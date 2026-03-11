# REPEATABILITY REPORT — TAVERNA-V2

Este documento confirma que Taverna-v2 es determinista y resiliente ante reinicios del entorno.

| ID Corrida | Condición del Runtime | Resultado General | Estado |
| :--- | :--- | :--- | :--- |
| **Run A** | Runtime ya existente | **READY** | ✅ Estabilidad confirmada |
| **Run B** | Post-Reinicio (Kill & Start) | **READY** | ✅ Resiliencia de arranque |
| **Run C** | Rerun consecutivo | **READY** | ✅ Determinismo total |

## Análisis de Consistencia
- **Capa REPO**: No hubo deriva. El sistema de archivos permaneció alineado.
- **Capa MEMORY**: No se detectaron escrituras duplicadas ni corrupción en `persistent_memory.json`.
- **Capa CONTINUITY**: Los estados de escena se mantuvieron estables entre turnos incluso tras el reinicio del bridge.

**Diagnóstico**: **DETERMINISTIC REPEATABLE**
El sistema puede ser apagado y encendido sin perder su capacidad de gobernanza ni degradar sus contratos.
