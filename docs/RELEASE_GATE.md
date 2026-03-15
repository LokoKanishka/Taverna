# RELEASE GATE — TAVERNA-v2

## Propósito
Este documento describe el protocolo de validación final antes de promover cambios a la rama principal (`main`) o realizar un despliegue. El Release Gate garantiza que el sistema sea estable, auditable y recuperable.

## Capas de Validación
El proceso de gate ejecuta las siguientes verificaciones en orden secuencial:

1. **REPO Health**: Verifica la integridad del repositorio y dependencias mediante `scripts/doctor.sh`.
2. **INTEGRATED STACK**: Levanta el entorno completo y valida la conectividad con SillyTavern.
3. **RECOVERY CHECK**: Asegura que el sistema pueda recuperarse de fallos controlados.
4. **SOAK SUMMARY**: Valida que las pruebas de carga recientes hayan concluido satisfactoriamente.

## Ejecución
Para ejecutar el gate y validar el estado actual del sistema:
```bash
bash scripts/release_gate.sh
```

## Reportes de Ejecución
Los resultados detallados de la última corrida NO se guardan en este archivo para evitar ruido en el repositorio. Pueden encontrarse en:
- **Resumen Final**: `logs/release_gate_latest.md` (Ignorado por Git)
- **Log Detallado**: `logs/release.log`

> [!IMPORTANT]
> Nunca promueva cambios que no hayan pasado el Release Gate con estado **READY**.
