# PROJECT TRUTH MATRIX

This matrix resolves the contradictions between documentation, codebase, branches, and the official base (`main`).

| Surface | Real State | Details |
| :--- | :--- | :--- |
| **character.delete_bulk** | IMPLEMENTED | Added in operations.js (L1646). Not in `main` yet. |
| **group.delete** | IMPLEMENTED | Added in operations.js (L1799). Not in `main` yet. |
| **chat.delete** | IMPLEMENTED | Added in operations.js (L1857). Not in `main` yet. |
| **lorebook.update** | IMPLEMENTED | Added in operations.js (L1896). Not in `main` yet. |
| **chat governance** | IMPLEMENTED | Includes `chatResolveTarget`, safe append, and idempotency logic. |
| **zero-ui enforcement** | DOCUMENTED | `ZERO_UI_ENFORCEMENT.md` is correct and aligns with code. |
| **character.create/import** | UNSUPPORTED_NO_UI_FALLBACK | Wrapper hangs during multipart fetch. Cannot be closed cleanly without risking Node.js streaming issues. UI fallback is strictly forbidden. |

## Branch Status
All these implementations exist in `feat/vertical-slice-01` but missing from the official base (`main`). Phase 6 will rectify this gap.
