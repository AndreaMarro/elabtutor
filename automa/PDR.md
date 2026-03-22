# PDR — Piano di Riferimento ELAB Tutor
**Aggiornato**: 22/03/2026 notte (post-design completo)
**Principio Zero**: L'insegnante è il vero utente. Galileo è un libro intelligente e una guida invisibile — non un professore sostitutivo. Tutti possono insegnare con ELAB Tutor. Apprendimento orizzontale: l'insegnante impara mentre insegna.

---

## ARCHITETTURA AUTOMA

Loop Python (`orchestrator.py`) ogni 2h. 7 check veloci (3 min) → Claude Code headless lavora (25 min) → report. 12 cicli/giorno. Watchdog launchd ogni 10 min. Non si ferma mai.

### Modelli
| Tool | Modello | Ruolo |
|------|---------|-------|
| Claude Code | Opus 4.6 | Lavora: codice, fix, test, deploy, debug, ricerca |
| DeepSeek | deepseek-reasoner (R1) | Ragionamento per judge/scoring classi simulate |
| Gemini | gemini-2.5-pro | Thinking, vision screenshot, ricerca, 1M context |
| Kimi | K2.5 | 128K context, vision, agent swarm, review |
| Brain V13 | Qwen3.5-2B fine-tuned | Routing proprietario (VPS 72.60.129.50) |
| Playwright | — | Test browser reali su simulatore |
| Semantic Scholar | API | Paper scan continuo |
| AutoResearchClaw | — | Deep research su problemi reali |

### API Keys
- DeepSeek: DEEPSEEK_API_KEY (in .env)
- Gemini: GEMINI_API_KEY (in .env)
- Kimi: KIMI_API_KEY (in .env)
- Brain VPS: BRAIN_URL (in .env)

---

## I 16 ASPETTI

### 1. Simulatore funzionalità
Test Playwright: load, play, pause, clearall, Ralph Loop, Passo Passo

### 2. Simulatore estetica
Inline styles → CSS vars, padding grid, colori palette Navy/Lime

### 3. iPad + LIM
Touch ≥56px, font leggibili da 10m (28pt eq.), toolbar no overflow, Scratch portrait stack

### 4. Arduino / Scratch / C++
Blocchi mancanti: serial_read, serial_available, for loop, while loop, custom function, pulseIn, constrain, serial_println. Error message translation layer (20 errori → italiano bambini). Hover block→C++. Serial Monitor input field.

### 5. AI / Galileo
10 test ogni 2h. Classi simulate 5 profili nightly. Brain V13 routing. Prompt improvement continuo.

### 6. Insegnante (UTENTE REALE)
Pre-lezione: Galileo prepara il docente (cosa fare, non teoria). Durante lezione: linguaggio LIM 10-14 anni. Gulpease ≥60. Mai paternalistico. Mai si sostituisce. "Scopriamo insieme."

### 7. Contenuti / Percorso Volumi
62 esperimenti integri. 62 curriculum YAML con: analogie, misconceptions, teacher briefing, vocabolario consentito/vietato per capitolo. Vol1=scoperta, Vol2=comprensione, Vol3=creazione. Galileo non usa mai termini di capitoli futuri.

### 8. Performance
Lighthouse 90+. ElectronView DOM fix (P0). will-change CSS. Bundle splitting. Memory leak check.

### 9. PWA / Offline
vite-plugin-pwa, service worker, Dexie.js IndexedDB, install banner, fallback Galileo offline.

### 10. Sicurezza / Accessibilità
CSP header. axe-core WCAG. Focus-visible. aria-labels SVG. Profanity + injection filter.

### 11. Design / UX
BackstopJS visual regression 3 viewport. Split-attention fix (istruzioni sopra breadboard). First launch <10s. Progressive disclosure.

### 12. i18n
react-i18next. IT + EN + ES. Galileo multilingua. Analogie culturalmente adattate.

### 13. Business / Mercato
Competitor watch (Gemini). PNRR/MePa updates. Pricing research. EdTech Italia.

