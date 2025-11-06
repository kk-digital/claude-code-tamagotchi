#!/usr/bin/env bun
// CLI handler for pet commands - to be called directly from command line
import { CommandProcessor } from './command_processor';

const command = process.argv[2];
const args = process.argv.slice(3).join(' ');

async function main() {
  if (!command) {
    console.log('Usage: claude-code-tamagotchi <command> [args]');
    console.log('Run "claude-code-tamagotchi help" for available commands');
    return;
  }

  // Special handling for violation-check command
  if (command === 'violation-check') {
    // This command reads from stdin and needs special handling
    const { violationCheck } = await import('./violation-check');
    await violationCheck();
    return;
  }

  // Special handling for test-lmstudio command
  if (command === 'test-lmstudio') {
    const { testLMStudio } = await import('./test_lmstudio');
    await testLMStudio();
    return;
  }

  // Special handling for thoughts command
  if (command === 'thoughts') {
    const { showThoughts } = await import('./show_thoughts');
    await showThoughts();
    return;
  }

  // Special handling for settings command
  if (command === 'settings') {
    const { showSettings } = await import('./show_settings');
    await showSettings();
    return;
  }

  // Convert CLI command to slash command format expected by CommandProcessor
  // Special handling for commands that need "pet-" prefix
  let slashCommand: string;
  if (command === 'name' || command === 'reset' || command === 'stats' || command === 'status' || command === 'help') {
    slashCommand = `/pet-${command} ${args}`.trim();
  } else {
    // Commands like feed, play, pet, clean, sleep, wake are used without "pet-" prefix
    slashCommand = `/${command} ${args}`.trim();
  }
  const response = await CommandProcessor.processCommand(slashCommand);
  console.log(response);
}

main().catch(console.error);