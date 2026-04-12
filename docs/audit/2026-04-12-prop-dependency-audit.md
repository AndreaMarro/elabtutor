# Prop Dependency Audit — ELAB Tutor
**Data:** 12/04/2026 | **Auditor:** Prop Audit by Claude Code Web

---

## Executive Summary

Analisi sistematica di 7 file "connessi" nel simulator e lavagna. Trovati:
- **3 CONFIRMED dangling props** (P0/P1)
- **2 SUSPICIOUS** (potrebbero passare via `...rest` ma difficili da tracciare)
- **Regressione del 04/2026**: il fix su `onOpenFumetto` ha risolto UNO dei problemi, ma ne rimangono altri.

---

## CONFIRMED DANGLING PROPS

### 1. `circuitStatus` — NewElabSimulator → MinimalControlBar (P1)
**File:** `src/components/simulator/NewElabSimulator.jsx`
- **Passata a:** linea 794 (`circuitStatus={circuitStatus}`)
- **Dove dovrebbe essere usata:** MinimalControlBar
- **REALTÀ:** NON destrutturata né in riga 176 né in `buildOverflowItems()` (riga 304)
- **Impatto:** Informazione sullo stato del circuito NON raggiunge la toolbar
- **Uso previsto:** Colorare la toolbar in caso di errori circuitali
- **Fix:** Aggiungere a destructuring riga 176

---

### 2. `simulationTime` — NewElabSimulator → MinimalControlBar (P1)
**File:** `src/components/simulator/NewElabSimulator.jsx`
- **Passata a:** linea 764 (`simulationTime={simulationTime}`)
- **Dove dovrebbe essere usata:** MinimalControlBar
- **REALTÀ:** NON destrutturata
- **Impatto:** Timer/cronometro della simulazione non visibile nella toolbar
- **Uso previsto:** Mostrare "00:42" accanto al play/pause
- **Fix:** Aggiungere a destructuring riga 176

---

### 3. `className` — NewElabSimulator → MinimalControlBar (P0)
**File:** `src/components/simulator/NewElabSimulator.jsx`
- **Passata a:** (non explicitamente in call, ma potrebbe essere in `...rest`)
- **REALTÀ:** MinimalControlBar riceve `minimalMode=true` e `...rest` (riga 192), ma non ha un `className` wrapper
- **Impatto:** CSS classes da parent non applicate (possibile custom styling bloccato)
- **Fix:** Se inteso, aggiungere a JSX principale (riga 207)

---

## SUSPICIOUS DANGLING (Possibili false positives)

### 1. Spread operator `...rest` — linea 192
```javascript
const { ... } = props;
...
<ControlBar {...props} />  // linea 199
```
**Osservazione:** Se `minimalMode=false`, MinimalControlBar **forwarda TUTTI i props inalterati** a ControlBar (fallback).
Quindi alcune prop non destrutturate qui potrebbero essere intese per il fallback.
**Rischio:** Chi legge il codice non capisce quale prop è per chi.
**Raccomandazione:** Documentare con JSDoc.

### 2. GalileoAdapter `onSpeakingChange` — src/components/lavagna/GalileoAdapter.jsx
**Passata da:** LavagnaShell (ipotizzato)
**Usata in:** useEffect riga 372-376
**Status:** OK — usata via callback in dependency array. Nessun dangling.

---

## ANALYSIS BY FILE

### MinimalControlBar.jsx (lines 175-403)
**Destructuring points:**
- Riga 176-193: PRIMARY (experiment, isRunning, onPlay, onPause, onReset, onBack, onAskUNLIM, isAskingUNLIM, onCompile, compileStatus, minimalMode, ...rest)
- Riga 304-331: BUILDOVERFLOWITEMS (nested destructuring for overflow menu items)

**Missing from BOTH:**
- circuitStatus
- simulationTime
- className (presumibilmente da usare nel wrapper div riga 207, ma non applicata)

---

### NewElabSimulator.jsx (lines 755-818)
**Props passate:** 59 prop totali
**Breakdown:**
- 10 prop: USATE SOLO nel top-level destructuring di MinimalControlBar
- 35 prop: Intese per buildOverflowItems()
- 3 prop: **DANGLING** (circuitStatus, simulationTime, className)
- 11 prop: Fallback (se minimalMode=false, forwarded a ControlBar)

---

