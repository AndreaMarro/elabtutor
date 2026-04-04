# ELAB Tutor — Progetto Context

## Cosa e' questo progetto
ELAB e' un tutor educativo per elettronica e Arduino per bambini 8-12 anni. Include:
- **Simulatore di circuiti** proprietario (CircuitSolver + AVRBridge + avr8js)
- **Chat AI "Galileo"** (tutor pedagogico via n8n + Anthropic)
- **62 esperimenti** organizzati in 3 volumi (38 + 18 + 6)
- **Giochi didattici** (Trova il Guasto, Prevedi e Spiega, Circuito Misterioso, Controlla Circuito)

## Stack tecnico
- React 19 + Vite 7 (NO react-router — routing custom con useState)
- Deploy su Vercel
- Backend AI: n8n su Hostinger
- CPU emulation: avr8js (ATmega328p)

## File critici del simulatore (aggiornato 13/02/2026 post-Sprint 3)
```
src/components/simulator/
  NewElabSimulator.jsx         — ~1900 righe (Sprint 3: +BOM, Annotations, Export PNG, Shortcuts)
  engine/CircuitSolver.js      — Solver DC, Union-Find + MNA/KCL (1702 righe)
  engine/SimulationManager.js  — Orchestratore CircuitSolver/AVRBridge (302 righe)
  engine/AVRBridge.js          — Bridge avr8js, GPIO/ADC/PWM/USART + Worker (1051 righe)
  engine/avrWorker.js          — Web Worker per CPU AVR (348 righe)
  canvas/SimulatorCanvas.jsx   — Canvas SVG con zoom/pan/drag (1382 righe)
  canvas/WireRenderer.jsx      — Wire bezier routing + selection + net highlight + current flow animation
  api/AnalyticsWebhook.js      — LIVE: 7 lifecycle events → n8n webhook
  panels/CodeEditorCM6.jsx     — CM6 editor con C++ highlighting (517 righe)
  panels/PropertiesPanel.jsx   — R/C/V/LED properties editor (129 righe)
  panels/GalileoResponsePanel.jsx — Galileo AI response modal (62 righe)
  panels/ExperimentGuide.jsx   — Experiment steps panel (79 righe)
  panels/BomPanel.jsx          — [Sprint 3] Bill of Materials panel (265 righe)
  panels/ShortcutsPanel.jsx    — [Sprint 3] Keyboard shortcuts modal (190 righe)
  components/Annotation.jsx    — [Sprint 3] Draggable canvas annotations (157 righe)
  components/Servo.jsx         — [Sprint 2] Servo motor SVG (153 righe)
  components/LCD16x2.jsx       — [Sprint 2] LCD 16x2 HD44780 (290 righe)
  overlays/PotOverlay.jsx      — Potentiometer rotation knob (104 righe)
  overlays/LdrOverlay.jsx      — LDR light slider (71 righe)
  utils/errorTranslator.js     — GCC error → kid-friendly Italian (75 righe)
  utils/pinComponentMap.js     — Union-Find pin mapping + onPinChange (256 righe)
  utils/breadboardSnap.js      — Breadboard auto-assignment + ID generator (214 righe)
  codeEditor.module.css        — CSS module per code editor
  overlays.module.css          — CSS module per overlays
  layout.module.css            — CSS module per layout + Galileo
```
API globale: `window.__ELAB_API` (unified, include `.galileo` namespace)
- `.galileo.highlightComponent(ids)`, `.galileo.highlightPin(refs)`, `.galileo.clearHighlights()`
- `.galileo.serialWrite(text)`, `.galileo.getCircuitState()`
- `.on(event, callback)`, `.off(event, callback)` — pub/sub
- Events: experimentChange, stateChange, serialOutput, componentInteract, circuitChange

## Regole immutabili
1. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
2. Scala SVG: NanoR4Board uses SCALE=1.8 (rescaled for proportion with breadboard)
3. BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
4. Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
5. Build check: `npm run build` deve passare prima di ogni deploy
6. Target: bambini 8-12 anni — interfaccia chiara, feedback visivo forte

## Palette colori
Navy: #1E4D8C / Lime: #4A7A25 / Vol1: #4A7A25 / Vol2: #E8941C / Vol3: #E54B3D
> Nota: Lime aggiornato #7CB342 → #558B2F (27/03) → #4A7A25 (28/03) per WCAG AA (contrasto 5.12:1 su bianco)

## Skills disponibili
- `arduino-simulator` — compilatore + AVR emulation
- `tinkercad-simulator` — simulatore visuale circuiti
- `nano-breakout` — hardware NanoBreakout V1.1 GP
- `skill-factory` — generazione dinamica skills

## Bug fixati (12/02/2026 sessione 3)
- ✅ PWM duty cycle → LED brightness (SimulationManager.js: float 0.0-1.0 + RGB LED + Motor DC)
- ✅ Resistenze parallele nel CircuitSolver (multi-path collection, MAX_PATHS=8, formula 1/Rtot)
- ✅ Wire individuali eliminabili (click → selezione verde → Delete/Backspace)

