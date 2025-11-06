# Monitoring Trigger Command and Conditions

## Command to Trigger Monitoring

There is **NO manual command** to trigger monitoring. The monitoring system is **AUTOMATIC** and triggered by Claude Code's statusline updates.

### The Trigger Command (Automatic)

```bash
# This command is called AUTOMATICALLY by Claude Code statusline
# Configured in ~/.claude/settings.json:
bun run --silent src/index.ts
```

**Input**: Claude Code sends JSON via stdin:
```json
{
  "session_id": "abc-123-def-456",
  "transcript_path": "/home/user/.claude/sessions/abc-123/transcript.json",
  "cwd": "/home/user/project",
  "model": {
    "id": "claude-sonnet-4-5",
    "display_name": "Sonnet 4.5"
  }
}
```

**When it runs**: Every time Claude Code updates the statusline (constantly during active work)

## Exact Conditions for Monitoring to Trigger

The monitoring system checks 6 conditions in this exact order:

### Condition 1: Feedback System Enabled
```bash
# Must be set in .env:
PET_FEEDBACK_ENABLED=true
```

**Check**: `this.config.enabled` must be `true`
**Why it fails**: If `PET_FEEDBACK_ENABLED` is not explicitly set to `"true"`

### Condition 2: Mode Not Disabled
```bash
# Must NOT be set to 'off':
PET_FEEDBACK_MODE=full  # or 'basic' or 'minimal'
```

**Check**: `this.config.mode !== 'off'`
**Why it fails**: If mode is explicitly set to `'off'`

### Condition 3: Transcript Path Provided
```bash
# Claude Code must provide transcript_path in JSON input
```

**Check**: `transcriptPath` exists and is not empty
**Why it fails**: Running pet outside Claude Code (no stdin input)

### Condition 4: Counter Threshold Reached
```bash
# Default: Analyze every 5th statusline update
PET_FEEDBACK_CHECK_INTERVAL=5
```

**Check**: `this.checkCounter >= this.config.checkInterval`
**Counter logic**:
```
Update 1: counter = 1, check: 1 < 5, SKIP
Update 2: counter = 2, check: 2 < 5, SKIP
Update 3: counter = 3, check: 3 < 5, SKIP
Update 4: counter = 4, check: 4 < 5, SKIP
Update 5: counter = 5, check: 5 >= 5, TRIGGER! Reset to 0
Update 6: counter = 1, check: 1 < 5, SKIP
...
```

**Why it fails**: Not enough statusline updates have occurred yet

### Condition 5: Not Already Processing
```bash
# Only one background worker at a time
```

**Check**: `!this.isProcessing`
**Why it fails**: Previous analysis still running (worker takes 2-10 seconds)

### Condition 6: New Messages Exist
```bash
# Transcript must have unprocessed messages
```

**Check**: `await this.processor.hasNewMessages(transcriptPath)` returns `true`
**Why it fails**:
- Transcript file doesn't exist
- Transcript has no new messages since last analysis
- All messages already processed

## Flow Diagram

```
Claude Code Statusline Update
    ↓
Pet receives JSON input
    ↓
PetEngine.update() called
    ↓
FeedbackSystem.processFeedback() called
    ↓
TranscriptAnalyzer.quickAnalyze() called
    ↓
    ├─→ Condition 1: Enabled? → NO → STOP
    ├─→ Condition 2: Mode not off? → NO → STOP
    ├─→ Condition 3: Transcript path? → NO → STOP
    ├─→ Condition 4: Counter >= 5? → NO → Increment, STOP
    ├─→ Condition 5: Not processing? → NO → STOP
    └─→ Condition 6: New messages? → NO → STOP
         ↓ YES TO ALL
    Spawn background worker
         ↓
    Worker reads transcript
         ↓
    Worker calls LM Studio
         ↓
    Worker saves to database
         ↓
    Next statusline update reads database
         ↓
    Display thought in statusline
```

