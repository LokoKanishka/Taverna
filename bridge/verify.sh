#!/bin/bash

# verify.sh
# Closed-loop verification helper for Taverna-v2
# Usage: ./verify.sh [TIMEOUT_MS]
# Monitors the queue_depth until it reaches 0 or the timeout is exceeded.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

TIMEOUT_MS=${1:-2500}
INTERVAL_MS=200
ELAPSED=0

echo "[Verifier] Waiting for queue_depth to reach 0 (Timeout: ${TIMEOUT_MS}ms)..."

while [ $ELAPSED -lt $TIMEOUT_MS ]; do
    # Mute healthcheck and extract queue_depth directly
    RESPONSE=$(curl -s -X POST "$BRIDGE_API_URL/probe" || echo "")
    
    if [ -z "$RESPONSE" ]; then
        echo "[Verifier] ERROR: Backend unreachable during verification."
        exit 2
    fi

    QUEUE_DEPTH=$(echo "$RESPONSE" | grep -o '"queue_depth":[0-9]*' | cut -d':' -f2)
    
    if [ "$QUEUE_DEPTH" = "0" ]; then
        echo "[Verifier] SUCCESS: Queue flushed at ${ELAPSED}ms."
        exit 0
    fi
    
    sleep 0.2
    ELAPSED=$((ELAPSED + INTERVAL_MS))
done

echo "[Verifier] FAILURE: Queue depth is still $QUEUE_DEPTH after ${TIMEOUT_MS}ms. (Stuck Queue / Ghost Execution)"
exit 1
