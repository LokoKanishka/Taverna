# Verification and Rollback Strategies (Phase 6)

One of the defining requirements of the Taverna orchestration wrapper is the ability to guarantee safe state changes. SillyTavern was designed as a GUI primarily operated by humans who visually observe and correct errors. We must automate this capability to build a trusted NLP bridge.

## Core Principles

1. **State Observation Pre-Flight (Observed Before):** 
   No mutable operation is performed without first capturing the state of the component. 
2. **Deterministic Actions:**
   The wrapper submits changes payload.
3. **Verification Step (Observed After):**
   The wrapper performs an explicit read AFTER the change to guarantee SillyTavern absorbed the payload.
4. **Conditional Rollback:**
   If the API throws an error during the action, OR if the Verification step reveals a mismatch, a Rollback sequence is automatically triggered using the `Observed Before` state.
5. **Traceability:**
   A failed operation must comprehensively document its `rollback_plan` and `rollback_result`.

## Implemented Strategies

### `model.set_active`
- **Before:** Saves `api_server_default` and the corresponding `temp_{api}` property from `/api/settings/get`.
- **Verify:** Re-reads the setting to ensure it matches the command.
- **Rollback Plan:** Dispatches a secondary POST `/api/settings/save` restoring the previous exact API and Model keys.

### `character.update_fields`
- **Before:** Loads the specific character object via `character.read` payload before executing any edit.
- **Verify:** Reloads the character object and compares the strictly edited keys against the response.
- **Rollback Plan:** Re-invokes `/api/characters/edit` endpoint utilizing the full pre-modification Character Object as multipart/form-data.

### `lorebook.upsert_entry`
- **Before:** Downloads the entire original Lorebook file from `/api/worldinfo/get`.
- **Verify:** Checks if the target keyword is present and perfectly matches the content sent.
- **Rollback Plan:** REST-POSTs the original, unmodified Lorebook JSON entirely back onto `/api/worldinfo/edit`.

### `settings.update`
- **Before:** Copies out existing key-values for the set of requested properties.
- **Verify:** Re-reads the updated keys to verify they match exactly.
- **Rollback Plan:** Overwrites the invalid change by immediately triggering a save containing the `observed_before` subset values.
