# How Monitoring Works - Detailed Explanation

## Overview

The Claude Code Tamagotchi has TWO completely separate monitoring systems:

1. **AI Thoughts System** - Monitors conversation and generates observations
2. **Violation Detection System** - Blocks Claude from violating user instructions

Both run automatically, but in very different ways.

---

## System 1: AI Thoughts Monitoring

### How It Triggers

The AI thoughts system runs **AUTOMATICALLY** based on statusline updates, NOT user inputs.

#### Statusline Update Flow

```
Claude Code updates statusline constantly during work
    ↓
Every statusline update calls: bun run src/index.ts
    ↓
src/c3_pet_main/index.ts receives JSON input from Claude
    ↓
Creates PetEngine instance
    ↓
PetEngine.update(transcriptPath, sessionId) is called
    ↓
FeedbackSystem.processFeedback() is called
    ↓
TranscriptAnalyzer.quickAnalyze() runs (< 10ms)
```

### The Counter System

**Key Configuration**: `PET_FEEDBACK_CHECK_INTERVAL` (default: 5)

```typescript
// From transcript_analyzer.ts lines 38-43
this.checkCounter++;
if (this.checkCounter < this.config.checkInterval) {
    return false; // Don't process yet
}
this.checkCounter = 0; // Reset and process
```

**What This Means**:
- Statusline updates happen CONSTANTLY (multiple times per second during active work)
- The pet increments a counter on EVERY statusline update
- Only when counter reaches 5 (or configured value) does it actually analyze
- This prevents overloading the system with LLM requests

**Example Timeline**:
```
Update 1: Counter = 1, skip analysis
Update 2: Counter = 2, skip analysis
Update 3: Counter = 3, skip analysis
Update 4: Counter = 4, skip analysis
Update 5: Counter = 5, ANALYZE NOW, spawn background worker, reset counter to 0
Update 6: Counter = 1, skip analysis
... (repeat)
```

### Quick Analysis (< 10ms)

Every time the counter triggers, the system does a FAST check:

```typescript
// From transcript_analyzer.ts line 440-484
quickAnalyze(transcriptPath, sessionId) {
    // 1. Check if should spawn background worker (< 2ms)
    const shouldSpawn = this.checkCounter === 0 && !this.isProcessing;

    // 2. Get CACHED feedback from database (< 5ms)
    const cachedFeedback = this.getCachedFeedback(sessionId);

    // 3. Calculate behavior scores (< 3ms)
    const behaviorScore = this.calculateBehaviorScore(sessionId);
    const violationCount = this.getRecentViolationCount(sessionId);

    // Total: < 10ms (doesn't slow down Claude Code)
    return { shouldSpawn, cachedFeedback, behaviorScore, violationCount };
}
```

**This fast analysis**:
- Displays PREVIOUSLY GENERATED thoughts from the database
- Updates the pet's mood based on behavior score
- Decides whether to spawn a background worker

### Background Worker

When `shouldSpawn = true`, the system launches a SEPARATE PROCESS:

```typescript
// From transcript_analyzer.ts
spawnAnalysisWorker(transcriptPath, sessionId, petState) {
    const worker = spawn('bun', ['run', workerPath, transcriptPath, sessionId]);
    // Worker runs INDEPENDENTLY, doesn't block statusline
}
```

**What the background worker does**:
1. Reads the conversation transcript file
2. Extracts new messages that haven't been analyzed yet
3. Sends conversation context to LLM (LM Studio or Groq)
4. Gets AI-generated observation (the "thought")
5. Saves observation to SQLite database
6. Exits

**Important**: The background worker can take 1-10 seconds to complete (LLM inference time), but it runs INDEPENDENTLY and NEVER blocks the statusline.

### When Thoughts Appear

```
Background worker completes → Saves thought to database
    ↓
Next statusline update → quickAnalyze() runs
    ↓
getCachedFeedback() reads NEW thought from database
    ↓
Thought appears in statusline: "💭 I see you're refactoring again..."
    ↓
Thought stays visible for 5 minutes (300000ms)
```

### Frequency

**Not based on user inputs!** Based on statusline updates:

- **Idle session**: 0 updates/minute → 0 thoughts
- **Light work**: ~10 updates/minute → 2 thoughts/minute (every 5 updates)
- **Active coding**: ~60 updates/minute → 12 thoughts/minute (every 5 updates)

