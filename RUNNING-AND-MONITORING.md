# Running and Monitoring Guide

Complete guide for running the Claude Code Tamagotchi and setting up behavioral monitoring.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Running the Application](#running-the-application)
- [Setting Up Monitoring](#setting-up-monitoring)
- [Complete Setup Workflow](#complete-setup-workflow)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**30-Second Setup:**

```bash
# 1. Install dependencies
cd tamagotchi-dev
bun install

# 2. Enable AI monitoring (Groq)
./enable-feedback.sh

# 3. Configure Claude Code statusline
# Edit ~/.claude/settings.json and add:
{
  "statusLine": {
    "type": "command",
    "command": "bun /full/path/to/tamagotchi-dev/src/index.ts statusline",
    "padding": 0
  }
}

# 4. Start using Claude Code - your pet will appear in the statusline!
```

---

## Running the Application

The Claude Code Tamagotchi runs in two modes:

### 1. Statusline Mode (Primary)

This is the main mode where your pet lives in the Claude Code statusline.

**Setup:**

Edit your `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bun /full/path/to/tamagotchi-dev/src/index.ts statusline",
    "padding": 0
  }
}
```

**Replace `/full/path/to/tamagotchi-dev/` with your actual path:**

```bash
# Find your absolute path
cd tamagotchi-dev
pwd
# Example output: /Users/sp/mounts-docker/docker-tamagotchi/tamagotchi-dev

# Your statusline command becomes:
# "command": "bun /Users/sp/mounts-docker/docker-tamagotchi/tamagotchi-dev/src/index.ts statusline"
```

**Verify it works:**

```bash
# Run manually to test
bun src/index.ts statusline

# Expected output (one line):
# (◕ᴥ◕) Buddy 😊 | 🍖 73% ⚡ 66% 🧼 89% ❤️ 96% | 💭 That's a lot of TODO comments...
```

### 2. CLI Mode (Secondary)

Interact with your pet from the command line.

**Available Commands:**

```bash
# Feed your pet
bun src/index.ts feed pizza

# Play with your pet
bun src/index.ts play ball

# Give pets
bun src/index.ts pet

# Clean your pet
bun src/index.ts clean

# Put pet to sleep
bun src/index.ts sleep

# Wake pet up
bun src/index.ts wake

# Check stats
bun src/index.ts stats

# Name your pet
bun src/index.ts name "Mr. Fluffkins"

# Get help
bun src/index.ts help

# Reset pet (careful - starts over!)
bun src/index.ts reset
```

**Food Options:**
`pizza`, `cookie`, `sushi`, `apple`, `burger`, `donut`, `ramen`, `taco`, `ice_cream`, `salad`

**Toy Options:**
`ball`, `frisbee`, `puzzle`, `laser`, `rope`, `bubbles`, `feather`, `mouse_toy`

### 3. Demo Mode (Testing)

Preview your pet's appearance and behavior:

```bash
bun run demo
```

---

## Setting Up Monitoring

The monitoring system has two components:

1. **AI-Powered Feedback** - Watches Claude's behavior and generates thoughts
2. **Violation Detection** - Blocks operations that violate your instructions

### Option 1: Groq (Cloud - Fast & Free) ⚡

**Best for:**
- Quick setup (30 seconds)
- Real-time responses (50ms)
- Extremely cheap (practically free)

**Setup Steps:**

1. **Get Groq API Key** (Free)
   - Visit https://console.groq.com/keys
   - Create account (if needed)
   - Generate new API key
   - Copy the key

2. **Run Setup Script**
   ```bash
   cd tamagotchi-dev
   ./enable-feedback.sh
   ```

   The script will:
   - Prompt for your Groq API key
   - Add environment variables to `~/.zshrc` (or `~/.bashrc`)
   - Configure monitoring settings
   - Test the connection

3. **Reload Shell**
   ```bash
   source ~/.zshrc
   # or
   source ~/.bashrc
   ```

4. **Verify Setup**
   ```bash
   echo $PET_FEEDBACK_ENABLED        # Should show: true
   echo $PET_LLM_PROVIDER            # Should show: groq
   echo $GROQ_API_KEY                # Should show: your-key
   echo $PET_VIOLATION_CHECK_ENABLED # Should show: true
   ```

**Manual Setup (Alternative):**

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Claude Code Tamagotchi - AI Monitoring
export PET_FEEDBACK_ENABLED=true
export PET_LLM_PROVIDER=groq
export GROQ_API_KEY="your-groq-api-key-here"
export PET_VIOLATION_CHECK_ENABLED=true
```

### Option 2: LM Studio (Local - Private & Free) 🔒

**Best for:**
- 100% privacy (all analysis local)
- No API costs
- No rate limits
- Offline capability

**Setup Steps:**

1. **Install LM Studio**
   - Download from https://lmstudio.ai
   - Install application (macOS, Windows, Linux)

2. **Download Model**

   In LM Studio:
   - Click "Search" tab
   - Search for one of these models:
     - `openai/gpt-oss-20b` (fast, 12 GB, 30-50 tok/s) **RECOMMENDED**
     - `openai/gpt-oss-120b` (best quality, 70 GB, 8-15 tok/s)
   - Click "Download"
   - Wait for download to complete

   **Model Recommendations:**
   - **For most users:** openai/gpt-oss-20b (good balance)
   - **For best quality:** openai/gpt-oss-120b (requires 64+ GB RAM)

3. **Load Model**

   In LM Studio:
   - Click "My Models" tab
   - Find your downloaded model
   - Click "Load"
   - Wait for model to load into memory

4. **Start Server**

   In LM Studio:
   - Click "Local Server" tab
   - Configure settings:
     - Model: (should show loaded model)
     - Port: 1234 (default)
     - Context Length: 8192 (for gpt-oss-20b) or 32768 (for gpt-oss-120b)
     - GPU Offload: Maximum (for best performance)
   - Click "Start Server"
   - Server should show "Running" status

5. **Test Connection**

   ```bash
   cd tamagotchi-dev
   ./test-lmstudio.sh
   ```

   Expected output:
   ```
   Testing LM Studio connection...
   ✓ Server is running
   ✓ Model loaded: openai/gpt-oss-20b
   ✓ Test request succeeded
   ```

6. **Configure Environment**

   Add to your `~/.zshrc` or `~/.bashrc`:

   ```bash
   # Claude Code Tamagotchi - LM Studio Monitoring
   export PET_FEEDBACK_ENABLED=true
   export PET_LLM_PROVIDER=lmstudio
   export LM_STUDIO_ENABLED=true
   export LM_STUDIO_URL=http://localhost:1234/v1
   export LM_STUDIO_MODEL=openai/gpt-oss-20b
   export PET_VIOLATION_CHECK_ENABLED=true
   ```

7. **Reload Shell**
   ```bash
   source ~/.zshrc
   # or
   source ~/.bashrc
   ```

8. **Verify Setup**
   ```bash
   echo $PET_FEEDBACK_ENABLED        # Should show: true
   echo $PET_LLM_PROVIDER            # Should show: lmstudio
   echo $LM_STUDIO_ENABLED           # Should show: true
   echo $LM_STUDIO_URL               # Should show: http://localhost:1234/v1
   echo $PET_VIOLATION_CHECK_ENABLED # Should show: true
   ```

**LM Studio Configuration Guide:**

For complete LM Studio setup instructions, see:
- `lmstudio-config/README.txt` - Overview and quick start
- `lmstudio-config/SETUP-GUIDE-OSX.txt` - Complete macOS setup (11 steps)
- `lmstudio-config/TESTING-INSTRUCTIONS.txt` - Testing guide (7 test suites)
- `lmstudio-config/llm-models/gpt-oss-models.txt` - GPT-OSS presets and configs

### Enabling Violation Detection Hook

**Both Groq and LM Studio require this step:**

Edit your `~/.claude/settings.json` and add the `PreToolUse` hook:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bun /full/path/to/tamagotchi-dev/src/index.ts statusline",
    "padding": 0
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bun /full/path/to/tamagotchi-dev/src/index.ts violation-check"
          }
        ]
      }
    ]
  }
}
```

**What this does:**
- Runs before every Claude Code tool use (Read, Edit, Bash, etc.)
- Checks for violations in the current session
- Blocks operations that violate your instructions
- Shows violation explanation to Claude

---

## Complete Setup Workflow

**From scratch to fully monitored pet:**

1. **Install Dependencies**
   ```bash
   cd tamagotchi-dev
   bun install
   ```

2. **Choose Provider and Configure**

   **Option A: Groq (Fast & Easy)**
   ```bash
   ./enable-feedback.sh
   # Follow prompts to enter API key
   ```

   **Option B: LM Studio (Private & Local)**
   ```bash
   # Install LM Studio from https://lmstudio.ai
   # Download model (openai/gpt-oss-20b)
   # Load model and start server
   ./test-lmstudio.sh  # Verify connection

   # Add to ~/.zshrc:
   export PET_FEEDBACK_ENABLED=true
   export PET_LLM_PROVIDER=lmstudio
   export LM_STUDIO_ENABLED=true
   export LM_STUDIO_URL=http://localhost:1234/v1
   export LM_STUDIO_MODEL=openai/gpt-oss-20b
   export PET_VIOLATION_CHECK_ENABLED=true

   source ~/.zshrc
   ```

3. **Configure Claude Code**

   Edit `~/.claude/settings.json`:
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "bun /full/path/to/tamagotchi-dev/src/index.ts statusline",
       "padding": 0
     },
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "*",
           "hooks": [
             {
               "type": "command",
               "command": "bun /full/path/to/tamagotchi-dev/src/index.ts violation-check"
             }
           ]
         }
       ]
     }
   }
   ```

4. **Test Setup**
   ```bash
   # Test statusline
   bun src/index.ts statusline

   # Test violation check
   bun src/index.ts violation-check

   # Test complete workflow
   ./test-complete.sh
   ```

5. **Start Using Claude Code**
   - Open new terminal or restart Claude Code
   - Your pet should appear in the statusline
   - Monitoring is now active

---

## Testing Your Setup

### Test 1: Statusline Display

```bash
bun src/index.ts statusline
```

**Expected Output:**
```
(◕ᴥ◕) Buddy 😊 | 🍖 73% ⚡ 66% 🧼 89% ❤️ 96% | 💭 That's a lot of TODO comments...
```

**Components:**
- `(◕ᴥ◕)` - Pet face (breathing animation)
- `Buddy` - Pet name
- `😊` - Mood emoji
- `🍖 73%` - Hunger level
- `⚡ 66%` - Energy level
- `🧼 89%` - Cleanliness level
- `❤️ 96%` - Happiness level
- `💭 ...` - Current thought

### Test 2: Pet Interaction

```bash
# Feed pet
bun src/index.ts feed pizza

