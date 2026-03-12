# CoV Tracking — Overnight Sprint

## Metodo
Dopo OGNI fase, compila questa checklist. Se anche UN punto fallisce, STOP e correggi prima di procedere.

---

## FASE 0 — Build Health
| # | Check | Status | Note |
|---|-------|--------|------|
| 0.1 | `npm run build` 0 errori | | |
| 0.2 | Main chunk < 350KB gzip | | |
| 0.3 | ScratchEditor < 250KB gzip | | |
| 0.4 | 0 warning critici | | |

## FASE 1 — NanoR4Board SVG
| # | Check | Status | Note |
|---|-------|--------|------|
| 1.1 | Build 0 errori | | |
| 1.2 | Outline semicerchio + nano slot + wing | | |
| 1.3 | Arduino Nano R4 dettagli realistici | | |
| 1.4 | 15 top header pins + label | | |
| 1.5 | 15 bottom header pins + label | | |
| 1.6 | 17 wing pins + label | | |
| 1.7 | 4 power bus pads (+/-/+/-) | | |
| 1.8 | Reset button interattivo | | |
| 1.9 | Status LEDs funzionali | | |
| 1.10 | Running indicator | | |
| 1.11 | LED glow | | |
| 1.12 | Pin positions IMMUTATE (47 pin) | | |

## FASE 2 — Simon Game
| # | Check | Status | Note |
|---|-------|--------|------|
| 2.1 | Simon carica senza errori | | |
| 2.2 | 4 LED visibili e posizionati | | |
| 2.3 | 4 pulsanti visibili e posizionati | | |
| 2.4 | Buzzer presente | | |
| 2.5 | Wiring corretto (wing → breadboard) | | |
| 2.6 | Scratch XML → C++ valido | | |
| 2.7 | "Gia Montato" funziona | | |
| 2.8 | "Passo Passo" funziona | | |
| 2.9 | Build 0 errori | | |

## FASE 3 — Tutti gli Esperimenti
| # | Check | Status | Note |
|---|-------|--------|------|
| 3.1 | Vol1: 38/38 caricano senza errori | | |
| 3.2 | Vol2: 18/18 caricano senza errori | | |
| 3.3 | Vol3: 14/14 caricano senza errori | | |
| 3.4 | Scratch tab su 12/14 AVR | | |
| 3.5 | "Gia Montato" funziona su tutti | | |
| 3.6 | Build 0 errori | | |

## FASE 4 — Circuit Solver Responsive
| # | Check | Status | Note |
|---|-------|--------|------|
| 4.1 | Visibile a 375px | | |
| 4.2 | Visibile a 768px | | |
| 4.3 | Visibile a 1280px | | |
| 4.4 | Pin coerenti dopo resize | | |
| 4.5 | Build 0 errori | | |

## FASE 5 — Scratch Compile
| # | Check | Status | Note |
|---|-------|--------|------|
| 5.1 | Side-by-side visibile | | |
| 5.2 | Compilazione produce output | | |
| 5.3 | v3-cap6-blink codice valido | | |
| 5.4 | Build 0 errori | | |

## FASE 6 — Skills
| # | Check | Status | Note |
|---|-------|--------|------|
| 6.1 | nano-breakout SKILL.md creato | | |
| 6.2 | Path corretti | | |
| 6.3 | Costanti documentate | | |
| 6.4 | Build/test commands OK | | |

## FASE 7 — Deploy & Push
| # | Check | Status | Note |
|---|-------|--------|------|
| 7.1 | Build 0 errori finale | | |
| 7.2 | Vercel deploy OK | | |
| 7.3 | Git push OK | | |
| 7.4 | Tutti i file committati | | |
| 7.5 | Nessuna regressione | | |
