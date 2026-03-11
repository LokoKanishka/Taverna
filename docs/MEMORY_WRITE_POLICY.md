# MEMORY WRITE POLICY — TAVERNA-v2

Esta política define cómo y cuándo se escribe en la memoria persistente para evitar la degradación del contexto y el uso excesivo de recursos.

## 1. Scopes y Reglas de Escritura

| Scope | Propietario | Tipo de Dato Permitido | Límite por Entrada | Acción ante Exceso |
| :--- | :--- | :--- | :--- | :--- |
| **Scene** | Master / System | Resumen de eventos, flags de mundo, estado de locación. | 2 KB | Rechazo |
| **Role** | Role Propietario | Metadatos de ejecución, presets específicos. | 1 KB | Truncado / Rechazo |
| **Character** | Character / Master | Pensamientos internos, estado de relación, hechos personales. | 2 KB | Rechazo |

## 2. Guardrails de Implementación
- **Límite Global de Archivo**: `persistent_memory.json` no debe exceder los 100 KB en MVP.
- **Validación de Estructura**: Solo se aceptan objetos JSON planos o con un nivel de anidación. No se permiten arrays binarios ni strings masivos.
- **Rechazo por Redundancia**: Si el dato nuevo es idéntico al anterior, se omite la escritura pero se reporta éxito.

## 3. Trazabilidad Obligatoria
Toda operación de escritura debe devolver:
- `scope`: Ámbito de la memoria.
- `memory_key`: Clave afectada.
- `write_reason`: Motivo (ej: "Scene event update").
- `observed_before`: Estado previo.
- `observed_after`: Estado nuevo.
- `verified`: Confirmación de commit a disco.

## 4. Separación Conceptual
- **Persistent Memory**: Datos que sobreviven al reinicio de la escena y afectarán futuros encuentros.
- **Scene State**: Datos volátiles del hilo actual (se pierden al limpiar el chat o cambiar de grupo).
- **Immediate Context**: El prompt exacto enviado al modelo en el turno actual.
