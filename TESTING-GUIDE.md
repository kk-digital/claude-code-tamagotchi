# Claude Code Tamagotchi - Testing Guide

## Quick Test Overview

```bash
# Run all tests
./test-path-resolution.sh    # Path configuration tests (17 tests)
./test-complete.sh            # LM Studio integration tests (18 tests)
```

## 1. Automated Test Suites

### Test Suite 1: Path Resolution Tests
**File**: `test-path-resolution.sh`
**Purpose**: Verify all paths are correctly configured after modular refactoring

```bash
# Run path resolution tests
source ~/.bashrc && ./test-path-resolution.sh
```

**Expected Output**:
```
✅ ALL TESTS PASSED
Total tests:  17
Passed:       17
Failed:       0
```

**What it tests**:
- File existence (src/index.ts, src/c3_pet_commands/cli.ts, etc.)
- Bin file path references
- Slash command templates
- Setup script configuration
- CLI functionality (help, stats, status)
- Installed commands in ~/.claude/commands

### Test Suite 2: LM Studio Integration Tests
**File**: `test-complete.sh`
**Purpose**: Verify LM Studio connectivity and functionality

```bash
# Run LM Studio integration tests
source ~/.bashrc && ./test-complete.sh
```

**Expected Output**:
```
✅ ALL TESTS PASSED
Total tests:  18
Passed:       18
Failed:       0
```

**What it tests**:
- .env configuration
- LM Studio server connectivity
- Model availability
- Embedding models
- Chat completion API
- Response time performance
- Bun runtime
- Application integration

## 2. Testing the Statusline

### Method 1: Direct Test (Quick)
```bash
# Test statusline output
source ~/.bashrc && echo '{}' | bun run --silent src/index.ts
```

**Expected Output**:
```
(◕ᴗ◕) ☀️ Buddy 🙂 | 🍖 70% ⚡ 90% 🧼 100% ❤️ 80% | 📁 claude-code-tamag...
```

### Method 2: With Claude Code Context
```bash
# Simulate Claude Code environment
echo '{"workspace":{"current_dir":"/home/user/claude-code-tamagotchi/claude-code-tamagotchi"}}' | bun run --silent src/index.ts
```

**Expected Output**:
- Pet face animation (breathing effect)
- Pet name and mood emoji
- Stats (hunger, energy, cleanliness, happiness)
- Directory name (truncated)

### Statusline Indicators

**Pet Faces**:
- `(◕ᴥ◕)` ↔ `(◕ᴗ◕)` - Happy and breathing
- `(◕‿◕)` - Super happy
- `(-ᴥ-)` - Sleeping
- `(◕︵◕)` - Sad (needs attention)
- `(@_@)` - Not feeling great

**Stats**:
- 🍖 Hunger (70-100% = good, <30% = ⚠️ warning)
- ⚡ Energy (70-100% = good, <30% = ⚠️ warning)
- 🧼 Cleanliness (70-100% = good, <30% = ⚠️ warning)
- ❤️ Happiness (70-100% = good, <30% = ⚠️ warning)

## 3. Testing Slash Commands

### Available Slash Commands
```
/pet-stats          - View detailed statistics
/pet-status         - Quick status check
/pet-feed [food]    - Feed your pet
/pet-play [toy]     - Play with your pet
/pet-pet            - Give pets and affection
/pet-clean          - Give a bath
/pet-sleep          - Put to sleep
/pet-wake           - Wake up
/pet-name [name]    - Rename your pet
/pet-reset          - Reset pet (starts over)
/pet-help           - Show all commands
```

### Testing in Claude Code
1. Open Claude Code
2. Navigate to this project directory
3. Type any slash command: `/pet-stats`
4. Claude should execute the command and show results

