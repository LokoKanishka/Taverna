# FINAL DESTRUCTIVE OPERATIONS GOVERNANCE

This document specifies the finalized contracts for destructive and persistent mutations in Taverna-v2.

## Mandatory Safety Protocol: "Puppeteer Control"

1. **Zero UI Dependency**: All mutations MUST be performed via Internal API or Filesystem. Mouse/Click automation is strictly forbidden for state mutations.
2. **Preview-Confirm Pattern**:
   - Every destructive operation defaults to `dry_run: true`.
   - Operations return a detailed `Preview` including target resolution and observed state.
   - Execution requires explicit `confirm: true`.

## Governed Operations

### Character Deletion (`character.delete_bulk`)
- **Scope**: Multi-character deletion with associated chat cleanup.
- **Verification**: Post-delete list verification.
- **Guardrail**: Aborts on ambiguous "delete all" requests.

### Group Deletion (`group.delete`)
- **Scope**: Single group deletion by ID.
- **Verification**: Post-delete list verification.

### Chat Deletion (`chat.delete`)
- **Scope**: Individual chat file deletion by avatar/filename.
- **Note**: Currently verified by API success response.

### Lorebook Mutation (`lorebook.update` & `lorebook.upsert`)
- **Scope**: Full book replacement or granular entry upsert.
- **Rollback**: Previous state captured before mutation.

## Enforcement Mechanism
The `TavernaOperations` wrapper prevents any fallback to UI by throwing or returning explicit `operation_ok: false` if an internal channel is unavailable.
