# Chatterbox provider (MIT, expressive cloning; matches generate_dialogues.py).
# API verified against the Chatterbox multilingual quickstart:
#   from chatterbox.mtl_tts import ChatterboxMultilingualTTS
#   m = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
#   m.generate(text, language_id="fr", audio_prompt_path="ref.wav")
from .base import TtsEngine
from .config import CHATTERBOX_LANGS, LICENCES


class ChatterboxEngine(TtsEngine):
    """Expressive multilingual engine; clones from a reference clip."""

    name = "chatterbox"
    licence = LICENCES["chatterbox"]
    _models: dict = {}

    def available(self) -> bool:
        try:
            import chatterbox.mtl_tts  # noqa: F401
        except Exception:
            return False
        return True

    def supports(self, lang: str) -> bool:
        return lang in CHATTERBOX_LANGS

    def synth(self, text, lang, out_path, *, speaker=None, voice=None, gpu=False):
        import os

        import torch
        import torchaudio
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS

        if speaker is not None and not os.path.exists(speaker):
            raise FileNotFoundError(f"Reference clip not found: {speaker}")
        device = "cuda" if (gpu and torch.cuda.is_available()) else "cpu"
        key = device
        if key not in self._models:
            self._models[key] = ChatterboxMultilingualTTS.from_pretrained(device=device)
        model = self._models[key]
        wav = model.generate(text, language_id=lang, audio_prompt_path=speaker)
        wav = wav.cpu()
        if wav.dim() == 1:
            wav = wav.unsqueeze(0)
        torchaudio.save(out_path, wav, model.sr)
        return True