### Testing via CLI (Alternative)
```bash
# Test each command manually
source ~/.bashrc

# View stats
bun run src/c3_pet_commands/cli.ts stats

# Check status
bun run src/c3_pet_commands/cli.ts status

# Feed the pet
bun run src/c3_pet_commands/cli.ts feed pizza

# Play with the pet
bun run src/c3_pet_commands/cli.ts play ball

# Pet your companion
bun run src/c3_pet_commands/cli.ts pet

# Give a bath
bun run src/c3_pet_commands/cli.ts clean

# Put to sleep
bun run src/c3_pet_commands/cli.ts sleep

# Wake up
bun run src/c3_pet_commands/cli.ts wake

# Rename
bun run src/c3_pet_commands/cli.ts name "Buddy"

# Show help
bun run src/c3_pet_commands/cli.ts help
```

## 4. Testing CLI via Bin File

### Using Node
```bash
# Test bin file with node
node bin/claude-code-tamagotchi.cjs help
node bin/claude-code-tamagotchi.cjs stats
node bin/claude-code-tamagotchi.cjs status
node bin/claude-code-tamagotchi.cjs feed pizza
```

### Using Bun (Recommended)
```bash
# Test bin file with bun (better TypeScript support)
source ~/.bashrc
bun run bin/claude-code-tamagotchi.cjs help
bun run bin/claude-code-tamagotchi.cjs stats
bun run bin/claude-code-tamagotchi.cjs status
bun run bin/claude-code-tamagotchi.cjs feed pizza
```

## 5. Testing LM Studio Integration

### Verify LM Studio is Running
```bash
# Check LM Studio server
curl -s http://host.docker.internal:1234/v1/models | head -20
```

**Expected**: JSON response with list of models

### Test AI Feedback System
The pet uses LM Studio to generate contextual thoughts and observations.

**Configuration** (in `.env`):
```bash
PET_FEEDBACK_ENABLED=true
PET_LLM_PROVIDER=lmstudio
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b
```

**Test AI Observations**:
1. Make changes in Claude Code (edit files, run commands)
2. Watch the statusline for thought bubbles: `💭 "observation text"`
3. Thoughts should be contextual to your actions

### Test Violation Detection
When enabled, the pet can detect when Claude Code violates your instructions.

**Configuration**:
```bash
PET_VIOLATION_CHECK_ENABLED=true
```

**Test**:
1. Ask Claude to do something
2. Then ask Claude to do something else
3. If Claude ignores your request, pet should detect violation

## 6. Testing Pet State Persistence

### View Pet State File
```bash
# Check pet state file
cat ~/.claude/pets/claude-pet-state.json | jq .
```

**Expected Fields**:
- `name`: Pet name
- `type`: Pet type (dog, cat, dragon, robot)
- `stats`: hunger, energy, cleanliness, happiness
- `createdAt`: Creation timestamp
- `lastUpdate`: Last update timestamp
- `sessionStartTime`: Current session start

### Test State Changes
```bash
# Feed the pet and check state change
bun run src/c3_pet_commands/cli.ts feed pizza
cat ~/.claude/pets/claude-pet-state.json | jq '.stats.hunger'

# Play and check energy
bun run src/c3_pet_commands/cli.ts play ball
cat ~/.claude/pets/claude-pet-state.json | jq '.stats.energy'
```

### Reset Pet State
```bash
# Reset to start over
bun run src/c3_pet_commands/cli.ts reset

# Verify reset
cat ~/.claude/pets/claude-pet-state.json | jq .
```

## 7. Manual Verification Checklist

### Installation Verification
- [ ] Bun is installed: `bun --version`
- [ ] Dependencies installed: `ls node_modules | wc -l` (should be ~40)
- [ ] .env file exists: `ls -la .env`
- [ ] Bin file is executable: `ls -la bin/claude-code-tamagotchi.cjs`

### Path Resolution Verification
- [ ] Main entry exists: `ls src/index.ts`
- [ ] CLI exists: `ls src/c3_pet_commands/cli.ts`
- [ ] Commands installed: `ls ~/.claude/commands/pet-*.md | wc -l` (should be 11)

### Statusline Verification
- [ ] Settings configured: `cat ~/.claude/settings.json | grep statusLine`
- [ ] Project settings exist: `cat .claude/settings.json`
- [ ] Statusline displays correctly in Claude Code

