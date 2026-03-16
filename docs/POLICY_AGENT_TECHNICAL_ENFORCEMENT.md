# Bloqueo Técnico de Subagente (Enforcement)

## 1. Dónde quedó el Enforcement
El bloqueo quedó implementado directamente en el archivo `wrapper/operations.js`, modificando operaciones de mutación cruda (como `characterImport`) para que corran envueltas en `_executeWithPolicy()`.

---

## 2. Cómo Funciona el Bloqueo Técnico
Al envolver una operación:
```javascript
return this._executeWithPolicy('character_import', async () => {
    // Código interno...
}, null); // fallbackUiFn = null
```
Se produce el siguiente comportamiento:
1.  **Garantía Interna**: Se ejecuta el código REST/API de forma transparente.
2.  **Aislamiento de Fallo**: Si la API o el código interno fallan:
    -   Como `fallbackUiFn` es `null` (explícitamente bloqueado), el wrapper **retorna el error cerrado** (`operation_failed_internally`).
    -   Queda **técnicamente imposible** que el Agente intercepte una excepción para saltar a un subagente visual.

---

## 3. Evidencia y Pruebas
-   **Test de Verificación**: `wrapper/test_agent_policy_tech_guard.js`
-   **Ejecución**: Al simular una importación fallida por archivo inexistente, el wrapper reporta `used_internal_path: true`, `used_emergency_ui: false` y finaliza la tarea con `ok: false`.
-   **Resultado**: El bucle de ejecución se detiene en seco, forzando un **Fail-Closed**.

---

## 4. Próxima Etapa
El sistema ya no depende de la voluntad del Agente para no clickear. Sus propias funciones le cierran la puerta a cualquier vía de escape visual.
