/**
 * Integration test for LM Studio provider
 * Tests that the LMStudioProvider can be instantiated and make API calls
 */
import { LlmWrapperFactory } from './src/llm/LlmWrapperFactory';
import { LlmWrapperSettings } from './src/llm/LlmWrapper';

async function testLMStudioProvider() {
  console.log('=== Testing LM Studio Provider Integration ===\n');

  // Test 1: Create LMStudioProvider instance
  console.log('1. Creating LMStudioProvider instance...');
  const settings: LlmWrapperSettings = {
    provider: 'lmstudio',
    model: 'openai/gpt-oss-120b',
    timeout: 10000,
    maxRetries: 1,
    lmstudioSettings: {
      url: 'http://host.docker.internal:1234/v1',
      model: 'openai/gpt-oss-120b'
    }
  };

  const llm = LlmWrapperFactory.create(settings);
  console.log('   ✓ LMStudioProvider created successfully\n');

  // Test 2: Test analyzeUserMessage
  console.log('2. Testing analyzeUserMessage...');
  try {
    const result = await llm.analyzeUserMessage(
      'Please help me debug this error',
      ['User: Working on authentication', 'Claude: Analyzing code']
    );
    console.log('   ✓ analyzeUserMessage successful');
    console.log('   Summary:', result.summary);
    console.log('   Intent:', result.intent);
  } catch (error: any) {
    console.log('   ✗ analyzeUserMessage failed:', error.message);
    throw error;
  }

  console.log('\n=== All Integration Tests Passed ===');
}

testLMStudioProvider().catch(error => {
  console.error('\n✗ Test failed:', error);
  process.exit(1);
});
