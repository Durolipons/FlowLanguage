# FlowLanguage — TTS Licence Audit

**Date:** 13 October 2026
**Scope:** Every TTS engine referenced by FlowLanguage's Course Generation Layer (Kokoro, Chatterbox, Piper) plus the new candidate (VoxCPM2).
**Method:** Licences verified directly against primary sources — GitHub `LICENSE` files and Hugging Face model-card `license` fields (not third-party summaries). Cross-checked against the Cartesia open-source TTS licence comparison (Oct 2026).

> ⚠️ **This document is a licence survey, not legal advice.** For a shipped commercial product, have counsel review especially the Piper voice terms.

---

## 1. Executive summary

| Finding | Result |
|---|---|
| **RED (blocking) engines in stack** | **None** |
| GREEN (Apache 2.0 / MIT) | Kokoro · Chatterbox · VoxCPM2 |
| YELLOW (conditional) | **Piper** — GPL-3.0 engine + **per-voice** licences |
| Removed as RED | XTTS-v2 (Coqui) · F5-TTS weights (both non-commercial) |
| **Recommended default engine** | **VoxCPM2** (Apache 2.0, 30 languages incl. Polish) |

All four licence classifications supplied for this audit were **independently verified and confirmed correct.**

---

## 2. Summary table

| Engine | Repository | Model | Licence | Commercial Use | Redistribution Allowed | Risk |
|--------|-----------|-------|---------|----------------|------------------------|------|
| **Kokoro** | `github.com/hexgrad/kokoro` | `hexgrad/Kokoro-82M` (v1.0) | **Apache 2.0** (code + weights) | ✅ Yes | ✅ Yes | 🟢 GREEN |
| **Chatterbox** | `github.com/Resemble-AI/chatterbox` | `ResembleAI/chatterbox` (Multilingual V3, 500M) | **MIT** (code + model) | ✅ Yes | ✅ Yes | 🟢 GREEN |
| **Piper** | `github.com/OHF-Voice/piper1-gpl` | **per-voice** (e.g. `rhasspy/piper-voices`) | **GPL-3.0** engine; **voices vary** | ⚠️ Conditional | ⚠️ Conditional | 🟡 YELLOW |
| **VoxCPM2** | `github.com/OpenBMB/VoxCPM` | `openbmb/VoxCPM2` (2.29B) | **Apache 2.0** (code + weights) | ✅ Yes | ✅ Yes | 🟢 GREEN |

### Risk levels
- 🟢 **GREEN** — Apache 2.0 or MIT (or equivalent permissive): commercial use **and** redistribution permitted.
- 🟡 **YELLOW** — unclear model licence and/or unclear redistribution rights: verify before shipping.
- 🔴 **RED** — non-commercial, restricted, or incompatible with commercial release (must not ship).

---

## 3. Compliance report (commercial use)

| Engine | In stack | Licence verified | Commercial-safe | Action required |
|--------|----------|------------------|-----------------|-----------------|
| Kokoro | ✅ | ✅ Apache 2.0 | ✅ Yes | None |
| Chatterbox | ✅ | ✅ MIT | ✅ Yes | None (output is watermarked — imperceptible, not a licence term) |
| Piper | ⬚ future path | ✅ GPL-3.0 + per-voice | ⚠️ Conditional | Verify **every** voice model's licence before adding |
| VoxCPM2 | ✅ candidate | ✅ Apache 2.0 | ✅ Yes | None |

**Voices flagged as not clearly commercial-safe:** none currently installed (Piper voices present: 0). Any future Piper voice not clearly CC0 / CC-BY (or explicitly permissive) must be treated 🔴 until verified.

---

## 4. Per-engine detail

### 🟢 Kokoro
- **Repository:** https://github.com/hexgrad/kokoro — `LICENSE` = **Apache-2.0**.
- **Model:** https://huggingface.co/hexgrad/Kokoro-82M — HF field `License: apache-2.0`. Version **v1.0** (2025-01-27), SHA256 `496dba118d…`.
- **Licence files:** Apache 2.0 covers both code and weights ("With Apache-licensed weights, Kokoro can be deployed anywhere").
- **Redistribution rights:** ✅ Apache 2.0 expressly permits redistribution of code and weights.
- **Commercial use:** ✅ Explicitly encouraged ("Apache-licensed model… commercial APIs… welcome real use cases").
- **Training data:** "trained exclusively on permissive/non-copyrighted audio" plus two CC BY corpora (SIWIS, Koniwa) with attribution noted on the card. Low infringement risk.
- **Languages:** 8 — en, es, fr, hi, it, pt, ja, zh. **Does NOT include Polish.**

