# Cierre Final de Audio - Módulo Congelado

## 1. Alcance del Cierre
-   **TTS (Text-to-Speech)**: **CERRADO Y OPERATIVO**. Validado por el usuario. El proveedor `System` está configurado con las voces correctas.
-   **STT (Speech-to-Text)**: **DIFERIDO**. Configurado en el cliente (Browser), pero queda fuera del foco de desarrollo actual por depender de permisos interactivos.
-   **Roundtrip (Voz Bidireccional)**: **FUERA DE ALCANCE**. No se continuará su desarrollo en este tramo.

---

## 2. Instrucciones de Arranque y Uso
Para volver a testear o usar el audio mañana:
1.  Iniciar SillyTavern normalmente (`start.sh`).
2.  La configuración se cargará automáticamente de `settings.json`.
3.  **Prueba Mínima**: Se puede disparar una frase de prueba usando el método `audioTTSTestOutput()` del wrapper o mediante el comando `/tts` en el puente Orchestrator.

---

## 3. Restricciones y Cuidados (No tocar)
-   No cambiar el proveedor de TTS en `settings.json` sin asegurar que el nuevo proveedor tenga un `voiceMap` configurado.
-   No alterar las dependencias de `/api/settings/save` del wrapper que persisten este estado.

---

## 4. Estado de Validación
-   **TTS**: Validado por el usuario (operativo).
-   **STT**: Fuera de foco / diferido.
-   **Diseño**: Congelado como submódulo operativo en su estado actual.
