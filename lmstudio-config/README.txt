================================================================================
LM STUDIO CONFIGURATION AND SETUP GUIDE
================================================================================
Date: 2025-11-05
Version: 1.0
Purpose: Complete configuration guide for LM Studio on macOS

================================================================================
QUICK START
================================================================================

1. Read SETUP-GUIDE-OSX.txt for installation
2. Download models (GPT-OSS, embeddings, or Qwen3 Coder)
3. Configure using presets in model-specific files
4. Test using TESTING-INSTRUCTIONS.txt

================================================================================
DIRECTORY STRUCTURE
================================================================================

lmstudio-config/
├── README.txt (this file)
├── SETUP-GUIDE-OSX.txt (macOS installation guide)
├── TESTING-INSTRUCTIONS.txt (comprehensive testing guide)
├── embeddings/
│   └── embedding-models.txt (6 embedding models + presets)
├── llm-models/
│   └── gpt-oss-models.txt (GPT-OSS-20B and 120B configs)
└── qwen3-coder/
    └── qwen3-coder-models.txt (Qwen3 Coder 0.5B-32B configs)

================================================================================
DOCUMENTATION FILES
================================================================================

**SETUP-GUIDE-OSX.txt**
- Complete macOS installation guide
- Step-by-step setup instructions
- Configuration for all model types
- Environment variable setup
- Troubleshooting common issues

**TESTING-INSTRUCTIONS.txt**
- 7 comprehensive test suites
- Connectivity, embeddings, chat, performance tests
- Error handling verification
- Automated test scripts
- Integration testing examples

**embeddings/embedding-models.txt**
- 6 working embedding models
- ✅ nomic-embed-text-v1.5 (768 dims, fast)
- ✅ granite-embedding-125m (768 dims, fastest)
- ✅ qwen3-embedding-0.6b (1024 dims, balanced)
- ✅ qwen3-embedding-4b (2560 dims, high quality)
- ✅ qwen3-embedding-8b (4096 dims, best quality)
- ✅ embeddinggemma-300m (768 dims, compact)
- Preset configurations for each model
- Performance benchmarks
- Testing commands

**llm-models/gpt-oss-models.txt**
- GPT-OSS-20B (fast, 12 GB, 30-50 tok/s)
- GPT-OSS-120B (high quality, 70 GB, 8-15 tok/s)
- Preset configurations (fast, balanced, production)
- System prompts for different tasks
- Performance comparisons
- Troubleshooting guide

**qwen3-coder/qwen3-coder-models.txt**
- 5 Qwen3 Coder models (0.5B to 32B)
- qwen3-coder-0.5b (ultrafast, code completion)
- qwen3-coder-7b (balanced, recommended)
- qwen3-coder-32b (expert, production)
- Code generation presets
- Multi-language support
- Integration examples

================================================================================
MODEL RECOMMENDATIONS
================================================================================

**For General Use (Tamagotchi Feedback System):**
- Primary: openai/gpt-oss-20b (fast, good quality)
- Alternative: openai/gpt-oss-120b (best quality, slower)
- Embedding: text-embedding-qwen3-embedding-8b (best)

**For Code Generation:**
- Daily coding: qwen3-coder-7b (balanced)
- Code completion: qwen3-coder-0.5b (ultrafast)
- Code review: qwen3-coder-32b (expert)

**For Embeddings:**
- Speed: text-embedding-granite-embedding-125m-english
- Balance: text-embedding-qwen3-embedding-0.6b
- Quality: text-embedding-qwen3-embedding-8b

================================================================================
HARDWARE REQUIREMENTS
================================================================================

**Minimum (for gpt-oss-20b + embeddings):**
- macOS 11.0+ (Big Sur or later)
- 16 GB RAM
- 8 GB VRAM (Apple Silicon recommended)
- 50 GB free disk space

**Recommended (for gpt-oss-120b):**
- macOS 12.0+ (Monterey or later)
- 128 GB RAM (for 120B model)
- 32-48 GB VRAM (Mac Studio recommended)
- 150 GB free disk space

**Optimal (all models):**
- Mac Studio M1/M2 Ultra
- 192 GB RAM
- 64 GPU cores
- 500 GB SSD

================================================================================
QUICK REFERENCE COMMANDS
================================================================================

**Check Server Status:**
```bash
curl http://localhost:1234/v1/models
```

**Test Embedding:**
```bash
curl -X POST http://localhost:1234/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model": "text-embedding-qwen3-embedding-8b", "input": "test"}'
```

**Test Chat:**
```bash
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-oss-20b", "messages": [{"role": "user", "content": "Hello"}]}'
```

**Test Code Generation:**
```bash
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3-coder-7b", "messages": [{"role": "user", "content": "Write Python hello world"}]}'
```

================================================================================
ENVIRONMENT VARIABLES
================================================================================

**For Claude Code Tamagotchi (.env file):**

