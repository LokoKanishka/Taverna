#!/bin/bash

# ============================================================
#  🔍 TAVERNA SMOKE TEST — End-to-End System Verification
#  Proyecto: SILLY_TAVERN__Q2M8
#
#  Exit code 0 = ALL OK
#  Exit code 1 = At least one FAIL
#
#  Usage: ./smoke_test.sh [--verbose]
# ============================================================

VERBOSE=false
[[ "${1:-}" == "--verbose" ]] && VERBOSE=true

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${BASE_DIR:-$SCRIPT_DIR}"

PASS=0
FAIL=0
WARN=0

# ── Colors ──────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

check_ok()   { echo -e "  ${GREEN}OK${NC}   | $1"; ((PASS++)); }
check_fail() { echo -e "  ${RED}FAIL${NC} | $1"; ((FAIL++)); }
check_warn() { echo -e "  ${YELLOW}WARN${NC} | $1"; ((WARN++)); }

# ── Header ──────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🔍 TAVERNA SMOKE TEST"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════════"
echo ""

# ============================================================
#  1. CORE PROCESSES
# ============================================================
echo -e "${CYAN}── Core Processes ─────────────────────────────────────────${NC}"

# SillyTavern
if (command -v ss >/dev/null 2>&1 && ss -tlnp 2>/dev/null | grep -q ":8123 ") || pgrep -f "SillyTavern/server.js" > /dev/null 2>&1; then
    check_ok "SillyTavern server process (listening on 8123)"
else
    check_fail "SillyTavern server process NOT running"
fi

# ST-Extras
if pgrep -f "SillyTavern-extras/server.py" > /dev/null 2>&1; then
    check_ok "SillyTavern-Extras process"
else
    check_warn "SillyTavern-Extras process NOT running (optional)"
fi

# MCP Bridges
if (command -v ss >/dev/null 2>&1 && ss -tlnp 2>/dev/null | grep -q ":13001 ") || pgrep -f "mcp_bridges.js" > /dev/null 2>&1; then
    check_ok "MCP Bridges process"
else
    check_fail "MCP Bridges process NOT running"
fi

# tmux session
if tmux has-session -t taverna_eco 2>/dev/null; then
    check_ok "tmux session 'taverna_eco' active"
else
    check_fail "tmux session 'taverna_eco' NOT found"
fi

echo ""

# ============================================================
#  2. CORE PORTS
# ============================================================
echo -e "${CYAN}── Core Ports ─────────────────────────────────────────────${NC}"

check_port() {
    local port=$1
    local label=$2
    if (command -v ss >/dev/null 2>&1 && ss -tlnp 2>/dev/null | grep -q ":${port} ") || (command -v netstat >/dev/null 2>&1 && netstat -tlnp 2>/dev/null | grep -q ":${port} "); then
        check_ok "$label (port $port)"
    else
        check_fail "$label (port $port) NOT listening"
    fi
}

check_port 8123 "SillyTavern Frontend"
check_port 5100 "SillyTavern Extras"

echo ""

# ============================================================
#  3. MCP BRIDGE HEALTHCHECKS (Tier 0-4)
# ============================================================
echo -e "${CYAN}── MCP Bridge Healthchecks ────────────────────────────────${NC}"

# Define bridges: port|name|tier|critical
BRIDGES=(
    "13001|SQLite|T0|critical"
    "13002|Memory|T0|critical"
    "13003|Filesystem|T0|critical"
    "13004|Fetch|T0|critical"
    "13005|Git|T1|critical"
    "13006|Time|T1|critical"
    "13007|Puppeteer|T1|optional"
    "13008|SequentialThinking|T1|optional"
    "13009|PostgreSQL|T2|optional"
    "13010|BraveSearch|T2|optional"
    "13011|GoogleMaps|T2|optional"
    "13012|GitHub|T2|optional"
    "13013|EverArt|T3|optional"
    "13014|Sentry|T3|optional"
    "13015|Slack|T3|optional"
    "13016|GoogleDrive|T3|optional"
    "13017|n8n|T4|optional"
    "13018|Docker|T4|optional"
    "13019|Redis|T4|optional"
    "13020|Supabase|T4|optional"
)

for bridge in "${BRIDGES[@]}"; do
    IFS='|' read -r port name tier criticality <<< "$bridge"

    response=$(curl -s --connect-timeout 2 --max-time 3 "http://localhost:${port}/health" 2>/dev/null)

    if [ $? -eq 0 ] && echo "$response" | grep -q '"status"'; then
        status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$status" = "running" ]; then
            check_ok "[$tier] $name (:$port) → running"
        else
            if [ "$criticality" = "critical" ]; then
                check_fail "[$tier] $name (:$port) → $status"
            else
                check_warn "[$tier] $name (:$port) → $status"
            fi
        fi
    else
        if [ "$criticality" = "critical" ]; then
            check_fail "[$tier] $name (:$port) → unreachable"
        else
            check_warn "[$tier] $name (:$port) → unreachable (optional)"
        fi
    fi

    $VERBOSE && [ -n "$response" ] && echo "         └─ $response"
done

echo ""

# ============================================================
#  4. SQLITE DATABASE
# ============================================================
echo -e "${CYAN}── SQLite Database ────────────────────────────────────────${NC}"

DB_PATH="${DB_PATH:-$BASE_DIR/taverna_stats.db}"

if [ -f "$DB_PATH" ]; then
    check_ok "Database file exists"

    tables=$(sqlite3 "$DB_PATH" ".tables" 2>/dev/null)
    if echo "$tables" | grep -q "characters"; then
        check_ok "Schema valid (characters table found)"
    else
        check_fail "Schema missing (characters table not found)"
    fi

    if sqlite3 "$DB_PATH" "SELECT 1;" > /dev/null 2>&1; then
        check_ok "Database readable (not locked)"
    else
        check_fail "Database locked or corrupted"
    fi
else
    check_fail "Database file NOT found at $DB_PATH"
fi

echo ""

# ============================================================
#  5. SUMMARY
# ============================================================
echo "════════════════════════════════════════════════════════════"
echo -e "  Results: ${GREEN}${PASS} OK${NC}  |  ${RED}${FAIL} FAIL${NC}  |  ${YELLOW}${WARN} WARN${NC}"
echo "════════════════════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
    echo -e "  ${RED}❌ SMOKE TEST FAILED${NC} — $FAIL critical issue(s) detected."
    echo ""
    exit 1
else
    echo -e "  ${GREEN}✅ SMOKE TEST PASSED${NC} — All critical checks OK."
    [ $WARN -gt 0 ] && echo -e "  ${YELLOW}⚠  $WARN warnings (non-critical)${NC}"
    echo ""
    exit 0
fi
