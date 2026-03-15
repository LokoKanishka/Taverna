#!/bin/bash
# verify_integrated_stack.sh - Taverna-v2 Integrated Validation Harness
set -e

LOG_DIR="/tmp/taverna_validation"
mkdir -p "$LOG_DIR"
FINAL_REPORT="$LOG_DIR/validation_report.txt"
echo "=== TAVERNA-V2 INTEGRATED VALIDATION START: $(date) ===" > "$FINAL_REPORT"

function log_block() {
    local name="$1"
    local status="$2"
    local msg="$3"
    echo "[$name] $status - $msg" | tee -a "$FINAL_REPORT"
}

# A. REPO HEALTH
echo "Checking Repo Health..."
if git status --short | grep -q '^[ MADRCU]'; then
    log_block "REPO" "WARN" "Tree is dirty (uncommitted changes allowed for validation)"
else
    log_block "REPO" "PASS" "Tree is clean"
fi

# B. RUNTIME CHECK
echo "Checking SillyTavern Runtime..."
if ss -ltnp | grep -q ':8123'; then
    log_block "RUNTIME" "PASS" "SillyTavern listening on 8123"
else
    echo "Runtime down, attempting startup..."
    (cd /home/lucy-ubuntu/Archivo_proyectos/Taverna/Taverna-legacy/SillyTavern && BROWSER=true nohup node server.js > "$LOG_DIR/st_runtime.log" 2>&1 & echo $! > "$LOG_DIR/st_runtime.pid")
    sleep 5
    if ss -ltnp | grep -q ':8123'; then
        log_block "RUNTIME" "PASS" "SillyTavern started successfully (PID $(cat $LOG_DIR/st_runtime.pid))"
    else
        log_block "RUNTIME" "FAIL" "Failed to start SillyTavern"
        exit 1
    fi
fi

# C. SMOKE TEST
echo "Running Smoke Test..."
if bash ./scripts/smoke_test.sh > "$LOG_DIR/smoke_test.log" 2>&1; then
    log_block "SMOKE" "PASS" "API endpoints responding correctly"
else
    log_block "SMOKE" "FAIL" "Check $LOG_DIR/smoke_test.log"
fi

# D. ROLE EXECUTION
echo "Running Role Execution Demo..."
if node ./wrapper/demo_scene_roles.js > "$LOG_DIR/role_demo.log" 2>&1; then
    log_block "ROLE" "PASS" "Role-to-model logic verified"
else
    log_block "ROLE" "FAIL" "Check $LOG_DIR/role_demo.log"
fi

# E. PERSISTENT MEMORY
echo "Running Context & Memory Demo..."
if node ./wrapper/demo_context_memory.js > "$LOG_DIR/memory_demo.log" 2>&1; then
    log_block "MEMORY" "PASS" "Persistent memory read/write verified"
else
    log_block "MEMORY" "FAIL" "Check $LOG_DIR/memory_demo.log"
fi

# F. SCENE CONTINUITY (New)
echo "Running Scene Continuity Demo..."
if node ./wrapper/demo_scene_continuity.js > "$LOG_DIR/continuity_demo.log" 2>&1; then
    log_block "CONTINUITY" "PASS" "Multi-turn state and trace verified"
else
    log_block "CONTINUITY" "FAIL" "Check $LOG_DIR/continuity_demo.log"
fi

echo ""
echo "=== INTEGRATED RESULT ==="
cat "$FINAL_REPORT"
