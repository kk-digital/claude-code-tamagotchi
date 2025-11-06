// Display current pet configuration and status
import { config } from '../c1_config/config';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export async function showSettings(): Promise<void> {
  console.log('⚙️  Pet Configuration & Status\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Core Settings
  console.log('📁 Core Settings:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  printSetting('Pet Name', config.petName || 'Buddy', '🐾');
  printSetting('Pet Type', config.petType || 'dog', '🐶');
  printSetting('State File', config.petStateFile, '💾', existsSync(config.petStateFile) ? '✅' : '❌');
  console.log('');

  // Display Settings
  console.log('📺 Display Settings:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  printSetting('Show Directory', config.petShowDirectory ? 'Enabled' : 'Disabled', '📁', config.petShowDirectory ? '✅' : '⚪');
  printSetting('Show Session', config.petShowSession ? 'Enabled' : 'Disabled', '🔢', config.petShowSession ? '✅' : '⚪');
  printSetting('Show Model', config.petShowModel ? 'Enabled' : 'Disabled', '🤖', config.petShowModel ? '✅' : '⚪');
  console.log('');

  // AI Features
  console.log('🤖 AI Features:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Feedback Status
  const feedbackStatus = config.petFeedbackEnabled ? '✅ ENABLED' : '❌ DISABLED';
  printSetting('AI Feedback', feedbackStatus, '💭');

  if (config.petFeedbackEnabled) {
    const provider = config.petLlmProvider || 'not set';
    const providerStatus = provider === 'lmstudio' ? '✅' : '⚠️';
    printSetting('  LLM Provider', provider, '🧠', providerStatus);

    const dbPath = config.petFeedbackDbPath || join(homedir(), '.claude', 'pets', 'feedback.db');
    const dbExists = existsSync(dbPath);
    printSetting('  Database', dbPath, '💾', dbExists ? '✅' : '❌');
  }

  // Violation Detection
  const violationStatus = config.petViolationCheckEnabled ? '✅ ENABLED' : '❌ DISABLED';
  printSetting('Violation Detection', violationStatus, '🚫');

  console.log('');

  // LM Studio Configuration
  console.log('🔌 LM Studio Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const lmEnabled = config.lmStudioEnabled ? '✅ ENABLED' : '❌ DISABLED';
  printSetting('LM Studio', lmEnabled, '⚡');

  if (config.lmStudioEnabled) {
    const url = config.lmStudioUrl || 'not set';
    const urlStatus = url.includes('host.docker.internal') || url.includes('localhost') ? '✅' : '⚠️';
    printSetting('  URL', url, '🌐', urlStatus);

    const model = config.lmStudioModel || 'not set';
    const modelStatus = model !== 'not set' ? '✅' : '⚠️';
    printSetting('  Model', model, '🎯', modelStatus);

    const timeout = config.petLmStudioTimeout || 5000;
    printSetting('  Timeout', `${timeout}ms`, '⏱️');

    const retries = config.petLmStudioMaxRetries || 1;
    printSetting('  Max Retries', retries.toString(), '🔄');

    // Test connection
    console.log('');
    await testConnection(url, model);
  }

  console.log('');

  // Metabolism Settings
  console.log('⚡ Metabolism Settings:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  printSetting('Decay Interval', (config.petDecayInterval || 20).toString(), '📉');
  printSetting('Hunger Decay', (config.petHungerDecay || 0.9).toString(), '🍖');
  printSetting('Energy Decay', (config.petEnergyDecay || 0.75).toString(), '⚡');
  printSetting('Clean Decay', (config.petCleanDecay || 0.6).toString(), '🧼');
  printSetting('Sleep Recovery', (config.petSleepRecovery || 3).toString(), '😴');
  console.log('');

  // Thought System
  console.log('💭 Thought System:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  printSetting('Frequency', (config.petThoughtFrequency || 15).toString(), '📊');
  printSetting('Cooldown', (config.petThoughtCooldown || 10).toString(), '⏳');
  printSetting('Chattiness', config.petChattiness || 'normal', '💬');
  printSetting('Need Threshold', `${config.petNeedThreshold || 40}%`, '⚠️');
  printSetting('Critical Threshold', `${config.petCriticalThreshold || 20}%`, '🚨');
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Summary:');

  const features = [];
  if (config.petFeedbackEnabled) features.push('✅ AI Thoughts');
  if (config.petViolationCheckEnabled) features.push('✅ Violation Detection');
  if (config.lmStudioEnabled) features.push('✅ LM Studio');

  if (features.length > 0) {
    console.log(`   Active Features: ${features.join(', ')}`);
  } else {
    console.log('   No AI features enabled (basic pet functionality only)');
  }

  console.log('\n💡 Tips:');
  console.log('   • Run /pet-test-lmstudio to test AI connection');
  console.log('   • Run /pet-thoughts to view recent observations');
  console.log('   • Edit .env file to change settings');
}

function printSetting(name: string, value: string, icon: string, status?: string): void {
  const statusIndicator = status ? ` ${status}` : '';
  const padding = ' '.repeat(Math.max(0, 25 - name.length));
  console.log(`   ${icon} ${name}:${padding}${value}${statusIndicator}`);
}

async function testConnection(url: string, model: string): Promise<void> {
  if (!url || url === 'not set') {
    printSetting('  Connection', 'Cannot test (no URL)', '🔌', '⚠️');
    return;
  }

  try {
    const modelsUrl = url.replace('/chat/completions', '/models');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(modelsUrl, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const models = data?.data || [];
      const modelCount = models.length;
      const modelExists = models.some((m: any) => m.id === model);

      if (modelExists) {
        printSetting('  Connection', `✅ Connected (${modelCount} models)`, '🔌', '✅');
        printSetting('  Model Status', 'Available', '✅', '✅');
      } else {
        printSetting('  Connection', `✅ Connected (${modelCount} models)`, '🔌', '✅');
        printSetting('  Model Status', 'Not found in LM Studio', '⚠️', '❌');
      }
    } else {
      printSetting('  Connection', `HTTP ${response.status}`, '🔌', '❌');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      printSetting('  Connection', 'Timeout (3s)', '🔌', '⏱️');
    } else if (error.cause?.code === 'ECONNREFUSED') {
      printSetting('  Connection', 'Refused (not running)', '🔌', '❌');
    } else {
      printSetting('  Connection', 'Failed', '🔌', '❌');
    }
  }
}
