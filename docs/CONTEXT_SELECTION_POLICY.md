# Context Selection and Exclusion Policy (Phase 11B.5)

This document defines the strict governance rules for the `contextComposer` when selecting, prioritizing, and excluding data sources for prompt generation.

## 1. Source Hierarchy and Priority

| Priority | Source Type | Inclusion Condition | Exclusion Condition | Default Policy |
| :--- | :--- | :--- | :--- | :--- |
| 10 | **Role Metadata** | Always | Never | Mandatory for all roles |
| 9 | **Scene State** | Active Group context | No active group | Included if Group ID exists |
| 8 | **Character Data** | Role is 'character' | Role is 'master' or 'system' | Direct injection for character role |
| 7 | **Chat Tail** | Non-empty chat | Empty chat | Included up to Budget |
| 6 | **Lorebook (WI)** | Keywords extracted | No keywords / Irrelevant | Selective injection |
| 5 | **Presets** | Global context | Scene-specific override | Default ST settings |

## 2. Budget and Truncation Policies

### Role-Based Token Budgets (Reference)
- **Master:** 8192 tokens (maximum context visibility)
- **Player:** 4096 tokens (restricted to immediate scene)
- **Character:** 4096 tokens (internal state + scene)
- **Narrator:** 6144 tokens (scene + lore)

### Truncation Strategy
1. **Chat Tail:** Most recent turns preserved. Older turns dropped first.
2. **Lorebook:** Sorted by priority. Lowest priority entries dropped if over budget.
3. **Character Description:** Compacted (removing fields like 'scenario' or 'example chats') before excluding main description.

## 3. Conflict Resolution Rules

- **Lorebook vs State Snapshot:** State Snapshot (Dynamic) > Lorebook (Static). If Lorebook says "Door is locked" but State Snapshot says "Door is open", the State Snapshot version prevails.
- **Character Description vs Role Metadata:** Role Metadata (Runtime Policy) > Character Card. The runtime policy (e.g., specific model or system prompt) overrides character-specific instructions if they conflict.
- **Scene State Redundancy:** If the group mission is already in the Chat Tail, it is compressed in the Scene State block to avoid token waste.

## 4. Exclusion Reasons
- `ROLE_RESTRICTION`: The role is not authorized to see this data.
- `BUDGET_EXHAUSTED`: Source was discarded to fit within token limits.
- `REDUNDANCY`: Data already present in a higher-priority source.
- `MISSING_DEPENDENCY`: Necessary metadata (e.g., character ID) not found.
- `IRRELEVANCE`: Source does not match the current context keywords/state.
