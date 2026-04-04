# ELAB Tutor — Contesto per Claude Code

## Cosa e' questo progetto
ELAB e' un tutor educativo per elettronica e Arduino per bambini 8-14 anni.
Il prodotto include kit fisici (3 volumi + componenti) e questo software web.
Live: https://www.elabtutor.school

Include:
- **Simulatore di circuiti** proprietario (CircuitSolver MNA/KCL + AVRBridge avr8js)
- **92 esperimenti** in 3 volumi (38 Vol1 + 27 Vol2 + 27 Vol3)
- **Tutor AI "Galileo"** (chat, voice, messaggi contestuali, report fumetto)
- **Scratch/Blockly** per programmare Arduino visualmente
- **Compilatore Arduino** (C++ -> HEX -> emulazione AVR nel browser)
- **Dashboard docente** con progressi, nudge, export CSV
- **4 giochi didattici** (Detective, POE, Reverse Engineering, Circuit Review)
- **PWA** con service worker e offline support

## Stack tecnico
- React 19 + Vite 7 (NO react-router — routing custom con useState e hash)
- Vitest (1001+ test)
- Deploy: Vercel (frontend) + Supabase (backend DB)
- Nanobot AI: Render (https://elab-galileo.onrender.com)
- Compilatore: n8n su Hostinger (https://n8n.srv1022317.hstgr.cloud/compile)
- CPU emulation: avr8js (ATmega328p nel browser)
- Styling: CSS Modules (preferiti) + inline styles (legacy, da migrare)

## Regole immutabili

### Tecniche
1. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
2. Scala SVG: NanoR4Board SCALE=1.8
3. BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
4. Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
5. `.trim()` su TUTTE le letture di env var (bug Vercel trailing \n)

### Qualita'
6. `npm run build` deve passare prima di ogni deploy
7. `npm run test:ci` deve passare prima di ogni commit
8. Font minimo 13px testi, 10px label secondarie
9. Touch target minimo 44x44px per bottoni interattivi
10. Contrasto WCAG AA: 4.5:1 testo, 3:1 grafici
11. MAI emoji come icone nei componenti — usare ElabIcons.jsx
12. MAI dati finti o demo — tutto deve funzionare con dati reali
13. MAI aggiungere dipendenze npm senza approvazione di Andrea

### Design
14. Target: bambini 8-14 — interfaccia chiara, feedback visivo forte
15. Palette: Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D
16. Font: Oswald (titoli) + Open Sans (body) + Fira Code (codice)

## Collaborazione (multi-developer)
- **Mai pushare su `main` direttamente** — sempre branch + Pull Request
- Branch protection attiva: CI deve passare prima del merge
- Pre-push hook: blocca push su main se il build fallisce
- Branch naming: `feature/`, `fix/`, `style/`, `refactor/`, `docs/`
- Commit format: `tipo(area): descrizione` (es. `feat(unlim): aggiungi nudge vocale`)
- Leggi `CONTRIBUTING.md` per la guida completa
- Leggi `docs/HISTORY.md` per la storia completa del progetto

## File critici — coordinamento OBBLIGATORIO prima di modificare

| File | Righe | Ruolo |
|------|-------|-------|
| `src/components/simulator/engine/CircuitSolver.js` | 2486 | Solver DC MNA/KCL, Gaussian elimination |
| `src/components/simulator/engine/AVRBridge.js` | 1242 | Bridge CPU emulation avr8js, GPIO/ADC/PWM/USART |
| `src/components/simulator/engine/PlacementEngine.js` | 822 | Posizionamento automatico componenti |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | 3149 | Canvas SVG principale, zoom/pan/drag, 21 componenti |
| `src/components/simulator/NewElabSimulator.jsx` | 1022 | Shell simulatore, orchestrazione pannelli |
| `src/services/api.js` | 1040 | Tutte le API calls, routing, retry, fallback chain |
| `src/services/simulator-api.js` | 755 | API globale __ELAB_API, eventi, bridge |
| `src/components/simulator/utils/pinComponentMap.js` | 399 | Pin mapping Union-Find, connettivita' elettrica |
| `vite.config.js` | 293 | Build config, chunk splitting, obfuscation |
| `package.json` | - | Dipendenze — mai modificare senza OK |

## Aree dove si puo' lavorare liberamente
- `src/components/lavagna/` — Redesign lavagna (in corso)
- `src/components/unlim/` — UNLIM mode UI (chat, mascotte, voice)
- `src/components/tutor/` — Tab, giochi didattici, layout
- `src/components/common/` — Componenti condivisi (ElabIcons, Toast, etc.)
- `src/components/dashboard/` — Dashboard docente
- `src/styles/` — CSS globali
- `src/data/lesson-paths/` — Percorsi lezione JSON
- `docs/` — Documentazione
- `tests/` — Test

## API globale simulatore
```javascript
window.__ELAB_API
  .galileo.highlightComponent(['led1', 'r1'])
  .galileo.highlightPin(['nano:D13'])
  .galileo.clearHighlights()
  .galileo.serialWrite('Hello')
  .galileo.getCircuitState()
  .on('experimentChange', callback)
  .on('stateChange', callback)
  .on('serialOutput', callback)
  .on('componentInteract', callback)
  .on('circuitChange', callback)
  .toggleDrawing(true/false)
  .setComponentValue(id, param, value)
  .connectWire(from, to)
  .clearCircuit()
  .mountExperiment(id)
  .getCircuitDescription()
```

## Deploy commands
```bash
# Frontend -> Vercel
npm run build && npx vercel --prod --yes

# Backend -> Supabase
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy --project-ref vxvqalmxqtezvgiboxyv
```

## Infrastruttura
| Servizio | URL |
|----------|-----|
| Frontend | https://www.elabtutor.school (Vercel) |
| Supabase | vxvqalmxqtezvgiboxyv.supabase.co |
| Nanobot AI | https://elab-galileo.onrender.com (Render) |
| Compilatore | https://n8n.srv1022317.hstgr.cloud/compile (Hostinger) |
| Brain V13 | http://72.60.129.50:11434 (VPS, Qwen3.5-2B) |

## Bug aperti prioritari (04/04/2026)
1. **21/27 esp Vol3 senza buildSteps** — mancano le 3 modalita' (Gia' Montato/Passo Passo/Percorso)
2. **Scratch non configurato** — solo 10/92 esperimenti hanno scratchXml
3. **Dashboard senza Supabase configurato** — funziona solo localStorage (no cross-device)
4. **Lavagna** — non salva pagine, non cambia pagina
5. **Componenti touch** — difficili da cliccare/trascinare su iPad
6. **Lesson path** — alcuni con testi mancanti
