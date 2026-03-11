# Context and Memory Surfaces

This document maps the sources of truth that compose the execution context for roles in Taverna.

## 1. Context Sources Mapping

| Source | Type | Origin | Persistence | Governance |
| :--- | :--- | :--- | :--- | :--- |
| **Immediate Chat** | Fluid | ST Chat JSONL | Persistent (File) | ST Native |
| **Character Data** | Structural | ST Character JSON | Persistent (File) | ST Native |
| **Group Metadata** | Structural | ST Group JSON | Persistent (File) | ST Native |
| **Lorebook (WI)** | Reference | ST World Info | Persistent (JSON) | ST/Taverna |
| **Preset (SAM)** | Technical | ST Settings/Presets | Persistent (JSON) | ST Native |
| **Role Metadata** | Governance | Taverna `scene_governance.json` | Persistent (JSON) | Taverna |
| **Scene State** | Logic | Taverna `scene_governance.json` | Persistent (JSON) | Taverna |
| **Runtime Traces**| Observational| Taverna Internal Logs | Ephemeral | Taverna |

## 2. In-Depth Analysis

### A. Immediate Chat Context
- **Observation**: Read via `chat.read_tail` or direct file access.
- **Update**: Append via `chat.inject` or ST generation.
- **Cost**: Linear increase with chat length (token context).
- **Risk**: Injections might be lost if ST doesn't sync to disk immediately.

### B. Character and Group Data
- **Observation**: Read via `character.read` and `group.read`.
- **Update**: `character.update_fields` and `group.update_members`.
- **Note**: These define the "who" and "where".

### C. Lorebook (World Info)
- **Observation**: Read via `lorebook.read`.
- **Update**: `lorebook.upsert_entry`.
- **Role**: This is the primary "Long-term Memory" bridge for the LLM.

### D. Scene State (Taverna)
- **New Construct**: A key-value store within `scene_governance.json` under `scenes[group_id].state`.
- **Observation**: `scene.state_snapshot`.
- **Update**: `scene.state_update`.
- **Role**: Stores plot points, current time, location, and global variables that don't fit in characters.

### E. Memory Policies
- **Read Policy**: Taverna reads state and WI before building the context.
- **Write Policy**: Only "verified" results can update the persistent Scene State.
