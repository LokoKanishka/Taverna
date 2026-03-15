# Política Central: Internal-First (No Mouse Fallback)

## 1. Regla General de Ejecución
Taverna opera exclusivamente mediante **superficies internas verificables** (REST APIs, manipulación de archivos). El uso de automatización visual (mouse clicks, coordinadas o `browser_subagent`) queda prohibido como mecanismo de fallback automático.

---

## 2. Configuración y Modo de Emergencia
Para garantizar la cuarentena de cualquier ruta visual futura, se ha implementado un control centralizado:

-   **Flag**: `TAVERNA_ALLOW_EMERGENCY_UI`
    -   **Valor por defecto**: `0` (Desactivado).
    -   **Comportamiento**:
        -   Si está **desactivado**: Cualquier intento de fallback a UI lanzará un error estructurado `unsupported_internal_path` y se considerará fallo seguro.
        -   Si está **activado**: Se registrará un log de advertencia `[POLICY] EMERGENCY_UI_PATH_USED` y se permitirá la ejecución de emergencia.

---

## 3. Arquitectura de Defensa (Quarantine Framework)
En `wrapper/operations.js`, el método centralizador `_executeWithPolicy` implementa este flujo:

```javascript
async _executeWithPolicy(operationName, internalActionFn, fallbackUiFn = null)
```

1.  Intenta `internalActionFn()`.
2.  Si falla o no existe, y hay `fallbackUiFn`:
    -   Si `emergency_ui_mode === true` -> Ejecuta UI + Log.
    -   Si `emergency_ui_mode === false` -> Error `unsupported_internal_path`.

---

## 4. Estructura de Reporte de Ejecución
Todas las operaciones de Taverna ahora reportan los siguientes campos de auditoría en su resultado:

```json
{
  "operation_ok": true/false,
  "used_internal_path": true,
  "used_emergency_ui": false,
  "verification_ok": true/false
}
```

---

## 5. Estado Actual
-   **Rutas de Mouse en el Repo**: `0` (Confirmado por auditoría).
-   **Copia de Seguridad**: La arquitectura queda blindada contra futuras regresiones que intenten depender de clicks automáticos.
