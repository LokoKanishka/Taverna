#!/bin/bash

# probe.sh
# Verifies that the SillyTavern Orchestrator is reachable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo "Probing Taverna Orchestrator at $BRIDGE_API_URL..."

RESPONSE=$(curl -s -X POST "$BRIDGE_API_URL/probe")

if [[ "$RESPONSE" == *"st-orchestrator"* ]]; then
    echo "SUCCESS: Orchestrator is ALIVE."
    echo "Response: $RESPONSE"
    exit 0
else
    echo "ERROR: Orchestrator is NOT RESPONDING or UNREACHABLE."
    echo "Verify SillyTavern is running and the ST-Orchestrator plugin is installed."
    exit 1
fi
