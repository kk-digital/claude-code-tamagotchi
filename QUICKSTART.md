# Claude Code Tamagotchi - Quick Start Guide

## 🎮 How to Use Your Pet

Your digital pet lives in the Claude Code statusline and responds to your interactions!

### Viewing Your Pet

**In Claude Code**:
Your pet appears automatically in the statusline at the top/bottom of your terminal:

```
(◕ᴗ◕) ☀️ Buddy 😊 | 🍖 70% ⚡ 95% 🧼 100% ❤️ 85%
```

**What You See**:
- `(◕ᴗ◕)` - Pet face (animates with breathing)
- `☀️` - Weather
- `Buddy` - Pet name
- `😊` - Mood emoji
- `🍖 70%` - Hunger level
- `⚡ 95%` - Energy level
- `🧼 100%` - Cleanliness
- `❤️ 85%` - Happiness

### Interacting with Your Pet

You have **TWO WAYS** to interact:

#### Method 1: Slash Commands in Claude Code (Easiest!)

Just type these commands while chatting with Claude:

```
/pet-stats          # See full statistics
/pet-status         # Quick status check
/pet-feed pizza     # Feed your pet
/pet-play ball      # Play with your pet
/pet-pet            # Give pets and affection
/pet-clean          # Give a bath
/pet-sleep          # Put to sleep
/pet-wake           # Wake them up
/pet-name Fluffy    # Rename your pet
/pet-help           # Show all commands
```

#### Method 2: CLI from Terminal

```bash
# Navigate to project directory
cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi

# Use CLI commands
bun run src/c3_pet_commands/cli.ts stats
bun run src/c3_pet_commands/cli.ts feed pizza
bun run src/c3_pet_commands/cli.ts play ball
```

---

## 🧪 Testing Your Setup (Step-by-Step)

### Test 1: Check Installation ✅

```bash
cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi
source ~/.bashrc

# Verify bun is installed
bun --version
# Expected: 1.3.1 or higher

# Verify node_modules exists
ls node_modules | wc -l
# Expected: ~40 packages

# Verify .env file exists
ls -la .env
# Expected: -rw-r--r-- ... .env
```

**✅ Success**: All commands return expected values

---

### Test 2: Run Automated Tests ✅

```bash
# Test path configuration (takes ~5 seconds)
./test-path-resolution.sh
```

**Expected Output**:
```
✅ ALL TESTS PASSED
Total tests:  17
Passed:       17
Failed:       0
```

```bash
# Test LM Studio integration (takes ~20 seconds)
./test-complete.sh
```

**Expected Output**:
```
✅ ALL TESTS PASSED
Total tests:  18
Passed:       18
Failed:       0
```

**✅ Success**: Both test suites show 0 failures

---

### Test 3: Test Statusline Display ✅

```bash
# Simulate statusline output
echo '{}' | bun run --silent src/index.ts
```

**Expected Output**:
```
(◕ᴗ◕) ☀️ Buddy 😊 | 🍖 70% ⚡ 95% 🧼 100% ❤️ 85% | 📁 claude-code-tamag...
```

**What to check**:
- ✅ Pet face appears (with parentheses)
- ✅ Pet name shows (Buddy by default)
- ✅ Four stats show with percentages (🍖 ⚡ 🧼 ❤️)
- ✅ Directory name appears at end

**✅ Success**: Statusline displays correctly

---

### Test 4: Test CLI Commands ✅

```bash
# Test stats command
bun run src/c3_pet_commands/cli.ts stats
```

**Expected Output**:
```
🐾 Pet Statistics 🐾
━━━━━━━━━━━━━━━━━━
Name: Buddy
Type: dog
Age: 0h 30m
Evolution: Stage 0
Mood: Content

📊 Vital Stats:
❤️ Happiness: 85%
🍖 Hunger: 70%
⚡ Energy: 95%
🏥 Health: 97%
🧼 Cleanliness: 100%
...
```

**What to check**:
- ✅ Statistics display formatted with emojis
- ✅ Pet name, type, age show correctly
- ✅ All stats have values

```bash
# Test feed command
bun run src/c3_pet_commands/cli.ts feed pizza
```

**Expected Output**:
```
🍕 Nom nom nom! Your pet devoured the pizza!

Stats updated:
❤️ Happiness: 85% → 90%
🍖 Hunger: 70% → 95%
```

**What to check**:
- ✅ Confirmation message appears
- ✅ Stats show before → after values
- ✅ Hunger increases significantly

