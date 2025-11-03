#!/bin/bash

# Complete test suite for LM Studio integration
# Tests: Configuration, LM Studio connectivity, embeddings, chat completions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test result tracking
print_header() {
    echo ""
    echo "================================================================================"
    echo "$1"
    echo "================================================================================"
    echo ""
}

print_test() {
    echo -n "Test $TESTS_TOTAL: $1... "
}

pass() {
    echo -e "${GREEN}PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}FAIL${NC}"
    echo -e "${RED}Error: $1${NC}"
    if [ -n "$2" ]; then
        echo -e "${YELLOW}Details: $2${NC}"
    fi
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

warn() {
    echo -e "${YELLOW}WARN${NC}"
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Start testing
print_header "LM STUDIO INTEGRATION - COMPLETE TEST SUITE"

# Test 1: Check if .env file exists
TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check .env file exists"
if [ -f .env ]; then
    pass
    source .env
else
    fail ".env file not found" "Create .env file with LM Studio configuration"
fi

# Test 2: Check required environment variables
TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check PET_LLM_PROVIDER is set"
if [ -n "$PET_LLM_PROVIDER" ]; then
    pass
    echo "   Provider: $PET_LLM_PROVIDER"
else
    fail "PET_LLM_PROVIDER not set" "Add: export PET_LLM_PROVIDER=lmstudio"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check LM_STUDIO_ENABLED is set"
if [ "$LM_STUDIO_ENABLED" = "true" ]; then
    pass
else
    fail "LM_STUDIO_ENABLED not true" "Add: export LM_STUDIO_ENABLED=true"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check LM_STUDIO_URL is set"
if [ -n "$LM_STUDIO_URL" ]; then
    pass
    echo "   URL: $LM_STUDIO_URL"
else
    fail "LM_STUDIO_URL not set" "Add: export LM_STUDIO_URL=http://host.docker.internal:1234/v1"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check LM_STUDIO_MODEL is set"
if [ -n "$LM_STUDIO_MODEL" ]; then
    pass
    echo "   Model: $LM_STUDIO_MODEL"
else
    fail "LM_STUDIO_MODEL not set" "Add: export LM_STUDIO_MODEL=openai/gpt-oss-120b"
fi

# Test 3: Network connectivity
print_header "NETWORK CONNECTIVITY TESTS"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check LM Studio server is reachable"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${LM_STUDIO_URL}/models" 2>&1 | tail -1)
# Remove any leading zeros and handle connection failures
HTTP_CODE=$(echo "$HTTP_CODE" | sed 's/^0*//')
if [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "0" ] || [ "$HTTP_CODE" = "00" ] || [ "$HTTP_CODE" = "000" ]; then
    fail "Cannot connect to LM Studio server" "Connection refused or network error. Is LM Studio running? Check that host.docker.internal resolves correctly. URL: ${LM_STUDIO_URL}"
elif [ "$HTTP_CODE" = "200" ]; then
    pass
elif [ "$HTTP_CODE" = "404" ]; then
    fail "HTTP 404 Not Found" "Endpoint ${LM_STUDIO_URL}/models not found. Check URL is correct and LM Studio server is started."
elif [ "$HTTP_CODE" = "500" ]; then
    fail "HTTP 500 Internal Server Error" "LM Studio server error. Check LM Studio logs for details."
elif [ "$HTTP_CODE" = "502" ]; then
    fail "HTTP 502 Bad Gateway" "LM Studio server not responding properly. Restart LM Studio."
elif [ "$HTTP_CODE" = "503" ]; then
    fail "HTTP 503 Service Unavailable" "LM Studio server overloaded or not ready. Wait and retry."
else
    fail "HTTP $HTTP_CODE" "Unexpected HTTP status code. Check LM Studio server status."
fi

# Test 4: List models
print_header "MODEL AVAILABILITY TESTS"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "List available models"
MODELS_RESPONSE=$(curl -s "${LM_STUDIO_URL}/models" 2>&1)
CURL_EXIT=$?
if [ $CURL_EXIT -ne 0 ]; then
    fail "curl command failed (exit code $CURL_EXIT)" "Network error: $MODELS_RESPONSE"
else
    if echo "$MODELS_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
        MODEL_COUNT=$(echo "$MODELS_RESPONSE" | jq '.data | length')
        pass
        echo "   Found $MODEL_COUNT models"
    else
        fail "Invalid JSON response from /models endpoint" "Response: $MODELS_RESPONSE"
    fi
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check configured model is available"
if echo "$MODELS_RESPONSE" | jq -e ".data[] | select(.id == \"$LM_STUDIO_MODEL\")" > /dev/null 2>&1; then
    pass
    echo "   Model: $LM_STUDIO_MODEL"
else
    fail "Model $LM_STUDIO_MODEL not found" "Available models: $(echo "$MODELS_RESPONSE" | jq -r '.data[].id' | tr '\n' ' ')"
fi

# Test 5: Check for embedding models
print_header "EMBEDDING MODEL TESTS"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check OpenAI embedding models available"
EMBEDDING_MODELS=$(echo "$MODELS_RESPONSE" | jq -r '.data[] | select(.id | contains("embedding")) | .id' 2>/dev/null)
if [ -n "$EMBEDDING_MODELS" ]; then
    pass
    echo "   Found embedding models:"
    echo "$EMBEDDING_MODELS" | while read -r model; do
        echo "     - $model"
    done
else
    warn "No embedding models found (optional)"
fi

# Test 6: Test embedding endpoint
TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Test embedding API endpoint"
if [ -n "$EMBEDDING_MODELS" ]; then
    EMBEDDING_MODEL=$(echo "$EMBEDDING_MODELS" | head -1)
    EMBEDDING_RESPONSE=$(curl -s -X POST "${LM_STUDIO_URL}/embeddings" \
        -H "Content-Type: application/json" \
        -d "{\"model\": \"$EMBEDDING_MODEL\", \"input\": \"test\"}" 2>&1)
    CURL_EXIT=$?

    if [ $CURL_EXIT -ne 0 ]; then
        fail "curl command failed (exit code $CURL_EXIT)" "Network error: $EMBEDDING_RESPONSE"
    else
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${LM_STUDIO_URL}/embeddings" \
            -H "Content-Type: application/json" \
            -d "{\"model\": \"$EMBEDDING_MODEL\", \"input\": \"test\"}")

        if [ "$HTTP_CODE" = "200" ]; then
            if echo "$EMBEDDING_RESPONSE" | jq -e '.data[0].embedding' > /dev/null 2>&1; then
                EMBEDDING_DIM=$(echo "$EMBEDDING_RESPONSE" | jq '.data[0].embedding | length')
                pass
                echo "   Model: $EMBEDDING_MODEL"
                echo "   Embedding dimension: $EMBEDDING_DIM"
            else
                fail "Invalid embedding response format" "Response: $EMBEDDING_RESPONSE"
            fi
        elif [ "$HTTP_CODE" = "404" ]; then
            fail "HTTP 404 Not Found" "Embeddings endpoint not available. Check LM Studio version supports embeddings."
        elif [ "$HTTP_CODE" = "500" ]; then
            fail "HTTP 500 Internal Server Error" "Model error: $EMBEDDING_RESPONSE"
        else
            fail "HTTP $HTTP_CODE" "Response: $EMBEDDING_RESPONSE"
        fi
    fi
else
    warn "Skipping embedding test (no embedding models)"
fi

# Test 7: Chat completion tests
print_header "CHAT COMPLETION TESTS"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Test chat completion endpoint (simple)"
CHAT_RESPONSE=$(curl -s -X POST "${LM_STUDIO_URL}/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$LM_STUDIO_MODEL\",
        \"messages\": [{\"role\": \"user\", \"content\": \"Say OK\"}],
        \"max_tokens\": 5,
        \"temperature\": 0.1
    }" 2>&1)
CURL_EXIT=$?

if [ $CURL_EXIT -ne 0 ]; then
    fail "curl command failed (exit code $CURL_EXIT)" "Network error: $CHAT_RESPONSE"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${LM_STUDIO_URL}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "{\"model\": \"$LM_STUDIO_MODEL\", \"messages\": [{\"role\": \"user\", \"content\": \"Say OK\"}], \"max_tokens\": 5}")

    if [ "$HTTP_CODE" = "200" ]; then
        if echo "$CHAT_RESPONSE" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
            CONTENT=$(echo "$CHAT_RESPONSE" | jq -r '.choices[0].message.content')
            pass
            echo "   Response: $CONTENT"
        else
            fail "Invalid chat response format" "Response: $CHAT_RESPONSE"
        fi
    elif [ "$HTTP_CODE" = "404" ]; then
        fail "HTTP 404 Not Found" "Chat completions endpoint not available"
    elif [ "$HTTP_CODE" = "500" ]; then
        fail "HTTP 500 Internal Server Error" "Model error: $CHAT_RESPONSE"
    else
        fail "HTTP $HTTP_CODE" "Response: $CHAT_RESPONSE"
    fi
