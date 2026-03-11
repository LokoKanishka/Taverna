# Chat Surfaces in SillyTavern

This document maps out how conversational surfaces are actively represented in the SillyTavern backend, based on live API probing during Phase 8A.

## 1. Finding Chats (`chat.list_recent`)
- **Surface:** Backed by files in `/data/[user]/chats/` and `/data/[user]/group chats/`.
- **Source of Truth:** The file system timestamps (mtime).
- **Observation Method:** `POST /api/chats/recent` with body `{}`.
  - Returns an array of chat metadata objects sorted by most recent activity.
  - **1-on-1 Chat format:** `{ file_id, file_name, file_size, chat_items, mes (last message), last_mes (ISO date), avatar }`
  - **Group Chat format:** `{ file_id, file_name, file_size, chat_items, mes, last_mes, group }`

## 2. Defining "Current Chat" (`chat.current`)
- **Important Finding:** There is NO global backend state for the "currently opened chat in the UI". `settings.json` natively tracks `active_character`, but not the specific chat file actively opened by the browser client.
- **Resolution Strategy:** The closest backend mapping to "current chat" is taking the `[0]` index of the array returned by `POST /api/chats/recent`. This guarantees we are interacting with the chat that had the absolute most recent activity across all groups and characters.
- **Risk:** High confidence for continuity, but if a user opens a different old chat without sending a message, the backend does not know.

## 3. Reading Chat Messages (`chat.read_tail`)
- **Surface:** `POST /api/chats/get` (1-on-1) or `POST /api/chats/group/get` (Group).
- **Observation Method:** 
  - 1-on-1: Requires `{ character_name: "[avatar]", file_name: "[file_name]" }`. Note: The ST endpoint expects `avatar_url` or `character_name` depending on the route, but strictly expects the `file_name` without the `.jsonl` extension.
  - Returns an array of message objects: `{ name, is_user, mes, send_date, extra }`.
- **Verification:** Easy to assert length (`chat_items`) and tail content.

## 4. Injecting Chat Messages (`chat.inject`)
- **Surface:** `POST /api/chats/save` (1-on-1) or `POST /api/chats/group/save` (Group).
- **Mutation Method:** The ST API does not support "append" endpoints natively. To inject, we must first fetch the full message array via `/chats/get`, push our new message object into it, and POST the entire array back to `/chats/save` via `{ avatar_url: "[avatar]", file_name: "[file_name]", chat: [array] }`.
- **Idempotency Strategy:** We will inject a hidden marker in the message's `extra` block, e.g., `extra: { antigravity_token: "xxx" }`. Before injecting, we check if the array already contains a message with this exact token/content.
- **Rollback / Irreversibility:** 
  - *Governable.* Because we fetch the array first, rollback simply entails caching the array `observed_before` and `POST`ing it back to `/chats/save` if verification or user rollback commands are triggered.
  - It is fully reversible via API without UI mismatch (though users might see the message flash on screen if they have ST open).

## Summary Status
- **chat.list_recent:** Fully Governable.
- **chat.current:** Partially Governable via fallback to most recent.
- **chat.read:** Fully Governable.
- **chat.inject:** Fully Governable via array rewrite.
