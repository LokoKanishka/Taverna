# CHAT GOVERNANCE & TARGETING CONTRACT

This document defines how Taverna-v2 resolves conversational targets and ensures message integrity.

## 1. Target Resolution Semantics

All chat operations accept a `target_name_or_group`.

### Key: `current`
When "current" is requested, Taverna follows a prioritized resolution path:
1. **Signal: Active Group**: If `active_group` is set in SillyTavern settings, it resolved with **1.0 confidence**.
2. **Signal: Active Character**: If `active_character` is set, it resolves with **1.0 confidence**.
3. **Fallback: Most Recent**: If no active signal is found, it uses the top of the `/api/chats/recent` list with **0.5 confidence**.

### Conflict Resolution
- **Unique Match**: If a name fragment matches exactly one character or group, confidence is **0.9**.
- **Ambiguity**: If multiple matches are found, the operation **ABORTS** with a list of candidates. Taverna never "guesses" between similar names.

## 2. Integrity Guarantee: Safe RMW

All message appends use the **Read-Modify-Write (RMW)** pattern with **Idempotency Tokens**.

- **Cycle**:
  1. Read full history.
  2. Generate unique `antigravity_token` based on content.
  3. Verify token doesn't already exist (idempotency).
  4. Write back full history.
  5. Verify post-write integrity (token presence and length check).
- **Rollback**: If verification fails, Taverna attempts to restore the `observed_before` history.

## 3. Auditable Traces
Every chat operation returns a structured result including:
- `target_confidence`
- `resolution_basis`
- `duplication_detected`
- `verified` (Boolean)
