# Action Ladder - Taverna

Este documento formaliza las vías de acción de las que dispone Taverna-v2 para manipular el entorno objetivo (SillyTavern), estableciendo una jerarquía estricta (Escalera de Acción) basada en la confiabilidad y la invasión.

**Regla de Oro:** *Taverna SIEMPRE debe intentar usar el nivel más bajo (menor número) que sea capaz de cumplir con la intención antes de subir de escalón.*

---

## Nivel 1: Plugin / Backend API
Es la capa de comunicación directa server-to-server.
- **Cuándo se usa**: Para interactuar puramente con el servidor de ST sin depender del navegador. Lectura de colas, healthchecks, estado interno.
- **Por qué**: Es la vía más rápida, estructurada y predecible (respuestas HTTP síncronas/JSON).
- **Riesgo**: Nulo/Muy Bajo.
- **Confiabilidad**: Muy Alta (99%).
- **Señales de Éxito**: Códigos HTTP 20x, JSON coherente.
- **Señales de Fallo**: Códigos HTTP 4xx/5xx, timeouts.

## Nivel 2: Frontend Extension / Hook
Es código estático cargado en el navegador del usuario a través de extensiones nativas de SillyTavern.
- **Cuándo se usa**: Para inyectar comandos de forma asíncrona pero nativa (`ST-Orchestrator`).
- **Por qué**: Permite usar las APIs del cliente original de SillyTavern (ej. `executeSlashCommands()`) sin pelearnos con el DOM.
- **Riesgo**: Bajo.
- **Confiabilidad**: Alta (90% - sujeto a ciclo del event loop y carga de la pestaña).
- **Señales de Éxito**: Consumo de la command queue del backend.
- **Señales de Fallo**: La cola no se vacía, errores de JS lanzados en la consola del cliente.

## Nivel 3: Slash Commands
Lenguaje de scripting embebido provisto por SillyTavern.
- **Cuándo se usa**: Para manipular el estado visual del cliente (cambiar personajes, limpiar chat, alterar macros).
- **Por qué**: Es una abstracción soportada nativamente; si la UI cambia, los slash commands suelen mantenerse.
- **Riesgo**: Medio. Operan sobre el estado vivo y pueden fallar silenciamente si el parser de ST cambia.
- **Confiabilidad**: Media-Alta (80%).
- **Señales de Éxito**: Efecto reflejado y medible indirectamente o visualmente con herramientas.
- **Señales de Fallo**: Comando ignorado, texto renderizado como mensaje de chat plano.

## Nivel 4: DOM / UI Automation
Automatización de navegador usando herramientas externas (Playwright, Puppeteer).
- **Cuándo se usa**: ÚNICA Y EXCLUSIVAMENTE cuando no existe alternativa en niveles 1 a 3 (ej. clicks en modales ciegos, configuraciones no expuestas por ST API).
- **Por qué**: Es extremadamente frágil a rediseños CSS y retrasos de renderizado.
- **Riesgo**: Alto.
- **Confiabilidad**: Baja (50% - Flaky).
- **Señales de Éxito**: Mutación exitosa confirmada por una captura visual o mutación de la URL.
- **Señales de Fallo**: `TimeoutError`, `ElementNotInteractable`.

## Nivel 5: Proceso / OS / Filesystem
Control directo vía bash, kill signals, manipulación de archivos.
- **Cuándo se usa**: Para arrancar el stack (`start_stack.sh`), matar procesos corruptos, manipular configuraciones crudas (`settings.json`).
- **Por qué**: Constituye la acción nuclear de intervención.
- **Riesgo**: Extremo. Puede corromper persistencia, dejar procesos zombis o requerir migración.
- **Confiabilidad**: Alta si se ejecuta bien, catastrófica si falla.
- **Señales de Éxito**: Proceso finalizado, archivo escrito, daemon activo.
- **Señales de Fallo**: Errors de permisos, `EACCES`, bloqueos del sistema de archivos.
