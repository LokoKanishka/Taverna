# Role Context Contracts

This document defines how context is assembled for each role during execution.

## 1. Context Assembly Priorities

| Role | Priority 1 | Priority 2 | Priority 3 | Exclusions |
| :--- | :--- | :--- | :--- | :--- |
| **master** | Scene State | Lorebook (Global) | Last 50 messages | Character quirks |
| **character**| Char Personality| Scene State | Last 30 messages | Other char profiles|
| **player** | Chat History | Scene State | - | Hidden system info |
| **narrator** | Scene State | High-level Lore | Last 10 messages | Internal NPC logic|
| **system** | Metadata | Error Logs | - | Everything else |

## 2. Assembly Rules

### Context Budget
- Fixed at **8192 tokens** (target) for general roles.
- **master** has priority for Scene State and high-level plot.
- **character** has priority for Personality and Scenario.

### Compaction Rules
1. **Chat Pruning**: If budget exceeded, remove middle messages, keep 5 oldest and 20 newest.
2. **Lore Pruning**: If multiple lore entries trigger, keep top 5 based on priority value.
3. **State Flattening**: All key-value pairs in `Scene State` are injected as a summary block.

## 3. Memory Writing Policies

| Role | Writing Capacity | Target | Verification |
| :--- | :--- | :--- | :--- |
| **master** | High | Scene State | Mandatory `state_diff` |
| **character**| Low | Lorebook (Personal)| - |
| **system** | Full | Metadata / States | Strict |

## 4. Verification Contract (`context.verify_inputs`)
Before execution, Taverna must verify:
- Presence of mandatory character JSON.
- Accessibility of `scene_governance.json`.
- Recent chat tail availability.
- Fingerprint generation for the compiled context.