## Bug fixati (12/02/2026 sessione 4 — code quality + CoVe agents)
- ✅ onPinChange duplicato 2x → estratto in `createOnPinChangeHandler()` helper (riga 49)
- ✅ Import inutilizzato `emitSimulatorEvent` rimosso
- ✅ Multimeter mode cycling V→Ω→A (click knob)
- ✅ Undo/Redo buttons visibili in ControlBar
- ✅ Net highlighting con Union-Find (click wire → glow intero net)
- ✅ F key fit-to-view shortcut
- ✅ Font size control code editor (+/- buttons)
- ✅ Baud rate bridge AVR→SerialMonitor
- ✅ Serial timestamps toggle
- ✅ avrReady rimosso da dependency array handlePlay

## Sprint 1 COMPLETED (12/02/2026)
- ✅ Dead code: 2,566 LOC deleted (7 files)
- ✅ God component: 3,507 → 1,831 LOC (9 files extracted)
- ✅ CSS: 3 module files (codeEditor, overlays, layout)
- ✅ getAutoWireColor unified in WireRenderer
- ✅ GalileoAPI merged into __ELAB_API.galileo (GalileoAPI.js deleted)
- ✅ Analytics: 7 lifecycle events wired to n8n webhook
- ✅ Event system: 5 event types with on/off pub/sub
- ✅ API unified: single __ELAB_API (no more duplicate ElabSimulator)

## Sprint 2 COMPLETED (13/02/2026)
- ✅ KCL/MNA solver (Gaussian elimination + partial pivoting, LED voltage source model)
- ✅ Multimeter Ω/A modes (BFS resistance trace, current calculation)
- ✅ Wire bezier routing (CORNER_RADIUS=5, collinear detection, adaptive radius)
- ✅ Current flow animation (direction-aware, speed∝current, gold/orange/red color coding)
- ✅ Multimeter probe drag (snap-to-pin, solver integration, visual glow)
- ✅ Multi-select (Shift+click, drag-box, multi-delete, multi-move)
- ✅ Copy/Paste/Duplicate (Ctrl+C/V/D, ID remapping, internal wire cloning)
- ✅ Web Worker per CPU AVR (pin batching 16ms, PWM 50ms, fallback main-thread)
- ✅ Servo component (SVG rotating horn, PWM→angle, registered in registry)
- ✅ LCD 16×2 component (5×7 font 95 chars, HD44780 4-bit mode, E falling edge)
- ✅ 21 SVG components (was 19: +Servo, +LCD16x2)
- ✅ Parallel circuits ~90%+ accurate (MNA) — was ~50-60%
- ✅ Tinkercad parity: ~45/56 features (80%)

## Sprint 3 COMPLETED (13/02/2026) — Polish & Deploy
- ✅ BOM Panel (265 LOC) — tabella componenti con icona, nome, quantità, valori
- ✅ Annotations (157 LOC) — note draggabili SVG sul canvas (#FFF9C4 sticky-note)
- ✅ Export PNG — screenshot circuito via SVG serialization, download automatico
- ✅ Shortcuts Panel (190 LOC) — modal con tutte le scorciatoie tastiera (3 categorie)
- ✅ ControlBar aggiornato — 3 nuovi bottoni: 📋 BOM, 📷 Foto, ⌨ Tasti
- ✅ Bundle optimization — code splitting via manualChunks (CodeMirror, AVR, React)
  - Chunk principale: 1,757 KB → 1,305 KB (-26%)
  - Build time: 5.40s → 4.35s (-19%)
- ✅ Test E2E: 68/69 esperimenti PASS (solo v1-cap13-esp2 senza pinAssignments)
- ✅ Test integrazione: 36/41 PASS (5 false negative per naming)
- ✅ Deployed to Vercel: https://elab-builder.vercel.app

## Bug fixati in Sprint 2 (ex P0/P1)
- ✅ Multimeter probe draggabili (snap-to-pin + solver integration)
- ✅ KCL implementato (paralleli ~90%+ accuracy)
- ✅ Multi-select componenti
- ✅ Copy/paste/duplicate
- ✅ Wire bezier routing
- ✅ Current flow animation
- ✅ Web Worker per CPU
- ✅ Servo/LCD components

## Collaborazione (multi-developer)
- **Mai pushare su `main` direttamente** — sempre branch + PR
- Branch naming: `feature/`, `fix/`, `style/`, `refactor/`, `docs/`
- Commit format: `tipo(area): descrizione` (es. `feat(unlim): aggiungi nudge vocale`)
- **Prima di ogni commit**: `npm run test:ci && npm run build`
- **File protetti** (coordinamento obbligatorio prima di modificare): CircuitSolver.js, AVRBridge.js, SimulationManager.js, SimulatorCanvas.jsx, simulator-api.js, pinComponentMap.js, vite.config.js, package.json
- **Mai aggiungere dipendenze npm** senza approvazione di Andrea
- Leggi CONTRIBUTING.md per la guida completa

## Bug noti (residui)
### P2 NICE-TO-HAVE
- Simulation speed slider
- Component mirroring
- Servo.h/LiquidCrystal.h compilation (dipende dal compiler remoto n8n)
- RC transient simulation
- Wire color picker
- Component labels

## Piano Agent Teams — COMPLETATO
- Vedi: `/Users/andreamarro/VOLUME 3/piano-agent-teams-12feb.md`
- 3 Sprint: Foundation → Features → Polish & Deploy
- **Sprint 1: COMPLETED** — cleanup + refactor + integration (3 agenti)
- **Sprint 2: COMPLETED** — visual + wire + arduino + solver (4 agenti)
- **Sprint 3: COMPLETED** — polish + test + deploy (3 agenti)
