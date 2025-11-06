#!/bin/bash
# Test LM Studio endpoint connectivity and model availability

echo "=== Testing LM Studio Endpoint ==="
echo ""

# Test 1: Check endpoint is reachable
echo "1. Testing endpoint connectivity..."
if curl -s -f http://host.docker.internal:1234/v1/models > /dev/null 2>&1; then
    echo "   ✓ LM Studio endpoint is reachable"
else
    echo "   ✗ ERROR: Cannot reach LM Studio endpoint"
    exit 1
fi

# Test 2: List available models
echo ""
echo "2. Listing available models..."
MODELS=$(curl -s http://host.docker.internal:1234/v1/models | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if echo "$MODELS" | grep -q "openai/gpt-oss-120b"; then
    echo "   ✓ openai/gpt-oss-120b found"
else
    echo "   ✗ WARNING: openai/gpt-oss-120b not found"
fi

if echo "$MODELS" | grep -q "openai/gpt-oss-20b"; then
    echo "   ✓ openai/gpt-oss-20b found"
else
    echo "   ✗ WARNING: openai/gpt-oss-20b not found"
fi

# Test 3: Test chat completion
echo ""
echo "3. Testing chat completion..."
RESPONSE=$(curl -s -X POST http://host.docker.internal:1234/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "Respond with: OK"}],
    "max_tokens": 5
  }')

if echo "$RESPONSE" | grep -q "chat.completion"; then
    echo "   ✓ Chat completion successful"
    CONTENT=$(echo $RESPONSE | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Response: $CONTENT"
else
    echo "   ✗ ERROR: Chat completion failed"
    echo "   Response: $RESPONSE"
    exit 1
fi

echo ""
echo "=== All Tests Passed ==="
echo ""
echo "LM Studio is ready for use with the Tamagotchi project."
