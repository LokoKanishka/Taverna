# State Model V1 - Taverna

Este documento define el modelo de estado interno mínimo que Taverna-v2 mantiene para dejar de operar a ciegas.

## Estructura del Estado Internal (Memory)

El estado se representa como un objeto JSON consolidado expuesto a través del endpoint `GET /state` del backend `ST-Orchestrator`.

```typescript
interface GlobalState {
  system: {
    runtime_up: boolean;             // ¿El proceso backend existe y ST responde?
    backend_plugin_up: boolean;      // ¿El router del plugin cargó? (Siempre true si obtenemos el estado)
    frontend_extension_up: boolean;  // ¿last_poll_time < 5000ms?
    poll_active: boolean;            // ¿El ciclo de poll actual está en tiempo?
  },
  commands: {
    queue_depth: number;             // Tamaño actual de la cola de comandos
    last_command_sent: number;       // Timestamp del último POST /execute
    last_command_consumed: number;   // Timestamp del último vaciado de cola por /poll
    last_verified_effect: number;    // Timestamp de la última verificación visual (Bridge)
  },
  errors: {
    recent_errors: string[];         // Últimos N errores (ej: timeouts, JSON malformado)
  },
  context: {
    current_mode: string;            // 'operational', 'degraded', 'recovery'
  }
}
```

## Mecanismos de Transición

- **`runtime_up` / `backend_plugin_up`**: Implícitamente `true` si la solicitud a `/state` devuelve una respuesta 200.
- **`frontend_extension_up` / `poll_active`**: Calculado dinámicamente evaluando `Date.now() - last_poll_time < 5000`.
- **`queue_depth`**: Incrementa en `/execute`, se resetea a 0 en `/poll`.
- **`last_command_sent`**: Actualizado en cada POST a `/execute`.
- **`last_command_consumed`**: Actualizado cuando GET `/poll` vacía una cola que no estaba vacía.
- **`recent_errors`**: Se puebla mediante bloques `try/catch` globales en el backend y mediante inyección manual de errores de validación.
- **`current_mode`**:
  - `operational`: Frontend conectado, sin errores críticos, queue fluyendo.
  - `degraded`: Queue atascada > 5 o Frontend desconectado.
  - `recovery`: Intervención de reinicio disparada (Futura Fase G).

## Vía de Acceso
El estado vivo se obtiene a través del bridge haciendo un curl básico:
`curl -s GET http://localhost:8000/api/plugins/st-orchestrator/state`
