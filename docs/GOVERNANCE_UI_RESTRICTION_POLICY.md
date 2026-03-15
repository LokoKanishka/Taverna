# Governance Policy — UI Automation Restrictions

## 1. Objective
Ensuring that all conversational and structural mutations in Taverna-v2 are performed through governable, internal channels (APIs, filesystem, or wrapper functions) rather than non-deterministic UI automation (clicks/mouse-based actions).

## 2. Decision: UI Automation Freeze
As of **2026-03-12**, the following policy is enacted:
- **PROHIBITION**: High-risk, destructive, or persistent operations (deletion of characters, chats, groups; history overwrites; sensitive setting changes) MUST NOT use UI automation.
- **RESTRICTION**: The `browser_subagent` or any mouse-based tool is restricted to **READ-ONLY** or **TEMPORARY DEMO** tasks unless explicitly authorized as an exception.
- **INTERNAL GOVERNANCE**: All mutations MUST be implemented using the **Read-Modify-Write (RMW)** pattern via internal APIs or controlled filesystem access.

## 3. Surface Classification Audit

| Operation | Available Channel | Classification | Status |
| :--- | :--- | :--- | :--- |
| **character.delete** | `/api/characters/delete` | INTERNAL_API | Investigated |
| **character.create** | `/api/characters/import` | INTERNAL_API | Available |
| **chat.append_safe** | RMW over `/api/chats/save` | INTERNAL_WRAPPER | **IMPLEMENTED** |
| **chat.delete** | `/api/chats/delete` | INTERNAL_API | Available |
| **group.delete** | `/api/groups/delete` | INTERNAL_API | Available |
| **settings.update** | `/api/settings/save` | INTERNAL_WRAPPER | **IMPLEMENTED** |
| **lorebook.update** | `/api/lorebook/` endpoints | INTERNAL_API | Available |
| **model.change** | `/api/settings/save` | INTERNAL_API | Available |

## 4. Policy Enforcement Mechanism
If an internal path is not yet implemented for a requested operation, the agent MUST:
1. **ABORT** the automated UI fallback.
2. **NOTIFICATION**: Inform the user with the exact error: `“Operation not yet internally governed. UI automation is restricted for destructive actions.”`
3. **PLAN**: Propose a technical ticket to internalize the operation.

## 5. Audit Trace: Character Deletion Incident
- **Event**: `borra todos los personajes` (2026-03-12T01:53)
- **Problem**: API listing was slow/hanging; agent fell back to `browser_subagent` clicks.
- **Remediation**: Use `/api/characters/delete` in the future.
