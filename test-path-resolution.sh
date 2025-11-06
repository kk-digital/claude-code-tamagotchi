#!/bin/bash

# Claude Code Tamagotchi - Path Resolution Tests
# Tests to verify all paths are correctly configured after refactoring

# Note: Don't use 'set -e' because arithmetic expressions like ((COUNT++)) return non-zero exit codes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PASS_COUNT=0
FAIL_COUNT=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================================================"
echo "CLAUDE CODE TAMAGOTCHI - PATH RESOLUTION TESTS"
echo "========================================================================"
echo ""

# Test function
test_path() {
  local test_name="$1"
  local path="$2"

  if [ -e "$path" ]; then
    echo -e "Test: $test_name... ${GREEN}PASS${NC}"
    ((PASS_COUNT++))
  else
    echo -e "Test: $test_name... ${RED}FAIL${NC}"
    echo -e "${RED}Error: Path does not exist: $path${NC}"
    ((FAIL_COUNT++))
  fi
}

# Test command execution
test_command() {
  local test_name="$1"
  local command="$2"

  if eval "$command" > /dev/null 2>&1; then
    echo -e "Test: $test_name... ${GREEN}PASS${NC}"
    ((PASS_COUNT++))
  else
    echo -e "Test: $test_name... ${RED}FAIL${NC}"
    echo -e "${RED}Error: Command failed: $command${NC}"
    ((FAIL_COUNT++))
  fi
}

echo "FILE EXISTENCE TESTS"
echo "========================================================================"

# Test 1: Main entry point exists
test_path "Main entry point (src/index.ts)" "$SCRIPT_DIR/src/index.ts"

# Test 2: CLI module exists at correct location
test_path "CLI module (src/c3_pet_commands/cli.ts)" "$SCRIPT_DIR/src/c3_pet_commands/cli.ts"

# Test 3: Bin file exists
test_path "Bin file (bin/claude-code-tamagotchi.cjs)" "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs"

# Test 4: Command processor exists
test_path "Command processor (src/c3_pet_commands/command_processor.ts)" "$SCRIPT_DIR/src/c3_pet_commands/command_processor.ts"

# Test 5: Violation check exists
test_path "Violation check (src/c3_pet_commands/violation_check.ts)" "$SCRIPT_DIR/src/c3_pet_commands/violation_check.ts"

# Test 6: Setup script exists
test_path "Setup script (setup.sh)" "$SCRIPT_DIR/setup.sh"

echo ""
echo "BIN FILE PATH VERIFICATION"
echo "========================================================================"

# Test 7: Bin file references correct CLI path
if grep -q "c3_pet_commands" "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs"; then
  echo -e "Test: Bin file has correct CLI path... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: Bin file has correct CLI path... ${RED}FAIL${NC}"
  echo -e "${RED}Error: Bin file still references old path (src/commands/cli.ts)${NC}"
  ((FAIL_COUNT++))
fi

# Test 8: Bin file references correct index path
if grep -q "index.ts" "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs"; then
  echo -e "Test: Bin file has correct index path... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: Bin file has correct index path... ${RED}FAIL${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo "SLASH COMMAND TEMPLATE VERIFICATION"
echo "========================================================================"

# Test 9: Command templates use $PET_PATH placeholder
if grep -q "\$PET_PATH" "$SCRIPT_DIR/claude-commands/pet-stats.md"; then
  echo -e "Test: Command templates use \$PET_PATH placeholder... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: Command templates use \$PET_PATH placeholder... ${RED}FAIL${NC}"
  echo -e "${YELLOW}Warning: Templates still use !claude-code-tamagotchi (global install only)${NC}"
  ((FAIL_COUNT++))
fi

# Test 10: All command templates exist
COMMAND_COUNT=$(ls -1 "$SCRIPT_DIR/claude-commands"/pet-*.md 2>/dev/null | wc -l)
if [ "$COMMAND_COUNT" -ge 11 ]; then
  echo -e "Test: All command templates exist ($COMMAND_COUNT commands)... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: All command templates exist... ${RED}FAIL${NC}"
  echo -e "${RED}Error: Expected 11 command templates, found $COMMAND_COUNT${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo "SETUP SCRIPT VERIFICATION"
