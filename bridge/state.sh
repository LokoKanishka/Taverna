#!/bin/bash

# state.sh
# Retrieves the live Global State of Taverna-v2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "This script requires 'jq' to parse JSON neatly."
    echo "Install it using: sudo apt install jq"
    # Fallback raw output
    curl -s GET "$BRIDGE_API_URL/state"
    echo ""
    exit 0
fi

RESPONSE=$(curl -s -w "\n%{http_code}" GET "$BRIDGE_API_URL/state")
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "ERROR: Could not retrieve state. Backend may be offline (HTTP $HTTP_STATUS)"
    exit 1
fi

echo "=== TAVERNA GLOBAL STATE ==="
echo "$BODY" | jq .
