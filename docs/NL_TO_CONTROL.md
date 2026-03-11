# NLP to Control Translation (Phase 5)

This document charts the Natural Language mapping strategy for Taverna-v2's MVP. The goal is to safely transform messy, ambiguous human intents into strict, verifiable programmatic operations acting against the SillyTavern runtime. 

## Architectural Separation

1. **Parser & Intent Resolver:** Uses keyword/heuristic or LLM parsing to determine exactly *what* is being asked. Resolves to a canonical `IntentType`.
2. **Argument Normalizer:** Extracts entities (like character names, values, lorebook content) and formats them into strict schema requirements.
3. **Dispatcher:** Routes the canonical intent and normalized arguments to `TavernaOperations`.
4. **Structured Output:** Emits a traceable object detailing:
   `{ ok, user_request, resolved_intent, mapped_operation, arguments, observed_before, action_taken, observed_after, verified, error }`

## Supported Intents (Phase 5 MVP)

| Natural Language Example | Canonical Intent | Mapped Operation | Required Arguments |
| :--- | :--- | :--- | :--- |
| "Decime si Taverna está sano" | `sys_health_check` | `health.status` | None |
| "Listame los modelos" | `model_list` | `model.list` | None |
| "Qué modelo está activo" | `model_get_active` | `model.get_active` | None |
| "Cambiá al modelo openai gpt-4" | `model_set_active` | `model.set_active` | `api_server`, `model_id` |
| "Mostrame el personaje Byte.png" | `char_read` | `character.read` | `avatar` |
| "Agregale a Byte este rasgo: feliz" | `char_edit` | `character.update_fields`| `avatar`, `ch_name`, field update |
| "Listame los lorebooks" | `lorebook_list` | `lorebook.list` | None |
| "Creá una entrada de lorebook X con Y" | `lorebook_upsert` | `lorebook.upsert_entry` | `lorebook_name`, `keyword`, `content` |
| "Decime el valor de public_api" | `settings_read` | `settings.read` | `setting_key` |
| "Cambiá public_api a true" | `settings_update` | `settings.update` | `{ "public_api": true }` |

## Ambiguity and Fallbacks

If an intent cannot be parsed with high confidence, or if arguments are missing, the Resolver **must immediately abort and return a controlled failure** requesting clarification rather than guessing and invoking destructive API calls against SillyTavern.
