# Ricerca Wake Word "Ehi UNLIM" — Costi e Alternative

**Data**: 12/04/2026
**Scopo**: Decisione per presentazione Giovanni Fagherazzi
**Autore**: Claude Code Web per Andrea Marro

## TL;DR

Wake word "Ehi UNLIM" stile "Hey Siri" / "OK Google" **non è economicamente sostenibile** alla scala ELAB (migliaia di studenti). Raccomandazione: usare **attivazione on-tap** (tocco mascotte UNLIM → STT Web Speech API) per MVP. Rimandare wake word vero a quando ELAB ha ricavi stabili.

## Opzioni valutate

### 1. Picovoice Porcupine (on-device, WebAssembly)

**Pro**:
- Funziona offline nel browser via WASM.
- Alta accuratezza, latenza bassa (<50ms).
- Training del modello "Ehi UNLIM" in minuti sul Picovoice Console.
- Non invia audio a server (privacy OK per scuole).

**Contro — costo**:
- Free Tier: **1 MAU** (Monthly Active User). Inutile per produzione.
- Foundation Plan: **$6.000/anno** per 100 MAU (solo startup <5 anni).
- Enterprise: contratti 12 mesi minimo, quote custom ma >> $6k.
- Scala ELAB (ipotesi 1000 classi x 25 studenti = 25.000 MAU) → costo stimato **$150k-500k/anno**. Non sostenibile.

**Sorgenti**:
- https://picovoice.ai/pricing/
- https://picovoice.ai/blog/introducing-picovoices-free-tier/

### 2. Web Speech API continuous (SpeechRecognition)

**Pro**:
- Gratis, nativo nel browser.
- No dipendenze npm (rispetta regola 13 di CLAUDE.md).
- Detection "ehi unlim" via regex sul transcript.

**Contro**:
- Chrome/Edge desktop/Android: OK continuous.
- Safari iOS/iPadOS: `continuous = true` non rispettato, termina dopo ~30s.
- Audio inviato a Google Cloud (GDPR: bambini 8-14 servono consenso genitori + DPA).
- Microfono sempre attivo: batteria iPad ~20-30% in più/ora.
- Falsi positivi alti in classe rumorosa (25 bambini).

### 3. OpenAI Whisper On-Device (whisper.cpp WASM)

**Pro**:
- Gratis, offline, privacy ok.
- Funziona su Mac Mini M4 (se c'è in classe).

**Contro**:
- File modello 75-300 MB da scaricare (PWA gonfia).
- Inference costosa su iPad (CPU limitata, laptop scuola M1 8GB è al limite).
- Non è wake word nativo — serve VAD + finestra mobile.

### 4. Edge TTS + on-tap STT (stato attuale)

**Pro**:
- Zero costo aggiuntivo.
- Gia in produzione (src/services/voiceCommands.js, tts*.js).
- Controllo totale su quando si ascolta → no bolletta audio, no batteria.

**Contro**:
- Serve tocco per parlare. Meno "magico" di "Ehi UNLIM".

## Decisione proposta

**Per lunedì (demo Giovanni)**:
- NO wake word. Dimostra UNLIM via:
  - Tocco mascotte → STT parte.
  - Tocco bottone microfono → registra + invia.
- Messaggio nella presentazione: "Wake word in roadmap Q3 2026, al raggiungimento di 500 licenze attive".

**Roadmap (quando ELAB ha ricavi)**:
- Implementare Porcupine Foundation Plan a 500 MAU pagato.
- Training modello custom "Ehi UNLIM" in italiano.
- Feature flag `VITE_WAKE_WORD_ENABLED` — rollout graduale.

## Costi TTS alternativi (riepilogo per presentazione)

| Servizio | Costo/risposta (50 token) | Qualità | Note |
|----------|---------------------------|---------|------|
| Gemini Native Audio | ~€0.008 | 9/10 | Troppo caro a scala |
| ElevenLabs Flash v2 | ~€0.003 | 8.5/10 | Sweet spot |
| Edge TTS (Azure free) | €0 | 7/10 | In uso oggi |
| Kokoro (Mac Mini M4) | €0 | 8/10 | Richiede hw classe |
| OpenAI TTS | ~€0.005 | 8/10 | Latenza variabile |

## Implementazione attuale ELAB (verificata 12/04)

- `src/services/voiceCommands.js:330` — comandi "crea report", "apri percorso", etc.
- `src/services/voiceService.js` — wrapper STT/TTS.
- Pattern di attivazione: tocco esplicito. Nessun loop continuous audio.

## Gap rimasti (per next session)

1. Wake word NO (deciso sopra, rimandato).
2. STT multi-locale (al momento it-IT, manca fallback en-US per docenti bilingui).
3. Feedback visivo di "sto ascoltando" migliorabile (pulsing mic icon).
4. Rate limit STT (Google applica quota ~50/min per origin) — serve mediator.

---

Firmato: **Andrea Marro Claude Code Web — 12/04/2026**

Sorgenti consultate:
- [Picovoice Porcupine](https://picovoice.ai/platform/porcupine/)
- [Picovoice Pricing](https://picovoice.ai/pricing/)
- [Introducing Picovoice Free Tier](https://picovoice.ai/blog/introducing-picovoices-free-tier/)
- [@picovoice/porcupine-web npm](https://www.npmjs.com/package/@picovoice/porcupine-web)
