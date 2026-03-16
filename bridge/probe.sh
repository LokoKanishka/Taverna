#!/bin/bash

# probe.sh
# Verifies that the SillyTavern Orchestrator is reachable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo "Probing Taverna Orchestrator at $BRIDGE_API_URL..."

RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$BRIDGE_API_URL/probe")

if [ "$RESPONSE" -eq 204 ] || [ "$RESPONSE" -eq 200 ]; then
    echo "SUCCESS: Orchestrator is ALIVE."
    exit 0
else
    echo "ERROR: Orchestrator is NOT RESPONDING or UNREACHABLE (HTTP $RESPONSE)."
    echo "Verify SillyTavern is running and the ST-Orchestrator plugin is installed."
    exit 1
fi
