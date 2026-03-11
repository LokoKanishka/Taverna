# Context, Memory and State Surfaces (Mapping)

Este documento mapeia as fontes de dados e superfícies de controle para a governança de contexto e estado no Taverna-v2 sobre SillyTavern.

## Áreas de Dados

| Superfície | Fonte de Verdade (ST) | Observação (Wrapper) | Atualização | Persistência | Risco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chat Context** | `/api/chats/get` | `chatReadTail` | `/api/chats/save` | Persistente (JSONL) | Médio (Corrida/Token limit) |
| **Character Data** | `/api/characters/all` | `characterRead` | `/api/characters/edit` | Persistente (JSON) | Alto (Payload size/OOM) |
| **Group/Scene** | `/api/groups/all` | `groupRead` | `/api/groups/edit` | Persistente (JSON) | Baixo |
| **Lorebook/WI** | `/api/worldinfo/get` | `lorebookRead` | `/api/worldinfo/edit` | Persistente (JSON) | Médio (Injeção/Busca) |
| **Presets** | `/api/settings/get` | `settingsRead` | `/api/settings/save` | Persistente (Settings) | Alto (Global impact) |
| **Role Metadata**| `scene_governance.json`| `_loadGovernance` | `_saveGovernance` | Persistente (Local) | Baixo |
| **Scene State** | Derived Snapshot | `sceneSnapshot` | N/A (Efímero) | Efímero / Derivado | Baixo |

## Detalhes de Superfície

### 1. Chat Context (Immediate Memory)
- **Definição:** A sequência literal de mensagens enviadas.
- **Governança:** Taverna injeta tokens de idempotência (`antigravity_token`).
- **Composição:** Composto por mensagens de usuário, sistema e personagens.

### 2. Character Data (Identity Memory)
- **Definição:** Atributos estáticos e dinâmicos (description, personality).
- **Governança:** Bloqueio de campos específicos durante a execução de cena.
- **Risco:** O orquestrador deve evitar sobrecarregar o buffer durante edições simultâneas.

### 3. Lorebook/World Info (Relational Memory)
- **Definição:** Chaves ativadas por contexto que trazem dados externos.
- **Governança:** Taverna pode "forçar" a ativação ou desativação de chaves baseadas no papel (Role).

### 4. Scene Snapshot (Operational State)
- **Definição:** Uma agregação em tempo real (Timestamp + Group Members + Role Policy).
- **Uso:** Serve como base para a verificação de "drift" (desvio de estado) entre o que o orquestrador espera e o que o ST reflete.

## Trazabilidade (Turn Tracking)
Cada turno deve registrar:
1. `source_context`: Qual parte do chat foi lida.
2. `active_role`: Qual papel está executando.
3. `applied_policy`: Qual API/Modelo/Preset foi usado.
4. `governance_token`: ID de transação para rastreio.
