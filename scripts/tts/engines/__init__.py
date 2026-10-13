"""TTS provider package (new).

Importing this package is side-effect free and must NOT require torch or any
model package. All heavy imports live inside engine methods.
"""

from .base import TtsEngine
from .config import LICENCES, MODELS, PRIORITY
from .registry import (
    ENGINES,
    chain,
    describe,
    get,
    status,
    synthesize,
    synthesize_with_fallback,
)

__all__ = [
    "TtsEngine",
    "LICENCES",
    "MODELS",
    "PRIORITY",
    "ENGINES",
    "chain",
    "describe",
    "get",
    "status",
    "synthesize",
    "synthesize_with_fallback",
]
