# Chat Target Hardening

## Problem
In a multi-user or high-activity environment, resolving "the current chat" or a chat by a partial name is error-prone. Ambiguity leads to injecting messages into the wrong context.

## Improved Resolution Strategy
Taverna uses a multi-criteria confidence scoring system for resolving targets.

### Confidence Levels
- **HIGH (1.0)**: Exact match on `file_id` or `avatar_url`.
- **MEDIUM (0.7)**: Case-insensitive partial match on character name where only one candidate exists.
- **LOW (0.3)**: Match on "Recent List" index 0 when no other target is specified.
- **NONE (0.0)**: No matches found or multiple conflicting matches with similar scores.

### Resolution Protocol
1.  **Strict Match**: Attempt to find a target by unique identifier.
2.  **Fuzzy Match**: If strictly matching fails, search `recent_chats` for character names or group names.
3.  **Ambiguity Check**: If multiple candidates are found (e.g., "Nova" matches "Nova" and "Nova 2"), the operation MUST be rejected unless a specific tie-breaker is provided.
4.  **Traceability**: Every resolved target returns its `confidence_score` and `resolution_basis`.

## Rejected States
Operations will fail if:
- Target is ambiguous (multiple matches).
- Target is not found in the last 20 recent chats.
- Confidence score is below **0.5** for destructive or sensitive operations.
