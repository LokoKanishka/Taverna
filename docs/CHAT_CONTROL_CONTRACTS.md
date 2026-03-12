# Chat Control Contracts

This document defines the exact operational contracts for Taverna's governance over SillyTavern's chat surfaces. These are derived from `docs/CHAT_SURFACES.md`.

## Operation: `chat.list_recent`
- **Goal:** Retrieve the most recent chats (both characters and groups) sorted chronologically by activity.
- **Surface:** `POST /api/chats/recent`
- **Arguments:** None. (Or `{}` JSON body)
- **State Change:** None (Read-Only)
- **Expected Success Validation:** Returns an array.
- **Contract Signature:**
  ```javascript
  // IN: null
  // OUT:
  {
      ok: true,
      chats: [
          {
              is_group: false,
              id: "Director de Juego",
              file_id: "Director de Juego - 2026-03-05@01h37m42s808ms",
              chat_items: 104,
              last_mes: "2026-03-06T08:24:39.001Z"
          }, ...
      ]
  }
  ```

## Operation: `chat.current`
- **Goal:** Determine the single most active chat context for natural language parsing (e.g., "Manda un mensaje al chat actual").
- **Surface:** Resolves via `chat.list_recent`.
- **Arguments:** None.
- **State Change:** None.
- **Expected Success Validation:** Array has `length > 0`.
- **Contract Signature:**
  ```javascript
  // IN: null
  // OUT:
  {
      ok: true,
      is_group: false,
      id: "Director de Juego", // Group ID or Character Avatar
      file_id: "Director de Juego - 2026-03..."
  }
  ```

## Operation: `chat.read_tail`
- **Goal:** Read the last `N` messages of a specific chat.
- **Surface:** `POST /api/chats/get` (Characters) OR `POST /api/chats/group/get` (Groups)
- **Arguments:**
  - `is_group`: boolean
  - `id`: string (Group ID or Character Avatar basename)
  - `file_id`: string (The chat's unique filename handle)
  - `tail`: number (Default 5)
- **State Change:** None (Read-Only)
- **Contract Signature:**
  ```javascript
  // IN: { is_group, id, file_id, tail }
  // OUT:
  {
      ok: true,
      messages: [
          {
              name: "Nova",
              is_user: true,
              mes: "Hello",
              send_date: "2026..."
          }
      ],
      total_items: 104
  }
  ```

## Operation: `chat.inject`
- **Goal:** Non-destructively inject a hidden or simulated message into a chat history.
- **Surface:** 
  1. `POST /api/chats/[get]` to retrieve the full array.
  2. Push the new message logic locally.
  3. `POST /api/chats/[save]` to overwrite the physical chat file.
- **Arguments:**
  - `is_group`: boolean
  - `id`: string
  - `file_id`: string
  - `message`: string (The content to inject)
  - `is_user`: boolean (Default false)
  - `name`: string (The author name)
- **Idempotency Tag:** Will attach `extra: { original_author: "Taverna", antigravity_target: true }` to avoid double-injects.
- **State Change:** Appends 1 item to the end of the chat.
- **Verification:** Re-read using `chat.read_tail` and assert the new item matches content + idempotency tag.
- **Rollback Plan:**
  - Fetch original array and cache it.
  - If injection or verification fails, simply `POST /api/chats/[save]` with the original array to fully restore it.
- **Contract Signature:**
  ```javascript
  // IN: { is_group, id, file_id, message, is_user, name }
  // OUT:
  {
      operation_ok: true,
      operation: "chat.inject",
      observed_before: { items: 103, last_mes: "..." },
      action_taken: "Pushed 1 new item to array",
      observed_after: { items: 104, last_mes: "[Target Content]" },
      verified: true,
      rollback_plan: "Restore full array via /save [103 items]",
      rollback_attempted: false,
      rollback_ok: null,
      error: null
  }
  ```
