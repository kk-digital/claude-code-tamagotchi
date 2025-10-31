# Using LMStudio with Claude Code Tamagotchi

Claude Code Tamagotchi now supports using LMStudio as an alternative to Groq for AI-powered behavioral monitoring! This allows you to run the AI analysis completely locally on your machine.

## What is LMStudio?

LMStudio is a desktop application that lets you run large language models locally on your computer. It provides an OpenAI-compatible API endpoint, making it easy to swap in for cloud services like Groq.

## Setup Instructions

### 1. Install and Configure LMStudio

1. Download LMStudio from https://lmstudio.ai/
2. Install and launch LMStudio
3. Download a model (recommended: llama-3.1-8b-instruct or similar)
4. Start the local server:
   - In LMStudio, go to the "Local Server" tab
   - Click "Start Server"
   - Default port is 1234 (http://localhost:1234)
   - Make sure "Enable CORS" is checked

### 2. Configure Environment Variables

Add these environment variables to your shell profile (~/.zshrc, ~/.bashrc, etc.):

```bash
# Enable AI features
export PET_FEEDBACK_ENABLED=true

# Use LMStudio instead of Groq
export PET_LLM_PROVIDER=lmstudio

# (Optional) Custom base URL if using different port
# export PET_LLM_BASE_URL=http://localhost:1234/v1

# Model name (as shown in LMStudio)
export PET_GROQ_MODEL=llama-3.1-8b-instruct

# (Optional) Increase timeout for local models (slower than Groq)
export PET_GROQ_TIMEOUT=5000
```

### 3. Restart Your Shell

```bash
source ~/.zshrc  # or ~/.bashrc
```

### 4. Test It Out

Start a Claude Code session and your pet should now use LMStudio for AI observations!

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PET_LLM_PROVIDER` | `groq` | LLM provider to use: `groq` or `lmstudio` |
| `PET_LLM_BASE_URL` | `http://localhost:1234/v1` (for lmstudio) | Custom API endpoint URL |
| `PET_GROQ_MODEL` | `openai/gpt-oss-20b` | Model name to use |
| `PET_GROQ_TIMEOUT` | `2000` | API timeout in milliseconds (increase for slower local models) |
| `PET_GROQ_API_KEY` | - | Not required for LMStudio (can be any value) |

### Switching Between Groq and LMStudio

**Use Groq (cloud, fast):**
```bash
export PET_LLM_PROVIDER=groq
export GROQ_API_KEY=your-groq-api-key-here
export PET_GROQ_MODEL=openai/gpt-oss-20b
export PET_GROQ_TIMEOUT=2000
```

**Use LMStudio (local, private):**
```bash
export PET_LLM_PROVIDER=lmstudio
export PET_LLM_BASE_URL=http://localhost:1234/v1
export PET_GROQ_MODEL=llama-3.1-8b-instruct
export PET_GROQ_TIMEOUT=5000
```

## Recommended Models

For best results with Claude Code Tamagotchi, use instruction-tuned models:

- **llama-3.1-8b-instruct** - Fast, good quality
- **llama-3.1-70b-instruct** - Best quality (requires powerful GPU)
- **mistral-7b-instruct** - Fast alternative
- **mixtral-8x7b-instruct** - Good balance

Make sure to download the model in LMStudio first!

## Performance Considerations

### Groq (Cloud)
- ⚡ Very fast (~50ms response time)
- 💰 Extremely cheap (practically free)
- 🌐 Requires internet connection
- 🔒 Sends conversation data to Groq servers

### LMStudio (Local)
- 🏠 Completely private and local
- 🔒 No data sent to external servers
- 💻 Requires decent hardware (GPU recommended)
- 🐢 Slower response time (1-10 seconds depending on hardware)
- 📦 No API key needed

## Troubleshooting

### Pet observations not appearing

1. Check LMStudio server is running:
   ```bash
   curl http://localhost:1234/v1/models
   ```

2. Verify environment variables:
   ```bash
   env | grep PET_
   ```

3. Enable debug logging:
   ```bash
   export PET_FEEDBACK_DEBUG=true
   export PET_FEEDBACK_LOG_DIR=/tmp/pet-logs
   ```

### Timeout errors

Increase the timeout for slower models:
```bash
export PET_GROQ_TIMEOUT=10000  # 10 seconds
```

### Model not found

Make sure the model name in `PET_GROQ_MODEL` matches exactly what shows in LMStudio's server tab.

## Privacy Benefits

Using LMStudio means:
- ✅ All conversation analysis happens on your machine
- ✅ No data sent to external servers
- ✅ Complete privacy for sensitive projects
- ✅ Works offline
- ✅ No API costs

Perfect for working with proprietary code or sensitive data!

## Example Configuration File

Create a file `~/.pet-lmstudio.env`:

```bash
# LMStudio Configuration for Claude Code Tamagotchi
export PET_FEEDBACK_ENABLED=true
export PET_LLM_PROVIDER=lmstudio
export PET_LLM_BASE_URL=http://localhost:1234/v1
export PET_GROQ_MODEL=llama-3.1-8b-instruct
export PET_GROQ_TIMEOUT=5000
export PET_FEEDBACK_DEBUG=false

# Optional: Adjust analysis frequency
export PET_FEEDBACK_CHECK_INTERVAL=5
export PET_FEEDBACK_BATCH_SIZE=10
```

Then source it when you want to use LMStudio:
```bash
source ~/.pet-lmstudio.env
```

## Testing LMStudio Connection

### Run Test Suite

```bash
./test-model.sh
```

### Test Inference Directly

Test that LMStudio is responding correctly:

```bash
curl -s http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.6,
    "max_tokens": 100
  }' \
  | jq -r '.choices[0].message.content'
```

Expected output: A response from the LLM model.

### Check LMStudio Configuration

Verify the model is loaded in LMStudio:

```bash
cat ~/.lmstudio/.internal/model-data.json | jq '.json[] | select(.[0] == "openai/gpt-oss-20b")'
```

This shows the model configuration and status in LMStudio's internal data.

### Verify API Endpoint

Check that the server is running:

```bash
curl -s http://localhost:1234/v1/models | jq
```

Expected output: JSON list of available models.

## Support

If you encounter issues:
1. Check the LMStudio console for errors
2. Enable debug logging with `PET_FEEDBACK_DEBUG=true`
3. Open an issue at https://github.com/Ido-Levi/claude-code-tamagotchi/issues

---

Made with 🤍 by developers who value privacy
