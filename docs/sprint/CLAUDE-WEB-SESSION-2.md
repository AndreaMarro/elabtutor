# ISTRUZIONI PER CLAUDE CODE WEB — Sprint 2

> Leggi PRIMA di fare qualsiasi cosa.
> Questa sessione lavora IN PARALLELO con Claude Code Terminal.
> I due si comunicano via docs/sprint/S2-PROGRESS.md

## CHI SEI

Sei Claude Code Web, sessione di Andrea Marro per ELAB Tutor.
Lavori in parallelo con Claude Code Terminal che gestisce agenti su worktree.

## COME COMUNICARE

1. **PRIMA di iniziare**: fai `git pull origin main` e leggi `docs/sprint/S2-PROGRESS.md`
2. **DURANTE**: aggiorna S2-PROGRESS.md con il tuo stato ogni 30 minuti
3. **PRIMA di ogni commit**: fai `git pull origin main` per integrare il lavoro dell'altro
4. **SEMPRE su branch**: `sprint/web-s2-[nome-task]`, MAI su main

## I TUOI TASK (in ordine di priorità)

### TASK A: Flusso "Bentornati" — Principio Zero (IL PIÙ IMPORTANTE)

Il docente apre ELAB sulla LIM. OGGI non succede niente — deve scegliere da solo.
DOMANI (lunedì riunione!) UNLIM deve dire: "Bentornati! L'ultima volta avete fatto [X]. Oggi vi propongo [Y]."

**File da modificare**: `src/components/lavagna/LavagnaShell.jsx`
**Come funziona**:
1. Al mount, LavagnaShell legge unlimMemory per ottenere l'ultimo esperimento fatto
2. Legge lesson-paths/index.js per trovare il next_experiment
3. Mostra un overlay UNLIM con: "Bentornati! Oggi facciamo [titolo]"
4. Il docente può accettare o scegliere altro

**NON toccare**: ExperimentPicker.jsx (lo sta facendo Terminal), experiments-vol*.js, api.js

### TASK B: Verifica ScratchXml in Blockly Runtime

29 scratchXml generati da AI. NESSUNO testato.

**Come testare**:
1. Apri elabtutor.school su Chrome (usa Control Chrome MCP se disponibile)
2. Seleziona un esperimento Vol3 con scratchXml (es. v3-cap5-esp1 Blink)
3. Apri la modalità Scratch
4. Verifica che i blocchi si caricano correttamente
5. Se non funzionano: documenta COSA non funziona in S2-PROGRESS.md

### TASK C: Test UNLIM Onniscienza (20 domande)

Testa se UNLIM sa rispondere su esperimenti specifici:

```bash
curl -s -X POST "https://elab-galileo.onrender.com/tutor-chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Cosa serve per l esperimento Accendi il tuo primo LED?","experimentId":"v1-cap6-esp1","sessionId":"test-web"}'
```

Fai 20 domande diverse su esperimenti diversi. Verifica che UNLIM:
- Conosca i componenti necessari
- Sappia spiegare il concetto
- Usi linguaggio 10-14 anni
- Non inventi cose che non ci sono

**Output**: docs/sprint/AUDIT-UNLIM-20-DOMANDE.md

### TASK D: Audit UX su Chrome Reale

Apri https://www.elabtutor.school e fai il percorso del docente:
1. Homepage → cosa vede?
2. Sceglie Vol 1 → esperimenti visibili?
3. Apre esperimento → buildSteps funzionano?
4. Scratch → si apre?
5. Voce → funziona? (se possibile testare)
6. Report → si genera?

**Output**: docs/sprint/AUDIT-UX-REALE.md con screenshot se possibile

## REGOLE

- **NO push su main** — sempre branch
- **git pull prima di ogni commit** — evita conflitti
- **Prova oggettiva per ogni task** — output curl, screenshot, o test pass
- **Aggiorna S2-PROGRESS.md** — così Terminal sa cosa stai facendo
- **Se trovi un bug**: documentalo in S2-PROGRESS.md, NON fixarlo se tocca file che Terminal sta modificando

## FILE CHE NON DEVI TOCCARE (Terminal li sta usando)

- src/components/lavagna/ExperimentPicker.jsx (Terminal: chapter-map UI)
- src/components/VetrinaSimulatore.jsx (Terminal: chapter-map UI)
- src/data/experiments-vol*.js (Terminal: worktree)
- src/data/chapter-map.js (Terminal: worktree)

## FILE CHE PUOI TOCCARE

- src/components/lavagna/LavagnaShell.jsx (flusso bentornati — SOLO TU)
- src/components/lavagna/LavagnaShell.module.css
- docs/sprint/*.md (report)
- tests/ (nuovi test)

## CONTESTO TECNICO

- Build: `npm run build` (Vite 7, React 19)
- Test: `npx vitest run` (2110 pass)
- Deploy: `npx vercel --prod --yes`
- Nanobot chat: POST https://elab-galileo.onrender.com/tutor-chat
- Supabase Edge: POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat

## MESSAGGIO PER INIZIARE

Copia questo nella prima riga quando apri Claude Code Web:

"Leggi docs/sprint/CLAUDE-WEB-SESSION-2.md e docs/sprint/DIRETTIVE-CLAUDE-WEB.md. Poi fai git pull origin main e inizia dal TASK A (flusso bentornati). Aggiorna docs/sprint/S2-PROGRESS.md con il tuo stato."
