# Informe Forense - Diagnóstico de Uso de Mouse

## 1. Resumen Corto
Tras un rastreo completo del repositorio `Taverna-v2` y su entorno:
-   **Código Taverna**: Contiene **0** ocurrencias de automatización visual o control de coordenadas de mouse (`click`, `xdotool`, `pyautogui`, etc.).
-   **Origen del Síntoma**: El uso de mouse/clicks observado proviene exclusivamente de la **capa del Agente de IA (Antigravity)** al invocar su herramienta nativa `browser_subagent` como fallback para resolver tareas cuando una ruta interna falla o no está implementada.

---

## 2. Conclusión Principal
El ratón **no nace en Taverna**. Nace en la **plataforma de agentes** (Antigravity) que, ante un problema complejo (ej. un Error 500 en un endpoint), recurre a la automatización del navegador (`browser_subagent`) para interactuar con el DOM de SillyTavern.

---

## 3. Evidencia y Cadena Causal

### Evidencia de Código (.js, .sh, .py)
-   **Auditoría**: Búsqueda global de librerías de control de pantalla/mouse -> **0 Resultados**.
-   **Wrappers**: `health.sh` y `probe.sh` usan estrictamente `curl`. `operations.js` usa `node-fetch`/`client.js`.

### Mapa Causal del Síntoma
1.  **Flujo Interno (Taverna)**:
    `Usuario -> Antigravity -> wrapper/operations.js -> client.js -> SillyTavern REST API` *(0 Mouse)*
2.  **Flujo con Fallback (Antigravity)**:
    `Antigravity -> browser_subagent -> click/DOM triggers -> SillyTavern UI` *(Origen del síntoma)*

---

## 4. Dictamen Causal (Respuestas al Ticket)

1.  **¿Hay realmente uso de mouse/click?**
    -   SÍ, a nivel de disparos de eventos DOM (`browser.click()`) ejecutados por el subagente.
2.  **¿Dentro de Taverna?**
    -   **NO**. Ningún archivo del repositorio genera estas llamadas.
3.  **¿Fuera de Taverna?**
    -   **SÍ**, en la capa de ejecución del Agente.
4.  **Componente Responsable**:
    -   El Agente (Antigravity) y su herramienta `browser_subagent`.
5.  **Caracterización**:
    -   Es un **diseño de fallback de la plataforma de agentes**, ajeno al control del código de Taverna.

---

## 5. Riesgos y Recomendación
-   **Riesgo de Diagnóstico Equivocado**: Intentar "purgar " el código de Taverna no tendrá efecto, ya que el código no es el emisor.
-   **Próximo Ticket Recomendado**:
    -   "Aislar la gobernanza del Agente": Deshabilitar o restringir el uso de `browser_subagent` en tareas de mutación de estado de SillyTavern, forzando al Agente a reportar fallo en lugar de clickear.