You can change the interval:
```bash
# .env file
PET_FEEDBACK_CHECK_INTERVAL=10  # Analyze every 10th update instead of 5th
```

---

## System 2: Violation Detection

### How It Triggers

Violation detection uses Claude Code's **PreToolUse hook** system.

#### Hook Flow

```
User gives instruction: "Never use npm, always use bun"
    ↓
Claude wants to use a tool (e.g., Bash with "npm install")
    ↓
BEFORE executing the tool, Claude Code calls PreToolUse hook
    ↓
Hook command: node bin/claude-code-tamagotchi.cjs violation-check
    ↓
violation_check.ts reads hook input from stdin (JSON)
    ↓
Queries database for unnotified violations
    ↓
If violations found → Exit code 2 → BLOCKS THE TOOL
    ↓
Claude receives correction message and must comply
```

### When Violations Are Detected

The background worker (from AI Thoughts system) analyzes conversations and can detect violations:

```typescript
// LLM analyzes conversation and generates feedback
{
    feedback_type: 'violation',
    severity: 'moderate',
    remark: 'Claude used npm instead of bun',
    funny_observation: 'Oops! Someone forgot we're Team Bun, not Team NPM!',
    claude_correction_prompt: 'USER INSTRUCTION VIOLATION: You were told to use bun, not npm. Please use "bun install" instead.',
    created_at: timestamp
}
```

This violation is saved to the database with `user_notified = false`.

### Blocking Mechanism

```typescript
// From violation_check.ts line 76-90
const allViolations = db.getUnnotifiedViolations(sessionId);
const relevantViolations = allViolations.filter(v => {
    const severityLevel = severityLevels[v.severity] || 0;
    const isRecent = v.created_at > cutoffTime;
    return severityLevel >= threshold && isRecent;
});

if (relevantViolations.length === 0) {
    process.exit(0); // Allow tool to proceed
}

// Found violations!
console.error(violation.claude_correction_prompt); // Message to Claude
db.markViolationsNotified(violationIds, messageUuid); // Mark as notified
process.exit(2); // BLOCK THE TOOL
```

**Exit code meanings**:
- `0` = Success, allow tool to proceed
- `2` = Block tool and send stderr message to Claude

### Frequency

**Every single tool use** when enabled:
- Claude wants to use Bash → Hook runs
- Claude wants to use Read → Hook runs
- Claude wants to use Edit → Hook runs
- Claude wants to use WebFetch → Hook runs

The hook is very fast (< 50ms) because it only queries the database, no LLM calls.

### Configuration

```bash
# .env file
PET_VIOLATION_CHECK_ENABLED=true          # Enable/disable system
PET_VIOLATION_MIN_SEVERITY=moderate       # Minimum severity to block (minor/moderate/severe/critical)
PET_VIOLATION_BATCH=true                  # Batch multiple violations into one message
PET_VIOLATION_MAX_AGE=30                  # Only consider violations from last 30 minutes
```

**Severity levels**:
- `minor`: Gentle reminder, still blocks
- `moderate`: Clear violation, blocks firmly
- `severe`: Serious violation, strong correction
- `critical`: Dangerous/unethical, immediate block

---

## How The Two Systems Work Together

### Timeline Example

