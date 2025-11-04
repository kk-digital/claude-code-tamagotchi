import { LLMAnalysisResult } from '../c1_feedback_models/feedback_types';
import { FeedbackDatabase } from '../c1_feedback_database/feedback_database';

/**
 * Response from LLM provider
 */
export interface LlmResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Settings for LLM provider configuration
 *
 * IMPORTANT: Provider must be explicitly specified - no automatic fallback.
 * Automatic fallback is undesirable because it can lead to:
 * - Unexpected behavior when switching between providers
 * - Different response quality/formats between providers
 * - Silent failures masking configuration issues
 * - Unpredictable costs when falling back to cloud providers
 */
export interface LlmWrapperSettings {
  provider: 'groq' | 'lmstudio' | 'openai';

  // Common settings
  model: string;
  timeout: number;
  maxRetries: number;
  dbPath?: string;

  // Provider-specific settings
  groqSettings?: {
    apiKey?: string;
    model?: string;
  };

  lmstudioSettings?: {
    url: string;
    model?: string;
    apiKey?: string;
  };

  openaiSettings?: {
    apiKey: string;
    model?: string;
    organization?: string;
  };
}

/**
 * Abstract base class for LLM providers
 *
 * All LLM providers (Groq, LM Studio, OpenAI) extend this class
 * and implement the required methods for analyzing messages and exchanges.
 */
export abstract class LlmWrapper {
  protected settings: LlmWrapperSettings;
  protected timeout: number;
  protected maxRetries: number;
  protected db: FeedbackDatabase | null = null;

  constructor(settings: LlmWrapperSettings) {
    this.settings = settings;
    this.timeout = settings.timeout;
    this.maxRetries = settings.maxRetries;

    // Initialize database if path provided
    if (settings.dbPath) {
      try {
        this.db = new FeedbackDatabase(settings.dbPath, 50);
        this.debug(`Database initialized successfully at ${settings.dbPath}`);
      } catch (error) {
        this.logError('Failed to initialize database', error as Error);
        this.debug(`Database initialization failed: ${error}`);
      }
    }
  }

  /**
   * Analyze a user message to extract intent and create summary
   *
   * @param userMessage The message to analyze
   * @param sessionHistory Previous messages in the session
   * @returns Summary and intent extracted from the message
   */
  abstract analyzeUserMessage(
    userMessage: string,
    sessionHistory: string[]
  ): Promise<{ summary: string; intent: string }>;

  /**
   * Analyze a conversation exchange between user and Claude
   *
   * @param userRequest The user's request
   * @param claudeActions Actions Claude took in response
   * @param sessionHistory Previous messages in the session
   * @param projectContext Optional project context
   * @param petState Current pet state
   * @param sessionId Session identifier
   * @param messageUuid Message identifier
   * @param workspaceId Workspace identifier
   * @returns Analysis result with compliance scores and feedback
   */
  abstract analyzeExchange(
    userRequest: string,
    claudeActions: string[],
    sessionHistory: string[],
    projectContext?: string,
    petState?: any,
    sessionId?: string,
    messageUuid?: string,
    workspaceId?: string
  ): Promise<LLMAnalysisResult>;

  /**
   * Call LLM API with timeout protection
   *
   * @param prompt The prompt to send to the LLM
   * @returns Response from the LLM
   */
  protected abstract callLlmWithTimeout(prompt: string): Promise<LlmResponse>;

  /**
   * Log debug message if debug mode enabled
   */
  protected debug(message: string): void {
    if (process.env.PET_FEEDBACK_DEBUG === 'true') {
      const timestamp = new Date().toISOString();
      const providerName = this.settings.provider;
      const logMessage = `[${timestamp}] [${providerName}Provider] ${message}\n`;

      // Log to console if debug mode
      if (process.env.DEBUG_MODE === 'true') {
        console.error(logMessage.trim());
      }

      // Log to file if specified
      const logDir = process.env.PET_FEEDBACK_LOG_DIR;
      if (logDir) {
        try {
          const fs = require('fs');
          const path = require('path');

          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }

          const logFile = path.join(logDir, `${providerName}-provider.log`);
          fs.appendFileSync(logFile, logMessage);
        } catch (error) {
          // Silently fail if logging fails
        }
      }
    }
  }

  /**
   * Log error message
   */
  protected logError(message: string, error: Error): void {
    const timestamp = new Date().toISOString();
    const providerName = this.settings.provider;
    const errorMessage = `[${timestamp}] [${providerName}Provider] ERROR: ${message} - ${error.message}\n${error.stack}\n`;

    // Always log errors to console
    console.error(errorMessage.trim());

    // Log to file if specified
    const logDir = process.env.PET_FEEDBACK_LOG_DIR;
    if (logDir) {
      try {
        const fs = require('fs');
        const path = require('path');

        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, `${providerName}-errors.log`);
        fs.appendFileSync(logFile, errorMessage);
      } catch (err) {
        // Silently fail if logging fails
      }
    }
  }

  /**
   * Get default analysis when LLM is unavailable
   */
  protected getDefaultAnalysis(): LLMAnalysisResult {
    return {
      compliance_score: 7,
      efficiency_score: 7,
      feedback_type: 'none',
      severity: 'good',
      funny_observation: 'Working without AI analysis',
      summary: 'Performing task',
      violations: [],
      pet_response: {
        mood_change: null,
        stat_changes: {},
        thought: null
      }
    };
  }
}
