# 🏴‍☠️ Taverna — Technical Startup Guide

> **Fingerprint**: `SILLY_TAVERN__Q2M8`

## Prerequisites

| Tool    | Minimum Version |
|---------|-----------------|
| Node.js | v22.x           |
| npm     | 10.x            |
| Python  | 3.12.x          |
| tmux    | 3.4             |
| sqlite3 | (bundled)       |

## Quick Start

```bash
# 1. Clone and enter
git clone https://github.com/LokoKanishka/Taverna.git
cd Taverna

# 2. Install Node dependencies (bridges)
npm install

# 3. Copy env template and fill in credentials
cp .env.example .env
# Edit .env with your API keys (only needed for Tier 2+ bridges)

# 4. Initialize the SQLite database (first time only)
python3 init_db.py

# 5. Launch the full ecosystem
./start_taverna.sh

# 6. Verify everything is up
./smoke_test.sh
```

## Verification

After startup, run the smoke test:

```bash
./smoke_test.sh           # Quick check
./smoke_test.sh --verbose # Full healthcheck JSON output
```

**Expected result**: Exit code `0`, all critical checks `OK`.

## Logs

After startup, logs are available in the tmux session:

```bash
# Attach to the session
tmux attach -t taverna_eco

# Navigate windows:
#   Ctrl+b → 0  = SillyTavern logs
#   Ctrl+b → 1  = ST-Extras logs
#   Ctrl+b → 2  = MCP Bridges logs

# Detach without killing:
#   Ctrl+b → d
```

Centralized log file (when enabled):

```bash
tail -f /tmp/taverna_bridges.log
```

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Port 8123 not responding | `tmux attach -t taverna_eco` → Window 0 |
| Bridge healthcheck FAIL | `curl http://localhost:<PORT>/health` |
| SQLite locked | `fuser taverna_stats.db` |
| Slow first boot | NPX downloads MCP servers on first run; subsequent boots are faster |

## Stopping

```bash
# Kill everything cleanly
tmux kill-session -t taverna_eco
pkill -f "SillyTavern/server.js"
pkill -f "SillyTavern-extras/server.py"
pkill -f "mcp_bridges.js"
```