fi

# Test 8: Prime numbers test (Claude Code task)
TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Test prime numbers generation"
PRIME_RESPONSE=$(curl -s -X POST "${LM_STUDIO_URL}/chat/completions" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "'"$LM_STUDIO_MODEL"'",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant. Answer concisely."},
            {"role": "user", "content": "Print the first 5 prime numbers in this exact format: [2, 3, 5, 7, 11]"}
        ],
        "max_tokens": 50,
        "temperature": 0.1
    }' 2>&1)
CURL_EXIT=$?

if [ $CURL_EXIT -ne 0 ]; then
    fail "curl command failed (exit code $CURL_EXIT)" "Network error: $PRIME_RESPONSE"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${LM_STUDIO_URL}/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{"model": "'"$LM_STUDIO_MODEL"'", "messages": [{"role": "user", "content": "Say OK"}], "max_tokens": 5}')

    if [ "$HTTP_CODE" = "200" ]; then
        if echo "$PRIME_RESPONSE" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
            PRIME_CONTENT=$(echo "$PRIME_RESPONSE" | jq -r '.choices[0].message.content')

            # Check if response contains the expected primes
            if echo "$PRIME_CONTENT" | grep -q "2.*3.*5.*7.*11"; then
                pass
                echo "   Response: $PRIME_CONTENT"

                # Check format matches exactly
                if echo "$PRIME_CONTENT" | grep -q "\[2, 3, 5, 7, 11\]"; then
                    echo "   ✓ Format matches exactly"
                else
                    echo "   ⚠ Format differs from requested (still contains correct primes)"
                fi
            else
                fail "Response does not contain correct primes" "Response: $PRIME_CONTENT"
            fi

            # Show token usage
            PROMPT_TOKENS=$(echo "$PRIME_RESPONSE" | jq -r '.usage.prompt_tokens // "N/A"')
            COMPLETION_TOKENS=$(echo "$PRIME_RESPONSE" | jq -r '.usage.completion_tokens // "N/A"')
            TOTAL_TOKENS=$(echo "$PRIME_RESPONSE" | jq -r '.usage.total_tokens // "N/A"')
            echo "   Token usage: prompt=$PROMPT_TOKENS, completion=$COMPLETION_TOKENS, total=$TOTAL_TOKENS"
        else
            fail "Invalid chat response format" "Response: $PRIME_RESPONSE"
        fi
    elif [ "$HTTP_CODE" = "404" ]; then
        fail "HTTP 404 Not Found" "Chat completions endpoint not available"
    elif [ "$HTTP_CODE" = "500" ]; then
        fail "HTTP 500 Internal Server Error" "Model error: $PRIME_RESPONSE"
    else
        fail "HTTP $HTTP_CODE" "Response: $PRIME_RESPONSE"
    fi
