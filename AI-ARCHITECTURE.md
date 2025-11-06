# Claude Code Tamagotchi - AI Architecture Explained

## TL;DR: Which Commands Use What?

### ❌ Pet Commands DON'T Use LLMs (Local Only)
All basic pet care commands run **entirely locally** with NO AI:

```
/pet-feed pizza     ← No LLM, just updates state file
/pet-play ball      ← No LLM, just updates state file
/pet-clean          ← No LLM, just updates state file
/pet-sleep          ← No LLM, just updates state file
/pet-wake           ← No LLM, just updates state file
/pet-pet            ← No LLM, just updates state file
/pet-stats          ← No LLM, reads state file
/pet-status         ← No LLM, reads state file
/pet-name Rex       ← No LLM, updates state file
/pet-reset          ← No LLM, deletes state file
```

**How They Work**:
1. You type `/pet-feed pizza` in Claude Code
2. Claude reads the slash command file: `~/.claude/commands/pet-feed.md`
3. Claude executes: `node /path/to/bin/claude-code-tamagotchi.cjs feed pizza`
4. The CLI script updates `~/.claude/pets/claude-pet-state.json`
5. No AI involved - just file I/O!

---

### 🤖 LM Studio Is Used For (Optional Features)

LM Studio provides **AI-powered observations** that run in the background:

#### 1. Contextual Thoughts (AI Observations)
**When Enabled**: Shows witty observations in statusline

```
💭 "That's a lot of TODO comments..."
💭 "Back to README.md? There must be gold in there!"
💭 "Straight to the bug! Someone came prepared today!"
```

**How It Works**:
1. Pet monitors your Claude Code conversation
2. Sends action summaries to LM Studio API
3. LM Studio generates contextual observation
4. Observation appears in statusline

**Configuration** (in `.env`):
```bash
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
LM_STUDIO_MODEL=openai/gpt-oss-120b
```

#### 2. Violation Detection (AI Enforcement)
**When Enabled**: Blocks Claude from violating your instructions

**Examples**:
- You: "Don't modify the database"
- Claude: *tries to modify database*
- Pet: 🚫 BLOCKS the operation

**How It Works**:
1. Pet analyzes your request to Claude
2. Pet monitors Claude's actual actions
3. If mismatch detected, LM Studio confirms violation
4. Pet blocks the operation before execution

**Configuration** (in `.env`):
```bash
PET_VIOLATION_CHECK_ENABLED=true
```

---

### 💬 Claude (Anthropic API) Is Used For

Claude provides the **conversational wrapper** around commands:

#### What Claude Does:
1. **Interprets slash commands** - Reads `~/.claude/commands/pet-*.md`
2. **Executes bash commands** - Runs the pet CLI
3. **Formats responses** - Adds personality and commentary
4. **Provides context** - Explains what happened

#### Example Flow:

**You Type**: `/pet-feed pizza`

**Claude's Role**:
```
1. Reads: ~/.claude/commands/pet-feed.md
2. Sees command: !node /path/to/bin/claude-code-tamagotchi.cjs feed pizza
3. Executes the command (bash)
4. Gets output: "Feeding pizza to your pet! 🍕"
5. Adds personality: "Your pet just devoured that pizza like it was
   their last meal! They're doing a little happy dance now..."
```

