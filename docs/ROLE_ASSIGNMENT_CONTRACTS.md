# Role Assignment Contracts

This document defines the technical contract for functional roles within the Taverna Governance Layer. These roles are virtual and managed by Taverna to orchestrate the SillyTavern experience.

## Functional Roles Definition

| Role | Purpose | Default Policy |
| :--- | :--- | :--- |
| **master** | The Primary Narrator/DM. Controls world state. | High-instruct model (e.g. GPT-4, Claude). |
| **player** | The User's POV character model. | Creative/Persona-aligned model. |
| **character** | Standard NPC/Side-character. | Task-specific model or shared pool. |
| **narrator** | Purely descriptive/atmospheric entity. | Prose-optimized model. |
| **system** | Logic, Tool use, and Internal Checks. | Fast, reliable instruct model. |

## Assignment Schema

Taverna persists these assignments in `config/scene_governance.json`.

```json
{
  "scenes": {
    "group_id_123": {
      "roles": {
        "master": {
          "model_id": "gpt-4o",
          "api_server": "openai",
          "preset": "Default"
        },
        "character:Nova.png": {
          "model_id": "claude-3-sonnet",
          "api_server": "anthropic",
          "preset": "Cohesive"
        }
      }
    }
  },
  "global_defaults": {
    "system": {
      "model_id": "llama-3-8b",
      "api_server": "ollama",
      "preset": "Short"
    }
  }
}
```

## Operation Contracts

### role.assign_model
- **Arguments**: `role_id`, `model_id`, `api_server`, `group_id` (optional).
- **Behavior**: Updates the local Taverna governance map.
- **Verification**: Internal read-back of the config.

### role.assign_preset
- **Arguments**: `role_id`, `preset_name`, `group_id` (optional).
- **Behavior**: Maps a SillyTavern preset to the virtual role.
- **Verification**: Internal read-back.

### role.verify_assignment
- **Behavior**: Re-reads the current scene context and confirms that the desired Role Policy is active in Taverna's memory.

## Resolution Logic
1. If a `group_id` is provided, Taverna looks for specific overrides in `scenes[group_id].roles`.
2. If not found, it falls back to `global_defaults`.
3. If still not found, it uses the current "Active Model" from SillyTavern's global state.

## Risks
- **Desync**: If SillyTavern's global model is changed manually by the user, Taverna's virtual role assignment might be ignored unless Taverna explicitly enforces it before each generation.
- **Verification Gap**: Role assignments are purely metadata in Taverna; we cannot "verify" them in ST's backend because ST doesn't know what a "Master" role is. We verify against our own persistence.
