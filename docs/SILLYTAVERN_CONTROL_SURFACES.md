# SillyTavern Control Surfaces Inventory

This document maps all the governable surfaces within SillyTavern based on real evidence obtained by inspecting the SillyTavern codebase (`server-main.js`, `settings.js`, `characters.js`, `chats.js`, etc.). It identifies how Taverna-v2 (Antigravity) can observe, modify, verify, and rollback changes for each surface using native REST API endpoints.

## 1. Runtime & Global Configuration
- **Description:** Core user preferences, enabled components, extensions toggle, and default behaviors.
- **Source of Truth:** `data/[user]/settings.json` (user preferences) and `config.yaml` (server startup config). 
- **Observation Surface:** 
  - `POST /api/settings/get` (Returns full `settings.json` payload and arrays of `themes`, `instruct`, `context`, etc.).
- **Modification Surface:** 
  - `POST /api/settings/save` (Writes directly to `settings.json` via atomic sync).
- **Verification:** Call `/api/settings/get` and assert the changed properties match.
- **Rollback:** 
  - Native support exists: `POST /api/settings/make-snapshot` creates a timestamped backup before modification. 
  - Recovery via `POST /api/settings/restore-snapshot` sending the snapshot filename.

## 2. Characters (Cards)
- **Description:** Character identities, metadata, prompts (V2 Spec), and avatars.
- **Source of Truth:** `/data/[user]/characters/[AvatarName].png` (or JSON), embedding the V2 Spec data.
- **Observation Surface:** 
  - `POST /api/characters/all` (Returns shallow list of all characters).
  - `POST /api/characters/get` (Returns specific character data parsed).
- **Modification Surface:** 
  - `POST /api/characters/create` / `POST /api/characters/import` (Creating new cards).
  - `POST /api/characters/edit` (Modifies character parameters and writes payload into the file).
  - `POST /api/characters/delete` (Removes the character file and associated chats).
- **Verification:** Retrieve the character via `/api/characters/get` and validate the `data` fields.
- **Rollback:** Antigravity must read the character state before editing, hold it in memory, and send a restorative `POST /api/characters/edit` payload if verification fails.

## 3. Chats (Conversations)
- **Description:** The message history of interactions between the user and characters.
- **Source of Truth:** `/data/[user]/chats/[character_name]/[chat_file].jsonl`.
- **Observation Surface:** 
  - `POST /api/chats/get` (Returns an array of parsed JSON objects representing messages).
- **Modification Surface:** 
  - `POST /api/chats/save` (Overwrites the JSONL array). 
  - `POST /api/chats/rename` / `POST /api/chats/delete`.
- **Verification:** Pull `/api/chats/get` and assert message count or the presence/absence of injected messages.
- **Rollback:** SillyTavern natively writes chat backups (e.g., `chat_[name]_[timestamp].jsonl`), but programmatic rollback by Antigravity is best achieved by storing the JSON array prior to modification and re-saving it.

## 4. Groups & Group Chats
- **Description:** Multi-character group definitions and their ongoing chat histories.
- **Source of Truth:** `/data/[user]/groups/` (metadata) and `/data/[user]/group chats/` (JSONL histories).
- **Observation Surface:** 
  - `POST /api/groups/all` (List all groups).
  - `POST /api/chats/group/get` (Retrieve messages).
- **Modification Surface:** 
  - `POST /api/groups/create`, `POST /api/groups/edit`, `POST /api/groups/delete`.
  - `POST /api/chats/group/save`.
- **Verification:** Query `/api/groups/all` or fetch the specific group chat.
- **Rollback:** Same as 1-on-1 chats; requires Antigravity to cache the state prior to `save` operations.

## 5. Lorebooks (World Info)
- **Description:** Dictionaries of contextual knowledge inserted during generation.
- **Source of Truth:** `/data/[user]/worlds/[name].json`.
- **Observation Surface:** 
  - `POST /api/worldinfo/list` (List available Lorebooks).
  - `POST /api/worldinfo/get` (Reads the full JSON payload with entries).
- **Modification Surface:** 
  - `POST /api/worldinfo/edit` (Expects the full JSON payload including the `entries` array).
  - `POST /api/worldinfo/import`, `POST /api/worldinfo/delete`.
- **Verification:** Re-fetch via `/api/worldinfo/get` and assert the new entry exists or was removed.
- **Rollback:** Simple to achieve by holding the previous JSON state and triggering `/api/worldinfo/edit` with the old payload.

## 6. Presets & Inference Parameters
- **Description:** Pre-configured generation settings (temperature, top_p, etc.), Instruct templates, Context templates.
- **Source of Truth:** `/data/[user]/[Backend]_Settings/` (e.g., `OpenAI Settings`), plus `/data/[user]/instruct/` and `/data/[user]/context/`.
- **Observation Surface:** 
  - Provided en-masse via `POST /api/settings/get` (e.g., `novelai_settings`, `instruct`, `context` arrays).
- **Modification Surface:** 
  - `POST /api/presets/save` (requires payload `{name, preset, apiId}` where `apiId` maps to the folder, e.g., 'openai', 'instruct').
  - `POST /api/presets/delete`.
- **Verification:** Fetch settings and assert the preset object is present in the intended array.
- **Rollback:** Read existing preset via `/api/settings/get` before overriding, then send the old preset payload to `/api/presets/save` if rollback is needed.

## 7. Secrets & API Keys
- **Description:** API keys for external providers (OpenAI, Anthropic, NovelAI, etc.).
- **Source of Truth:** `/data/[user]/secrets.json`.
- **Observation Surface:** 
  - `POST /api/secrets/get` (Reads the key-value store).
- **Modification Surface:** 
  - `POST /api/secrets/save` (Writes secrets back).
- **Verification:** Fetch `/api/secrets/get` to confirm key update, and ideally run a `/probe` or `/ping` test against the specific endpoint (e.g., `POST /api/openai/models` to verify the key works).
- **Rollback:** Cache previous key before overwrite.

## 8. Plugins & Extensions
- **Description:** Third-party UI extensions (Frontend) and Server plugins (Backend).
- **Source of Truth:** `/public/scripts/extensions/` (Frontend) and `/plugins/` (Backend).
- **Observation Surface:** 
  - Native endpoint `POST /api/extensions/all` or similar might exist, but ST-Orchestrator can map `/plugins/` via filesystem or OS probes.
- **Modification Surface:** 
  - Plugin installations usually require filesystem-level logic or specific plugin endpoints.
- **Verification:** Check `settings.json` for extension toggles or `package.json` in directories.
- **Rollback:** Antigravity filesystem rollback.

## Summary & Viability
SillyTavern's backend exposes almost all governable surfaces via REST API POST endpoints mapping directly to file-system reads/writes. Taverna-v2 can achieve **Total Control** by orchestrating these endpoints over HTTP without needing UI automation. 

**Next Steps for Antigravity:**
1. Define precise REST contracts for `settings.json`, characters, & lorebooks (`CONTROL_CONTRACTS.md`).
2. Map these contracts to an explicit Action Matrix MVP (`MVP_CONTROL_MATRIX.md`).
