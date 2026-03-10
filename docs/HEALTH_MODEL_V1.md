# Health Model V1 - Taverna

Este documento define el modelo mínimo de salud del sistema, necesario para asegurar que Taverna-v2 puede operar de forma predecible sobre SillyTavern.

## Componentes Evaluados

El Health Model mide el estado de 6 componentes estructurales:

1. **Backend Reachable**: ¿El plugin `ST-Orchestrator` responde a peticiones HTTP?
2. **Frontend Extension Loaded**: ¿El código del cliente en SillyTavern está cargado y ejecutándose?
3. **Poll Loop Healthy**: ¿La extensión está solicitando comandos periódicamente?
4. **Command Queue Healthy**: ¿La cola de comandos está operando y no está atascada (depth)?
5. **Runtime Available**: ¿SillyTavern está encendido y accesible?
6. **UI Actionable**: ¿El DOM de SillyTavern está listo para recibir comandos?

## Estados Permitidos

El sistema puede reportar los siguientes estados globales y por componente:

- **`ok`**: El componente está respondiendo dentro de los parámetros esperados.
- **`degraded`**: El componente responde pero con latencia, o hay comandos atascados en la cola.
- **`broken`**: El componente no responde o ha excedido los timeouts críticos.
- **`unknown`**: No hay datos suficientes para determinar el estado (ej: backend apagado).

## Criterios de Evaluación

### 1. Probe & Queue (Backend)
- **Vía de verificación**: `GET /api/plugins/st-orchestrator/probe`
- **Valores**: 
  - `status: "ok"` -> Backend Reachable: `ok` (Runtime Available: `ok`).
  - `queue_depth: N` -> Si `N < 5`: `ok`. Si `N >= 5`: `degraded`.

### 2. Poll & Frontend (Client)
- **Axioma**: La extensión cliente hace `GET /poll` cada 1000ms.
- **Métrica**: `last_poll_time` registrado en el backend.
- **Valores**: 
  - `Date.now() - last_poll_time < 5000ms` -> Poll Loop: `ok`, Frontend Loaded: `ok`.
  - `Date.now() - last_poll_time >= 5000ms` -> Poll Loop: `broken`.

### 3. UI Actionable
- **Mecanismo**: El cliente solo inicia el `start()` del poll loop si `document.readyState === 'complete'`. Por tanto, un Poll Loop Healthy implica inicialmente un UI Actionable.

## Implementación

El modelo se implementa mediante:
1. Una actualización al endpoint `/probe` en el backend para emitir las métricas.
2. Un script en `bridge/health.sh` que evalúa las respuestas contra los estados definidos e imprime el estado en un formato parseable.
