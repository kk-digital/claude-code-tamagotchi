#!/bin/bash
# Quick diagnostic to check if monitoring is ready to trigger

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Monitoring Trigger Conditions Diagnostic             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd /home/user/claude-code-tamagotchi/claude-code-tamagotchi

# Condition 1: Feedback Enabled
echo "📋 Condition 1: Feedback System Enabled"
if grep -q "^PET_FEEDBACK_ENABLED=true" .env 2>/dev/null; then
  echo "   ✅ PET_FEEDBACK_ENABLED=true"
else
  echo "   ❌ PET_FEEDBACK_ENABLED not set to 'true'"
fi
echo ""

# Condition 2: Mode Not Off
echo "📋 Condition 2: Feedback Mode Active"
MODE=$(grep "^PET_FEEDBACK_MODE=" .env 2>/dev/null | cut -d= -f2)
if [ "$MODE" = "off" ]; then
  echo "   ❌ PET_FEEDBACK_MODE=off (disabled)"
elif [ -z "$MODE" ]; then
  echo "   ✅ PET_FEEDBACK_MODE not set (defaults to 'full')"
else
  echo "   ✅ PET_FEEDBACK_MODE=$MODE"
fi
echo ""

# Condition 3: LM Studio Connection
echo "📋 Condition 3: LM Studio Accessible"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://host.docker.internal:1234/v1/models)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ LM Studio responding (HTTP $HTTP_CODE)"
else
  echo "   ❌ LM Studio not accessible (HTTP $HTTP_CODE)"
fi
echo ""

# Condition 4: Model Loaded
echo "📋 Condition 4: Model Available"
MODEL=$(grep "^LM_STUDIO_MODEL=" .env 2>/dev/null | cut -d= -f2)
if [ -z "$MODEL" ]; then
  MODEL="openai/gpt-oss-120b"
  echo "   ⚠️  LM_STUDIO_MODEL not set (defaults to $MODEL)"
else
  echo "   ℹ️  LM_STUDIO_MODEL=$MODEL"
fi

MODEL_EXISTS=$(curl -s http://host.docker.internal:1234/v1/models 2>/dev/null | grep -c "\"id\":\"$MODEL\"")
if [ "$MODEL_EXISTS" -gt 0 ]; then
  echo "   ✅ Model '$MODEL' loaded in LM Studio"
else
  echo "   ❌ Model '$MODEL' NOT found in LM Studio"
fi
echo ""

# Condition 5: Statusline Configured
echo "📋 Condition 5: Claude Code Statusline Configured"
if grep -q "statusLine" ~/.claude/settings.json 2>/dev/null; then
  echo "   ✅ Statusline configured in ~/.claude/settings.json"
else
  echo "   ❌ No statusline configuration found"
fi
echo ""

# Condition 6: Check Interval
echo "📋 Condition 6: Check Interval Setting"
INTERVAL=$(grep "^PET_FEEDBACK_CHECK_INTERVAL=" .env 2>/dev/null | cut -d= -f2)
if [ -z "$INTERVAL" ]; then
  INTERVAL=5
  echo "   ✅ PET_FEEDBACK_CHECK_INTERVAL not set (defaults to $INTERVAL)"
else
  echo "   ✅ PET_FEEDBACK_CHECK_INTERVAL=$INTERVAL"
fi
echo "   ℹ️  Monitoring triggers every $INTERVAL statusline updates"
echo ""

# Debug Logging
echo "📋 Debug Logging Configuration"
if grep -q "^PET_FEEDBACK_DEBUG=true" .env 2>/dev/null; then
  echo "   ✅ PET_FEEDBACK_DEBUG=true (logs enabled)"
  LOG_DIR=$(grep "^PET_FEEDBACK_LOG_DIR=" .env 2>/dev/null | cut -d= -f2)
  if [ -z "$LOG_DIR" ]; then
    echo "   ⚠️  PET_FEEDBACK_LOG_DIR not set"
  else
    echo "   ✅ PET_FEEDBACK_LOG_DIR=$LOG_DIR"
    if [ -d "$LOG_DIR" ]; then
      LOG_COUNT=$(ls -1 $LOG_DIR/*.log 2>/dev/null | wc -l)
      echo "   ℹ️  $LOG_COUNT log file(s) found"
    else
      echo "   ⚠️  Log directory doesn't exist yet"
    fi
  fi
else
  echo "   ⚠️  PET_FEEDBACK_DEBUG not enabled (no logs)"
fi
echo ""

# Database Check
echo "📋 Database Status"
if [ -f ~/.claude/pets/feedback.db ]; then
  OBS_COUNT=$(sqlite3 ~/.claude/pets/feedback.db "SELECT COUNT(*) FROM observations;" 2>/dev/null)
  echo "   ✅ Database exists: ~/.claude/pets/feedback.db"
  echo "   ℹ️  $OBS_COUNT observation(s) recorded"
else
  echo "   ⚠️  Database not created yet (monitoring hasn't run)"
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                       SUMMARY                            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "To trigger monitoring, you need:"
echo "1. ✅ All conditions above passing"
echo "2. 🔄 Active Claude Code session"
echo "3. 🔄 $INTERVAL consecutive statusline updates"
echo "4. 🔄 New messages in transcript"
echo ""
echo "How to test:"
echo "1. Start Claude Code and begin working"
echo "2. Monitor logs: tail -f /tmp/pet-logs/*.log"
echo "3. Wait for ~${INTERVAL} statusline updates"
echo "4. Check logs for 'should spawn: true'"
echo ""