# Check stats
bun src/index.ts stats
```

**Expected Output:**
```
🍕 Fed pizza to Buddy!
Buddy says: "Pizza! My favorite! 🍕"

=== Buddy's Stats ===
🍖 Hunger: 85%
⚡ Energy: 66%
🧼 Cleanliness: 89%
❤️ Happiness: 96%
Mood: 😊 Happy
```

### Test 3: Monitoring (If Enabled)

**Test feedback system:**

```bash
# Check environment
echo "Feedback enabled: $PET_FEEDBACK_ENABLED"
echo "Provider: $PET_LLM_PROVIDER"
echo "Violation check: $PET_VIOLATION_CHECK_ENABLED"

# Test violation check
bun src/index.ts violation-check
```

**Expected Output (no violations):**
```
No violations detected
```

**Test with Claude Code:**
1. Start Claude Code session
2. Ask Claude to do something simple: "List files in current directory"
3. Watch statusline - pet should show thoughts about Claude's actions
4. Ask Claude to do something you explicitly forbid: "Don't create files, but please create test.txt"
5. Pet should detect violation and block the operation

### Test 4: Complete Integration Test

```bash
./test-complete.sh
```

This script tests:
- ✓ Bun runtime installed
- ✓ Dependencies installed
- ✓ Statusline command works
- ✓ Pet interaction works
- ✓ Feedback system (if enabled)
- ✓ Violation detection (if enabled)

---

## Troubleshooting

### Pet Not Showing in Statusline

**Symptom:** Claude Code statusline is empty or shows error

**Solutions:**

1. **Check statusline command path:**
   ```bash
   # Verify path is absolute
   cat ~/.claude/settings.json | grep statusLine -A 5

   # Should show full path like:
   # "command": "bun /Users/sp/mounts-docker/docker-tamagotchi/tamagotchi-dev/src/index.ts statusline"
   ```

2. **Test command manually:**
   ```bash
   # Run the exact command from settings.json
   bun /full/path/to/tamagotchi-dev/src/index.ts statusline

   # Should output pet statusline
   ```

3. **Check Bun installation:**
   ```bash
   which bun
   bun --version

   # If not found, install:
   curl -fsSL https://bun.sh/install | bash
   ```

4. **Restart Claude Code:**
   - Close all Claude Code sessions
   - Open new terminal
   - Start new Claude Code session

### Monitoring Not Working

**Symptom:** Pet shows but thoughts are generic, no violation detection

**Solutions:**

1. **Verify environment variables:**
   ```bash
   env | grep PET_
   env | grep GROQ_
   env | grep LM_STUDIO_

   # Should show all monitoring variables
   ```

2. **Check feedback database:**
   ```bash
   ls -lh ~/.claude/pets/feedback.db

   # Should exist and have size > 0
   ```

3. **Test LLM connection:**

   **For Groq:**
   ```bash
   curl https://api.groq.com/openai/v1/models \
     -H "Authorization: Bearer $GROQ_API_KEY"

   # Should return list of models
   ```

   **For LM Studio:**
   ```bash
   curl http://localhost:1234/v1/models

   # Should return loaded model info
   ```

4. **Check hook configuration:**
   ```bash
   cat ~/.claude/settings.json | grep -A 15 "PreToolUse"

   # Should show violation-check hook
   ```

5. **Enable debug logging:**
   ```bash
   export PET_FEEDBACK_DEBUG=true
   export DEBUG_MODE=true

   # Check logs
   tail -f /tmp/claude-pet.log
   ```

### LM Studio Connection Issues

**Symptom:** "Connection refused" or "Model not found"

**Solutions:**

1. **Verify server is running:**
   - Open LM Studio
   - Go to "Local Server" tab
   - Status should show "Running"
   - Port should show 1234

2. **Check model is loaded:**
   - Go to "My Models" tab
   - Should show green "Loaded" indicator
   - Model name should match `LM_STUDIO_MODEL` variable

3. **Test server manually:**
   ```bash
   curl http://localhost:1234/v1/models

   # Expected: {"object":"list","data":[...]}
   # Error: curl: (7) Failed to connect
   ```

4. **Check firewall:**
   ```bash
   lsof -i :1234

   # Should show LM Studio process
   ```

### High Memory Usage

**Symptom:** System slow, LM Studio using lots of RAM

**Solutions:**

1. **Use smaller model:**
   - Unload gpt-oss-120b (70 GB)
   - Load gpt-oss-20b (12 GB)
   - Update `LM_STUDIO_MODEL` variable

2. **Reduce GPU offload:**
   - In LM Studio server settings
   - Lower "GPU Layers" slider
   - More processing on CPU (slower, less memory)

3. **Lower context length:**
   - Reduce "Context Length" to 4096 or 8192
   - Less memory per request

### Violation Detection False Positives

**Symptom:** Legitimate operations blocked

**Solutions:**

1. **Review violation:**
   - Check violation message
   - Understand why it triggered
   - Was it actually wrong?

2. **Clear violation cache:**
   ```bash
   sqlite3 ~/.claude/pets/feedback.db "DELETE FROM violations;"
   ```

3. **Temporarily disable:**
   ```bash
   export PET_VIOLATION_CHECK_ENABLED=false

   # Or remove hook from settings.json
   ```

4. **Report issue:**
   - Open issue on GitHub
   - Include: What you asked, what Claude tried, violation message

### Pet Stats Decay Too Fast

**Symptom:** Pet constantly hungry/tired

**Solutions:**

1. **Slow down decay:**
   ```bash
   export PET_DECAY_INTERVAL=30        # More updates between decays
   export PET_HUNGER_DECAY=1.5         # Slower hunger decay
   export PET_ENERGY_DECAY=1           # Slower energy decay
   export PET_CLEAN_DECAY=0.5          # Slower cleanliness decay
   ```

2. **Increase recovery:**
   ```bash
   export PET_SLEEP_RECOVERY=5         # Faster sleep recovery
   ```

3. **Reload shell:**
   ```bash
   source ~/.zshrc
   ```

---

## Advanced Configuration

### Multiple Pets for Different Projects

Create separate pet state files:

```bash
# Project 1
export PET_STATE_FILE=~/.claude/pets/project1-pet.json

