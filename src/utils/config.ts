import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Load .env file
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Helper to resolve tilde in paths
function resolvePath(filepath: string): string {
  if (filepath.startsWith('~')) {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

export interface Config {
  // Pet settings
  petName: string;
  petType: 'dog' | 'cat' | 'dragon' | 'robot';
  petColor: string;
  
  // Animation
  animationSpeed: number;
  enableBlinking: boolean;
  idleAnimationChance: number;
  walkingAnimationChance: number;
  
  // Environment
  weather: 'sunny' | 'rainy' | 'snowy' | 'cloudy';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  
  // Decay rates (per minute)
  hungerDecayRate: number;
  happinessDecayRate: number;
  energyDecayRate: number;
  cleanlinessDecayRate: number;
  
  // Features
  enableEvolution: boolean;
  enableAccessories: boolean;
  enableSounds: boolean;
  enableWeatherEffects: boolean;
  
  // Thought system
  conversationThoughtRatio: number;
  
  // Feedback system
  feedbackEnabled: boolean;
  feedbackMode: 'full' | 'passive' | 'off';
  feedbackCheckInterval: number;
  feedbackBatchSize: number;
  feedbackMinMessages: number;
  feedbackStaleLockTime: number;
  feedbackDbPath: string;
  feedbackDbMaxSize: number;
  groqApiKey?: string;
  groqModel: string;
  groqTimeout: number;
  groqMaxRetries: number;
  llmProvider: 'groq' | 'lmstudio' | 'auto';
  lmstudioEnabled: boolean;
  lmstudioUrl: string;
  lmstudioModel: string;
  lmstudioApiKey?: string;
  lmstudioTimeout: number;
  lmstudioMaxRetries: number;
  moodDecayRate: number;
  annoyedThreshold: number;
  angryThreshold: number;
  furiousThreshold: number;
  praiseBoost: number;
  feedbackIconStyle: 'emoji' | 'ascii' | 'minimal';
  feedbackRemarkLength: number;
  showComplianceScore: boolean;
  feedbackMaxHistory: number;
  
  // Paths
  stateFile: string;
  actionFile: string;
  logFile: string;
  
  // Debug
  debugMode: boolean;
  verboseLogging: boolean;
  enableLogging: boolean;
}

export const config: Config = {
  // Pet settings
  petName: process.env.PET_NAME || 'Buddy',
  petType: (process.env.PET_TYPE as any) || 'dog',
  petColor: process.env.PET_COLOR || 'default',
  
  // Animation
  animationSpeed: parseInt(process.env.ANIMATION_SPEED || '300'),
  enableBlinking: process.env.ENABLE_BLINKING !== 'false',
  idleAnimationChance: parseFloat(process.env.IDLE_ANIMATION_CHANCE || '0.1'),
  walkingAnimationChance: parseFloat(process.env.WALKING_ANIMATION_CHANCE || '0.05'),
  
  // Environment
  weather: (process.env.WEATHER as any) || 'sunny',
  season: (process.env.SEASON as any) || 'spring',
  
  // Decay rates
  hungerDecayRate: parseFloat(process.env.HUNGER_DECAY_RATE || '0.5'),
  happinessDecayRate: parseFloat(process.env.HAPPINESS_DECAY_RATE || '0.2'),
  energyDecayRate: parseFloat(process.env.ENERGY_DECAY_RATE || '0.3'),
  cleanlinessDecayRate: parseFloat(process.env.CLEANLINESS_DECAY_RATE || '0.1'),
  
  // Features
  enableEvolution: process.env.ENABLE_EVOLUTION !== 'false',
  enableAccessories: process.env.ENABLE_ACCESSORIES !== 'false',
  enableSounds: process.env.ENABLE_SOUNDS === 'true',
  enableWeatherEffects: process.env.ENABLE_WEATHER_EFFECTS !== 'false',
  
  // Thought system
  conversationThoughtRatio: parseFloat(process.env.PET_CONVERSATION_THOUGHT_RATIO || '1.0'),
  
  // Feedback system
  feedbackEnabled: process.env.PET_FEEDBACK_ENABLED === 'true',
  feedbackMode: (process.env.PET_FEEDBACK_MODE as any) || 'full',
  feedbackCheckInterval: parseInt(process.env.PET_FEEDBACK_CHECK_INTERVAL || '5'),
  feedbackBatchSize: parseInt(process.env.PET_FEEDBACK_BATCH_SIZE || '10'),
  feedbackMinMessages: parseInt(process.env.PET_FEEDBACK_MIN_MESSAGES || '3'),
  feedbackStaleLockTime: parseInt(process.env.PET_FEEDBACK_STALE_LOCK_TIME || '30000'),
  feedbackDbPath: resolvePath(process.env.PET_FEEDBACK_DB_PATH || '~/.claude/pets/feedback.db'),
  feedbackDbMaxSize: parseInt(process.env.PET_FEEDBACK_DB_MAX_SIZE || '50'),
  groqApiKey: process.env.PET_GROQ_API_KEY || process.env.GROQ_API_KEY,
  groqModel: process.env.PET_GROQ_MODEL || 'openai/gpt-oss-20b',
  groqTimeout: parseInt(process.env.PET_GROQ_TIMEOUT || '2000'),
  groqMaxRetries: parseInt(process.env.PET_GROQ_MAX_RETRIES || '2'),
  llmProvider: (process.env.PET_LLM_PROVIDER as any) || 'auto',
  lmstudioEnabled: process.env.LM_STUDIO_ENABLED === 'true',
  lmstudioUrl: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
  lmstudioModel: process.env.LM_STUDIO_MODEL || 'openai/gpt-oss-120b',
  lmstudioApiKey: process.env.LM_STUDIO_API_KEY,
  lmstudioTimeout: parseInt(process.env.PET_LM_STUDIO_TIMEOUT || '5000'),
  lmstudioMaxRetries: parseInt(process.env.PET_LM_STUDIO_MAX_RETRIES || '1'),
  moodDecayRate: parseInt(process.env.PET_MOOD_DECAY_RATE || '5'),
  annoyedThreshold: parseInt(process.env.PET_ANNOYED_THRESHOLD || '3'),
  angryThreshold: parseInt(process.env.PET_ANGRY_THRESHOLD || '5'),
  furiousThreshold: parseInt(process.env.PET_FURIOUS_THRESHOLD || '8'),
  praiseBoost: parseInt(process.env.PET_PRAISE_BOOST || '10'),
  feedbackIconStyle: (process.env.PET_FEEDBACK_ICON_STYLE as any) || 'emoji',
  feedbackRemarkLength: parseInt(process.env.PET_FEEDBACK_REMARK_LENGTH || '50'),
  showComplianceScore: process.env.PET_SHOW_COMPLIANCE_SCORE === 'true',
  feedbackMaxHistory: parseInt(process.env.PET_FEEDBACK_MAX_HISTORY || '200'),
  
  // Paths
  stateFile: resolvePath(process.env.PET_STATE_FILE || '~/.claude/pets/claude-pet-state.json'),
  actionFile: resolvePath(process.env.PET_ACTION_FILE || '/tmp/pet-action.json'),
  logFile: process.env.LOG_FILE || '/tmp/claude-pet.log',
  
  // Debug
  debugMode: process.env.DEBUG_MODE === 'true',
  verboseLogging: process.env.VERBOSE_LOGGING === 'true',
  enableLogging: process.env.ENABLE_LOGGING === 'true',  // Off by default
};

export function getWeatherEffects() {
  const effects = {
    sunny: { happiness: 0.1, energy: 0.2 },
    rainy: { happiness: -0.1, cleanliness: -0.3 },
    snowy: { energy: -0.2, happiness: 0.05 },
    cloudy: { energy: -0.05, happiness: -0.05 }
  };
  return effects[config.weather] || { happiness: 0, energy: 0 };
}

/**
 * Build LlmWrapperSettings from Config
 *
 * This helper creates the settings object for LlmWrapperFactory based on
 * the current configuration. It implements the auto provider selection logic:
 * 1. If explicit provider specified, use it
 * 2. If 'auto', prefer LM Studio if enabled, fall back to Groq
 *
 * @param cfg - Config object (defaults to global config)
 * @returns LlmWrapperSettings for creating LLM provider instances
 */
export function buildLlmWrapperSettings(cfg: Config = config) {
  // Import LlmWrapperFactory for selectProvider helper
  const { LlmWrapperFactory } = require('../llm/LlmWrapperFactory');

  // Determine which provider to use
  const selectedProvider = LlmWrapperFactory.selectProvider(
    cfg.llmProvider,
    cfg.lmstudioEnabled,
    cfg.groqApiKey
  );

  // If no provider available, throw error
  if (!selectedProvider) {
    throw new Error('No LLM provider available. Either enable LM Studio or provide Groq API key.');
  }

  // Build settings object based on selected provider
  const settings: any = {
    provider: selectedProvider,
    model: selectedProvider === 'groq' ? cfg.groqModel : cfg.lmstudioModel,
    timeout: selectedProvider === 'groq' ? cfg.groqTimeout : cfg.lmstudioTimeout,
    maxRetries: selectedProvider === 'groq' ? cfg.groqMaxRetries : cfg.lmstudioMaxRetries,
    dbPath: cfg.feedbackDbPath
  };

  // Add provider-specific settings
  if (selectedProvider === 'groq') {
    settings.groqSettings = {
      apiKey: cfg.groqApiKey,
      model: cfg.groqModel
    };
  } else if (selectedProvider === 'lmstudio') {
    settings.lmstudioSettings = {
      url: cfg.lmstudioUrl,
      model: cfg.lmstudioModel,
      apiKey: cfg.lmstudioApiKey
    };
  }

  return settings;
}