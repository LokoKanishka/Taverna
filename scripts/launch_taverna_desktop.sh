#!/bin/bash

# Taverna Desktop Launcher
# Robust entry point for SillyTavern runtime and UI.

LOG_FILE="$HOME/.taverna_launcher.log"
ST_DIR="/home/lucy-ubuntu/Archivo_proyectos/Taverna/Taverna-legacy/SillyTavern"
ST_URL="http://127.0.0.1:8123"
TIMEOUT=30

echo "[$(date)] Launching Taverna..." > "$LOG_FILE"

# 1. Check if ST is already running
if curl -s --head --fail "$ST_URL" > /dev/null; then
    echo "[$(date)] SillyTavern is already running." >> "$LOG_FILE"
else
    echo "[$(date)] SillyTavern not found. Starting runtime..." >> "$LOG_FILE"
    cd "$ST_DIR" || { echo "Error: ST Directory not found" >> "$LOG_FILE"; exit 1; }
    
    # Start ST in background using nohup to avoid closing with terminal
    # We use the existing start.sh which should handle the node launch.
    nohup ./start.sh > "$LOG_FILE.st_out" 2>&1 &
    
    # 2. Wait for availability
    echo "[$(date)] Waiting for port 8123..." >> "$LOG_FILE"
    COUNT=0
    while ! curl -s --head --fail "$ST_URL" > /dev/null; do
        sleep 1
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $TIMEOUT ]; then
            echo "[$(date)] ERROR: Timeout waiting for SillyTavern to start." >> "$LOG_FILE"
            notify-send "Taverna Error" "No se pudo iniciar SillyTavern a tiempo. Revisa logs en $LOG_FILE"
            exit 1
        fi
    done
    echo "[$(date)] SillyTavern is now UP." >> "$LOG_FILE"
fi

# 3. Open UI
# We prefer Google Chrome or Chromium to avoid Firefox Profile Picker issues.
if command -v google-chrome > /dev/null; then
    google-chrome --app="$ST_URL" &
elif command -v chromium-browser > /dev/null; then
    chromium-browser --app="$ST_URL" &
else
    xdg-open "$ST_URL" &
fi

echo "[$(date)] UI opened successfully." >> "$LOG_FILE"
exit 0
