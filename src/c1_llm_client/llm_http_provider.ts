import { LlmWrapper, LlmWrapperSettings, LlmResponse } from './llm_wrapper';

/**
 * Abstract base class for HTTP-based LLM providers
 *
 * Provides shared HTTP logic for providers that use REST APIs:
 * - Timeout enforcement using AbortController
 * - Retry logic for transient errors (network, 5xx, timeout)
 * - Error handling with detailed messages
 * - Template method pattern for provider customization
 *
 * HTTP-based providers (LM Studio, Ollama, OpenAI, Anthropic) extend this class.
 * SDK-based providers (Groq) extend LlmWrapper directly.
 */
export abstract class LlmHttpProvider extends LlmWrapper {
  /**
   * Get the API endpoint URL for this provider
   * Subclasses must implement to return provider-specific endpoint
   *
   * @example
   * For LM Studio: `${this.baseUrl}/chat/completions`
   * For Ollama: `${this.baseUrl}/api/generate`
   * For OpenAI: `https://api.openai.com/v1/chat/completions`
   */
  protected abstract getEndpoint(): string;

  /**
   * Build request body for the API call
   * Subclasses must implement to create provider-specific request format
   *
   * @param prompt The prompt to send to the LLM
   * @returns Request body object (will be JSON.stringify'd)
   */
  protected abstract buildRequestBody(prompt: string): object;

  /**
   * Parse API response into standardized LlmResponse format
   * Subclasses must implement to extract content from provider-specific response
   *
   * @param response Raw response from fetch (already parsed as JSON)
   * @returns Standardized LlmResponse object
   */
  protected abstract parseResponse(response: any): LlmResponse;

  /**
   * Build HTTP headers for the API call
   * Subclasses must implement to add provider-specific headers
   *
   * @returns Headers object
   */
  protected abstract buildHeaders(): Record<string, string>;

  /**
   * Call LLM API with timeout protection
   * Implements the template method pattern - calls abstract methods above
   *
   * @param prompt The prompt to send to the LLM
   * @returns Response from the LLM
   */
  protected async callLlmWithTimeout(prompt: string): Promise<LlmResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const endpoint = this.getEndpoint();
      const headers = this.buildHeaders();
      const body = this.buildRequestBody(prompt);

      this.debug(`Calling HTTP API at ${endpoint}`);
      this.debug(`Timeout: ${this.timeout}ms, Max retries: ${this.maxRetries}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error');
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      this.debug(`HTTP API response received`);

      return this.parseResponse(data);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`HTTP API timeout after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Execute HTTP POST with retry logic
   * Retries on transient errors (network, 5xx, timeout)
   * Does NOT retry on 4xx errors (client errors are permanent)
   *
   * @param prompt The prompt to send
   * @returns Response from the LLM
   */
  protected async callWithRetry(prompt: string): Promise<LlmResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.callLlmWithTimeout(prompt);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on timeout (already waited long enough)
        if (error instanceof Error && error.message.includes('timeout')) {
          this.debug(`Timeout error - not retrying`);
          break;
        }

        // Don't retry on 4xx errors (client errors are permanent)
        if (error instanceof Error && error.message.match(/HTTP 4\d\d/)) {
          this.debug(`Client error (4xx) - not retrying`);
          break;
        }

        // Retry on network errors and 5xx errors
        if (attempt < this.maxRetries - 1) {
          const waitTime = 500 * (attempt + 1); // Exponential backoff
          this.debug(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries exhausted
    const errorMessage = `HTTP API failed after ${this.maxRetries} attempts: ${lastError?.message}`;
    this.logError(errorMessage, lastError!);
    throw new Error(errorMessage);
  }
}
