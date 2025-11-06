// Test LM Studio connection and AI features
import { config } from '../c1_config/config';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export async function testLMStudio(): Promise<void> {
  const results: TestResult[] = [];

  console.log('🧪 LM Studio Connection Test\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Check if feedback is enabled
  results.push({
    name: 'Feedback Enabled',
    passed: config.petFeedbackEnabled,
    details: config.petFeedbackEnabled ? 'PET_FEEDBACK_ENABLED=true' : 'PET_FEEDBACK_ENABLED=false',
    error: config.petFeedbackEnabled ? undefined : 'Set PET_FEEDBACK_ENABLED=true in .env'
  });

  // Test 2: Check LLM provider
  results.push({
    name: 'LLM Provider',
    passed: config.petLlmProvider === 'lmstudio',
    details: `PET_LLM_PROVIDER=${config.petLlmProvider || 'not set'}`,
    error: config.petLlmProvider === 'lmstudio' ? undefined : 'Set PET_LLM_PROVIDER=lmstudio in .env'
  });

  // Test 3: Check if LM Studio is enabled
  results.push({
    name: 'LM Studio Enabled',
    passed: config.lmStudioEnabled,
    details: config.lmStudioEnabled ? 'LM_STUDIO_ENABLED=true' : 'LM_STUDIO_ENABLED=false',
    error: config.lmStudioEnabled ? undefined : 'Set LM_STUDIO_ENABLED=true in .env'
  });

  // Test 4: Check LM Studio URL
  const hasUrl = !!config.lmStudioUrl;
  const correctUrl = config.lmStudioUrl?.includes('host.docker.internal:1234') ||
                     config.lmStudioUrl?.includes('localhost:1234');
  results.push({
    name: 'LM Studio URL',
    passed: hasUrl && correctUrl,
    details: config.lmStudioUrl || 'not set',
    error: !hasUrl ? 'Set LM_STUDIO_URL in .env' :
           !correctUrl ? 'URL should be http://host.docker.internal:1234/v1 (Docker) or http://localhost:1234/v1 (host)' :
           undefined
  });

  // Test 5: Check model name
  const hasModel = !!config.lmStudioModel;
  results.push({
    name: 'Model Name',
    passed: hasModel,
    details: config.lmStudioModel || 'not set',
    error: hasModel ? undefined : 'Set LM_STUDIO_MODEL in .env'
  });

  // Test 6: Try to connect to LM Studio
  let connectionResult: TestResult = {
    name: 'LM Studio Connection',
    passed: false,
    error: 'Not tested'
  };

  if (config.lmStudioUrl) {
    try {
      const modelsUrl = config.lmStudioUrl.replace('/chat/completions', '/models');
      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const modelCount = data?.data?.length || 0;
        connectionResult = {
          name: 'LM Studio Connection',
          passed: true,
          details: `Connected successfully. Found ${modelCount} models.`
        };
      } else {
        connectionResult = {
          name: 'LM Studio Connection',
          passed: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: 'LM Studio server responded but with error status'
        };
      }
    } catch (error: any) {
      let errorMessage = 'Unknown error';
      let errorDetails = '';

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        errorMessage = 'Connection timeout (5s)';
        errorDetails = 'LM Studio may not be running or is not accessible';
      } else if (error.cause?.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused';
        errorDetails = 'LM Studio is not running or port 1234 is not open';
      } else if (error.cause?.code === 'ENOTFOUND') {
        errorMessage = 'Host not found';
        errorDetails = 'Check if using host.docker.internal (Docker) or localhost (host)';
      } else if (error.message) {
        errorMessage = error.message;
        errorDetails = error.cause?.message || '';
      }

      connectionResult = {
        name: 'LM Studio Connection',
        passed: false,
        error: errorMessage,
        details: errorDetails
      };
    }
  } else {
    connectionResult = {
      name: 'LM Studio Connection',
      passed: false,
      error: 'LM_STUDIO_URL not configured',
      details: 'Cannot test connection without URL'
    };
  }

  results.push(connectionResult);

  // Test 7: Check if configured model is available
  let modelAvailableResult: TestResult = {
    name: 'Configured Model Available',
    passed: false,
    error: 'Not tested'
  };

  if (connectionResult.passed && config.lmStudioModel) {
    try {
      const modelsUrl = config.lmStudioUrl!.replace('/chat/completions', '/models');
      const response = await fetch(modelsUrl);
      const data = await response.json();
      const models = data?.data || [];
      const modelExists = models.some((m: any) => m.id === config.lmStudioModel);

      if (modelExists) {
        modelAvailableResult = {
          name: 'Configured Model Available',
          passed: true,
          details: `Model "${config.lmStudioModel}" found in LM Studio`
        };
      } else {
        const availableModels = models.map((m: any) => m.id).join(', ');
        modelAvailableResult = {
          name: 'Configured Model Available',
          passed: false,
          error: `Model "${config.lmStudioModel}" not found`,
          details: `Available models: ${availableModels || 'none'}`
        };
      }
    } catch (error: any) {
      modelAvailableResult = {
        name: 'Configured Model Available',
        passed: false,
        error: 'Failed to list models',
        details: error.message
      };
    }
  } else if (!connectionResult.passed) {
    modelAvailableResult = {
      name: 'Configured Model Available',
      passed: false,
      error: 'Cannot check - connection failed',
      details: 'Fix connection issues first'
    };
  } else if (!config.lmStudioModel) {
    modelAvailableResult = {
      name: 'Configured Model Available',
      passed: false,
      error: 'No model configured',
      details: 'Set LM_STUDIO_MODEL in .env'
    };
  }

  results.push(modelAvailableResult);

  // Test 8: Try a simple chat completion
  let chatTestResult: TestResult = {
    name: 'Chat Completion Test',
    passed: false,
    error: 'Not tested'
  };

  if (connectionResult.passed && modelAvailableResult.passed) {
    try {
      const response = await fetch(config.lmStudioUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.lmStudioModel,
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Respond with exactly one word: "success"' },
            { role: 'user', content: 'Test' }
          ],
          max_tokens: 10,
          temperature: 0
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content || '';
        chatTestResult = {
          name: 'Chat Completion Test',
          passed: true,
          details: `Response: "${reply.trim()}"`
        };
      } else {
        const errorText = await response.text();
        chatTestResult = {
          name: 'Chat Completion Test',
          passed: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        };
      }
    } catch (error: any) {
      chatTestResult = {
        name: 'Chat Completion Test',
        passed: false,
        error: error.name === 'AbortError' ? 'Request timeout (10s)' : error.message,
        details: error.cause?.message || ''
      };
    }
  } else {
    chatTestResult = {
      name: 'Chat Completion Test',
      passed: false,
      error: 'Cannot test - prerequisites failed',
      details: 'Fix connection and model issues first'
    };
  }

  results.push(chatTestResult);

  // Print results
  console.log('Test Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);

    if (result.details) {
      console.log(`     ${result.details}`);
    }

    if (result.error) {
      console.log(`     ⚠️  Error: ${result.error}`);
    }

    console.log('');

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nSummary: ${passedCount}/${results.length} tests passed`);

  if (failedCount === 0) {
    console.log('\n🎉 All tests passed! LM Studio AI features are ready to use.');
  } else {
    console.log(`\n⚠️  ${failedCount} test(s) failed. Review errors above and fix configuration.`);
    console.log('\nCommon fixes:');
    console.log('  1. Ensure LM Studio is running on the host machine');
    console.log('  2. Load a model in LM Studio (e.g., openai/gpt-oss-120b)');
    console.log('  3. Check .env file has correct configuration');
    console.log('  4. Use host.docker.internal:1234 (Docker) or localhost:1234 (host)');
  }
}
