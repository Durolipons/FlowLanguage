# Piper provider (YELLOW: GPL-3.0 engine + per-voice licences).
#
# Pipeline contract: only run for entries present in config.PIPER_VOICES, and
# only add such an entry AFTER verifying its MODEL_CARD licence is clearly
# commercial-safe (CC0/CC-BY or equivalent) -- see TTS_LICENCE_AUDIT.md.
# Unconfigured == unavailable, so the fallback chain simply skips Piper.
from .base import TtsEngine
from .config import LICENCES, PIPER_VOICES


class PiperEngine(TtsEngine):
    """Last resort: fine-tuned / low-resource voices the other engines lack."""

    name = "piper"
    licence = LICENCES["piper"]

    def available(self) -> bool:
        if not PIPER_VOICES:
            return False
        try:
            import piper  # noqa: F401
        except Exception:
            return False
        return True

    def supports(self, lang: str) -> bool:
        entry = PIPER_VOICES.get(lang)
        if not entry:
            return False
        import os

        return os.path.exists(entry.get("model", "")) and os.path.exists(entry.get("config", ""))

    def synth(self, text, lang, out_path, *, speaker=None, voice=None, gpu=False):
        import wave

        from piper import PiperVoice

        entry = PIPER_VOICES.get(lang)
        if not entry:
            raise ValueError(f"No verified Piper voice configured for lang={lang!r}")
        import os

        for key in ("model", "config"):
            if not os.path.exists(entry.get(key, "")):
                raise FileNotFoundError(f"Piper voice file missing: {entry.get(key)}")
        voice_obj = PiperVoice.load(entry["model"], config_path=entry.get("config"))
        with wave.open(out_path, "wb") as wf:
            voice_obj.synthesize_wav(text, wf)
        return True
