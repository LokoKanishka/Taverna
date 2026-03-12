# FAILURE RECOVERY MATRIX — TAVERNA-v2

Este documento cataloga cómo el sistema responde ante fallos inesperados y garantiza que la escena no quede en un estado inconsistente.

| Escenario de Fallo | Detección | Comportamiento del Orquestador | Acción de Recuperación | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **SillyTavern Caído** | Time-out en `/probe` | Detención inmediata del pipeline. | Reporte de "dead runtime". | ✅ Verificado |
| **Escritura Masiva** | Guardrail de bytes | Rechazo de la operación `memoryWrite`. | Preservación del estado previos en disco. | ✅ Verificado |
| **Modelo Inválido** | Error 400/500 ST | Fallo en la verificación de `modelSetActive`. | Intento de Rollback al modelo previo. | ✅ Verificado |
| **Rol Inexistente** | `contextVerifyInputs` | Generación de advertencia (`warning`). | Degradación a modo "raw" o detención controlada. | ✅ Verificado |
| **Payload Ambiguo** | `Schema validation` | Lanzamiento de excepción antes de emitir REST. | Bloqueo preventivo. | ✅ Verificado |

## Clasificación de Resiliencia
- **Recoverable**: Fallos de configuración que admiten rollback (ej: modelos, settings).
- **Fallback-only**: Fallos de runtime donde solo se puede informar el error y esperar intervención (ej: ST caído).
- **Hard-fail**: Fallos de integridad donde Taverna detiene la secuencia para evitar corrupción (ej: falta de archivos críticos).
