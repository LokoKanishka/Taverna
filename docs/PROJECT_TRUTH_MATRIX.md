# PROJECT TRUTH MATRIX

This matrix resolves the contradictions between documentation, codebase, branches, and the official base (`main`).

| Surface | Real State | Details |
| :--- | :--- | :--- |
| **character.delete_bulk** | IMPLEMENTED | Added in operations.js (L1646). Merged into `main`. |
| **group.delete** | IMPLEMENTED | Added in operations.js (L1799). Merged into `main`. |
| **chat.delete** | IMPLEMENTED | Added in operations.js (L1857). Merged into `main`. |
| **lorebook.update** | IMPLEMENTED | Added in operations.js (L1896). Merged into `main`. |
| **chat governance** | IMPLEMENTED | Includes `chatResolveTarget`, safe append, and idempotency logic. |
| **zero-ui enforcement** | DOCUMENTED | `ZERO_UI_ENFORCEMENT.md` is correct and aligns with code. |
| **character.create/import** | UNSUPPORTED_NO_UI_FALLBACK | Wrapper hangs during multipart fetch. Cannot be closed cleanly without risking Node.js streaming issues. UI fallback is strictly forbidden. |

## Branch Status
All these implementations have been unified into the official base (`main`). The closure process is complete.
