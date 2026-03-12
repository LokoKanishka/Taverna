#!/bin/bash

# start_stack.sh
# Convenience wrapper to start an existing SillyTavern instance.
# Taverna-v2 is a bridge/plugin and requires SillyTavern to be installed separately.

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/SillyTavern"
    exit 1
fi

ST_PATH="$1"

if [ ! -d "$ST_PATH" ]; then
    echo "Error: SillyTavern directory not found at $ST_PATH"
    exit 1
fi

echo "Starting SillyTavern wrapper from $ST_PATH..."
cd "$ST_PATH"
BROWSER=true npm start