**Claude DOES NOT**:
- Decide what the command does (that's hardcoded in the CLI)
- Update pet stats (that's done by the local CLI)
- Generate the core pet logic (that's TypeScript code)

Claude is just the **UI layer** that makes it conversational!

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         YOU (User)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Types: /pet-feed pizza
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE CODE (Anthropic)                   │
│  • Reads slash command file                                 │
│  • Executes bash command                                    │
│  • Adds conversational wrapper                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Executes: node bin/claude-code-tamagotchi.cjs feed pizza
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              LOCAL CLI (No AI - Pure Logic)                 │
│  • src/c3_pet_commands/cli.ts                               │
│  • Reads: ~/.claude/pets/claude-pet-state.json             │
│  • Updates hunger stat: 70% → 95%                           │
│  • Writes: ~/.claude/pets/claude-pet-state.json            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         LM STUDIO (Optional - Background Only)              │
│  • Monitors Claude's conversation (background)              │
│  • Generates AI observations: "💭 interesting..."          │
│  • Detects violations (if enabled)                          │
│  • Model: openai/gpt-oss-120b (local inference)            │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ Background monitoring (async, non-blocking)
         │
    (Pet watches Claude's actions and generates thoughts)
```

---

## Detailed Breakdown by Component

### 1. Statusline (src/index.ts)
**Uses**: Nothing (pure rendering)
**Purpose**: Display pet face, stats, thoughts

```bash
# No LLM used
echo '{}' | bun run --silent src/index.ts
# Output: (◕ᴥ◕) ☀️ Rex 😊 | 🍖 95% ⚡ 80% 🧼 100% ❤️ 100%
```

### 2. Pet Commands (src/c3_pet_commands/)
**Uses**: Nothing (pure state management)
**Purpose**: Update pet stats in state file

```bash
# No LLM used
bun run src/c3_pet_commands/cli.ts feed pizza
# Just updates: ~/.claude/pets/claude-pet-state.json
```

### 3. AI Feedback System (src/c2_pet_feedback/)
**Uses**: LM Studio API (optional)
**Purpose**: Generate contextual observations

```bash
# Uses LM Studio (if enabled)
# Monitors conversation → sends to LM Studio → generates thought
# Result: 💭 "That's a lot of TODO comments..."
```

**API Call Example**:
```typescript
POST http://host.docker.internal:1234/v1/chat/completions
{
  "model": "openai/gpt-oss-120b",
  "messages": [
    {"role": "system", "content": "You are a witty pet observing coding..."},
    {"role": "user", "content": "Claude is editing README.md again"}
  ]
}
```

### 4. Violation Detection (src/c3_pet_commands/violation_check.ts)
**Uses**: LM Studio API (optional)
**Purpose**: Detect when Claude violates instructions

```bash
# Uses LM Studio (if enabled)
# Analyzes: user request + Claude's action → violation?
# If yes: blocks operation
```

### 5. Slash Commands (~/.claude/commands/)
**Uses**: Claude Code execution engine
**Purpose**: Execute bash commands

```markdown
# pet-feed.md
!node /path/to/bin/claude-code-tamagotchi.cjs feed $ARGUMENTS
```

Claude reads this, executes the bash command, shows output.

---

## Configuration Matrix

| Component | Uses LM Studio? | Uses Claude? | Uses Local Logic? |
|-----------|----------------|--------------|-------------------|
| `/pet-feed` | ❌ No | ✅ Yes (wrapper) | ✅ Yes (core logic) |
| `/pet-play` | ❌ No | ✅ Yes (wrapper) | ✅ Yes (core logic) |
| `/pet-stats` | ❌ No | ✅ Yes (wrapper) | ✅ Yes (read state) |
| Statusline | ❌ No | ❌ No | ✅ Yes (render) |
| AI Thoughts | ✅ Yes (optional) | ❌ No | ✅ Yes (collect data) |
| Violation Check | ✅ Yes (optional) | ❌ No | ✅ Yes (detect mismatch) |

---

## Cost & Performance

### Free (No API Costs)
- ✅ All pet commands (feed, play, clean, etc.)
- ✅ Statusline display
- ✅ State persistence
- ✅ Basic pet functionality

### Requires LM Studio (Free but Needs Setup)
- AI-powered thoughts/observations
- Violation detection
- Contextual mood changes

**Note**: LM Studio runs **locally on your machine** - no cloud API costs!

### Included with Claude Code Subscription
- Conversational wrapper around commands
- Slash command execution
- Claude's personality/commentary

---

## Enabling/Disabling Features

### Disable AI Features (Maximum Privacy)
```bash
# In .env file
PET_FEEDBACK_ENABLED=false
PET_VIOLATION_CHECK_ENABLED=false
```

**Result**: Pet still works fully, just no AI observations

### Enable AI Features (Maximum Intelligence)
```bash
# In .env file
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b
PET_VIOLATION_CHECK_ENABLED=true
```

**Result**: Pet generates witty observations and detects violations

---

## Privacy & Data Flow

### What Stays Local (Never Leaves Your Machine)
- ✅ Pet state file (`~/.claude/pets/claude-pet-state.json`)
- ✅ All pet commands execution
- ✅ LM Studio inference (if using local LM Studio)
- ✅ Statusline rendering

### What Goes to Anthropic (Claude Code)
- ✅ Your slash command input (e.g., "/pet-feed pizza")
- ✅ Command execution results
- ✅ Conversation context (for Claude's responses)

### What Goes to LM Studio (Optional, Local)
- ✅ Summary of Claude's actions (e.g., "edited README.md")
- ✅ Summary of user request (e.g., "user asked to fix bug")
- ❌ NOT your full conversation (only action summaries)

---

## Summary

**Core Pet Functionality**: 100% local, no AI needed
- Feed, play, clean, sleep, stats, etc.
- Just updates a JSON file on disk

**Claude's Role**: Conversational UI wrapper
- Reads your slash commands
- Executes bash commands
- Adds personality to responses

**LM Studio's Role**: Optional AI enhancements
- Generates witty observations
- Detects when Claude goes off-track
- Runs locally (no cloud costs)

**You Get**:
- ✅ Fully functional pet without any AI (if preferred)
- ✅ Enhanced experience with LM Studio (if desired)
- ✅ Conversational interface via Claude Code
- ✅ Complete privacy (everything local)
