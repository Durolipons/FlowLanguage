# Kokoro provider (Apache-2.0, 82M, CPU-friendly, built-in voices).
# Mirrors the existing gen_kokoro() in generate_voices.py one text at a time so
# current vocabulary generation keeps working unchanged.
from .base import TtsEngine
from .config import KOKORO_LANGS, KOKORO_VOICES, LICENCES


class KokoroEngine(TtsEngine):
    """Fast bulk engine for languages with a wired built-in voice."""

    name = "kokoro"
    licence = LICENCES["kokoro"]
    _pipelines: dict = {}

    def available(self) -> bool:
        try:
            import kokoro  # noqa: F401
        except Exception:
            return False
        return True

    def supports(self, lang: str) -> bool:
        return lang in KOKORO_LANGS

    def synth(self, text, lang, out_path, *, speaker=None, voice=None, gpu=False):
        import numpy as np
        import soundfile as sf
        from kokoro import KPipeline

        lang_map = {"es": "e", "fr": "f"}
        if lang not in lang_map:
            raise ValueError(f"Kokoro has no wired voice for lang={lang!r}")
        voice = voice or KOKORO_VOICES[lang]
        key = (lang_map[lang], voice)
        if key not in self._pipelines:
            self._pipelines[key] = KPipeline(lang_code=lang_map[lang])
        pipeline = self._pipelines[key]
        chunks = [audio for (_gs, _ps, audio) in pipeline(text, voice=voice, speed=1, split_pattern=r"\n+")]
        if not chunks:
            raise RuntimeError("Kokoro produced no audio")
        audio = chunks[0] if len(chunks) == 1 else np.concatenate(chunks)
        sf.write(out_path, audio, 24000)
        return True
