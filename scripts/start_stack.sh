#!/bin/bash

# start_stack.sh
# Entry point to start the Taverna-v2 Orchestration stack.

# 1. Start SillyTavern (Optional/Wrapper)
# This script assumes SillyTavern is installed and configured.

ST_PATH="${1:-../SillyTavern}"

if [ ! -d "$ST_PATH" ]; then
    echo "Error: SillyTavern directory not found at $ST_PATH"
    echo "Usage: $0 /path/to/SillyTavern"
    exit 1
fi

echo "Starting SillyTavern from $ST_PATH..."
cd "$ST_PATH" && npm start
