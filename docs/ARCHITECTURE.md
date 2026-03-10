# Taverna-v2 Architecture

Minimal and maintainable orchestration bridge.

## Core Components

### 1. Orchestrator Backend (`orchestrator/backend`)
- **Type:** SillyTavern Server Plugin (TypeScript/Node.js).
- **Responsibility:** Exposar endpoints HTTP para recibir comandos externos y gestionarlos en una cola de memoria.
- **Key File:** `index.ts`.

### 2. Orchestrator Frontend (`orchestrator/frontend`)
- **Type:** Browser Extension (Vanilla JS).
- **Responsibility:** Realizar polling al backend, retirar comandos y ejecutarlos en el runtime de SillyTavern mediante `executeSlashCommands`.
- **Key File:** `index.js`.

### 3. Bridge Interface
- **Type:** HTTP/JSON Contract.
- **Use Case:** Antigravity o agentes externos envían `POST /execute` con comandos STscript.

## Communication Flow

1. **Agente Externo** -> `POST /execute` (Comando STscript).
2. **Backend Plugin** -> Guarda en `commandQueue`.
3. **Frontend Extension** -> `GET /poll` (cada 1s).
4. **Backend Plugin** -> Entrega comandos y limpia cola.
5. **Frontend Extension** -> `executeSlashCommands(cmd)`.
6. **SillyTavern** -> Realiza la acción (e.g., cambia modelo, inyecta RAG).

## Installation Diagram

```text
Taverna-v2/
├── orchestrator/backend  --> SillyTavern/plugins/ST-Orchestrator
└── orchestrator/frontend --> SillyTavern/data/default-user/extensions/ST-Orchestrator
```
