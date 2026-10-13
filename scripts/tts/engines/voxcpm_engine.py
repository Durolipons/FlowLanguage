# VoxCPM2 provider (deliverable #2).
# Verified: Apache-2.0 code + model weights (openbmb/VoxCPM2, ~4.6 GB, 30 langs).
# API verified against the VoxCPM quickstart + API reference:
#   pip install voxcpm
#   from voxcpm import VoxCPM
#   model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, device="auto")
#   wav = model.generate(text=..., reference_wav_path=..., cfg_value=2.0,
#                        inference_timesteps=10)
#   sf.write(out_path, wav, model.tts_model.sample_rate)
from .base import TtsEngine
from .config import LICENCES, MODELS, VOXCPM_LANGS


class VoxCPM2Engine(TtsEngine):
    """Voice cloning/design engine. First in the fallback chain."""

    name = "voxcpm"
    licence = LICENCES["voxcpm"]

    def available(self) -> bool:
        try:
            import voxcpm  # noqa: F401
        except Exception:
            return False
        return True

    def supports(self, lang: str) -> bool:
        return lang in VOXCPM_LANGS

    def synth(self, text, lang, out_path, *, speaker=None, voice=None, gpu=False):
        import os

        import soundfile as sf
        from voxcpm import VoxCPM

        if not self.supports(lang):
            raise ValueError(f"VoxCPM2 has no coverage entry for lang={lang!r}")
        if speaker is not None and not os.path.exists(speaker):
            raise FileNotFoundError(f"Reference clip not found: {speaker}")

        device = "auto" if gpu else "cpu"
        model = VoxCPM.from_pretrained(
            MODELS["voxcpm"], load_denoiser=False, device=device
        )
        kwargs = {
            "text": text,
            "cfg_value": 2.0,
            "inference_timesteps": 10,
        }
        if speaker is not None:
            kwargs["reference_wav_path"] = speaker
        wav = model.generate(**kwargs)
        sr = getattr(getattr(model, "tts_model", None), "sample_rate", 24000)
        sf.write(out_path, wav, sr)
        return True
