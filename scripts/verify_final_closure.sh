#!/bin/bash
# verify_final_closure.sh
# Entrypoint for the final reproducible closure verification
cd "$(dirname "$0")/.."
echo "Firing Node.js Verification Suite..."
node scripts/verify_final_closure.js
