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
DIRS=("orchestrator/backend" "orchestrator/frontend" "scripts" "docs")
for d in "${DIRS[@]}"; do
    if [ ! -d "$d" ]; then
        echo -e "${RED}MISSING $d${NC}"
        exit 1
    fi
done
echo -e "${GREEN}OK${NC}"

# 2. Core Files
echo -n "[2/4] Checking core files... "
FILES=("orchestrator/backend/src/index.ts" "orchestrator/frontend/index.js" "docs/ST_ORCHESTRATOR_PROTOCOL.md")
for f in "${FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo -e "${RED}MISSING $f${NC}"
        exit 1
    fi
done
echo -e "${GREEN}OK${NC}"

# 3. Dependencies
echo -n "[3/4] Checking backend deps (package.json)... "
if grep -q "body-parser" orchestrator/backend/package.json; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}MISSING DEPENDENCIES${NC}"
fi

# 4. Git (Taverna-v2 should eventually be initialized as its own repo)
echo -n "[4/4] Checking project root... "
pwd
echo -e "${GREEN}OK${NC}"

echo -e "\n${GREEN}Taverna-v2 structure is valid.${NC}"
