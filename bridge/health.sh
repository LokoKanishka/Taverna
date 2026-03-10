#!/bin/bash

# health.sh
# Evaluates the Health Model V1 of Taverna-v2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo "=== Taverna Health Model V1 ==="
echo "Probing backend at $BRIDGE_API_URL/probe..."

# Get HTTP status and body
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BRIDGE_API_URL/probe")
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "1. Backend Reachable: broken (HTTP $HTTP_STATUS)"
    echo "2. Frontend Loaded   : unknown"
    echo "3. Poll Loop Healthy : unknown"
    echo "4. Command Queue     : unknown"
    echo "5. Runtime Available : broken/unknown"
    echo "6. UI Actionable     : unknown"
    echo ""
    echo "OVERALL STATE: broken"
    exit 1
fi

# Parse JSON values using grep/sed (minimal dependencies)
QUEUE_DEPTH=$(echo "$BODY" | grep -o '"queue_depth":[0-9]*' | cut -d':' -f2)
FRONTEND_CONN=$(echo "$BODY" | grep -o '"frontend_connected":\(true\|false\)' | cut -d':' -f2)

# Evaluate Frontend / Poll
if [ "$FRONTEND_CONN" = "true" ]; then
    F_STATUS="ok"
    P_STATUS="ok"
    UI_STATUS="ok (implied)"
else
    F_STATUS="broken (or not loaded)"
    P_STATUS="broken (not polling)"
    UI_STATUS="unknown"
fi

# Evaluate Queue
if [ -z "$QUEUE_DEPTH" ]; then
    Q_STATUS="unknown"
elif [ "$QUEUE_DEPTH" -ge 5 ]; then
    Q_STATUS="degraded (depth $QUEUE_DEPTH)"
else
    Q_STATUS="ok (depth $QUEUE_DEPTH)"
fi

echo "1. Backend Reachable: ok"
echo "2. Frontend Loaded   : $F_STATUS"
echo "3. Poll Loop Healthy : $P_STATUS"
echo "4. Command Queue     : $Q_STATUS"
echo "5. Runtime Available : ok"
echo "6. UI Actionable     : $UI_STATUS"

echo ""
if [ "$FRONTEND_CONN" = "true" ] && [ "$QUEUE_DEPTH" -lt 5 ]; then
    echo "OVERALL STATE: ok"
    exit 0
else
    echo "OVERALL STATE: degraded / broken"
    exit 1
fi
