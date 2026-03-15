#!/bin/bash
# scripts/run_vertical_slice.sh - Executes the vertical slice 01 sequence
set -e

SCENE_PATH="scenes/pilot-scenario-01"
LOG_FILE="logs/vertical_slice_01.log"
mkdir -p logs

echo "=== STARTING VERTICAL SLICE 01: THE CRIMSON ARCHIVE ===" | tee "$LOG_FILE"

# Pre-check
if [[ ! -f "$SCENE_PATH/config.json" ]]; then
    echo "ERROR: Scene configuration missing." | exit 1
fi

# Turn execution simulator (calling our governable bridge)
for turn in {1..10}
do
    echo -e "\n--- TURNO $turn ---" | tee -a "$LOG_FILE"
    
    # Specific events for vertical slice
    case $turn in
        1)
            echo "Action: Elara enters the deep vaults." | tee -a "$LOG_FILE"
            ;;
        3)
            echo "Action: Detección de peligro. Check de sigilo..." | tee -a "$LOG_FILE"
            ;;
        5)
            echo "Action: Interacting with 'Scroll of Whispering Sands' (Memory check)." | tee -a "$LOG_FILE"
            ;;
        8)
            echo "Action: ARCANE SURGE - Hot-swap: Upgrading Master Model to emphasize intensity." | tee -a "$LOG_FILE"
            ;;
        10)
            echo "Action: Final extraction of the Seal of Silence." | tee -a "$LOG_FILE"
            ;;
        *)
            echo "Action: Standard exploration/narrative turn." | tee -a "$LOG_FILE"
            ;;
    esac

    # Execution call (using existing bridge logic)
    node ./wrapper/pilot_scenario_session.js --scene "$SCENE_PATH" --turn "$turn" | tee -a "$LOG_FILE"
done

echo -e "\n=== VERTICAL SLICE 01 COMPLETE ===" | tee -a "$LOG_FILE"
