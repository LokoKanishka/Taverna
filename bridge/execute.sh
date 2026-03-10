#!/bin/bash

# execute.sh
# Sends a command to the SillyTavern Orchestrator.

COMMAND="$1"

if [ -z "$COMMAND" ]; then
    echo "Usage: $0 \"/slash_command args\""
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo "Sending command to Taverna: $COMMAND"

RESPONSE=$(curl -s -X POST "$BRIDGE_API_URL/execute" \
    -H "Content-Type: application/json" \
    -d "{\"command\": \"$COMMAND\"}")

if [[ "$RESPONSE" == *"success"* ]]; then
    echo "SUCCESS: Command enqueued."
    echo "Response: $RESPONSE"
    exit 0
else
    echo "ERROR: Failed to send command."
    echo "Response: $RESPONSE"
    exit 1
fi
