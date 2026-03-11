# REGRESSION MATRIX — TAVERNA-v2

| Componente | Script de Prueba | Detecta | Frecuencia |
| :--- | :--- | :--- | :--- |
| **Bridge API** | `smoke_test.sh` | Caídas de conectividad / Endpoint downtime | Release |
| **Governance** | `demo_scene_roles.js` | Desalineación de roles/modelos | CI/CD |
| **Context** | `demo_context_memory.js` | Corrupción de compilación de contexto | CI/CD |
| **Memory** | `demo_failure_recovery.js` | Violación de guardrails de disco | Release |
| **Continuity** | `demo_scene_continuity.js` | Pérdida de estado entre turnos | Deep Validation |
| **Stability** | `soak_test_stack.sh` | Fugas de memoria o drift de estado | Soak |