```bash
# Test play command
bun run src/c3_pet_commands/cli.ts play ball
```

**Expected Output**:
```
🎾 Playtime! Your pet is having a blast!

Stats updated:
❤️ Happiness: 90% → 95%
⚡ Energy: 95% → 85%
```

**What to check**:
- ✅ Confirmation message appears
- ✅ Happiness increases
- ✅ Energy decreases (playing is tiring!)

**✅ Success**: All CLI commands work and update stats

---

### Test 5: Test Slash Commands in Claude Code ✅

**How to Test**:
1. Open Claude Code
2. Navigate to this project directory
3. Type: `/pet-status`
4. Press Enter

**Expected**: Claude executes the command and shows pet status

**Try These Commands**:
```
/pet-stats          # Full statistics
/pet-feed cookie    # Feed a cookie
/pet-play frisbee   # Play frisbee
/pet-pet            # Give affection
```

**What to check**:
- ✅ Commands are recognized (no "Unknown command" error)
- ✅ Claude shows results with personality
- ✅ Stats change after interactions

**✅ Success**: Slash commands work in Claude Code

---

### Test 6: Test LM Studio AI Feedback ✅

**Prerequisites**: LM Studio must be running on host

```bash
# Verify LM Studio is accessible
curl -s http://host.docker.internal:1234/v1/models | head -10
```

**Expected Output**: JSON with model list

```json
{
  "data": [
    {
      "id": "openai/gpt-oss-120b",
      "object": "model",
      ...
```

**What to check**:
- ✅ Connection succeeds (no "connection refused")
- ✅ JSON response received
- ✅ Model "openai/gpt-oss-120b" is in the list

```bash
# Check .env configuration
cat .env | grep LM_STUDIO
```

**Expected**:
```
LM_STUDIO_ENABLED=true
LM_STUDIO_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=openai/gpt-oss-120b
```

**What to check**:
- ✅ ENABLED=true
- ✅ URL uses host.docker.internal (not localhost)
- ✅ MODEL matches available model

**✅ Success**: LM Studio is connected and configured

---

### Test 7: Test Pet State Persistence ✅

```bash
# View current pet state
cat ~/.claude/pets/claude-pet-state.json | jq '.'
```

**Expected Output**:
```json
{
  "name": "Buddy",
  "type": "dog",
  "stats": {
    "hunger": 95,
    "energy": 85,
    "cleanliness": 100,
    "happiness": 95
  },
  "createdAt": "2025-11-06T12:00:00.000Z",
  "lastUpdate": "2025-11-06T12:30:00.000Z",
  ...
}
```

**What to check**:
- ✅ File exists and is valid JSON
- ✅ Name matches your pet's name
- ✅ Stats have realistic values (0-100)

```bash
# Make a change
bun run src/c3_pet_commands/cli.ts feed pizza

# Verify state updated
cat ~/.claude/pets/claude-pet-state.json | jq '.stats.hunger'
```

**Expected**: Hunger value increased (e.g., 70 → 95)

**What to check**:
- ✅ State file updates after interactions
- ✅ Changes persist across commands
- ✅ Timestamps update

**✅ Success**: Pet state persists correctly

---

## 🎯 Quick Test Checklist

Run through this checklist to verify everything works:

### Installation ✅
- [ ] Bun installed: `bun --version` shows version
- [ ] Dependencies installed: `ls node_modules` shows ~40 packages
- [ ] .env exists: `ls .env` shows file

### Automated Tests ✅
- [ ] Path tests pass: `./test-path-resolution.sh` → 17/17
- [ ] Integration tests pass: `./test-complete.sh` → 18/18

### Functionality ✅
- [ ] Statusline works: `echo '{}' | bun run --silent src/index.ts` shows pet
- [ ] CLI stats work: `bun run src/c3_pet_commands/cli.ts stats` shows data
- [ ] CLI feed works: `bun run src/c3_pet_commands/cli.ts feed pizza` updates hunger
- [ ] State persists: `cat ~/.claude/pets/claude-pet-state.json` shows JSON

### Claude Code Integration ✅
- [ ] Slash commands work: `/pet-status` in Claude Code executes
- [ ] Pet appears in statusline when using Claude Code
- [ ] Commands update pet state

### LM Studio (Optional) ✅
- [ ] LM Studio accessible: `curl http://host.docker.internal:1234/v1/models` succeeds
- [ ] .env configured: `cat .env | grep LM_STUDIO` shows correct values

---

## 🎮 Common Usage Scenarios

### Scenario 1: Daily Check-In

