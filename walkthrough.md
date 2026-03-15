# Walkthrough - Importación de Personajes sin Mouse

## Diagnóstico del Error 500
El endpoint `/api/characters/import` fallaba inicialmente con un `500 Internal Server Error` debido a un error de `MulterError: Unexpected field`.
-   **Causa**: La petición `curl` usaba `-F "file=@..."`, pero el servidor espera `-F "avatar=@..."` (configurado en `server-main.js` de SillyTavern).

---

## Cambios Implementados

### 1. Cliente HTTP (`wrapper/client.js`)
-   Se modificó `_request` para detectar si el payload es una instancia de `FormData`.
-   **Acción**: Si es `FormData`, se **omite** el encabezado `Content-Type: application/json` para permitir que el motor de `fetch` asigne el `boundary` automáticamente.

### 2. Validación de Esquemas (`wrapper/schema.js`)
-   Se agregó la validación `Schemas.characterImport` para asegurar que:
    -   `file_path` sea provisto.
    -   `file_type` sea uno de los permitidos (`png`, `json`, etc.).

### 3. Operaciones de Taverna (`wrapper/operations.js`)
-   Se implementó el método `characterImport(inputParams)`.
    1.  Carga el archivo local como un `Blob` usando `require('buffer').Blob`.
    2.  Anexa el archivo a `FormData` bajo el campo `avatar`.
    3.  Llama a la API `/api/characters/import`.
    4.  Verifica el resultado listando `/api/characters/all`.

---

## Validación de Resultados

### Prueba Automatizada (`wrapper/test_character_import.js`)
Se ejecutó un script de prueba que importa una imagen de personaje localmente.

**Comando**:
```bash
node wrapper/test_character_import.js
```

**Salida**:
```json
{
  "ok": true,
  "operation": "character.import",
  "file_name": "Lucy Cunningham2",
  "verified": true,
  "observed_after": {
    "file_name": "Lucy Cunningham2",
    "verified": true
  }
}
```

### Conclusión
Se ha consolidado el canal interno `/api/characters/import` como la vía principal para la gestión de personajes de forma automatizada y programática, respetando la política "Zero-UI" del proyecto Taverna. El ticket `k4v9pm` puede darse por cerrado.
