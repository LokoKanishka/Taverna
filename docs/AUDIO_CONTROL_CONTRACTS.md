# Audio Control Contracts — Phase 19

Strict JSON contracts for audio operations in Taverna-v2.

## 1. TTS Provider List
**Operation**: `audio.tts.list_providers`
**Response**:
```json
{
  "ok": true,
  "operation": "audio.tts.list_providers",
  "observed_after": [
    { "id": "Edge", "label": "Edge TTS" },
    { "id": "System", "label": "System TTS" }
  ],
  "verified": true
}
```

## 2. TTS Active Provider
**Operation**: `audio.tts.get_active` / `audio.tts.set_provider`
**Schema**:
```json
{
  "provider_id": "string"
}
```

## 3. TTS Voice Mapping
**Operation**: `audio.tts.set_voice_mapping`
**Schema**:
```json
{
  "character_id": "string",
  "voice_id": "string",
  "provider_id": "string"
}
```

## 4. STT Mode & Status
**Operation**: `audio.stt.get_status` / `audio.stt.set_mode`
**Schema**:
```json
{
  "enabled": "boolean",
  "provider": "string",
  "mode": "string"
}
```

## 5. Audio Test (Internal)
**Operation**: `audio.tts.test_output` / `audio.stt.test_input`
**Response**:
```json
{
  "ok": true,
  "operation": "audio.tts.test_output",
  "action_taken": "triggered_tts_test",
  "verified": true
}
```
