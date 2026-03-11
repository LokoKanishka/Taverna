# Role Execution Contracts

This document defines the technical contracts for executing turns in a scene based on Taverna-governed roles.

## Execution Model

Role execution in Taverna follows an **External Orchestration** pattern:
1. **Context Preparation**: Taverna verifies or sets the correct Model and Preset for the acting role.
2. **Pre-Injection**: (Optional) Taverna injects system instructions or world info relevant to the role.
3. **Trigger**: Taverna sends a `generate` command via the UI Orchestrator Bridge.
4. **Acquisition**: SillyTavern generates the message.
5. **Verification**: Taverna reads the chat tail to confirm a new message from the expected character exists.
6. **Trace**: Every step is logged with `observed_before`, `action_taken`, and `observed_after`.

## Role Policies

### 1. `master` (Dungeon Master / Narrator)
- **Objective**: Orchestrate the world, NPC reactions, and environmental changes.
- **Inference Policy**: High-intelligence model (e.g., Claude 3.5 Sonnet, GPT-4o).
- **Execution Trigger**: `/gen` or `/as <narrator_character>`.
- **Instruction Mode**: Pre-injected `(System: [Instructions])` or hidden prompt.

### 2. `player` / `character`
- **Objective**: Standard interaction.
- **Inference Policy**: Role-specific model or global default.
- **Execution Trigger**: `/gen` or `/continue` if the last message was a user message.

### 3. `system`
- **Objective**: Automated state management, lorebook updates, or "inner thoughts" narration.
- **Inference Policy**: Fast, low-latency model.
- **Execution Trigger**: `chat.inject` (No inference usually, or specialized summary inference).

## Bridge Commands

Taverna uses the `ST-Orchestrator` bridge to send Slash Commands to the SillyTavern UI:

| Action | Command | Basis |
| :--- | :--- | :--- |
| **Simple Gen** | `/gen` | Request ST to generate next turn |
| **Specific Char** | `/as <name>` | Force generation as specific member |
| **Continue** | `/continue` | Continue the last incomplete message |
| **Stop** | `/stop` | Force stop current generation |

## Verification Contract

`role.execute_turn` must return:
- `ok`: Boolean (was the command enqueued successfully)
- `execution_id`: Tracking ID
- `character_name`: Who executed the turn
- `model_used`: Effective model confirmed during verification
- `preset_used`: Effective preset confirmed during verification
- `trace`: Array of sub-operations (setting model, sending bridge command, etc.)
- `verified`: Boolean (did a new message appear in chat within timeout)
