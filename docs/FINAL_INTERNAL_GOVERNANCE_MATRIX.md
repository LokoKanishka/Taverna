# FINAL INTERNAL GOVERNANCE MATRIX

This document tracks the internalization status of every SillyTavern surface used by Taverna.

| Surface | Operation | Method | Internalized | UI Fallback Allowed | Notes |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **System** | health.status | API (`/probe`) | [x] | [ ] | ST-Orchestrator plugin probe. |
| **System** | runtime.status | API (`/state`) | [x] | [ ] | ST-Orchestrator plugin state. |
| **Settings** | settings.read | API (`/api/settings/get`) | [x] | [ ] | |
| **Settings** | settings.update | API (`/api/settings/save`) | [x] | [ ] | Includes RMW loop & validation. |
| **Model** | model.get_active | API (Settings) | [x] | [ ] | Derived from settings. |
| **Model** | model.set_active | API (Settings) | [x] | [ ] | Updates `api_server_default` and `temp_...`. |
| **Character** | character.read | API (`/api/characters/all`) | [x] | [ ] | |
| **Character** | character.create | API (`/api/characters/import`) | [ ] | [x] | Complex multipart. Out of scope for now. |
| **Character** | character.update | API (`/api/characters/edit`) | [x] | [ ] | Field-level updates. |
| **Character** | character.delete | API (`/api/characters/delete`) | [x] | [ ] | `character.delete_bulk` implemented. |
| **Chat** | chat.resolve | API (Recent/Settings) | [x] | [ ] | `chatResolveTarget` handles "current". |
| **Chat** | chat.append | API (`/api/chats/save`) | [x] | [ ] | Safe RMW append with integrity check. |
| **Chat** | chat.delete | API (`/api/chats/delete`) | [ ] | [ ] | **GAP: Missing implementation.** |
| **Group** | group.list | API (`/api/groups/all`) | [x] | [ ] | Implemented. |
| **Group** | group.delete | API (`/api/groups/delete`) | [ ] | [ ] | **GAP: Missing implementation.** |
| **Lorebook** | lorebook.list | API (`/api/worldinfo/list`) | [x] | [ ] | Implemented. |
| **Lorebook** | lorebook.update | API (`/api/worldinfo/edit`) | [ ] | [ ] | **GAP: Missing full update implementation.** |
| **Memory** | memory.write | Filesystem | [x] | [ ] | Persistent memory governance. |
| **Memory** | memory.read | Filesystem | [x] | [ ] | Persistent memory governance. |
| **Context** | context.build | Logic | [x] | [ ] | Role-based context compilation. |

## UI Automation Freeze
As of this audit, any operation marked "Internalized" or "Proposed" is strictly FORBIDDEN from using browser-level clicks.
In the next step, we will implement the "GAP" operations.