### LM Studio Verification
- [ ] LM Studio running: `curl -I http://host.docker.internal:1234/v1/models`
- [ ] Model available: `curl -s http://host.docker.internal:1234/v1/models | grep gpt-oss-120b`
- [ ] .env configured: `cat .env | grep LM_STUDIO`

## 8. Troubleshooting Tests

### If Path Resolution Tests Fail

**Test 7-8 (Bin file paths)**:
```bash
# Check bin file content
grep "c3_pet_commands" bin/claude-code-tamagotchi.cjs
grep "index.ts" bin/claude-code-tamagotchi.cjs
```

**Test 13-15 (CLI commands)**:
```bash
# Verify bun is in PATH
source ~/.bashrc
which bun

# Test CLI directly
bun run src/c3_pet_commands/cli.ts help
```

### If LM Studio Tests Fail

**Connection Issues**:
```bash
# Check if LM Studio is accessible
curl -v http://host.docker.internal:1234/v1/models

# Verify .env configuration
cat .env | grep LM_STUDIO_URL
```

**Model Issues**:
```bash
# List available models
curl -s http://host.docker.internal:1234/v1/models | jq '.data[].id'

# Check if configured model exists
curl -s http://host.docker.internal:1234/v1/models | grep "gpt-oss-120b"
```

### If Statusline Doesn't Display

**Check Configuration**:
```bash
# Verify project settings
cat .claude/settings.json | jq .

# Verify global settings
cat ~/.claude/settings.json | jq .
```

**Test Manually**:
```bash
# Run statusline command directly
source ~/.bashrc
cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi
bun run --silent src/index.ts
```

### If Slash Commands Don't Work

**Check Installation**:
```bash
# Verify commands are installed
ls -la ~/.claude/commands/pet-*.md

# Check command content
cat ~/.claude/commands/pet-stats.md
```

**Verify Paths**:
```bash
# Commands should have absolute paths
grep "/home/user" ~/.claude/commands/pet-stats.md
```

**Re-run Setup**:
```bash
# Re-install commands
./setup.sh
```

## 9. Performance Benchmarks

### Expected Response Times
- **Statusline Update**: < 100ms
- **CLI Command**: < 200ms
- **LM Studio Chat**: < 500ms (with gpt-oss-120b)
- **Path Resolution Tests**: < 5 seconds
- **Full Test Suite**: < 30 seconds

### Memory Usage
- **Statusline Process**: ~30-50 MB
- **CLI Process**: ~30-50 MB
- **LM Studio Connection**: < 5 MB overhead

## 10. Continuous Testing

### Run Tests Before Commit
```bash
# Quick verification
./test-path-resolution.sh && ./test-complete.sh

# If both pass, safe to commit
git add . && git commit -m "your message"
```

### Run Tests After Pull
```bash
# After pulling changes
git pull origin dev-haltingstate

# Verify everything still works
source ~/.bashrc
./test-path-resolution.sh
./test-complete.sh
```

## 11. Test Coverage Summary

### What We Test
✅ **Path Configuration** (17 tests)
- File existence and locations
- Bin file references
- Command templates
- Setup script paths
- CLI functionality

✅ **LM Studio Integration** (18 tests)
- Configuration validity
- Network connectivity
- Model availability
- API endpoints
- Performance
- Runtime requirements

✅ **Manual Testing**
- Statusline display
- Slash commands
- CLI commands
- State persistence
- AI feedback

### What We Don't Test (Yet)
⚠️ **Not Covered**:
- UI/UX in Claude Code environment (manual only)
- Long-running session behavior
- State migration between versions
- Error recovery scenarios
- Concurrent access to state file

**Recommendations**:
- Add integration tests for slash command execution
- Add stress tests for long sessions
- Add state migration tests
- Add error recovery tests

## Success Criteria

**All tests passing = System ready for use**

✅ Path resolution: 17/17 tests PASS
✅ LM Studio integration: 18/18 tests PASS
✅ Statusline displays correctly
✅ Slash commands work in Claude Code
✅ CLI commands work from terminal
✅ Pet state persists correctly
✅ AI feedback generates observations

**Total: 35/35 automated tests + manual verification = Production ready!** 🎉
