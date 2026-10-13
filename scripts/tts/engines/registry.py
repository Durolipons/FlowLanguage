# Provider registry + fallback chain (deliverable #4).
#
# Order is fixed by config.PRIORITY:
#   VoxCPM2 -> Kokoro -> Chatterbox -> Piper  (Piper LAST: YELLOW licence)
#
# Usage:
#   from engines import synthesize_with_fallback, synthesize
#   used = synthesize_with_fallback("hola", "es", "out.wav", speaker="ref.wav")
#
# Importing this module must be side-effect free (no torch, no model loads).
from typing import TYPE_CHECKING

from .base import TtsEngine
from .config import LICENCES, MODELS, PRIORITY


def _load(name: str) -> "TtsEngine":
    if name == "voxcpm":
        from .voxcpm_engine import VoxCPM2Engine

        return VoxCPM2Engine()
    if name == "kokoro":
        from .kokoro_engine import KokoroEngine

        return KokoroEngine()
    if name == "chatterbox":
        from .chatterbox_engine import ChatterboxEngine

        return ChatterboxEngine()
    if name == "piper":
        from .piper_engine import PiperEngine

        return PiperEngine()
    raise ValueError(f"Unknown TTS engine: {name!r}")


def get(name: str) -> "TtsEngine":
    """Return the provider for a single engine name (cached instance)."""
    return _engine(name)


def chain(priority: "list[str] | None" = None) -> "list[TtsEngine]":
    """Providers in fallback order (defaults to config.PRIORITY)."""
    return [_load(n) for n in (priority or PRIORITY)]


#: Provider registry (deliverable #4): name -> loaded engine instance.
ENGINES: "dict[str, TtsEngine]" = {}


def _engine(name: str) -> "TtsEngine":
    if name not in ENGINES:
        ENGINES[name] = _load(name)
    return ENGINES[name]


def describe() -> dict:
    """Updated configuration snapshot (deliverable #3)."""
    return {"priority": list(PRIORITY), "models": dict(MODELS), "licences": dict(LICENCES)}


def status() -> "list[dict]":
    """Availability snapshot: [{name, licence, model, available}]. Never raises."""
    rows = []
    for name in PRIORITY:
        try:
            eng = _engine(name)
            available = bool(eng.available())
        except Exception:
            available = False
            eng = None
        rows.append(
            {
                "name": name,
                "licence": (eng.licence if eng else LICENCES.get(name, "unknown")),
                "model": MODELS.get(name, "unknown"),
                "available": available,
            }
        )
    return rows


def synthesize(engine: str, text: str, lang: str, out_path: str, **kw) -> bool:
    """Run one named engine once. Raises on failure."""
    return bool(_engine(engine).synth(text, lang, out_path, **kw))


def synthesize_with_fallback(
    text: str,
    lang: str,
    out_path: str,
    priority: "list[str] | None" = None,
    **kw,
) -> "str":
    """Try engines in priority order. Returns the engine name that produced audio.

    Engines that do not support the language or are not installed are skipped
    silently. Raises RuntimeError if every engine in the chain failed.
    """
    failures: "list[str]" = []
    for engine in chain(priority):
        try:
            if not engine.available():
                continue
            if not engine.supports(lang):
                continue
            if engine.synth(text, lang, out_path, **kw):
                return engine.name
        except Exception as e:  # noqa: BLE001 - fallback must survive anything
            failures.append(f"{engine.name}: {e}")
    raise RuntimeError(
        "All TTS engines in the chain failed for "
        f"lang={lang!r}. Details: {'; '.join(failures) or 'no engine available'}"
    )