echo "========================================================================"

# Test 11: Setup script uses correct chmod paths
if grep -q "src/c3_pet_commands/cli.ts" "$SCRIPT_DIR/setup.sh"; then
  echo -e "Test: Setup script uses correct chmod path... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: Setup script uses correct chmod path... ${RED}FAIL${NC}"
  echo -e "${RED}Error: Setup script still references old path (src/commands/pet-cli.ts)${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo "CLI FUNCTIONALITY TESTS"
echo "========================================================================"

# Test 12: Bin file is executable
if [ -x "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs" ]; then
  echo -e "Test: Bin file is executable... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: Bin file is executable... ${RED}FAIL${NC}"
  echo -e "${YELLOW}Note: Run 'chmod +x bin/claude-code-tamagotchi.cjs'${NC}"
  ((FAIL_COUNT++))
fi

# Detect runner (prefer bun for TypeScript support)
if command -v bun > /dev/null 2>&1; then
  RUNNER="bun"
else
  RUNNER="node"
fi

# Test 13: CLI help command works
if $RUNNER "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs" help > /dev/null 2>&1; then
  echo -e "Test: CLI help command works (using $RUNNER)... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: CLI help command works... ${RED}FAIL${NC}"
  ((FAIL_COUNT++))
fi

# Test 14: CLI stats command works
if $RUNNER "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs" stats > /dev/null 2>&1; then
  echo -e "Test: CLI stats command works (using $RUNNER)... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: CLI stats command works... ${RED}FAIL${NC}"
  ((FAIL_COUNT++))
fi

# Test 15: CLI status command works
if $RUNNER "$SCRIPT_DIR/bin/claude-code-tamagotchi.cjs" status > /dev/null 2>&1; then
  echo -e "Test: CLI status command works (using $RUNNER)... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: CLI status command works... ${RED}FAIL${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo "INSTALLED COMMAND VERIFICATION"
echo "========================================================================"

# Test 16: Commands installed in ~/.claude/commands
INSTALLED_COUNT=$(ls -1 ~/.claude/commands/pet-*.md 2>/dev/null | wc -l)
if [ "$INSTALLED_COUNT" -ge 11 ]; then
  echo -e "Test: Commands installed in ~/.claude/commands ($INSTALLED_COUNT commands)... ${GREEN}PASS${NC}"
  ((PASS_COUNT++))
else
  echo -e "Test: Commands installed in ~/.claude/commands... ${YELLOW}WARN${NC}"
  echo -e "${YELLOW}Warning: Expected 11 commands, found $INSTALLED_COUNT. Run ./setup.sh to install${NC}"
  # Don't count as failure, might not have run setup yet
fi

# Test 17: Installed commands have correct absolute paths (not placeholders)
if [ -f ~/.claude/commands/pet-stats.md ]; then
  if grep -q "/home/.*/bin/claude-code-tamagotchi.cjs" ~/.claude/commands/pet-stats.md; then
    echo -e "Test: Installed commands have absolute paths... ${GREEN}PASS${NC}"
    ((PASS_COUNT++))
  else
    echo -e "Test: Installed commands have absolute paths... ${RED}FAIL${NC}"
    echo -e "${RED}Error: Installed commands still have \$PET_PATH placeholder${NC}"
    ((FAIL_COUNT++))
  fi
else
  echo -e "Test: Installed commands have absolute paths... ${YELLOW}SKIP${NC}"
  echo -e "${YELLOW}Note: Commands not installed. Run ./setup.sh first${NC}"
fi

echo ""
echo "========================================================================"
echo "TEST SUMMARY"
echo "========================================================================"
echo ""
echo -e "Total tests:  $((PASS_COUNT + FAIL_COUNT))"
echo -e "Passed:       ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed:       ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  echo ""
  echo "Path resolution is correctly configured!"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo "Please fix the errors above before using the pet."
  exit 1
fi
