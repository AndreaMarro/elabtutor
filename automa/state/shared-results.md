# RISULTATI CONDIVISI — Tutti i task leggono e scrivono qui
© Andrea Marro — ELAB Tutor
Ultimo aggiornamento: 2026-03-25 22:45

---

## REGOLA
Ogni scheduled task e l'automa Python APPENDONO i loro risultati qui.
NON sovrascrivere — solo appendere alla fine.
Formato: ## [nome-task] YYYY-MM-DD HH:MM → risultati strutturati

## STATO ATTUALE SISTEMA
- Score: 0.9471
- Build: OK (1m 4s)
- Bundle: 51 KB main
- Fix reali: ConsentBanner CLS, Google Fonts, font LIM, landing /scuole, lazy-load, DOMPurify
- Automa: PID 24834, loop ogni 10min
- Queue: 2 P0 + 8 P1

---

## [Ciclo 36] RESEARCH — 2026-03-26 13:15
- Cosa fatto: Ricerca innovazione EdTech — analizzati 8 fonti accademiche (Stanford Tutor CoPilot RCT, Harvard AI tutoring, npj systematic review, GenAI EE tutors, CADRE microelectronics, trend 2026)
- File modificati: automa/knowledge/research-cycle-36.md (nuovo)
- Finding principali:
  - F1: Stanford Tutor CoPilot conferma Principio Zero — AI che supporta il docente > AI che sostituisce (+9% mastery per inesperti, $20/anno)
  - F2: Middle school (10-14 anni) è la fascia dove ITS hanno effetti meno significativi — servono scaffold specifici
  - F3: Prompt strutturati → risposte AI migliori (vantaggio curriculum YAML di ELAB)
  - F4: 2026 = anno consolidamento abitudini AI nelle scuole (timing perfetto per ELAB)
- Opportunità: O1 Galileo multi-suggerimento (medium), O2 scaffold progressivo (medium), O3 articolo marketing Stanford-ELAB (low)
- Lesson: La ricerca Stanford valida scientificamente il modello ELAB. Il gap middle school suggerisce che ELAB deve investire in scaffold calibrati per 10-14 anni, non copiare pattern da high school/università.

## [Ciclo 37] IMPROVE — 2026-03-26 13:30
- Cosa fatto: Lighthouse LCP — deferred 3 heavy imports from main bundle
  - PrivacyPolicy (1339 LOC) → React.lazy() (only used on /privacy path)
  - Buffer polyfill → requestIdleCallback (only needed by react-pdf, already lazy)
  - mobile-drag-drop → requestIdleCallback (only needed for touch-device simulator)
- File modificati: src/App.jsx, src/main.jsx
- Risultato: index chunk 675 KB → 478 KB (**-29%**, -197 KB)
- Build: PASS (18.57s)
- Lesson: Polyfills importati staticamente che servono solo a moduli lazy-loaded sono sprechi sul critical path. requestIdleCallback con fallback setTimeout è il pattern sicuro per deferire.

## [Ciclo 38] IMPROVE — 2026-03-26 13:15
- Cosa fatto: Fixed 9 relatedExperiment IDs in unlim-knowledge-base.js (100% were broken offline)
- Mapping: cap1-led-semplice→v1-cap6-esp1, cap7-led-rgb→v1-cap7-esp1, cap6-pulsante→v1-cap8-esp1, cap3-potenziometro→v1-cap9-esp1, cap4-buzzer→v1-cap11-esp1, cap5-fotoresistenza→v1-cap10-esp1, cap8-servo→v3-extra-servo-sweep, cap9-motor-dc→v2-cap10-esp1, cap10-lcd→v3-extra-lcd-hello
- File modificati: src/data/unlim-knowledge-base.js
- Build: PASS (19.10s)
- Lesson: Knowledge base IDs were authored with a fictional naming convention that never matched the actual experiment ID schema (v{vol}-cap{ch}-esp{n}). Cross-validation between data files is essential.

## [smoke-test-agent] 2026-03-26 20:53
- Automa: PID 56062 (running)
- Build: PASS (last chunk: dist/workbox-354287e6.js)
- Questo test FUNZIONA
