# Capability Registry V1 - Taverna

El registro de capacidades (Capability Registry) formaliza *qué* puede hacer Taverna-v2 sobre SillyTavern, *cómo* lo hace, y *con qué confianza*. Cualquier acción no documentada aquí se considera fuera del contrato de operación seguro.

---

## 1. `probe_system`
- **Intent**: Medir y reportar el estado de salud de todos los componentes estructurales (Health Model).
- **Layer**: Backend API (`/probe`) & Bridge CLI (`health.sh`).
- **Primary Path**: HTTP POST a `/api/plugins/st-orchestrator/probe`.
- **Fallbacks**: Ninguno. Si falla, el sistema está incomunicado.
- **Risk**: Low (Solo lectura, sin efectos secundarios).
- **Expected Time**: < 100ms.
- **Success Criteria**: HTTP 200 OK y JSON coherente parseable.
- **Failure Signals**: HTTP timeout, conexión rechazada, JSON malformado.
- **Recovery**: Notificar caída al agente externo, sugerir reinicio del stack.
- **Confidence**: Alta.

## 2. `enqueue_remote_command`
- **Intent**: Insertar un comando en la cola del backend para ejecución asíncrona por el frontend.
- **Layer**: Backend API (`/execute`).
- **Primary Path**: HTTP POST a `/execute` con payload JSON.
- **Fallbacks**: Ninguno directo.
- **Risk**: Low (Mutación delegada, no ejecuta directamente).
- **Expected Time**: < 100ms.
- **Success Criteria**: HTTP 200 OK informando `queue_size` incrementado.
- **Failure Signals**: HTTP 500, payload rechazado (400).
- **Recovery**: Reintento con backoff lineal.
- **Confidence**: Alta.

## 3. `poll_command_delivery`
- **Intent**: Transferir comandos encolados desde el backend hacia el frontend de SillyTavern.
- **Layer**: Frontend Extension -> Backend API.
- **Primary Path**: Intervalo automático (1000ms) haciendo GET a `/poll`.
- **Fallbacks**: Si falla automáticamente, reintento en el próximo ciclo.
- **Risk**: Low.
- **Expected Time**: < 50ms por batch.
- **Success Criteria**: Respuesta 200 recibida por el frontend, cola vaciada en el backend.
- **Failure Signals**: Network Error en el navegador, `queue_depth` no se reduce en el backend.
- **Recovery**: Silencioso (el frontend sigue reintentando).
- **Confidence**: Alta.

## 4. `verify_frontend_consumption`
- **Intent**: Confirmar que los comandos encolados han sido procesados y vaciados del backend.
- **Layer**: Bridge CLI (observador).
- **Primary Path**: Monitorear la reducción de `queue_depth` vía `probe_system`.
- **Fallbacks**: Lectura de logs directos de la terminal del servidor (ruidoso).
- **Risk**: Low.
- **Expected Time**: ~1000ms a 2000ms (dependiendo del ciclo de poll).
- **Success Criteria**: `queue_depth` llega a 0 después de un `enqueue`.
- **Failure Signals**: `queue_depth` se mantiene estático por > 5000ms tras un encolado.
- **Recovery**: Declarar estado Degraded o Broken (`Poll Loop Broken`).
- **Confidence**: Media (es una verificación indirecta por ahora).

## 5. `execute_simple_visible_action`
- **Intent**: Ejecutar un cambio de estado visible en la UI sin romper el contexto o usar automatización riesgosa.
- **Layer**: Frontend Extension (`slash-commands`).
- **Primary Path**: Encolar un comando `/v` o `/sys` que altere visualmente el estado, y dejar que el poll lo ejecute.
- **Fallbacks**: UI Automation (fuera del scope V1).
- **Risk**: Medium (Ejecuta comandos reales en el runtime y DOM).
- **Expected Time**: < 2000ms (Total ciclo).
- **Success Criteria**: El comando fue consumido y la UI de destino en el navegador se actualiza.
- **Failure Signals**: El comando fue consumido pero no hubo cambio visible o el parser de ST devolvió error.
- **Recovery**: Loguear el fallo de ejecución en la terminal, devolver feedback al agente.
- **Confidence**: Media (depende del sistema de `slash-commands` de SillyTavern).

## 6. `read_basic_runtime_state`
- **Intent**: Leer de forma segura un segmento del estado en vivo de SillyTavern (ej. último mensaje, extensiones activas).
- **Layer**: Frontend Extension -> Backend API -> Bridge.
- **Primary Path**: [Por Implementar - Fase D]. Extensión envía estado en su GET `/poll` o vía POST dedicado (`/state`). Bridge lee este estado.
- **Fallbacks**: Lectura de archivos JSON en `SillyTavern/data/` (Peligro de lectura desactualizada).
- **Risk**: Medium. 
- **Expected Time**: < 500ms.
- **Success Criteria**: Obtener un payload de estado fresco y verificable.
- **Failure Signals**: Payload desactualizado (Timestamp viejo) o vacío.
- **Recovery**: Solicitar refresco manual al frontend.
- **Confidence**: Media.
