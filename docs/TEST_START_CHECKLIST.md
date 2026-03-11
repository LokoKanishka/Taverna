# TEST START CHECKLIST — TAVERNA-V2 (RC1)

Para iniciar las pruebas integradas con Taverna-v2 RC1, siga este procedimiento:

## [ ] Preparación del Entorno
1. Asegurar que SillyTavern esté corriendo en el puerto 8123.
2. Verificar que `persistent_memory.json` sea legible en la raíz del proyecto.
3. Ejecutar `./scripts/release_gate.sh` y confirmar el estado **READY**.

## [ ] Ciclo de Prueba Recomendado
- **Paso 1**: Crear un grupo en SillyTavern y anotar su ID.
- **Paso 2**: Utilizar `wrapper/pilot_scenario_session.js` como base para nuevos escenarios.
- **Paso 3**: Monitorear `docs/CONTUINITY_TRACE.json` tras cada turno para verificar la coherencia del estado.

## [ ] Reporte de Errores
- Si una operación falla, adjuntar el log de `/tmp/taverna_release/release.log`.
- Verificar si el fallo está catalogado en `docs/FAILURE_RECOVERY_MATRIX.md`.
