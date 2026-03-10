# ST-Orchestrator Protocol Specification

Functional specification of the bridge protocol between external agents and SillyTavern.

## 1. Backend Endpoints (Server Plugin)

The backend is mounted under `/api/plugins/st-orchestrator/`.

### `POST /probe`
- **Purpose:** Verifies the plugin is alive and reachable.
- **Payload:** None (or empty JSON).
- **Response:** `{ "status": "ok", "plugin": "st-orchestrator" }`

### `POST /execute`
- **Purpose:** Receives external commands and adds them to the internal queue.
- **Payload:** `{ "command": "string" }`
- **Lógica:** Push to `commandQueue`.

### `GET /poll`
- **Purpose:** Delivers the current queue to the client extension and clears it.
- **Payload:** None.
- **Response:** `Array<Object>` (e.g., `[ { "command": "/echo test" } ]`)
- **Lógica:** Atomic get-and-clear of `commandQueue`.

## 2. Client-Backend Handshake (Polling Flow)

### Client Side (Frontend Extension)
- **Mechanism:** `setInterval` every 1000ms.
- **Fetching:** Calls `GET /api/plugins/st-orchestrator/poll`.
- **Execution:** Iterates over the received array and calls SillyTavern's internal `executeSlashCommands(cmd.command)`.

## 3. Queue Management
- **In-Memory:** The `commandQueue` is a simple JavaScript array in the backend's memory.
- **Persistence:** None. The queue is lost if the server restarts.
- **Concurrency:** FIFO (First-In, First-Out).

## 4. Key Functions
- `executeSlashCommands`: The primary entry point into SillyTavern's command system.

---
*Extracted from live code on 2026-03-09.*
