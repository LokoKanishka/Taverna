# Persistent Memory Contracts (Phase 11C)

This document defines the formal rules for persistent memory operations in Taverna-v2, ensuring strict separation from immediate context and scene state.

## 1. Conceptual Boundaries

| Layer | Type | Persistence | Purpose |
| :--- | :--- | :--- | :--- |
| **Immediate Context** | Ephemeral | Volatile (Current turn) | LLM context Window |
| **Scene State** | Semi-Persistent | Persistent (Scene scope) | Current situation (Door locked, etc) |
| **Lorebook (WI)** | Persistent | Permanent (World scope) | Static facts about the world |
| **Persistent Memory** | **Persistent** | **Incremental/Long-term** | **Narrative memory, character growth, relationships** |

## 2. Memory Operations Schema

Every memory operation returns a structured result with the following fields:

- `ok`: boolean
- `operation`: string (`memory.read`, `memory.write`, `memory.snapshot`)
- `scope`: `scene`, `role`, or `character`
- `memory_key`: Unique identifier for the memory block
- `observed_before`: State of memory before the operation
- `action_taken`: Description of the atomic change
- `observed_after`: State of memory after the operation
- `verified`: boolean (confirmed write)
- `rollback_supported`: boolean
- `error`: string (if any)

## 3. Scopes and Policies

### Scopes
- **Scene Memory:** Shared records of past events in a specific group.
- **Role Memory:** Private memory for the Orchestrator/Master about a specific role.
- **Character Memory:** Persistent traits or "inner monologue" for a specific avatar.

### Read/Write Policies
- **Read:** Selective retrieval based on scope and role visibility.
- **Write:** Atomic updates to specific keys. No automatic "memory of everything".
- **Verification:** Post-write read check to ensure persistence.

## 4. Conflict Resolution
- **Memory vs State:** State (Scene State) always overrides Memory if there is a direct conflict regarding the *present* (e.g., Memory says "I am in the forest" but State says "I am in the lab").
- **Memory vs Lorebook:** Memory (Narrative) overrides Lorebook (Static) for specific instances (e.g., Lorebook says "Goblins are evil" but Memory says "This goblin is my friend").

## 5. Persistence Mechanism (Taverna MVP)
For the current phase, persistent memory is stored in `config/persistent_memory.json` to allow easy inspection and auditability without external database complexity.