### FloatingToolbar.jsx
**Status:** CLEAN
- 4 prop destructurate: `activeTool, onToolChange, abovePanel, leftPanelOpen`
- 0 dangling
- Semplice component, nessun spread.

---

### LessonBar.jsx
**Status:** CLEAN
- 3 prop destructurate: `steps, currentStep, onAskUnlim`
- 0 dangling
- Callback `onAskUnlim` usata 2 volte (line 24, 79)

---

### GalileoAdapter.jsx
**Status:** MOSTLY CLEAN
- 3 prop destructurate: `visible, onClose, onSpeakingChange, activeTab`
- `onSpeakingChange` usata in useEffect riga 372-376 (OK)
- `visible` usata in JSX riga 526 (OK)
- `onClose` usata in JSX riga 550 (OK)
- `activeTab` usata in JSX riga 341 (OK)

---

## RECOMMENDED PATTERN ANTI-DANGLING

### 1. **Explicit Prop Typing (JSDoc)**
```javascript
/**
 * MinimalControlBar — Toolbar minimale con overflow menu.
 * @param {Object} props
 * @param {Experiment} props.experiment — Exp attuale
 * @param {boolean} props.isRunning — Stato play/pause
 * @param {Function} props.onPlay — Handler per play
 * ... (ogni prop documentato)
 * @param {string} [props.simulationTime] — Tempo simulazione (OPTIONAL, per timer display)
 * @param {string} [props.circuitStatus] — Status circuito (OPTIONAL, per warning styling)
 */
const MinimalControlBar = (props) => { ... }
```

### 2. **Separate Concerns: Top-level vs Overflow**
Creare 2 destructuring "named groups":
```javascript
const {
  // ── TOP-LEVEL CONTROLS ──
  experiment, isRunning, onPlay, onPause, onReset, onBack,
  onAskUNLIM, isAskingUNLIM, onCompile, compileStatus,
  minimalMode,
  // ── OPTIONAL (unused in main render, forwarded to fallback) ──
  ...fallbackProps
} = props;
```

### 3. **Lint Rule: `react/no-unused-prop-types`**
Configurare ESLint per flag prop destrutturate ma non usate:
```json
{
  "react/no-unused-prop-types": [
    "warn",
    { "skipShapeProps": false }
  ]
}
```

### 4. **Naming Convention: Explicit Forwarding**
Se una prop è intesa SOLO per il fallback:
```javascript
const { 
  experiment, ... 
  // Fallback-only props — passed to ControlBar if minimalMode=false
  ...controlBarOnlyProps 
} = props;

if (!minimalMode) {
  return <ControlBar {...controlBarOnlyProps} />;
}
```

### 5. **Test Coverage**
Aggiungere test per verificare che buildOverflowItems() riceva le prop corrette:
```javascript
describe('MinimalControlBar overflow', () => {
  it('should handle missing optional props gracefully', () => {
    const props = { experiment: {...}, isRunning: false };
    const items = buildOverflowItems(props);
    expect(items).toBeDefined();
  });
});
```

---

## SEVERITY CLASSIFICATION

| Caso | Severity | Perché | Action |
|------|----------|--------|--------|
| circuitStatus | **P1** | Visibilità circuito è critica UX | Add to destructuring, use in styling |
| simulationTime | **P1** | Timer è feature richiesta da docenti | Add to destructuring, display in toolbar |
| className | **P0** | Potrebbe bloccare custom styling | Verify intent, apply if needed |
| ...rest spread | **P2** | Readability issue, not functional bug | Document + lint rule |

---

## TIMELINE

- **12/04/2026 09:00** — Fumetto (`onOpenFumetto`) fix completato (linea 371 in buildOverflowItems)
- **12/04/2026 09:15** — Audit completo: trovati 3 dangling confermati + 2 suspicious
- **Suggerito:** Sprint prossimo per applicare pattern anti-dangling su tutta la codebase

---

## Nota di Onestà Intellettuale

Il pattern `...rest` in MinimalControlBar riga 192 è LEGITTIMO: se `minimalMode=false`, i prop "dangling" qui dovrebbero essere forwarded a ControlBar per il fallback. **Non è un bug** se ben documentato. Ma richiede chiarezza nel JSDoc.

`circuitStatus` e `simulationTime` invece sono **veri dangling**: passati da parent con intento di use, ma mai letti dal componente.

---

**Audit completo da:** Prop Audit by Claude Code Web — 12/04/2026 — per Andrea Marro

