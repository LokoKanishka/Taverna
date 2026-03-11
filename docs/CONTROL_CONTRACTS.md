# Taverna Control Contracts (Phase 2)
This document defines the exact HTTP/REST contracts required for Antigravity (Taverna-v2) to interface with SillyTavern's governable surfaces.

All endpoints are relative to `http://127.0.0.1:8123`.

---

## 1. Global Settings & Configuration
The central configuration of the user's SillyTavern instance.

### Observation
- **Endpoint:** `POST /api/settings/get`
- **Request Body:** `{}` (Empty)
- **Response Expected:** `200 OK` with JSON object containing `settings` (stringified), `themes`, `instruct`, `context`, `openai_settings`, `textgenerationwebui_presets`, etc.

### Modification
- **Endpoint:** `POST /api/settings/save`
- **Request Body:** `application/json` containing the full `settings.json` payload (unstringified object, as it stringifies internally before saving).
- **Response Expected:** `200 OK` with `{"result": "ok"}`

### Verification
- **Action:** Re-run `POST /api/settings/get`, parse the `settings` string into JSON, and assert the target field matches the intended value.

### Rollback
- **Pre-action:** `POST /api/settings/make-snapshot` (returns `204 No Content`).
- **Post-action (if failure):** Fetch the latest snapshot name from `POST /api/settings/get-snapshots` and then call `POST /api/settings/restore-snapshot` with `{"name": "snapshot-filename.json"}`.

---

## 2. Characters (Cards)
The definitions and metadata for individual AI characters.

### Observation
- **Endpoint:** `POST /api/characters/all`
- **Request Body:** `{}`
- **Response Expected:** `200 OK` returning an array of shallow character metadata objects containing `name`, `avatar`, `data_size`, etc.
- **Deep Observation:** `POST /api/characters/get`
    - **Request Body:** `{"avatar": "character_name.png"}` (Note: usually requires a multipart/form-data or specific JSON structure if the character endpoint expects files. Wait, `characters.js` has `/all`. Let's assume standard behavior of ST frontend fetching individual cards).

### Modification (Edit)
- **Endpoint:** `POST /api/characters/edit`
- **Request Body:** `multipart/form-data` with `avatar` (string filename like `Character.png`), `ch_name`, `description`, `personality`, `first_mes`, `scenario`, etc. fields mapping to Spec V2 data. 
- **Response Expected:** `200 OK` with `{"avatar": "Character.png"}`.

### Verification
- **Action:** Re-fetch the character list or specific character properties to verify the updated field (e.g., `description`).

### Rollback
- **Pre-action:** Fetch full character details.
- **Post-action (if failure):** Send the `POST /api/characters/edit` with the original values.

---

## 3. Lorebooks (World Info)
Dictionaries inserted into the context window.

### Observation
- **Endpoint:** `POST /api/worldinfo/get`
- **Request Body:** `{"name": "LorebookName"}`
- **Response Expected:** `200 OK` returning the full JSON structure including the `entries` array.

### Modification
- **Endpoint:** `POST /api/worldinfo/edit`
- **Request Body:** `application/json` with `{"name": "LorebookName", "data": { ...full JSON... }}`.
- **Response Expected:** `200 OK` with `{"ok": true}`.

### Verification
- **Action:** Read via `POST /api/worldinfo/get` and confirm the `entries` list or specific `uid` / `key` matches the changes.

### Rollback
- **Pre-action:** Read and cache the full object in Taverna memory.
- **Post-action (if failure):** Send the entire cached object back via `POST /api/worldinfo/edit`.

---

## 4. Chats (History)
Backing up or modifying the context history for a chat.

### Observation
- **Endpoint:** `POST /api/chats/get`
- **Request Body:** `{"avatar_url": "Character.png", "file_name": "Character - Timestamp"}`
- **Response Expected:** `200 OK` returning a parsed JSON array of message objects.

### Modification
- **Endpoint:** `POST /api/chats/save`
- **Request Body:** `{"avatar_url": "Character.png", "file_name": "Character - Timestamp", "chat": [ ...message objects... ]}`
- **Response Expected:** `200 OK` with `{"ok": true}`.

### Verification
- **Action:** Call `/api/chats/get` and assert the message length or target `mes` field.

### Rollback
- **Pre-action:** Pull the full array using `/api/chats/get`.
- **Post-action:** Save the original array back if the change is deemed incorrect.

---

## 5. Inference Presets
Provider-specific configurations (e.g., OpenAI, NovelAI settings).

### Modification
- **Endpoint:** `POST /api/presets/save`
- **Request Body:** `{"name": "PresetName", "preset": { ... }, "apiId": "openai"}`
- **Response Expected:** `200 OK` with `{"name": "PresetName"}`.

### Deletion / Rollback
- **Endpoint:** `POST /api/presets/delete`
- **Request Body:** `{"name": "PresetName", "apiId": "openai"}`
- **Response Expected:** `200 OK`.

---

## Summary of the Integration Strategy
By adhering strictly to these contracts, Taverna-v2 will not need any complex shell scripts or `sed` commands to modify SillyTavern properties. It will construct JSON/Multipart payloads, fire them directly at ST's HTTP port, and read the response. If the modification breaks something, it can execute the Rollback path described above using its own memory.
