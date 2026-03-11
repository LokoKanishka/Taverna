# Real Chat Governance Demos

This document synthesizes the results of the `demo_chat_governance.js` script, fulfilling Phase 8C and 8D of the Taverna Total Control Initiative.
It proves that the NLP parser and operational backend successfully and honestly govern conversational surfaces in SillyTavern without manipulating the UI.

## Mandated Scenarios Validated

### 1. List Recent Chats
- **Input:** `"listame los chats recientes"`
- **Result:** Read the `/api/chats/recent` endpoint successfully.
- **Output:** Array of chronologically sorted chat files containing both groups and 1-on-1 characters.

### 2. Resolve "Current" Candidate
- **Input:** `"mostrame el chat actual"`
- **Result:** Accurately parsed the `target: 'current'` intent.
- **Honesty Contract:** 
  - `TARGET_CONFIDENCE`: **medium**
  - `RESOLUTION_BASIS`: "Chronological fallback (index 0). ST lacks true global UI active state tracking."
- **Output:** Correctly identified the latest active chat (`1772677610950`).

### 3. Read Last N Messages
- **Input:** `"leé los últimos 2 mensajes del chat actual"`
- **Result:** Chained the target resolution into a tail read operation (`chat.read_tail`).
- **Honesty Contract:** Inherited the `TARGET_CONFIDENCE: medium` gracefully from the resolution step.
- **Output:** Returned the message count and content string successfully without downloading the entire history to memory.

### 4. Inject Message Explicitly
- **Input:** `"inyectá este mensaje en el chat actual..."`
- **Result:** Retrieved chat history, appended message with `extra.antigravity_token` idempotency hash, and saved back.
- **Output:** Action executed. `ROLLBACK_SUPPORTED` explicitly mapped to `true`.

### 5. Verify Injection
- **Result:** Manual read of the tail message correctly verified that the `ag_inj_*` token was present in the `.extra` metadata of the message item. 

### 6. Ambiguous/Unresolvable Rejection
- **Input:** `"mostrame el chat de UnPersonajeQueNoExiste"`
- **Result:** Rejected the command instead of falling back blindly.
- **Honesty Contract:**
  - `TARGET`: UnPersonajeQueNoExiste
  - `TARGET_CONFIDENCE`: **none**
  - `RESOLUTION_BASIS`: "No matches found in recent chats"
- **Output:** Returns explicit execution `[ERROR] => Target resolution failed`.

### 7. Idempotency and Duplication Detection
- **Input:** Re-running `"inyectá este mensaje en el chat actual..."` with the exact same payload.
- **Result:** Succeeded without mutating the file.
- **Output:** 
  - `[ACTION] => Aborted injection (idempotent duplicate detected)`
  - `[DUPLICATION_DETECTED] => true` 

## Conclusion
The conversional orchestration layer successfully operates within strict, honest contracts. It gracefully handles the lack of a true "currently active UI tab" backend variable by relying on chronological sorting while explicitly warning about its medium-level confidence basis. Idempotency guarantees that agents can re-run message injections safely during retries. Rollback for these manipulations is native and robust.
