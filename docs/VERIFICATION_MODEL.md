# Verification Model V1 - Taverna

Este documento estipula la forma en que Taverna verifica el resultado de cada acción delegada a SillyTavern, reemplazando la fe ciega ("fire-and-forget") por una comprobación en bucle cerrado (closed-loop verification).

---

## 1. Reglas Generales

Toda acción ejecutada a través del `bridge/execute.sh` o el Backend POST `/execute` debe ir seguida de una rutina de validación proporcional al nivel invocado (ver `ACTION_LADDER.md`).

## 2. Definición del Proceso

### **¿Qué observación confirma éxito?**
- Para comandos asíncronos encolados: **Consumo verificado**. La métrica `queue_depth` del comando GET `/state` o POST `/probe` debe volver a `0` dentro de la ventana de tiempo esperado.
- Para cambios visuales: **Lectura diferencial**. Un cambio explícito en el DOM de la interfaz objetivo, medido y confirmado por una automatización del navegador si es viable, o reflejado en un endpoint JSON consultado posteriormente.

### **¿Cuánto tiempo se espera?**
El Time-To-Live (TTL) o timeout para cada validación está vinculado a la latencia esperada de la vía:
- **Backend Enqueue**: < 100ms.
- **Frontend Consumo (Poll)**: Timeout estricto de **2000ms** (el poll cycle es de 1000ms).
- **DOM / Action Reflected**: Timeout de **5000ms** después del consumo. Modificaciones lentas de render pueden tomar un breve periodo extra.

### **¿Qué cuenta como fallo?**
1. **Fallo de inyección**: Payload rechazado por HTTP 4xx o backend inaccesible (HTTP 500 o timeout).
2. **Fallo de consumo (`Stuck Queue`)**: `queue_depth` se mantiene en `>= 1` transcurrido el Timeout de la vía respectiva (2000ms).
3. **Fallo de efecto (`Ghost Execution`)**: El comando fue consumido (`queue_depth = 0`), pero la vía de lectura diferencial demuestra que el estado de ST no ha mutado.

### **¿Qué cuenta como estado incierto (Ambigüedad)?**
1. El backend da timeout durante la verificación (¿se rompió ST o se trabó la red de bridge?).
2. La cola bajó a `0`, pero se lanzó una segunda operación paralela que enmascara los resultados (interferencia de estado).

### **¿Qué hacer ante ambigüedad?**
La ambigüedad es un fallo inyectado. La doctrina indica escalar a `Fallback/Detached Recovery`:
1. NO inyectar más comandos.
2. Hacer rollback si estuviera habilitado en comandos futuros, o declarar estado "Degraded" en el `GlobalState`.
3. Pedir la detención del proceso actual mediante el Immune System (`FAILURE_AND_RECOVERY.md`).
