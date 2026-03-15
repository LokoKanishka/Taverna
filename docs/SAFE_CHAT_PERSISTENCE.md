# Safe Chat Persistence Protocol

## Overview
SillyTavern's `/api/chats/save` (and group equivalent) follows an **overwrite** pattern. Sending a partial chat array results in the immediate loss of all other messages in that history.

To ensure zero data loss, Taverna implements a strict **Read-Modify-Write (RMW)** pattern for all conversational mutations.

## RMW Sequence
All "safe" append operations must follow this sequence:

1.  **READ**: Fetch the complete current history from the server.
2.  **VALIDATE (Optional)**: If implementing high-concurrency guards, verify the 'before' state matches expectations (e.g., message count).
3.  **MODIFY**: Append the new message(s) to the local array.
4.  **WRITE**: Send the **full** merged array back to the server.
5.  **VERIFY**: Re-fetch or verify via server response that the new message is present and the history length is correct (Before + N).

## Error Handling & Rollback
- If **READ** fails: Abort operation.
- If **WRITE** fails: Log error and notify governance layer; since we didn't overwrite yet, the server state remains intact.
- If **VERIFY** fails: If the write was partially successful or corrupted the file, a rollback to the state captured in step 1 must be attempted.

## Safety Guardrails
- **Max History Size**: To prevent OOM (Out of Memory) on extremely long chats (>10k messages), Taverna should implementation pagination or local caching if necessary (Future Phase).
- **Idempotency**: Every injected message MUST carry an `antigravity_token` in its `extra` metadata to prevent duplication on retries.
