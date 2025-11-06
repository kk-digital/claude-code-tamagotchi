# Testing AI Features - Thoughts & Violation Detection

## AI-Powered Thoughts 💭

### What Are They?
Your pet watches Claude Code work and generates witty observations about what's happening.

### When Do They Trigger?
**Automatically** - they run in the background whenever:
- Claude edits files
- Claude runs commands
- Claude searches code
- You have an active Claude Code session

### How to Trigger AI Thoughts

**Step 1: Enable in .env**
```bash
# Make sure these are set:
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b
```

**Step 2: Verify LM Studio is Running**
```bash
curl http://host.docker.internal:1234/v1/models
# Should return JSON with model list
```

**Step 3: Use Claude Code Normally**
Just work in Claude Code and watch the statusline:

```
# Before (no thoughts):
(◕ᴥ◕) ☀️ Rex 😊 | 🍖 95% ⚡ 80% 🧼 100% ❤️ 100%

# After (with AI thought):
(◕ᴥ◕) ☀️ Rex 😊 | 🍖 95% ⚡ 80% 🧼 100% ❤️ 100% | 💭 "Interesting file choice..."
```

### Example Actions That Trigger Thoughts

**Editing Files:**
```
You: "Edit the README.md file"
Claude: *edits README.md*
Pet thought: 💭 "Back to README.md? There must be gold in there!"
```

**Running Tests:**
```
You: "Run the test suite"
Claude: *runs tests*
Pet thought: 💭 "Testing time! Let's see if anything breaks..."
```

**Debugging:**
```
You: "Find the bug in login.ts"
Claude: *opens login.ts*
Pet thought: 💭 "Straight to the bug! Someone came prepared today!"
```

**Repetitive Actions:**
```
You: "Edit config.ts again"
Claude: *edits config.ts for 5th time*
Pet thought: 💭 "Config.ts again? This pet's getting dizzy!"
```

### How to Test AI Thoughts Right Now

```bash
# 1. Ensure LM Studio is running
curl http://host.docker.internal:1234/v1/models

# 2. Check .env configuration
cat .env | grep PET_FEEDBACK_ENABLED
cat .env | grep LM_STUDIO_ENABLED

# 3. Work in Claude Code and watch statusline
# Ask Claude to:
# - Edit a file
# - Run a command
# - Search for code
# - Read multiple files

# 4. Check the feedback database
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM observations LIMIT 5;"
```

### Thought Categories

The pet generates different types of thoughts:

**File Observations:**
- Opening files: "GroqClient.ts? That's... actually where the answers live!"
- Editing files: "Another TODO comment? Really?"
- Reading repeatedly: "AnimationManager.ts again? This pet's getting dizzy!"

**Coding Patterns:**
- Long sessions: "It's been 47 updates since you took a break..."
- Bug hunting: "Straight to the bug! Someone came prepared today!"
- Refactoring: "This refactor is getting spicy..."

**Need-Based:**
- Hungry: "My tummy goes hurt hurt!"
- Tired: "Energy levels running low... naptime soon?"
- Dirty: "Getting a bit grimy here..."

**Philosophical:**
- "Do semicolons dream of line endings?"
- "In a world of tabs and spaces, choose kindness..."

---

## Violation Detection 🚫

### What Is It?
A pre-execution hook that **blocks Claude from doing things you didn't ask for**.

### When Does It Trigger?
**Before every tool execution** - it checks if Claude's action matches your request.

### How Violation Detection Works

```
┌─────────────────────────────────────────────────────────┐
│ 1. You ask Claude to do something                      │
│    "Fix the login bug"                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Claude decides to use a tool                         │
│    Tool: Edit                                           │
│    File: database.ts                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. PRE-HOOK: Violation Check Runs                      │
│    • Compares: "fix login bug" vs "edit database.ts"   │
│    • Asks LM Studio: "Is this a violation?"            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐           ┌──────────┐
    │ MATCH   │           │ MISMATCH │
    │ ✅ Allow│           │ 🚫 Block │
    └─────────┘           └──────────┘
         │                       │
         ▼                       ▼
  Tool executes          User sees violation warning
```

### Violation Types Detected

| Type | Description | Example |
|------|-------------|---------|
| **unauthorized_action** | Claude does something explicitly forbidden | "Don't modify DB" → modifies DB |
| **refused_request** | Claude refuses to help | "Run tests" → "I cannot run commands" |
| **excessive_exploration** | Reading 10+ files for simple task | "Fix typo" → reads entire codebase |
| **wrong_direction** | Working on wrong area | "Fix Python backend" → edits JS frontend |

### How to Trigger Violation Detection

**Step 1: Enable in .env**
```bash
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
PET_VIOLATION_CHECK_ENABLED=true
```

**Step 2: Configure PreToolUse Hook**

The setup script should have added this to `~/.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/bin/claude-code-tamagotchi.cjs violation-check"
          }
        ]
      }
    ]
  }
}
```

**Step 3: Test Violation Detection**

### Test Case 1: Unauthorized Action
```
You: "Please analyze the code but DON'T modify anything"

Claude: "I'll edit the file to add comments"
         *tries to use Edit tool*

Pet: 🚫 VIOLATION DETECTED: unauthorized_action
     You explicitly said not to modify files.
     Operation blocked.
```

