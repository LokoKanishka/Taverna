#!/bin/bash

# ==========================================
# Taverna Roleplay Ecosystem Launcher Script
# ==========================================

if ! command -v tmux &> /dev/null
then
    echo "tmux no está instalado. Instalando..."
    sudo apt-get update && sudo apt-get install -y tmux
fi

# Directorio Base
BASE_DIR="/home/lucy-ubuntu/Escritorio/Taverna"
SESSION="taverna_eco"

# Matar sesión existente si la hay
tmux kill-session -t $SESSION 2>/dev/null

# Matar procesos huerfanos para liberar puertos
pkill -f "SillyTavern/server.js" || true
pkill -f "SillyTavern-extras/server.py" || true
sleep 2

# Crear nueva sesión tmux en background
tmux new-session -d -s $SESSION

# 1. Frontend: SillyTavern (Puerto 8123)
tmux rename-window -t $SESSION:0 'SillyTavern'
tmux send-keys -t $SESSION:0 "cd $BASE_DIR/SillyTavern && npm start" C-m

# 2. Motor de Percepción: SillyTavern Extras (Puerto 5100, chromadb + caption)
tmux new-window -t $SESSION -n 'ST-Extras'
tmux send-keys -t $SESSION:1 "cd $BASE_DIR/SillyTavern-extras && source venv/bin/activate && python3 server.py --enable-modules=caption,chromadb --listen" C-m

# 3. Conocimiento Base y Orquestación: MCP Bridges (SSE en Puertos 3001-3004)
tmux new-window -t $SESSION -n 'MCP-Bridges'
tmux send-keys -t $SESSION:2 "cd $BASE_DIR && node mcp_bridges.js" C-m

echo "=========================================="
echo "🚀 Ecosistema Taverna Iniciado Correctamente"
echo "=========================================="
echo "Servicios en ejecución en bg (tmux):"
echo " - [0] SillyTavern (Puerto 8123) (USO exclusivo de TAVERNA)"
echo " - [1] SillyTavern Extras (Puerto 5100) (USO exclusivo de TAVERNA)"
echo " - [2] MCP Bridges (Puente SSE HTTP)"
echo "       * SQLite:   13001 (USO exclusivo de TAVERNA)"
echo "       * Memory:   13002 (USO exclusivo de TAVERNA)"
echo "       * Filesystem: 13003 (USO exclusivo de TAVERNA)"
echo "       * Fetch:    13004 (USO exclusivo de TAVERNA)"
echo " "
echo "Para ver los logs de un servicio en vivo usa:"
echo "   tmux attach -t $SESSION"
echo "(Usa Ctrl+b y luego d para salir de la vista del log sin matar el proceso)"
echo "=========================================="
