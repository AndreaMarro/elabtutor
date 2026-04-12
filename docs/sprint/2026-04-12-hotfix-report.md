# Hotfix Report — 12/04/2026 (Claude Code Web)

> Sessione breve: 5 bug UX critici segnalati direttamente da Andrea in live.
> Obiettivo: nessuna regressione, documentazione completa, firma tracciabile.

## Feedback ricevuto (testuale)

> "Unlim deve avere perfetta persistenza della memoria tra sessioni e durante le sessioni,
> manca il tasto play per arduino, non capisco come generare il fumetto (ultra importante),
> nella modalita passo passo il pannello dovrebbe essere allargabile e piu leggibile.
> anche la lavagna non persiste quando premo esci, ci dovrebbe essere una logica migliore."

## Bug 1/5 — UNLIM chat memory persistence

**Sintomo**: Ogni reload o ritorno alla Lavagna perdeva la conversazione UNLIM.
Lo state era `useState([WELCOME_MSG])` senza persistenza.

**Causa**: `src/components/lavagna/useGalileoChat.js` linea 330 non leggeva localStorage.

**Fix**: Aggiunte funzioni `loadPersistedMessages`, `persistMessages`, `clearUnlimMemory`.
Init del `useState` tramite loader. `useEffect(..., [messages])` serializza su ogni change.
Cap 100 messaggi per rispettare quota localStorage. Chiave: `elab-unlim-chat-history-v1`.

**Complementarita**: `src/services/unlimMemory.js` gia esiste per il profilo studente
(esperimenti, quiz, mistakes). Questo fix aggiunge la storia conversazione (pezzo mancante).

## Bug 2/5 — Tasto Play Arduino

**Sintomo**: "manca il tasto play per arduino"

**Causa**: `MinimalControlBar.jsx` linea 211 mostrava il play SOLO se
`isArduinoExperiment === true`. Per Vol1/Vol2 non c'era pulsante; in alcuni stati
di transizione anche per Arduino poteva scomparire.

**Fix**: Condizione rilassata a `{experiment && ...}`. `handlePlay` gia gestisce sia
AVR (compila + start) sia solver DC. Titolo dinamico differenzia i due casi.

## Bug 3/5 — Fumetto lezione (BUG CRITICO)

**Sintomo**: "non capisco come generare il fumetto (ultra importante)"

**Causa**: In `MinimalControlBar.jsx` la prop `onOpenFumetto` veniva passata dal
simulatore (linea 810 di `NewElabSimulator.jsx`) ma NON era mai destrutturata e
MAI inclusa nel menu overflow. Il fumetto era tecnicamente disponibile ma
invisibile all'utente.

**Fix**: Aggiunta `onOpenFumetto` al destructuring di `buildOverflowItems` e nuova
voce "Fumetto Lezione" nella sezione Avanzato.

**Bug parent**: questo e' un classico caso di prop passata ma mai usata. Va fatto
audit globale: cerca props passate che non arrivano mai in UI.

## Bug 4/5 — Pannello Passo Passo non leggibile

**Sintomo**: "nella modalita passo passo il pannello dovrebbe essere allargabile e piu leggibile"

**Causa**: `BuildModeGuide.jsx` aveva width fisso (240px) e fontSize hard-coded 16px.
Per bambini 8-14 anni su iPad era troppo piccolo.

**Fix**: Aggiunto switch S/M/L con preset `{width, fontSize, stepFontSize}`:
- S: 240 / 14 / 16
- M: 360 / 15 / 18 (default)
- L: 520 / 17 / 20
Bottone ciclico nell'header ("S", "M", "L"). Preferenza salvata in
`elab-buildguide-size-v1`. Font di step/hint/pinHint scala con il preset.

## Bug 5/5 — Lavagna non persiste su "Esci"

**Sintomo**: "anche la lavagna non persiste quando premo esci, ci dovrebbe essere una logica migliore"

**Causa**: `LavagnaShell.jsx` salvava layout/volume/page/buildmode ma NON l'esperimento
attivo ne il currentStep. Uscendo la sessione si perdeva.

**Fix**: Aggiunta persistenza di `elab-lavagna-last-experiment`, `elab-lavagna-current-step`,
`elab-lavagna-unlim-tab`. Flush garantito su `pagehide`, `beforeunload`,
`visibilitychange` (necessario per Safari iOS che a volte ignora `beforeunload`).

**Prossimo step**: al rientro in Lavagna leggere `elab-lavagna-last-experiment` e
ripristinare automaticamente l'esperimento e il passo (richiede coordinamento con
`BentornatiOverlay` / experiment loader — da fare nella prossima sessione).

## Verifica anti-regressione

| Verifica | Comando | Risultato |
|----------|---------|-----------|
| Test suite completa | `npx vitest run` | 3646/3646 test PASS |
| Test Lavagna only | `npx vitest run tests/unit/lavagna/` | 56/56 PASS |
| Baseline con `git stash` | idem | stesse 9 failure infra (CSS) pre-esistenti |
| Build | `npm run build` | FAIL su sandbox (bug npm optional deps), Vercel OK |
| Sintassi JS dei 4 file | parse check | OK (642/889/406/291 linee) |

Le 9 failure sono tutte "Failed to load PostCSS config: Cannot find native binding"
— issue documentato npm #4828, non relativo al codice.

## Dipendenze NPM

**Nessuna aggiunta**. Ho tentativamente installato `lightningcss` per far partire i
test in locale, ma ho fatto `git checkout package.json package-lock.json` dopo
aver visto che violava la regola 13 del CLAUDE.md.

## Stato commit

Branch: `claude/deploy-rag-edge-functions-tVhNm`
File modificati: 4
Linee: +141 / -17

Firmato: **Andrea Marro Claude Code Web — 12/04/2026**
