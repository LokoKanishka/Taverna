# Role Context Contracts (Phase 11A)

Este contrato define qué datos alimentan el contexto de ejecución para cada rol y cómo se priorizan para evitar ruido y desbordamiento de tokens.

## Matriz de Visibilidad por Rol

| Dato / Rol | Master | Player | Character | Narrator | System |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Chat History** | Full | Recent | Partial | Summary | None |
| **Character Card**| Yes | Yes | Yes | No | No |
| **Lorebook** | Full | Auto | Filtered | Relevant | No |
| **Scene State** | Yes | No | No | Yes | No |
| **System Logs** | Yes | No | No | No | Yes |

## Definiciones de Contrato

### 1. Rol: MASTER (Orquestador Supremo)
- **Contexto:** Visibilidad total del estado de ST y del wrapper.
- **Prioridad:** P0 (Ininterrumpido).
- **Budget:** Ilimitado (dentro de límites de hardware).
- **Exclusiones:** Ninguna.

### 2. Rol: CHARACTER (Identidad en escena)
- **Contexto:** Ficha de personaje + Lorebook propio + Últimos N mensajes.
- **Prioridad:** P1 (Identidad sobre comandos).
- **Budget:** 2000-4000 tokens (Sugerido).
- **Exclusiones:** Datos técnicos de otros personajes, configuraciones globales de ST.

### 3. Rol: NARRATOR (World Building)
- **Contexto:** Snapshot de escena + World Info relevante + Resumen de los últimos 2 turnos.
- **Prioridad:** P2 (Coherencia ambiental).
- **Budget:** 3000 tokens.
- **Exclusiones:** Diálogos internos de personajes (a menos que sean públicos).

## Reglas de Composición (Prompt Engineering Policy)

1. **Prioridad de Inserción:**
   - 1ero: `System Prompt` (Cerrado por Taverna)
   - 2do: `Scene State` (Contexto de la situación)
   - 3ero: `Character Identity`
   - 4to: `Lorebook/Memory`
   - 5to: `Chat History` (Cola corta)

2. **Exclusiones de Seguridad:**
   - Ningún rol (excepto Master/System) puede ver los tokens de validación internos (`antigravity_token`).
   - Los roles no pueden acceder a credenciales de API o configuraciones de red de ST.

3. **Política de Escritura (Memory Persistence):**
   - **Persistent:** Solo puede ser modificado por `characterUpdateFields` o `lorebookUpsert` con verificación P0.
   - **Ephemeral:** El `Scene State` se recalcula en cada ciclo de pensamiento.

## Trazabilidad de Fuentes
Cada salida del orquestador debe venir acompañada de un meta-bloque:
```json
{
  "context_composition": {
    "role": "character",
    "sources": ["char_card:Lucy.png", "chat_tail:5", "lorebook_active:true"],
    "token_budget_usage": "0.35"
  }
}
```
