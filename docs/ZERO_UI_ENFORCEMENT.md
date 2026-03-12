# ZERO-UI ENFORCEMENT POLICY

This document formalizes the "Puppeteer Control" standard for Taverna-v2, ensuring total internal governance over SillyTavern and prohibiting reliance on non-deterministic UI automation for sensitive state mutations.

## 1. Prohibited UI Operations
The following operations are **STRICTLY PROHIBITED** from using UI automation (e.g., mouse clicks, `browser_subagent` interactions, frontend DOM manipulation) for execution:

- **Deletions**: Characters, Groups, Chats, Lorebooks.
- **Persistence Mutations**: lorebook updates, chat history appends/injections, global settings changes.
- **Target Resolution**: Selecting characters or groups via UI elements.

## 2. Governed Internal Channels
Every sensitive operation must use an authorized internal channel:

| Operation Category | Internal Channel | Guardrail |
| :--- | :--- | :--- |
| **Destructive** | `/api/.../delete` | Preview-Confirm Pattern |
| **Persistence** | `/api/.../save` or `/api/.../edit` | Read-Modify-Write (RMW) + Idempotency |
| **Targeting** | `chats/recent` + Name Resolution | Confidence-based abort on ambiguity |

## 3. Failure Protocol
If an internal channel is unavailable or returns an error, Taverna **MUST NOT** fall back to UI automation. The operation must:
1. **Abort immediately**.
2. Return `verified: false`.
3. Log the error as `CHANNEL_UNAVAILABLE` or `INTERNAL_API_FAILURE`.
4. Propose an automated or manual retry via API, never a "manual click fix" by the agent.

## 4. browser_subagent Restriction
The `browser_subagent` and any similar UI-based tool are restricted to:
- **Read-Only Observation**: Verifying visual state for debugging report generation.
- **Diagnostics**: Checking if the frontend extension is loaded.
- **Prohibitted**: Mutating any internal state.

## 5. Audit Trace
All operations in `TavernaOperations` are designed to throw or return structured failure results rather than invoking UI tools. Any code path attempting to bridge between `TavernaOperations` and `browser_subagent` for mutations is considered a **CRITICAL GOVERNANCE VIOLATION**.
