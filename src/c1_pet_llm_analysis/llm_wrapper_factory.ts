import { LlmWrapper, LlmWrapperSettings } from '../c1_pet_llm_analysis/llm_wrapper';
import { GroqProvider } from '../c1_pet_llm_analysis/groq_provider';
import { LMStudioProvider } from '../c1_pet_llm_analysis/lmstudio_provider';

/**
 * Factory for creating LLM provider instances
 *
 * This factory creates the appropriate provider (Groq, LM Studio, OpenAI)
 * based on the settings provided.
 *
 * Usage examples:
 *
 * Groq (cloud):
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
 * LM Studio (local):
 *   const settings: LlmWrapperSettings = {
 *     provider: 'lmstudio',
 *     model: 'openai/gpt-oss-120b',
 *     timeout: 5000,
 *     maxRetries: 1,
 *     lmstudioSettings: {
 *       url: 'http://localhost:1234/v1'
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
        return new LMStudioProvider(settings);

      case 'openai':
        // Future implementation
        throw new Error('OpenAIProvider not yet implemented - future enhancement');

      default:
        throw new Error(`Unknown LLM provider: ${(settings as any).provider}`);
    }
  }

}
