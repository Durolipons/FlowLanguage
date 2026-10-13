# Updated configuration for the TTS provider layer (deliverable #3).
#
# Fallback chain is VoxCPM2 -> Kokoro -> Chatterbox -> Piper (Piper LAST:
# GPL-3.0 engine + per-voice licences, i.e. YELLOW, see TTS_LICENCE_AUDIT.md).
# The shipped app never runs these engines; they produce WAVs offline.
# See README.md in this folder for install commands per engine.

PRIORITY = ["voxcpm", "kokoro", "chatterbox", "piper"]

MODELS = {
    "voxcpm": "openbmb/VoxCPM2",
    "kokoro": "hexgrad/Kokoro-82M",
    "chatterbox": "ResembleAI/chatterbox",
    "piper": "OHF-Voice/piper1-gpl",
}

# Commercial-use licence of each engine, mirroring TTS_LICENCE_AUDIT.md.
LICENCES = {
    "voxcpm": "Apache-2.0",
    "kokoro": "Apache-2.0",
    "chatterbox": "MIT",
    "piper": "GPL-3.0 engine; per-voice (VERIFY before use)",
}

# Languages wired in this project per engine (subset of each model's coverage).
KOKORO_LANGS = {"es", "fr"}  # model covers 8; only es/fr wired (no pl)
CHATTERBOX_LANGS = {"es", "fr"}

# VoxCPM2: 30-language HF tag set (verified) -- includes en/de/pl.
VOXCPM_LANGS = {
    "zh", "en", "ar", "my", "da", "nl", "fi", "fr", "de", "el", "he", "hi",
    "id", "it", "ja", "km", "ko", "lo", "ms", "no", "pl", "pt", "ru", "es",
    "sw", "sv", "tl", "th", "tr", "vi",
}

# Kokoro built-in voices (override with --voice).
KOKORO_VOICES = {"es": "ef_dora", "fr": "ff_siwis"}

# Chatterbox: documented multilingual model (23 languages). The wired subset is
# asserted here; add more codes only after verifying against the model card.
CHATTERBOX_LANGS = {"es", "fr"}

# Piper voices: lang -> {"model": <onnx path>, "config": <json path>, "licence": ...}.
# EMPTY by default. Only add a voice AFTER verifying its MODEL_CARD licence is
# clearly commercial-safe (CC0/CC-BY or equivalent). Any entry here runs last.
PIPER_VOICES: "dict[str, dict[str, str]]" = {}
