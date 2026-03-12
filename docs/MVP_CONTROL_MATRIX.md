# MVP Control Matrix (Phase 3)

This matrix maps the core governance capabilities prioritized for Taverna-v2 (Antigravity), associating each capability with its control surface, implementation mechanism, state observability, verification evidence, and operational risk.

| Capability | Priority | Surface | Mechanism | State | Evidence | Risk |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **Change Inference Provider/Model** | P0 | Global Settings / Presets | `POST /api/settings/save` to update active model. | Cached in `/api/settings/get` | Output of `settings.json` matches target model/API | **High.** Can break text generation if keys or models are misconfigured. |
| **Inject/Modify Lorebook** | P0 | World Info | `POST /api/worldinfo/edit` | Cached via `POST /api/worldinfo/get` | `entries` array contains the injected Antigravity vectors | **Low.** Non-destructive if appended correctly; easy to rollback. |
| **Create/Edit Character** | P1 | Characters | `POST /api/characters/edit` | File system read or `POST /api/characters/get` | Character attributes (e.g., `creator_notes`) contain target injection | **Medium.** Incorrect payload could corrupt the character card JSON. |
| **Audit/Backup Chat History** | P1 | Chats | `POST /api/chats/get` | File system JSONL | JSON payload contains full conversation history | **Low.** Read-only operation. |
| **Inject Chat Message** | P2 | Chats | `POST /api/chats/save` | Read via `POST /api/chats/get` | JSON array contains the synthesized system/user message | **Medium.** Risk of duplicating or truncating history if partial saves occur. |
| **Audit Installed Plugins** | P2 | Plugins | File system probe (`/plugins`) or ST-Orchestrator | Process output | Directory listing / loaded modules | **Low.** Read-only, no REST API modification natively supported. |
| **Snapshot Global State** | P0 | Settings | `POST /api/settings/make-snapshot` | `POST /api/settings/get-snapshots` | Snapshot filename listed chronologically | **Low.** Native functionality; purely additive backup. |
| **Recover Global State** | P0 | Settings | `POST /api/settings/restore-snapshot` | `POST /api/settings/get` | `settings.json` matches prior state | **Medium.** Overwrites current state, but is restoring a verified backup. |

## Next Steps for Execution (Phase 4)
We will begin by building the Orchestration API layer in Taverna-v2 to wrap these mechanisms into modular tools. P0 capabilities (Change Provider, Inject Lorebook, Snapshot State) will be prioritized first.