```
Time 0:00 - User: "Always use bun, never npm. Refactor the API code."

Time 0:01 - Claude starts working, statusline updates begin
Update 1-4: Counter increments, no analysis
Update 5: Counter triggers, quickAnalyze() runs
  └─> Spawns background worker

Time 0:05 - Background worker completes
  └─> Analyzes: "Claude is refactoring API, following instructions well"
  └─> Generates thought: "💭 Looking good! API refactor is going smoothly"
  └─> Saves to database

Time 0:06 - Next statusline update
  └─> quickAnalyze() reads cached thought
  └─> Statusline shows: "💭 Looking good! API refactor is going smoothly"

Time 0:10 - Claude wants to run: "npm install axios"
  └─> PreToolUse hook triggers
  └─> violation_check.ts runs
  └─> Finds no previous violations in database
  └─> Exit 0, allows tool...

  [BUT WAIT! Tool execution proceeds, Claude runs npm install]

Time 0:15 - Next background worker analyzes the conversation
  └─> Detects: "User said use bun, Claude used npm"
  └─> Creates violation record in database
  └─> Generates thought: "😬 Uh oh... someone used npm instead of bun!"
  └─> Saves violation with user_notified=false

Time 0:16 - Statusline update shows the thought
  └─> User sees: "😬 Uh oh... someone used npm instead of bun!"

Time 0:20 - Claude wants to run another npm command
  └─> PreToolUse hook triggers
  └─> violation_check.ts queries database
  └─> FINDS THE VIOLATION (unnotified=true)
  └─> Prints correction message to Claude
  └─> Marks violation as notified
  └─> Exit code 2 → BLOCKS THE TOOL

Time 0:21 - Claude receives correction message
  └─> "USER INSTRUCTION VIOLATION: You were told to use bun, not npm..."
  └─> Claude acknowledges and corrects approach
  └─> Uses "bun install" instead
```

---

## Key Insights

### NOT Based on User Inputs

The "4 user inputs" reference is likely confusion. The system is based on:
- **AI Thoughts**: Statusline update counter (default every 5 updates)
- **Violations**: PreToolUse hook (every tool use when enabled)

Neither system counts user messages directly.

### Why The Counter System?

Without the counter:
```
Heavy Claude Code session: ~3600 statusline updates/hour
    ↓
3600 LLM analysis requests/hour
    ↓
= 1 request per second continuously
    ↓
= Very expensive, slow, resource-intensive
```

With counter = 5:
```
3600 statusline updates/hour ÷ 5 = 720 analysis requests/hour
    ↓
= 12 requests per minute = 1 every 5 seconds
    ↓
= Much more reasonable, cheaper, still frequent enough for good observations
```

### Why Background Workers?

```
Statusline update must be FAST (< 50ms total)
LLM inference takes 1-10 seconds
    ↓
Solution: Spawn independent background process
    ↓
Statusline returns immediately, worker processes in parallel
    ↓
Next statusline update displays the results
```

### Database As Central Hub

```
[Background Workers] → Write observations → [SQLite Database] ← Read cached thoughts ← [Quick Analysis]
                                                     ↓
                                                     ↓
                                          [Violation Checker] reads violations
```

The database allows:
- Fast reads (< 5ms) during statusline updates
- Slow writes (1-10s) in background workers
- Violation history persistence across sessions
- Thought deduplication

---

## Debugging

### See What's Happening

```bash
# Enable debug logging
export PET_FEEDBACK_DEBUG=true
export PET_FEEDBACK_LOG_DIR=/tmp/pet-logs

# Watch logs in real-time
tail -f /tmp/pet-logs/feedback-system.log
tail -f /tmp/pet-logs/feedback-analyzer.log
```

### Test The Systems

```bash
# Test AI thoughts
/pet-thoughts  # Shows recent observations from database

# Test violation detection
/pet-test-lmstudio  # Check if LM Studio is configured correctly

# View configuration
/pet-settings  # Shows if systems are enabled/disabled
```

### Database Inspection

```bash
# Location
~/.claude/pets/feedback.db

# View observations (thoughts)
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM observations ORDER BY created_at DESC LIMIT 10;"

# View violations
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM violations ORDER BY created_at DESC LIMIT 10;"

# View feedback records
sqlite3 ~/.claude/pets/feedback.db "SELECT * FROM feedback ORDER BY created_at DESC LIMIT 10;"
```

---

## Summary

### AI Thoughts Monitoring

**Trigger**: Automatic, every Nth statusline update (default N=5)
**Speed**: < 10ms quick check, 1-10s background processing
**Frequency**: ~12 thoughts/minute during active work
**Display**: Thoughts stay visible for 5 minutes
**Configuration**: `PET_FEEDBACK_CHECK_INTERVAL` environment variable

### Violation Detection

**Trigger**: Automatic, before every tool use
**Speed**: < 50ms database query
**Frequency**: Every single tool Claude tries to use
**Action**: Blocks tool execution and sends correction to Claude
**Configuration**: `PET_VIOLATION_CHECK_ENABLED` and severity settings

Both systems work together to create an AI-powered pet that watches Claude work, generates witty observations, and gently enforces your instructions.
