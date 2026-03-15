# Mapa de Uso de Mouse y Automatización de Interfaz

## Diagnóstico
Tras un relevamiento exhaustivo del repositorio `Taverna-v2` mediante búsquedas de palabras clave (`click`, `mouse`, `pyautogui`, `robotjs`, `xdotool`, `puppeteer`, etc.), se ha determinado el siguiente estado:

### Código Fuente (`.js`, `.sh`)
-   **Ocurrencias**: `0`
-   **Estado**: El sistema actual **no contiene** scripts de automatización de interfaz basados en coordenadas, clicks o control de mouse. Toda la interacción con SillyTavern se realiza vía REST API (`wrapper/client.js`) o lógica interna.

### Documentación (`docs/`, `*.md`)
-   **Ocurrencias**: Múltiples menciones sobre las **restricciones** de uso de mouse y políticas de "Zero-UI" (`ZERO_UI_ENFORCEMENT.md`, `GOVERNANCE_UI_RESTRICTION_POLICY.md`).
-   **Estado**: La documentación prohíbe el uso de mouse, y el código actual cumple con esta directiva.

---

## Próximo Paso (Policy Layer)
Dado que no hay código de mouse que "cuarentenar", el enfoque se traslada a **blindar la arquitectura**:
1.  Agregar un flag de configuración de emergencia (`TAVERNA_ALLOW_EMERGENCY_UI`).
2.  Extender los resultados estructurados para reportar explícitamente `used_internal_path: true`.
3.  Prever el circuito de rechazo ordenado para operaciones que no posean ruta interna en el futuro.
