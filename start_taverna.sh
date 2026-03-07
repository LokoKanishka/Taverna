#!/bin/bash
set -euo pipefail

# ============================================================
#  🏴‍☠️ TAVERNA ROLEPLAY ECOSYSTEM — CYBERPUNK LAUNCHER
#  20 MCP Servers | SillyTavern | ST-Extras
#  Proyecto: SILLY_TAVERN__Q2M8
# ============================================================

if ! command -v tmux &> /dev/null; then
    echo "Error: tmux no está instalado. Instálalo antes de ejecutar este script."
    exit 1
fi

# Directorio Base
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${BASE_DIR:-$SCRIPT_DIR}"
SESSION="taverna_eco"

# ── API Keys (configurar acá o exportar como env vars) ──────
# Descomenta y completá las que tengas:
# export BRAVE_API_KEY="tu-api-key"
# export GITHUB_TOKEN="tu-github-token"
# export GOOGLE_MAPS_API_KEY="tu-api-key"
# export EVERART_API_KEY="tu-api-key"
# export SENTRY_AUTH_TOKEN="tu-token"
# export SENTRY_ORG="tu-org"
# export SLACK_BOT_TOKEN="xoxb-tu-token"
# export SLACK_TEAM_ID="tu-team-id"
# export GDRIVE_CLIENT_ID="tu-client-id"
# export GDRIVE_CLIENT_SECRET="tu-client-secret"
# export N8N_BASE_URL="http://localhost:5678"
# export N8N_API_KEY="tu-n8n-api-key"
# export REDIS_URL="redis://localhost:6379"
# export TAVERNA_POSTGRES_URL="postgresql://localhost:5432/taverna"
# export SUPABASE_ACCESS_TOKEN="tu-supabase-token"

# Matar sesión existente si la hay
tmux kill-session -t "$SESSION" 2>/dev/null || true

pkill -f "SillyTavern/server.js" || true
pkill -f "SillyTavern-extras/server.py" || true
pkill -f "mcp_bridges.js" || true
# Forzar liberación de puertos core
fuser -k 8123/tcp 2>/dev/null
fuser -k 5100/tcp 2>/dev/null
fuser -k 13001/tcp 13002/tcp 13003/tcp 13004/tcp 2>/dev/null
sleep 2

# Crear nueva sesión tmux en background
tmux new-session -d -s "$SESSION"

# ── [0] Frontend: SillyTavern (Puerto 8123) ─────────────────
tmux rename-window -t "$SESSION":0 'SillyTavern'
tmux send-keys -t "$SESSION":0 "cd '$BASE_DIR/SillyTavern' && npm start" C-m

# ── [1] Motor de Percepción: ST-Extras (Puerto 5100) ────────
tmux new-window -t "$SESSION" -n 'ST-Extras'
tmux send-keys -t "$SESSION":1 "cd '$BASE_DIR/SillyTavern-extras' && source venv/bin/activate && python3 server.py --enable-modules=caption,chromadb --listen" C-m

# ── [2] MCP Bridge: Lanza TODOS los bridges ──────────────────
# Logs duplicated to /tmp/taverna_bridges.log for post-mortem analysis
LOG_FILE="/tmp/taverna_bridges.log"
tmux new-window -t "$SESSION" -n 'MCP-Bridges'
tmux send-keys -t "$SESSION":2 "cd '$BASE_DIR' && node mcp_bridges.js 2>&1 | tee -a '$LOG_FILE'" C-m

echo ""
echo "🏴‍☠️ ════════════════════════════════════════════════════════"
echo "   TAVERNA CYBERPUNK ECOSYSTEM — ALL SYSTEMS GO"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  ⚡ Servicios Core:"
echo "     [0] SillyTavern        → http://localhost:8123"
echo "     [1] SillyTavern Extras → http://localhost:5100"
echo ""
echo "  🧩 MCP Bridges (20 servidores):"
echo "     ┌─ Tier 0: Existentes ─────────────────────────────┐"
echo "     │  SQLite             → :13001                     │"
echo "     │  Memory             → :13002                     │"
echo "     │  Filesystem         → :13003                     │"
echo "     │  Fetch              → :13004                     │"
echo "     ├─ Tier 1: Impacto Directo ────────────────────────┤"
echo "     │  Git                → :13005                     │"
echo "     │  Time               → :13006                     │"
echo "     │  Puppeteer          → :13007                     │"
echo "     │  SequentialThinking → :13008                     │"
echo "     ├─ Tier 2: Datos y Contenido ──────────────────────┤"
echo "     │  PostgreSQL         → :13009  (⚿ DB requerida)  │"
echo "     │  BraveSearch        → :13010  (⚿ API key)       │"
echo "     │  GoogleMaps         → :13011  (⚿ API key)       │"
echo "     │  GitHub             → :13012  (⚿ Token)         │"
echo "     ├─ Tier 3: Multimedia y Monitoreo ─────────────────┤"
echo "     │  EverArt            → :13013  (⚿ API key)       │"
echo "     │  Sentry             → :13014  (⚿ Token)         │"
echo "     │  Slack              → :13015  (⚿ Token)         │"
echo "     │  GoogleDrive        → :13016  (⚿ OAuth)         │"
echo "     ├─ Tier 4: Orquestación Avanzada ──────────────────┤"
echo "     │  n8n                → :13017  (⚿ API key)       │"
echo "     │  Docker             → :13018                     │"
echo "     │  Redis              → :13019  (⚿ Redis server)  │"
echo "     │  Supabase           → :13020  (⚿ Token)         │"
echo "     └──────────────────────────────────────────────────┘"
echo ""
echo "  ⚿ = Necesita configuración de credenciales arriba"
echo ""
echo "  📺 Para ver logs en vivo:"
echo "     tmux attach -t $SESSION"
echo "     (Ctrl+b → d para salir sin matar procesos)"
echo ""
echo "  🔍 Health check de un bridge:"
echo "     curl http://localhost:13001/health"
echo ""
echo "════════════════════════════════════════════════════════════"

# ── Post-launch verification ─────────────────────────────────
echo ""
echo "  ⏳ Waiting 15 seconds for services to initialize..."
sleep 15
echo ""
"$BASE_DIR/smoke_test.sh"
