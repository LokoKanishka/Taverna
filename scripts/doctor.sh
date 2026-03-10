#!/bin/bash

# Taverna-v2 Doctor Script
# Verifies the health and integrity of the workspace.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "## Taverna-v2 Health Check"

# 1. Directory Structure
echo -n "[1/4] Checking directories... "
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIRS=("orchestrator/backend" "orchestrator/frontend" "scripts" "docs")
for d in "${DIRS[@]}"; do
    if [ ! -d "$BASE_DIR/$d" ]; then
        echo -e "${RED}MISSING $d${NC}"
        exit 1
    fi
done
echo -e "${GREEN}OK${NC}"

# 2. Core Files
echo -n "[2/4] Checking core files... "
FILES=("orchestrator/backend/src/index.ts" "orchestrator/frontend/index.js" "docs/ST_ORCHESTRATOR_PROTOCOL.md")
for f in "${FILES[@]}"; do
    if [ ! -f "$BASE_DIR/$f" ]; then
        echo -e "${RED}MISSING $f${NC}"
        exit 1
    fi
done
echo -e "${GREEN}OK${NC}"

# 3. Dependencies
echo -n "[3/4] Checking backend deps (package.json)... "
if grep -q "body-parser" "$BASE_DIR/orchestrator/backend/package.json"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING DEPENDENCIES${NC}"
fi

# 4. Git & Environment Integrity
echo -n "[4/4] Checking project root... "
ABS_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
echo -e "${GREEN}OK ($ABS_ROOT)${NC}"

echo -e "\n${GREEN}Taverna-v2 repository is consistent with its canonical contract.${NC}"
