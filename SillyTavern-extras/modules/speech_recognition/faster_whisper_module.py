"""
Speech-to-text module based on Whisper for SillyTavern Extras
    - Whisper github: https://github.com/openai/whisper

Authors:
    - Tony Ribeiro (https://github.com/Tony-sama)

Models are saved into user cache folder, example: C:/Users/toto/.cache/whisper

References:
    - Code adapted from:
        - whisper github: https://github.com/openai/whisper
        - oobabooga text-generation-webui github: https://github.com/oobabooga/text-generation-webui
"""
from flask import jsonify, abort, request

from faster_whisper import WhisperModel

DEBUG_PREFIX = "<stt whisper module>"
RECORDING_FILE_PATH = "stt_test.wav"

model_size = "large-v3-turbo"


def load_model(file_path=None,whisper_device="cuda",whisper_compute_type="auto"):
    """
    Load given vosk model from file or default to en-us model.
    Download model to user cache folder, example: C:/Users/toto/.cache/vosk
    """
    if whisper_compute_type=="auto":
        whisper_compute_type=(
            "int8"
            if whisper_device=="cpu"
            else "float16")

    if file_path is None:
        print(f"faster-whisper using {model_size} model with {whisper_compute_type}")
        return WhisperModel(model_size, device=whisper_device, compute_type=whisper_compute_type)
    else:
        print(f"faster-whisper using {file_path} model with {whisper_compute_type}")
        return WhisperModel(file_path, device=whisper_device, compute_type=whisper_compute_type)

def process_audio():
    """
    Transcript request audio file to text using Whisper
    """

    if model is None:
        print(DEBUG_PREFIX,"Whisper model not initialized yet.")
        return ""

    try:
        file = request.files.get('AudioFile')
        language = request.form.get('language', default=None)
        file.save(RECORDING_FILE_PATH)
        segments, info = model.transcribe(RECORDING_FILE_PATH, beam_size=5)
        transcript=""
        for segment in segments:
            transcript=transcript+" "+segment.text
        print(DEBUG_PREFIX, "Transcripted from audio file (whisper):", transcript)

        return jsonify({"transcript": transcript})

    except Exception as e: # No exception observed during test but we never know
        print(e)
        abort(500, DEBUG_PREFIX+" Exception occurs while processing audio")
