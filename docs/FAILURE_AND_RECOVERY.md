# Failure, Recovery & Immune System V1 - Taverna

Taverna-v2 no confía en que el sistema siempre estará en el "happy path". Este documento define el Sistema Inmune mínimo para manejar caídas y estados degradados.

## Principios del Sistema Inmune
1. **Fallo Seguro (Safe Failure)**: Es preferible abortar una orden y declararse "Broken" antes que ejecutar mutaciones desordenadas.
2. **Degraded Mode**: Si un subsistema no crítico falla, la operación puede continuar con capacidades reducidas.

---

## Modos de Falla y Rutinas de Recuperación

### 1. Backend Caído (Backend Unreachable)
- **Detección**: `POST /probe` devuelve HTTP 5xx o *Connection Refused* / Timeout.
- **Severidad**: **CRÍTICA**. Ciega toda la capa de comandos.
- **Retry**: 3 intentos separados por 500ms.
- **Degraded Mode**: No aplicable. El sistema entero está `Broken`.
- **Autorepair (Fase Futura)**: Lanzar `scripts/start_stack.sh` automáticamente si el puerto está libre.
- **Safe Failure**: Alertar al agente externo y rechazar todo intento de encolado.

### 2. Poll Roto (Poll Dead) / Frontend no cargado
- **Detección**: `frontend_connected` es `false` en el endpoint `/state` (no hay polls en > 5000ms).
- **Severidad**: **ALTA**. Se pueden encolar comandos pero nunca se ejecutarán.
- **Retry**: Esperar hasta 10000ms por si el cliente está refrescando la página.
- **Degraded Mode**: `Queue-Only`. El backend acepta órdenes pero alerta latencia infinita.
- **Autorepair**: Imposible sin manipulación del navegador (DOM Automation).
- **Safe Failure**: Bloquear enqueue preventivo si la cola llega a su límite natural (N > 10).

### 3. Cola no consumida (Stuck Queue)
- **Detección**: `queue_depth` > 0 durante más de 3000ms a pesar de que el Poll está activo.
- **Severidad**: **ALTA**. El bridge funciona, pero el event loop de ST o el parser están trabados.
- **Retry**: No se reintenta el comando atascado, el flujo ya falló.
- **Degraded Mode**: `Broken`. 
- **Autorepair**: Vaciar la cola forzosamente (Flushing) reiniciando el backend para evitar ráfagas descontroladas al destrabarse.
- **Safe Failure**: Impedir nueva inyección hasta que la cola sea liberada.

### 4. Runtime Ausente (SillyTavern Off)
- **Detección**: Fallo simultáneo del Backend (o Backend funcionando pero ST Server no responde).
- **Severidad**: **CRÍTICA**.
- **Retry**: N/A.
- **Degraded Mode**: N/A.
- **Autorepair**: Lanzar servidor Node (fuera de scope del orquestador, acción de SO).
- **Safe Failure**: Congelar plataforma.

### 5. Configuración Desviada (Config Drift)
- **Detección**: Puertos en `bridge/config.sh` no coinciden con los puertos vivos detectados.
- **Severidad**: **MEDIA**.
- **Retry**: Buscar puerto alternativo dinámicamente si aplica.
- **Degraded Mode**: Operar con config asimétrica.
- **Autorepair**: Imposible/Inseguro de forma autónoma.
- **Safe Failure**: Terminar ejecución con volcado de logs de configuración.

### 6. Drift entre Intención y Estado Real (Ghost Execution)
- **Detección**: `queue_depth` regresó a `0` tras inyectar un cambio de UI, pero la verificación estructural posterior falla.
- **Severidad**: **MEDIA/ALTA**. Pérdida de predictibilidad.
- **Retry**: No intentar repetir la acción ciegamente.
- **Degraded Mode**: Pasar a modo observador puro (`read_basic_runtime_state` solamente).
- **Autorepair**: Notificar divergencia; solicitar al usuario reiniciar el estado manual.
- **Safe Failure**: Bloquear acciones mutables hasta sincronizar.
