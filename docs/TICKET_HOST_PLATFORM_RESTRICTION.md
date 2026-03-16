# TICKET — Host / Plataforma de Antigravity

## Título
Bloquear `browser_subagent` para mutaciones sobre SillyTavern a nivel Host/Plataforma

## Problema
El repositorio `Taverna-v2` ya fue endurecido para fallar cerrado en mutaciones internas, pero la disponibilidad y ejecución de herramientas como `browser_subagent` pertenece al Host/Plataforma, no al workspace del repo.

Por lo tanto, desde Taverna no puede garantizarse al 100% que el agente no derive a browser visual en mutaciones sobre SillyTavern.

## Objetivo
Implementar enforcement real en la plataforma para que, en tareas clasificadas como mutación sobre SillyTavern:
- `browser_subagent` no esté disponible, o
- sea rechazado por runtime si se intenta usar.

## Requerimiento
Aplicar doble bloqueo:

1. **Selección**
   - excluir `browser_subagent` del set de tools disponibles para mutaciones ST

2. **Ejecución**
   - si por error o desvío se intenta invocarlo igual, rechazar la ejecución en runtime

## Además
Agregar logging visible de:
- tools habilitadas para la tarea
- tool elegida
- intento bloqueado, si ocurre
- resultado final

## Validación requerida
Ejecutar una mutación ST real con fallo controlado y demostrar:
- que la ruta interna falla
- que `browser_subagent` no estuvo disponible o fue rechazado
- que la tarea terminó fail-closed
- que quedó evidencia en logs de Host/runtime

## Criterio de cierre
Solo se considera resuelto si el bloqueo queda implementado en la plataforma, no solo documentado en el repo.
