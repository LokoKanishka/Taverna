# Audio Surfaces Map — Phase 19

Documentation of SillyTavern's audio capabilities and governance points for Taverna.

## TTS (Text-to-Speech)

### Available Providers
Based on internal relevement:
- **Edge**: Cloud-based (Microsoft), reliable, many voices, low latency.
- **System**: Uses local OS voices (Google Native/System).
- **ElevenLabs**: High quality, cloud-based, requires API Key.
- **OpenAI**: Requires API Key.
- **Local Providers**: Coqui, XTTS, Silero, Piper (require external servers or complex local setup).

### Extension Dependencies
- TTS is managed by the `tts` extension in `public/scripts/extensions/tts`.
- Character-specific voices depend on the `voiceMap` and character card metadata.

### Governance via Taverna
- **Provider selection**: Controllable via `settings.json` (`tts.currentProvider`).
- **Voice mapping**: Controllable via `settings.json` (`tts.voiceMap` or provider-specific mapping like `tts.System.voiceMap`).
- **Generation triggering**: Can be triggered via backend/extension bridge.

---

## STT (Speech-to-Text)

### Available Modes
- **Browser Native**: Web Speech API (low reliability, requires UI interaction).
- **Whisper**: Local or Cloud (OpenAI compatible).
- **SillyTavern-Extras**: Required for high-quality local STT.

### Extension Dependencies
- Integrated in `speech_recognition` settings.

---

## Governance Status Table

| Capability | Governance Level | Implementation Path |
|------------|------------------|---------------------|
| List TTS Providers | Full | Read `tts` extension folder / settings |
| Set TTS Provider | Full | Update `settings.json` |
| Map Voice | Partial | Update specific provider `voiceMap` |
| TTS Test | Full | Bridge command to extension |
| STT Status | Full | Read `speech_recognition` settings |
| STT Mode | Partial | Update `settings.json` |

> [!NOTE]
> Currently, STT requires more UI-level interaction than TTS. Taverna will focus on ensuring the foundation for both is operative and verifiable.