```bash
# Morning routine
/pet-status          # See how your pet slept
/pet-wake            # Wake them up
/pet-feed donut      # Breakfast!
/pet-play ball       # Morning exercise
```

### Scenario 2: Pet Needs Attention

**Statusline Shows**: `(◕︵◕) Buddy ⚠️ | 🍖 25% ⚡ 30% 🧼 90% ❤️ 40%`

```bash
# Your pet is hungry and tired!
/pet-feed pizza      # Feed first
/pet-play laser      # Quick play session
/pet-pet             # Give some love
/pet-sleep           # Let them rest
```

### Scenario 3: Check Progress

```bash
# View detailed stats
/pet-stats

# Check lifetime achievements
# Look for:
# - Total Feedings
# - Play Sessions
# - Age
# - Evolution stage
```

### Scenario 4: Reset and Start Over

```bash
# Start fresh (warning: deletes current pet!)
/pet-reset

# Name your new pet
/pet-name "Rex"

# Build up stats
/pet-feed pizza
/pet-play ball
/pet-pet
```

---

## 🔧 Troubleshooting

### Problem: Statusline doesn't show

**Check**:
```bash
# Verify settings
cat .claude/settings.json | jq '.statusLine'
```

**Should contain**:
```json
{
  "type": "command",
  "command": "cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi && bun run --silent src/index.ts",
  "padding": 0
}
```

**Fix**: Re-run setup
```bash
./setup.sh
```

### Problem: Slash commands not found

**Check**:
```bash
# Verify commands installed
ls ~/.claude/commands/pet-*.md | wc -l
# Should show: 11
```

**Fix**: Re-run setup
```bash
./setup.sh
```

### Problem: "bun: command not found"

**Fix**: Source bashrc
```bash
source ~/.bashrc
which bun
# Should show: /home/user/.bun/bin/bun
```

### Problem: LM Studio connection fails

**Check**:
```bash
# Test connection
curl http://host.docker.internal:1234/v1/models
```

**If fails**:
- Verify LM Studio is running on host machine
- Check that a model is loaded in LM Studio
- Verify port 1234 is open

### Problem: Pet stats don't change

**Check state file**:
```bash
cat ~/.claude/pets/claude-pet-state.json | jq '.lastUpdate'
```

**Try feeding directly**:
```bash
bun run src/c3_pet_commands/cli.ts feed pizza
cat ~/.claude/pets/claude-pet-state.json | jq '.stats.hunger'
```

**If still broken**: Reset state
```bash
bun run src/c3_pet_commands/cli.ts reset
```

---

## 📊 Understanding Pet Stats

### Hunger 🍖
- **Decreases**: As you work in Claude Code
- **Increases**: When you feed (pizza, cookie, sushi, etc.)
- **Warning**: Below 30%
- **Critical**: Below 20%

**Foods Available**:
- pizza, cookie, sushi, apple, burger, donut, ramen, taco, ice_cream, salad

### Energy ⚡
- **Decreases**: During play sessions and work
- **Increases**: When pet sleeps
- **Warning**: Below 30%
- **Critical**: Below 20%

**How to Restore**:
```bash
/pet-sleep     # Put to sleep
# Wait a bit...
/pet-wake      # Wake them up (energy restored)
```

### Cleanliness 🧼
- **Decreases**: Over time during play
- **Increases**: When you give bath
- **Warning**: Below 30%
- **Critical**: Below 20%

**How to Clean**:
```bash
/pet-clean     # Give a bath
```

### Happiness ❤️
- **Decreases**: When other stats are low
- **Increases**: Feeding, playing, petting
- **Warning**: Below 30%
- **Critical**: Below 20%

**How to Improve**:
```bash
/pet-play ball    # +10-15%
/pet-pet          # +5-10%
/pet-feed pizza   # +5-10%
```

---

## 🎯 Success Criteria

**Your tamagotchi is working correctly if**:

✅ All automated tests pass (35/35)
✅ Statusline displays in Claude Code
✅ Slash commands execute successfully
✅ CLI commands work from terminal
✅ Pet stats change after interactions
✅ State persists between sessions
✅ LM Studio generates AI observations (if enabled)

**You're ready to enjoy your pet!** 🎉

---

## 📚 Additional Resources

- **Full Testing Guide**: `TESTING-GUIDE.md`
- **Configuration Details**: `.env.example`
- **LM Studio Setup**: `LMSTUDIO.md`
- **Architecture Details**: `.claude.md`
- **Fix Documentation**: `251106.path-fixes-summary.txt`