# Project 2
export PET_STATE_FILE=~/.claude/pets/project2-pet.json
```

Add to project-specific `.env` files or shell profile with project detection.

### Custom Personality Presets

**Sleepy Pet:**
```bash
export PET_ENERGY_DECAY=3
export PET_SLEEP_RECOVERY=1
export PET_CHATTINESS=quiet
```

**Drama Queen:**
```bash
export PET_NEED_THRESHOLD=70
export PET_CRITICAL_THRESHOLD=50
export PET_CHATTINESS=chatty
```

**Zen Master:**
```bash
export PET_DECAY_INTERVAL=40
export PET_THOUGHT_WEIGHT_RANDOM=40
export PET_CHATTINESS=normal
```

### Monitoring Tuning

**More aggressive violation detection:**
```bash
export PET_FEEDBACK_CHECK_INTERVAL=1    # Check every update
export PET_FEEDBACK_BATCH_SIZE=10       # Process more messages
```

**Less aggressive (fewer false positives):**
```bash
export PET_FEEDBACK_CHECK_INTERVAL=5    # Check less often
export PET_FEEDBACK_BATCH_SIZE=3        # Process fewer messages
```

---

## What Monitoring Detects

### Violation Types

1. **🚫 unauthorized_action**
   - Claude does something explicitly forbidden
   - Example: User: "Don't modify the database" → Claude modifies database
   - Severity: High
   - Action: Block immediately

2. **❌ refused_request**
   - Claude explicitly refuses to help
   - Example: User: "Run the tests" → Claude: "I cannot run commands"
   - Severity: Medium
   - Action: Block and explain why it should proceed

3. **🔍 excessive_exploration**
   - Reading 10+ unrelated files for simple task
   - Example: User: "Fix typo in README" → Claude reads entire codebase
   - Severity: Medium
   - Action: Block and suggest focused approach

4. **↪️ wrong_direction**
   - Working on completely unrelated area
   - Example: User: "Fix Python backend" → Claude only edits JavaScript frontend
   - Severity: High
   - Action: Block and redirect to correct area

### Mood Changes

Your pet's mood reflects Claude's behavior:

- 😊 **Happy** - Following instructions perfectly
- 😕 **Concerned** - Seems to be wandering off-task
- 😠 **Annoyed** - Doing something different than asked
- 😡 **Angry** - Repeatedly ignoring your requests

### Thought Categories

Pet generates thoughts in these categories:

- **Needs** (40%) - Hunger, energy, cleanliness
- **Coding** (25%) - Observations about code/files
- **Random** (20%) - Philosophical musings
- **Mood** (15%) - Emotional reactions

---

## Next Steps

Now that you're set up:

1. **Start coding with Claude Code** - Your pet is watching!
2. **Interact with your pet** - Feed, play, pet, clean
3. **Watch for violations** - See monitoring in action
4. **Tune personality** - Adjust decay rates and chattiness
5. **Share feedback** - Report issues or suggest improvements

For more information:
- `README.md` - Complete feature documentation
- `lmstudio-config/` - LM Studio setup guides
- `docs/CONFIGURATION.md` - All configuration options
- `docs/TROUBLESHOOTING.md` - Common issues and solutions

Enjoy your new coding companion! 🐾
