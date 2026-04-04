# ELAB Tutor — Simulatore di Circuiti per Scuole

**Tutor educativo per elettronica e Arduino, bambini 8-14 anni.**

Live: https://www.elabtutor.school

## Cosa fa ELAB

ELAB e' un prodotto completo per l'insegnamento dell'elettronica nelle scuole:

- **Simulatore di circuiti** proprietario con 92 esperimenti in 3 volumi
- **Tutor AI "Galileo"** che guida lo studente passo passo
- **Scratch/Blockly** per programmare Arduino visualmente
- **Compilatore Arduino** (C++ -> HEX -> emulazione AVR in browser)
- **Dashboard docente** con tracciamento progressi e report
- **4 giochi didattici** (Trova il Guasto, Prevedi e Spiega, Circuito Misterioso, Controlla Circuito)
- **PWA** funzionante offline
- **Report "fumetto"** della lezione stampabile in PDF

## Quick Start

```bash
git clone https://github.com/AndreaMarro/elabtutor.git
cd elabtutor
npm install
npm run dev        # http://localhost:5173
npm run test:ci    # 1001 test
npm run build      # Build produzione
```

## Stack

| Tecnologia | Ruolo |
|-----------|-------|
| React 19 + Vite 7 | Frontend |
| Vitest | Test (1001+) |
| Vercel | Deploy produzione |
| Supabase | Backend (DB + Edge Functions) |
| avr8js | Emulazione CPU Arduino ATmega328p |
| CSS Modules | Styling |
| Workbox | PWA / Service Worker |

**Nota**: NON usiamo react-router. Il routing e' custom con useState e hash (#admin, #login, etc.).

## Struttura progetto

```
src/
  components/
    simulator/              <- CORE: simulatore di circuiti
      engine/               <- CircuitSolver (MNA/KCL), AVRBridge, PlacementEngine
      canvas/               <- SVG canvas, wire bezier routing, DrawingOverlay
      components/           <- 21 componenti SVG (LED, resistore, Arduino, breadboard...)
      panels/               <- Code editor, properties, serial monitor, Scratch
      hooks/                <- useCircuitHandlers, useSimulatorAPI, useExperimentLoader
      utils/                <- Pin mapping, breadboard snap, error translator, HEX cache
    lavagna/                <- Redesign interfaccia "Lavagna" (IN CORSO)
    unlim/                  <- UNLIM mode: chat AI, mascotte, voice, report fumetto
    tutor/                  <- ElabTutorV4 (shell principale), tab, giochi
    dashboard/              <- Dashboard docente (TeacherDashboard)
    admin/                  <- Admin panel + gestionale ERP
    common/                 <- ElabIcons, ConfirmModal, ConsentBanner, Toast
    auth/                   <- Login, RequireLicense
  data/
    experiments-vol1.js     <- 38 esperimenti Volume 1 (circuiti passivi)
    experiments-vol2.js     <- 18 esperimenti Volume 2 (condensatori, transistor)
    experiments-vol3.js     <- 27 esperimenti Volume 3 (Arduino, codice)
    lesson-paths/           <- 62 percorsi lezione JSON
  services/
    api.js                  <- API calls (chat, compile, diagnose, hints)
    voiceCommands.js        <- 24 comandi vocali
    simulator-api.js        <- window.__ELAB_API (API globale simulatore)
    supabaseSync.js         <- Sync sessioni con Supabase (offline queue)
    unlimMemory.js          <- Memoria 3-tier (local + Supabase + nanobot)
  hooks/                    <- useSessionTracker, useTTS, useSTT
  context/AuthContext.jsx   <- Autenticazione + ruoli
  styles/design-system.css  <- CSS variables, palette, tipografia
```

## I 3 Volumi

| Volume | Esperimenti | Tipo | Colore |
|--------|------------|------|--------|
| Vol. 1 | 38 | Circuiti passivi (LED, resistori, parallelo/serie) | Lime #4A7A25 |
| Vol. 2 | 27 | Condensatori, transistor, RC, scarica esponenziale | Orange #E8941C |
| Vol. 3 | 27 | Arduino (digitalWrite, analogRead, PWM, Servo, LCD) | Red #E54B3D |

## Palette colori

| Colore | HEX | Uso |
|--------|-----|-----|
| Navy | #1E4D8C | Primario, header, testi principali |
| Lime | #4A7A25 | Volume 1, azioni positive |
| Orange | #E8941C | Volume 2, warning |
| Red | #E54B3D | Volume 3, errori |

Font: Oswald (titoli) + Open Sans (body) + Fira Code (codice)

## Deploy

```bash
# Frontend
npm run build && npx vercel --prod --yes

# Backend Supabase
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref vxvqalmxqtezvgiboxyv
```

## Regole per sviluppatori

Leggi CONTRIBUTING.md per le regole complete. In breve:

1. Mai push su main — sempre branch + Pull Request
2. Mai dati finti — tutto deve funzionare con dati reali
3. Mai emoji nei componenti — usa ElabIcons.jsx
4. Sempre npm run test:ci && npm run build prima di pushare
5. Target: bambini 8-14 — testi semplici, bottoni grandi (44x44px min)
6. WCAG AA: contrasto minimo 4.5:1, font minimo 13px

## Licenza

Proprietario. Andrea Marro 2026. Tutti i diritti riservati.
