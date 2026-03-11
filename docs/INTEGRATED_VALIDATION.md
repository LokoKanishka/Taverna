# INTEGRATED VALIDATION — TAVERNA-v2

Este documento describe el arnés de validación integrada diseñado para asegurar que todas las capas del orquestador funcionen en conjunto.

## 1. El Script de Validación
El comando principal es:
```bash
bash ./scripts/verify_integrated_stack.sh
```

## 2. Capas Verificadas
1. **Repo**: Verifica que no haya desalineación en el sistema de archivos.
2. **Runtime**: Asegura que el servidor de SillyTavern esté arriba y escuchando en el puerto 8123.
3. **Smoke**: Pruebas rápidas de conectividad a los plugins de Taverna.
4. **Role Execution**: Valida que los roles (Master, Character, etc.) apliquen sus modelos y presets configurados.
5. **Context & Memory**: Valida la persistencia en disco y la compilación de contexto.
6. **Continuity**: Valida que el estado de la escena se mantenga a través de múltiples turnos.

## 3. Manejo de Logs
Toda salida detallada se guarda en:
`/tmp/taverna_validation/`

- `smoke_test.log`
- `role_demo.log`
- `memory_demo.log`
- `continuity_demo.log`

## 4. Criterio de Aceptación (Botón Rojo)
Un sistema se considera íntegro solo si todas las capas reportan **PASS**. Un solo FAIL en cualquier capa bloquea la promoción a producción de la escena.