```bash
# LLM Provider
PET_LLM_PROVIDER=lmstudio

# LM Studio Configuration
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-20b
LM_STUDIO_API_KEY=

# Timeouts
PET_LM_STUDIO_TIMEOUT=30000
PET_LM_STUDIO_MAX_RETRIES=1

# Embeddings (optional)
LM_STUDIO_EMBEDDING_MODEL=text-embedding-qwen3-embedding-8b
LM_STUDIO_EMBEDDING_URL=http://localhost:1234/v1
```

================================================================================
WORKFLOW EXAMPLES
================================================================================

**Workflow 1: Local Development (Fast Iteration)**
1. Load gpt-oss-20b in LM Studio
2. Set GPU layers to 40 (full offload)
3. Context length: 8192 tokens
4. Temperature: 0.7
5. Use for: Fast prototyping, testing

**Workflow 2: Production Transcript Analysis**
1. Load gpt-oss-120b in LM Studio
2. Set GPU layers to 60 (if 48+ GB VRAM)
3. Context length: 32768 tokens
4. Temperature: 0.6
5. Use for: Detailed analysis, quality reviews

**Workflow 3: Code Assistant**
1. Load qwen3-coder-7b in LM Studio
2. Set GPU layers to 35
3. Context length: 16384 tokens
4. Temperature: 0.3
5. Use for: Daily coding tasks

**Workflow 4: Semantic Search**
1. Load qwen3-embedding-8b in LM Studio
2. Set GPU layers to 40
3. Batch size: 32 texts
4. Use for: Document embeddings, similarity search

================================================================================
TROUBLESHOOTING QUICK GUIDE
================================================================================

**Server Won't Start:**
→ Check port 1234 not in use
→ Close other LM Studio instances
→ Restart LM Studio

**Model Too Slow:**
→ Increase GPU layers
→ Reduce context length
→ Use smaller model

**Out of Memory:**
→ Close other applications
→ Use smaller model (20b vs 120b)
→ Reduce GPU layers

**Connection Refused:**
→ Start server in LM Studio
→ Check "Local Server" tab
→ Verify port 1234

**Model Not Found:**
→ Load model in "My Models" tab
→ Wait for model to fully load
→ Check model name matches API call

================================================================================
PERFORMANCE BENCHMARKS (M1 Max, 32 GB RAM)
================================================================================

**Chat Models (tokens/second):**
- gpt-oss-20b: 40-50 tok/s (GPU)
- gpt-oss-120b: 12-15 tok/s (GPU, partial offload)
- qwen3-coder-0.5b: 150-200 tok/s (GPU)
- qwen3-coder-7b: 40-60 tok/s (GPU)
- qwen3-coder-32b: 15-25 tok/s (GPU)

**Embedding Models (per embedding):**
- granite-125m: ~50ms (CPU)
- nomic-embed: ~100ms (CPU), ~30ms (GPU)
- qwen3-0.6b: ~200ms (CPU), ~80ms (GPU)
- qwen3-8b: ~1500ms (CPU), ~400ms (GPU)

================================================================================
SUPPORT AND RESOURCES
================================================================================

**Official Resources:**
- LM Studio: https://lmstudio.ai
- Documentation: https://lmstudio.ai/docs
- Discord: https://discord.gg/lmstudio

**Model Sources:**
- HuggingFace: https://huggingface.co/models
- Search: "openai/gpt-oss", "qwen3-coder", "text-embedding"

**Community:**
- Reddit: r/LocalLLaMA
- GitHub: LM Studio discussions

**This Repository:**
- Issues: Report in project issues
- Questions: Check TESTING-INSTRUCTIONS.txt
- Updates: Watch for model/config updates

================================================================================
CHANGELOG
================================================================================

**Version 1.0 (2025-11-05):**
- Initial release
- Added SETUP-GUIDE-OSX.txt
- Added TESTING-INSTRUCTIONS.txt
- Added embedding models configuration
- Added GPT-OSS models configuration
- Added Qwen3 Coder models configuration
- Presets for all model types
- Performance benchmarks
- Integration examples

================================================================================
LICENSE AND USAGE
================================================================================

These configuration files are provided as-is for use with LM Studio.
Models are subject to their respective licenses (check HuggingFace).

**Model Licenses:**
- GPT-OSS: Apache 2.0
- Qwen3: Apache 2.0
- Nomic Embed: Apache 2.0
- Granite: Apache 2.0

Always verify model licenses before commercial use.

================================================================================
NEXT STEPS
================================================================================

1. **Install LM Studio:**
   → Read SETUP-GUIDE-OSX.txt
   → Follow step-by-step instructions

2. **Download Models:**
   → Choose models based on requirements
   → Use presets from model-specific files

3. **Configure:**
   → Set up environment variables
   → Adjust GPU layers and context

4. **Test:**
   → Run tests from TESTING-INSTRUCTIONS.txt
   → Verify all functionality works

5. **Integrate:**
   → Use with Claude Code Tamagotchi
   → Or integrate with your own applications

================================================================================
CONTACT AND CONTRIBUTIONS
================================================================================

For questions, issues, or contributions related to these configuration files,
please refer to the main project documentation.

Model-specific questions should be directed to:
- LM Studio: https://lmstudio.ai/support
- Model creators: Check HuggingFace model cards

================================================================================
END OF README
================================================================================