### 🟢 Chatterbox
- **Repository:** https://github.com/Resemble-AI/chatterbox — `LICENSE` = **MIT**.
- **Model:** https://huggingface.co/ResembleAI/chatterbox — HF field `License: mit`. Current: **Chatterbox Multilingual V3** (500M, 23 languages).
- **Licence files:** MIT covers code and model weights.
- **Redistribution rights:** ✅ MIT permits commercial use and redistribution.
- **Commercial use:** ✅ MIT. Every output carries an imperceptible **PerTh watermark** — a responsible-AI measure, **not** a licence restriction (you may freely use, edit, and redistribute outputs).
- **Note:** the HF card shows the current multilingual API — `ChatterboxMultilingualTTS.from_pretrained(device, t3_model="v3")`, `generate(text, language_id=…)`. Our `generate_dialogues.py` matches this.

### 🟡 Piper
- **Repository:** https://github.com/OHF-Voice/piper1-gpl — `LICENSE` = **GPL-3.0**. (The legacy `rhasspy/piper` was MIT but is **archived/read-only since Oct 2025** — do not target it.)
- **Voice models:** licensed **individually** — each voice ships a `MODEL_CARD` with its own licence. Common: **CC BY 4.0** (redistributable *with attribution*). Some voices were trained on corpora whose licences are **unclear** (e.g. "Blizzard" — see `rhasspy/piper` Discussion #271), making those voices 🟡/🔴 until traced.
- **Commercial use of engine:** GPL-3.0 permits commercial use, **but** distributing the engine triggers copyleft (release source under GPL). FlowLanguage ships only pre-generated WAVs, **not** the Piper engine, so GPL is understood not to reach the app — *interpretation, not legal advice.*
- **Redistribution of voices:** depends entirely on the per-voice licence (CC BY = yes with attribution; unclear = verify).

### 🟢 VoxCPM2
- **Repository:** https://github.com/OpenBMB/VoxCPM — `LICENSE` = **Apache-2.0** (code).
- **Model:** https://huggingface.co/openbmb/VoxCPM2 — HF field `license:apache-2.0`. README: *"VoxCPM model weights and code are open-sourced under the Apache-2.0 license."*
- **Redistribution rights:** ✅ Apache 2.0 covers code and weights.
- **Commercial use:** ✅ Yes. **Caveat:** voice-cloning misuse warning — VoxCPM asks that synthetic speech be clearly marked as AI-generated; this is guidance, **not** a licence restriction.
- **Languages:** **30**, including **en, es, fr, de, and pl (Polish)** — fills Kokoro's Polish gap.
- **Size / cost:** 2.29B params (~4.6 GB safetensors), GPU recommended.
- **Note:** training-data provenance is not itemised on the model card; if you need enterprise-grade assurance, review the technical report (arXiv:2606.06928). Stated licence is Apache-2.0.

---

## 5. Piper voice report

**No Piper voice models are currently installed in this project.** Piper is a documented low-resource path only — there is no Piper integration in `scripts/tts/` and no `.onnx`/`.onnx.json` voice files anywhere in the repo. Report is therefore empty; use this format when voices are added:

| voice | licence | commercial_use | redistributable |
|-------|---------|----------------|-----------------|
| *(none installed)* | — | — | — |

**Flag rule:** a Piper voice is 🔴 until its `MODEL_CARD` licence is clearly **CC0** or **CC-BY** (or another permissive licence) **and** its training-corpus licence is traceable. Voices trained on "unclear"/"Blizzard" data (Discussion #271) stay flagged.

---

## 6. Removed engines (context)

- 🔴 **XTTS-v2 (Coqui)** — Coqui Public Model License: *"allows only non-commercial use of a machine learning model and its outputs."* **REMOVED** — outputs inherit the restriction.
- 🔴 **F5-TTS** — weights are non-commercial. Never added.
- 🔴 **Fish Audio S2 Pro / Breeze TTS 2** — research/non-commercial weights. Not in stack.

---

## 7. Recommendation for default engine

1. **Default: VoxCPM2** — Apache 2.0 (commercial-safe), **30 languages including Polish**, high quality, voice cloning/design. Best all-round coverage. *Cost caveat:* ~4.6 GB weights, GPU recommended.
2. **Fast/light default (CI or CPU): Kokoro** — Apache 2.0, 82M params, near-zero cost; ideal for bulk vocabulary in its 8 languages.
3. **Expressive dialogues: Chatterbox** — MIT, per-speaker cloning (what `generate_dialogues.py` already uses).
4. **Last resort: Piper** — only for languages none of the above cover; **verify each voice's licence** first (🟡).

**Specified fallback chain:** `VoxCPM2 → Kokoro → Chatterbox → Piper` — licence-safe as written, with Piper correctly last.

> **Runtime note:** the shipped app never executes these engines. It plays pre-generated WAVs and falls back to **on-device TTS**, so the audited licences apply only to the offline generation step and the generated files (all permissive here).