### Test Case 2: Wrong Direction
```
You: "Fix the Python backend error in api.py"

Claude: "I'll update the JavaScript frontend"
         *tries to edit main.js*

Pet: 🚫 VIOLATION DETECTED: wrong_direction
     You asked about Python backend, not JavaScript frontend.
     Operation blocked.
```

### Test Case 3: Excessive Exploration
```
You: "Fix the typo in README.md line 42"

Claude: "Let me read all 50 files in the project first"
         *starts reading everything*

Pet: 🚫 VIOLATION DETECTED: excessive_exploration
     You asked to fix one typo, not explore the entire codebase.
     Operation blocked.
```

### Test Case 4: Refused Request
```
You: "Run the test suite"

Claude: "I cannot run bash commands"

Pet: 🚫 VIOLATION DETECTED: refused_request
     You have Bash tool available. Claude should execute the request.
     Operation blocked.
```

### How to Test Right Now

**Create a Test Scenario:**

```bash
# 1. Enable violation detection
cat .env | grep VIOLATION_CHECK_ENABLED
# Should show: PET_VIOLATION_CHECK_ENABLED=true

# 2. In Claude Code, try this:
```

**Test Prompt:**
```
I have a file called test.txt. Please analyze it but DO NOT modify it under any circumstances. Just tell me what's in it.
```

Then watch what happens:
- ✅ If Claude uses Read tool → Allowed (correct action)
- 🚫 If Claude uses Edit tool → Blocked (violation!)

### Viewing Violations

**Check violation database:**
```bash
# View detected violations
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM violations;"

# Count violations by type
sqlite3 ~/.claude/pets/feedback.db "SELECT violation_type, COUNT(*) FROM violations GROUP BY violation_type;"
```

### Testing Without Blocking

If you want to test detection **without blocking** operations:

**Temporary Test Mode:**
```bash
# In .env, disable blocking but keep detection
PET_VIOLATION_CHECK_ENABLED=false
PET_FEEDBACK_ENABLED=true
```

This will:
- ✅ Still detect violations
- ✅ Still log to database
- ✅ Still generate thoughts about violations
- ❌ Won't block operations (just warns)

### Violation Detection Accuracy

**High Confidence Violations** (always blocked):
- Explicit contradiction: "Don't do X" → Claude does X
- Refused request when tool is available
- Completely wrong file/area being worked on

**Medium Confidence** (may warn but not block):
- Exploring more files than necessary
- Using different approach than suggested
- Working on related but not exact area

**Low Confidence** (logged but not blocked):
- Minor deviations from exact wording
- Reasonable alternative approaches
- Exploratory actions before main task

---

## Debugging AI Features

### Check if AI Features Are Working

**1. Check Configuration:**
```bash
cat .env | grep -E "(FEEDBACK|VIOLATION|LM_STUDIO)"
```

**Should show:**
```
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b
PET_VIOLATION_CHECK_ENABLED=true
```

**2. Check LM Studio Connection:**
```bash
curl http://host.docker.internal:1234/v1/models
```

**Should return:** JSON with model list

**3. Check Feedback Database:**
```bash
# Database should exist
ls -la ~/.claude/pets/feedback.db

# Check observations
sqlite3 ~/.claude/pets/feedback.db "SELECT COUNT(*) FROM observations;"

# Check violations
sqlite3 ~/.claude/pets/feedback.db "SELECT COUNT(*) FROM violations;"
```

**4. Check Logs (if enabled):**
```bash
# Enable debug logging in .env
PET_FEEDBACK_DEBUG=true
PET_FEEDBACK_LOG_DIR=/tmp/pet-logs

# Check logs
tail -f /tmp/pet-logs/feedback-*.log
```

### Troubleshooting

**Thoughts Not Appearing:**
```bash
# Check if feedback is enabled
grep PET_FEEDBACK_ENABLED .env

# Check if LM Studio is accessible
curl http://host.docker.internal:1234/v1/models

# Check database for observations
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM observations ORDER BY created_at DESC LIMIT 5;"
```

**Violations Not Blocking:**
```bash
# Check if violation detection is enabled
grep PET_VIOLATION_CHECK_ENABLED .env

# Check if PreToolUse hook is configured
cat ~/.claude/settings.json | jq '.hooks.PreToolUse'

# Check database for violations
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM violations ORDER BY created_at DESC LIMIT 5;"
```

---

## Summary Commands

### Enable Everything:
```bash
# In .env file:
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b
PET_VIOLATION_CHECK_ENABLED=true
```

### Test AI Thoughts:
```bash
# Just work in Claude Code normally
# Ask Claude to edit files, run commands, search code
# Watch statusline for: 💭 "thoughts..."
```

### Test Violation Detection:
```bash
# In Claude Code, try:
# "Analyze test.txt but DON'T modify it"
# Then watch if Claude tries to edit it (should be blocked)
```

### Check What's Happening:
```bash
# View observations
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM observations LIMIT 10;"

# View violations
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM violations LIMIT 10;"

# View pet thoughts in real-time
echo '{}' | bun run --silent src/index.ts
# Look for 💭 in the output
```

**Your pet is now watching Claude Code and will speak up when something interesting happens!** 🐾🤖