fi

# Test 9: Response time measurement
print_header "PERFORMANCE TESTS"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Measure response time"
START_TIME=$(date +%s%N)
PERF_RESPONSE=$(curl -s -X POST "${LM_STUDIO_URL}/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$LM_STUDIO_MODEL\",
        \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}],
        \"max_tokens\": 10,
        \"temperature\": 0.1
    }" 2>&1)
END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))

if echo "$PERF_RESPONSE" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
    pass
    echo "   Response time: ${ELAPSED_MS}ms"

    if [ $ELAPSED_MS -lt 1000 ]; then
        echo "   Performance: Excellent (< 1s)"
    elif [ $ELAPSED_MS -lt 3000 ]; then
        echo "   Performance: Good (< 3s)"
    elif [ $ELAPSED_MS -lt 5000 ]; then
        echo "   Performance: Acceptable (< 5s)"
    else
        echo "   Performance: Slow (> 5s) - Consider using smaller model or increasing timeout"
    fi
else
    fail "Response time test failed" "Response: $PERF_RESPONSE"
fi

# Test 10: Tamagotchi application test
print_header "APPLICATION INTEGRATION TESTS"

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check TypeScript compiles"
if bun build src/index.ts --outdir /tmp/test-build > /dev/null 2>&1; then
    pass
    rm -rf /tmp/test-build
else
    fail "TypeScript compilation failed" "Run: bun build src/index.ts to see errors"
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
print_test "Check application runs (smoke test)"
TIMEOUT=5
APP_OUTPUT=$(timeout $TIMEOUT bun run src/index.ts 2>&1 || true)
if echo "$APP_OUTPUT" | grep -q "◕"; then
    pass
    echo "   Application started successfully"
else
    fail "Application did not start correctly" "Output: $APP_OUTPUT"
fi

# Final summary
print_header "TEST SUMMARY"

echo "Total tests:  $TESTS_TOTAL"
echo -e "Passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:       ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo ""
    echo "LM Studio integration is working correctly!"
    echo "You can now use the Tamagotchi with LM Studio."
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please fix the errors above before using LM Studio."
    echo ""
    echo "Common issues:"
    echo "  - LM Studio not running: Start LM Studio and load a model"
    echo "  - Wrong URL: Check LM_STUDIO_URL in .env file"
    echo "  - Model not loaded: Load model in LM Studio"
    echo "  - Network issue: Check host.docker.internal resolves"
    exit 1
fi
