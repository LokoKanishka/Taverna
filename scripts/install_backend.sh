#!/bin/bash

# install_backend.sh
# Copies the backend plugin to a target SillyTavern instance.

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/SillyTavern"
    exit 1
fi

ST_PATH="$1"
TARGET_DIR="$ST_PATH/plugins/ST-Orchestrator"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Installing Backend to $TARGET_DIR..."

mkdir -p "$TARGET_DIR/src"
cp "$BASE_DIR/orchestrator/backend/src/index.ts" "$TARGET_DIR/src/"
cp "$BASE_DIR/orchestrator/backend/src/state.ts" "$TARGET_DIR/src/"
cp "$BASE_DIR/orchestrator/backend/package.json" "$TARGET_DIR/"
cp "$BASE_DIR/orchestrator/backend/tsconfig.json" "$TARGET_DIR/"
cp "$BASE_DIR/orchestrator/backend/webpack.config.js" "$TARGET_DIR/"

echo "Successfully staged backend in $TARGET_DIR"
echo "Note: You need to run 'npm install' and build in $TARGET_DIR"