## Summary: ALL Conditions Must Be True

```python
def should_trigger_monitoring():
    return (
        PET_FEEDBACK_ENABLED == "true"           # Condition 1
        AND PET_FEEDBACK_MODE != "off"           # Condition 2
        AND transcript_path is not None          # Condition 3
        AND counter >= PET_FEEDBACK_CHECK_INTERVAL  # Condition 4 (default: 5)
        AND not currently_processing             # Condition 5
        AND new_messages_exist_in_transcript     # Condition 6
    )
```

## How to Manually Test Monitoring

You **cannot directly trigger monitoring** outside of Claude Code, but you can simulate it:

### Test 1: Verify Configuration
```bash
cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi

# Check if all conditions are configured correctly
cat .env | grep -E "PET_FEEDBACK_ENABLED|PET_LLM_PROVIDER|LM_STUDIO"

# Expected:
# PET_FEEDBACK_ENABLED=true
# PET_LLM_PROVIDER=lmstudio
# LM_STUDIO_ENABLED=true
```

### Test 2: Test LM Studio Connection
```bash
# This tests conditions 1-3 and the LLM connection
/home/user/.bun/bin/bun run src/c3_pet_commands/cli.ts test-lmstudio
```

### Test 3: Simulate Statusline Update
```bash
cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi

# Create a fake transcript (simulates condition 6)
cat > /tmp/test-transcript.json << 'EOF'
[
  {
    "role": "user",
    "content": "Can you help me write a function to sort an array?",
    "timestamp": 1699999999000,
    "uuid": "msg-001"
  },
  {
    "role": "assistant",
    "content": "Sure! I'll help you write a sorting function.",
    "timestamp": 1699999999500,
    "uuid": "msg-002"
  }
]
EOF

# Run the pet statusline manually with input
echo '{
  "session_id": "test-session-manual",
  "transcript_path": "/tmp/test-transcript.json",
  "cwd": "/home/user/test",
  "model": {"id": "claude-sonnet", "display_name": "Sonnet"}
}' | /home/user/.bun/bin/bun run --silent src/index.ts

# Check if logs were created
ls -la /tmp/pet-logs/
cat /tmp/pet-logs/*.log 2>/dev/null | tail -20
```

**Note**: This only triggers ONE statusline update. You need to run it 5 times to reach the counter threshold:

```bash
# Trigger 5 times to meet counter threshold
for i in {1..5}; do
  echo "Update $i/5"
  echo '{
    "session_id": "test-session-manual",
    "transcript_path": "/tmp/test-transcript.json",
    "cwd": "/home/user/test",
    "model": {"id": "claude-sonnet", "display_name": "Sonnet"}
  }' | /home/user/.bun/bin/bun run --silent src/index.ts
  sleep 1
done

# Check logs
cat /tmp/pet-logs/feedback-analyzer.log 2>/dev/null | grep "should spawn"
```

### Test 4: Monitor Real Claude Code Session

The ONLY reliable way to test is during an actual Claude Code session:

```bash
# Terminal 1: Monitor logs
tail -f /tmp/pet-logs/*.log

# Terminal 2: Monitor database
watch -n 2 'sqlite3 ~/.claude/pets/feedback.db "SELECT COUNT(*) FROM observations;" 2>/dev/null'

# Terminal 3: Monitor LM Studio (if UI available)
# Check LM Studio server logs for incoming POST requests
```

Then use Claude Code normally and watch for:
- Log entries showing counter incrementing
- "should spawn: true" when counter reaches 5
- Background worker logs
- LM Studio request logs
- Database entry count increasing

## Why "It Never Triggers"

### Most Common Reason: Not Enough Updates

```
Scenario: You start Claude Code, ask 1 question, then check logs
Result: Counter is at 1/5, monitoring hasn't triggered yet
Solution: Continue working, ask more questions, wait for 5+ updates
```

### Second Most Common: Not In Active Session