### 14. Ricerca continua
12 micro-ricerche/giorno (Semantic Scholar + Gemini). AutoResearchClaw per problemi reali. Paper → task concreti. Non ricerca accademica astratta — soluzioni a problemi REALI di ELAB.

### 15. Sistemi locali / velocità
Quantizzazione estrema (IQ2_XS). Speculative decoding. WASM circuit solver. Compile cache (precompiled core). Pi5 benchmark.

### 16. Cluster scuola
Auto-discovery mDNS. Zero install admin. USB deployment. Fault tolerant. Dashboard docente 1 bottone. GDPR locale (zero dati fuori dalla scuola). Exo/Petals/llama.cpp RPC distribuito.

---

## PRIORITÀ

### P0 — Senza questi non si parte
| # | Cosa |
|---|------|
| 1 | Configurare e attivare il loop (`orchestrator.py` + `checks.py` + `tools.py` + `start.sh` + `watchdog.sh` + launchd) |
| 2 | Collegare Brain V13 al nanobot (env var su Render) |
| 3 | Deploy Vercel (fix LED + Electron View) |
| 4 | Riorganizzare MEMORY.md (309→80 righe) + state.json + handoff.md |
| 5 | 7 check veloci funzionanti (health, build, galileo, content, gulpease, browser, iPad) |
| 6 | Curriculum YAML per Vol1 Cap 6 (i primi 3 esperimenti, template per gli altri) |

### P1 — Entro fine settimana
| # | Cosa |
|---|------|
| 7 | Classi simulate funzionanti (5 profili × 60 msg/notte, scoring DeepSeek R1) |
| 8 | iPad/LIM fix (touch 56px, font, split-attention) |
| 9 | PWA offline (service worker + manifest + Dexie.js) |
| 10 | 8 blocchi Scratch mancanti |
| 11 | Error message translation layer (20 errori → italiano) |
| 12 | Teacher pre-lezione mode in Galileo |
| 13 | Vocab checker (Galileo non usa termini futuri) |

### P2 — Settimana 2
| # | Cosa |
|---|------|
| 14 | i18n (EN + ES) |
| 15 | Teacher dashboard skeleton |
| 16 | Hover block→C++ tooltip |
| 17 | Serial Monitor input field |
| 18 | A/B test prompt (Socratic vs Direct) |
| 19 | Brain V14 retraining su dati classi simulate |
| 20 | Visual regression baseline + nightly |

### FUTURO
| # | Cosa |
|---|------|
| 21 | Cluster scuola (auto-discovery, zero install) |
| 22 | Electron View canvas (non SVG, 200+ particelle) |
| 23 | Intent Prediction Engine |
| 24 | Reverse Engineering Challenge mode |
| 25 | AutoResearchClaw paper pedagogico completo |
| 26 | Kolibri content pack |
| 27 | PCB export |
| 28 | 12 lingue |

### SCARTARE / RINVIARE
- claude-octopus (non testato headless, non affidabile nel loop)
- OpenCode nel loop automatico (bug hang #10411)
- Electron packaging
- Multiplayer circuits
- WebLLM in-browser (troppo pesante per PC scuola)

---

## VINCOLI
- Zero regressioni (ogni fix ri-testato)
- Zero compiacenza (numeri reali nei report)
- Skills + Skill Creator + Superpowers usati in ogni ciclo
- Gemini 2.5 Pro DeepThink per decisioni complesse
- Grafici MD giornalieri (score trend, delta, costo)
- ~$20/mese costo totale
- Solo ELAB Tutor + vetrina, mai Netlify
- iPad e LIM come vincoli centrali
- Riordino cartelle PRIMA di tutto

---

## COSTI
| Voce | Costo/mese |
|------|-----------|
| Claude Code | abbonamento (già pagato) |
| DeepSeek R1 | ~$10 (scoring + classi simulate) |
| Gemini 2.5 Pro | $0 (free tier 60 req/min) |
| Kimi K2.5 | $0 (API key) |
| Brain VPS Hostinger | €4 |
| AutoResearchClaw | ~$5 (1 deep research/mese) |
| **TOTALE** | **~$20/mese** |
