#!/bin/bash

# smoke_test.sh
# Verifies the orchestration circuit via loopback.

set -e

ST_URL="${1:-http://localhost:8000}"
ENDPOINT="$ST_URL/api/plugins/st-orchestrator"

echo "Running Smoke Test against $ST_URL"

# 1. Probe
echo -n "Test 1: /probe ... "
curl -s -X POST "$ENDPOINT/probe" | grep -q "st-orchestrator" && echo "PASS" || echo "FAIL"

# 2. Execute
echo -n "Test 2: /execute ... "
RESP=$(curl -s -X POST "$ENDPOINT/execute" -H "Content-Type: application/json" -d '{"command": "/echo smoke_test_alive"}')
echo "$RESP" | grep -q "success" && echo "PASS" || echo "FAIL"

# 3. Poll
echo -n "Test 3: /poll ... "
curl -s -X GET "$ENDPOINT/poll" | grep -q "smoke_test_alive" && echo "PASS" || echo "FAIL"

echo "Smoke test finished."