```
Scenario: Testing outside Claude Code with manual commands
Result: No transcript_path provided, condition 3 fails
Solution: Must test during real Claude Code session
```

### Third Most Common: Transcript Has No New Messages

```
Scenario: Counter reaches 5, but transcript hasn't changed
Result: Condition 6 fails (no new messages)
Solution: System is working, just nothing new to analyze
```

## Expected Behavior Timeline

```
Time 0:00 - Start Claude Code session
          - User: "Help me refactor this code"

Time 0:01 - Statusline Update 1
          - Counter: 1/5
          - Log: "Check counter 1/5"
          - Action: SKIP

Time 0:02 - Statusline Update 2
          - Counter: 2/5
          - Log: "Check counter 2/5"
          - Action: SKIP

Time 0:03 - Statusline Update 3
          - Counter: 3/5
          - Log: "Check counter 3/5"
          - Action: SKIP

Time 0:04 - Statusline Update 4
          - Counter: 4/5
          - Log: "Check counter 4/5"
          - Action: SKIP

Time 0:05 - Statusline Update 5
          - Counter: 5/5 → RESET TO 0
          - Log: "Quick analyze - should spawn: true"
          - Log: "Spawning background worker"
          - Action: SPAWN WORKER

Time 0:06 - Background Worker Running
          - Log: "Analyzing message: msg-002"
          - Log: "Calling LM Studio..."
          - LM Studio: POST /v1/chat/completions

Time 0:10 - Background Worker Complete
          - Log: "LM Studio response received"
          - Log: "Saved observation to database"
          - Database: New row in observations table

Time 0:11 - Next Statusline Update
          - Pet reads database
          - Finds new observation
          - Displays: "💭 Looks like someone's refactoring again!"
```

## Configuration Variables Summary

All conditions can be controlled via environment variables:

```bash
# Core enable/disable
PET_FEEDBACK_ENABLED=true              # Master switch (default: false)
PET_FEEDBACK_MODE=full                 # Mode: full/basic/minimal/off (default: full)

# Counter threshold
PET_FEEDBACK_CHECK_INTERVAL=5          # Analyze every Nth update (default: 5)

# LM Studio configuration
PET_LLM_PROVIDER=lmstudio              # Provider: lmstudio/groq (default: groq)
LM_STUDIO_ENABLED=true                 # Enable LM Studio (default: false)
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b

# Debug logging
PET_FEEDBACK_DEBUG=true                # Enable debug logs (default: false)
PET_FEEDBACK_LOG_DIR=/tmp/pet-logs    # Log directory
```

## Quick Check: Is Monitoring Active?

Run this diagnostic:

```bash
cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi

echo "=== Configuration Check ==="
grep -E "^PET_FEEDBACK_ENABLED|^PET_LLM_PROVIDER|^LM_STUDIO_ENABLED" .env

echo ""
echo "=== LM Studio Connection ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 3 http://host.docker.internal:1234/v1/models

echo ""
echo "=== Statusline Config ==="
jq -r '.statusLine.command' ~/.claude/settings.json 2>/dev/null

echo ""
echo "=== Logs Exist ==="
ls -lh /tmp/pet-logs/*.log 2>/dev/null | wc -l
echo "log files found"

echo ""
echo "=== Database Exists ==="
if [ -f ~/.claude/pets/feedback.db ]; then
  sqlite3 ~/.claude/pets/feedback.db "SELECT COUNT(*) FROM observations;" 2>/dev/null
  echo "observations in database"
else
  echo "Database not created yet (monitoring hasn't run)"
fi
```

## Bottom Line

**To trigger monitoring**:
1. Start a Claude Code session (no manual command)
2. Work normally (ask questions, run commands)
3. Wait for 5 statusline updates (~5-10 seconds of activity)
4. Monitor will automatically trigger on the 5th update
5. Results appear on the next update after LM Studio responds

**The system is AUTOMATIC** - no manual trigger command exists.
