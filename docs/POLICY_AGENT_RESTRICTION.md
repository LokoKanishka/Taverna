# Política de Gobernanza del Agente - Restricción de `browser_subagent`

## 1. Regla de Oro
El Agente de IA (**Antigravity**) tiene **estricta prohibición** de invocar la herramienta `browser_subagent` para realizar cualquier **mutación de estado** sobre SillyTavern.

---

## 2. Acciones Clasificadas

### 🔴 MUTACIONES (PROHIBIDAS vía Subagente)
Queda bloqueado el uso de navegador para:
-   Crear, editar o borrar Personajes (`Characters`).
-   Modificar `Settings`, `Presets` o configuraciones globales.
-   Tocar `Lorebooks` o estructuras de memoria persistente.
-   Alterar el `Chat History` o `Contexto` de forma destructiva por fuera de la REST API.

*Acción requerida ante falta de ruta*: **Fallar Cerrado** y devolver `unsupported_internal_path` o `mutation_rejected_by_policy`.

### 🟢 LECTURAS (PERMITIDAS bajo Criterio)
Se permite el uso de `browser_subagent` **exclusivamente** para:
-   Inspección visual de diagnósticos (capturas de pantalla, lectura de logs visuales).
-   Verificación de renderizado de elementos que no afecten el estado del servidor.

---

## 3. Flag de Emergencia (Plano Teórico)
Cualquier excepción debe ser habilitada explícitamente en el razonamiento del Agente:
-   `ALLOW_BROWSER_SUBAGENT_FOR_ST_MUTATIONS=0` (Por defecto).

---

## 4. Evidencia de Activación Previa
El subagente se disparaba anteriormente durante fallos de la API (ej. Error 500 en importación), donde el Agente intentaba "salvar la tarea" clickeando en la interfaz. A partir de esta política, **esa conducta queda desautorizada**.
