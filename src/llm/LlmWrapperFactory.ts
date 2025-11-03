import { LlmWrapper, LlmWrapperSettings } from './LlmWrapper';
import { GroqProvider } from './providers/GroqProvider';

/**
 * Factory for creating LLM provider instances
 *
 * This factory creates the appropriate provider (Groq, LM Studio, OpenAI)
 * based on the settings provided.
 *
 * Usage:
 *   const settings: LlmWrapperSettings = {
 *     provider: 'groq',
 *     model: 'openai/gpt-oss-20b',
 *     timeout: 2000,
 *     maxRetries: 2,
 *     groqSettings: {
 *       apiKey: process.env.GROQ_API_KEY
 *     }
 *   };
 *
 *   const llm = LlmWrapperFactory.create(settings);
 *   const result = await llm.analyzeUserMessage('Hello', []);
 */
export class LlmWrapperFactory {
  /**
   * Create an LLM provider instance based on settings
   *
   * @param settings Configuration for the LLM provider
   * @returns Instance of the appropriate provider
   * @throws Error if provider is unknown or not yet implemented
   */
  static create(settings: LlmWrapperSettings): LlmWrapper {
    switch (settings.provider) {
      case 'groq':
        return new GroqProvider(settings);

      case 'lmstudio':
        // Will be implemented in Phase 2B
        throw new Error('LMStudioProvider not yet implemented - see Phase 2B');

      case 'openai':
        // Future implementation
        throw new Error('OpenAIProvider not yet implemented - future enhancement');

      default:
        throw new Error(`Unknown LLM provider: ${(settings as any).provider}`);
    }
  }

  /**
   * Helper to determine provider based on environment and availability
   *
   * This implements "auto" mode logic:
   * 1. Try LM Studio if enabled and accessible
   * 2. Fall back to Groq if API key available
   * 3. Return null if neither available (caller handles offline fallback)
   *
   * @param preferredProvider Preferred provider or 'auto'
   * @param lmstudioEnabled Whether LM Studio is enabled
   * @param groqApiKey Groq API key (if available)
   * @returns Provider to use, or null for offline mode
   */
  static selectProvider(
    preferredProvider: string,
    lmstudioEnabled: boolean,
    groqApiKey?: string
  ): 'groq' | 'lmstudio' | null {
    // If explicit provider requested, use it
    if (preferredProvider === 'groq' && groqApiKey) {
      return 'groq';
    }

    if (preferredProvider === 'lmstudio' && lmstudioEnabled) {
      return 'lmstudio';
    }

    // Auto mode: prefer LM Studio -> Groq -> offline
    if (preferredProvider === 'auto') {
      if (lmstudioEnabled) {
        return 'lmstudio';
      }

      if (groqApiKey) {
        return 'groq';
      }
    }

    // No provider available
    return null;
  }
}
