#!/bin/bash

# install_frontend.sh
# Copies the frontend extension to a target SillyTavern instance.

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/SillyTavern [user_name]"
    exit 1
fi

ST_PATH="$1"
USER_NAME="${2:-default-user}"
TARGET_DIR="$ST_PATH/data/$USER_NAME/extensions/ST-Orchestrator"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Installing Frontend to $TARGET_DIR..."

mkdir -p "$TARGET_DIR"
cp "$BASE_DIR/orchestrator/frontend/index.js" "$TARGET_DIR/"
cp "$BASE_DIR/orchestrator/frontend/manifest.json" "$TARGET_DIR/"

echo "Successfully installed frontend extension in $TARGET_DIR"
