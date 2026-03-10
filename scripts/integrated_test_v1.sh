#!/bin/bash

# integrated_test_v1.sh
# E2E Test demonstrating Taverna-v2's operational models.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_DIR="$(dirname "$SCRIPT_DIR")/bridge"

# Make sure scripts are executable (in case they weren't)
chmod +x "$BRIDGE_DIR/health.sh" "$BRIDGE_DIR/state.sh" "$BRIDGE_DIR/execute.sh" "$BRIDGE_DIR/verify.sh" 2>/dev/null || true

echo "=========================================="
echo " TAVERNA-V2 INTEGRATED TEST V1"
echo "=========================================="
echo ""

echo "[1] HEALTH MODEL: Initial State"
"$BRIDGE_DIR/health.sh"
HEALTH_EXIT=$?

if [ $HEALTH_EXIT -ne 0 ]; then
    echo ""
    echo "[!] Immune System triggered: Health is Degraded/Broken. Aborting integrated test."
    echo "[!] Recovery Required: Please ensure ST is running and the Backend is alive."
    exit 1
fi

echo ""
echo "[2] CAPABILITY: 'execute_simple_visible_action'"
echo "    -> Primary Path: Backend API Enqueue"
echo "    -> Command: /sys [Taverna-v2] Integrated Test OK"

# Execution
"$BRIDGE_DIR/execute.sh" "/sys [Taverna-v2] Integrated Test OK"
EXEC_EXIT=$?

if [ $EXEC_EXIT -ne 0 ]; then
    echo "ERROR: Failed to enqueue command."
    exit 1
fi

echo ""
echo "[3] VERIFICATION MODEL: Awaiting Frontend Consumption"
"$BRIDGE_DIR/verify.sh" 5000
VERIFY_EXIT=$?

if [ $VERIFY_EXIT -ne 0 ]; then
    echo "ERROR: Verification failed. Immune System Action: Fallback/Safe Failure."
    echo "[!] Ghost Execution or Stuck Queue detected."
else
    echo "SUCCESS: Verification passed. State is consistent."
fi

echo ""
echo "[4] FINAL STATE MODEL DUMP"
"$BRIDGE_DIR/state.sh"

echo ""
echo "=========================================="
echo " INTEGRATED TEST COMPLETED"
echo "=========================================="
exit $VERIFY_EXIT
