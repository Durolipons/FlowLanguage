r"""TTS provider interface (new).

Nothing in the repo implemented engines as classes before -- generation lived in
`gen_kokoro` / `gen_chatterbox` functions. This ABC formalises engines so the
registry can fall back across them (VoxCPM2 -> Kokoro -> Chatterbox -> Piper).
Heavy third-party imports must stay INSIDE methods so merely importing this
package never requires torch/models to be installed.
"""
from abc import ABC, abstractmethod


class TtsEngine(ABC):
    """One speech-synthesis backend."""

    name: str = "base"
    licence: str = "unknown"

    @abstractmethod
    def available(self) -> bool:
        """True if the engine's package (and any required model/voice) can be used here."""

    @abstractmethod
    def supports(self, lang: str) -> bool:
        """True if this engine is expected to handle the language code."""

    @abstractmethod
    def synth(
        self,
        text: str,
        lang: str,
        out_path: str,
        *,
        speaker: "str | None" = None,
        voice: "str | None" = None,
        gpu: bool = False,
    ) -> bool:
        """Write synthesized audio to out_path. Return True on success.

        `speaker` = reference .wav for voice cloning (Chatterbox/VoxCPM2).
        `voice`   = built-in voice id (Kokoro).
        Implementations must let exceptions propagate; the registry treats any
        raise as "engine failed, try the next one".
        """
