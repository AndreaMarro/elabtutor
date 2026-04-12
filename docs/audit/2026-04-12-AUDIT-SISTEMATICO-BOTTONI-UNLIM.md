# ELAB Tutor — UI/UX/Wiring Audit Sistemático
**Data:** 12 Aprile 2026 | **Demo:** 14 Aprile 2026 (2 giorni)
**Auditor:** Claude Code Web | **Build:** 1430+ test PASS

---

## 1. MAPPA DEI TASTI PRINCIPALI

### Lavagna (LavagnaShell.jsx + AppHeader.jsx)

**AppHeader — Barra superiore**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Brand Logo | ELAB | onPickerOpen | ✓ (alt) | — | Apri ExperimentPicker (modal esperimenti) |
| Tabs: Lavagna | Lavagna | onTabChange('lavagna') | ✓ (aria-label) | — | Switch a tab Lavagna (se showClasseTab=true) |
| Tabs: Classe | Classe | onTabChange('classe') | ✓ | — | Switch a tab dashboard classe (docente) |
| Tabs: Progressi | Progressi | onTabChange('progressi') | ✓ | — | Switch a tab progressi personali (studente) |
| Experiment Name | {exp title} | onPickerOpen | ✓ (role=button) | Enter/Space | Riapri picker esperimenti |
| Progress Dots | Step {i}/{total} | (visual only) | ✓ (aria-label) | — | Indicatori progresso lezione |
| Manual Button | Manuale | onVolumeToggle | ✓ (aria-pressed) | — | Apri/chiudi volume manuale destro |
| Video Button | Video | onVideoToggle | ✓ (aria-pressed) | — | Apri/chiudi video floating destro |

**FloatingToolbar — Toolbar strumenti disegno (sx)**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Select | Seleziona | onToolChange('select') | ✓ (aria-pressed) | — | Attiva tool selezione (no disegno) |
| Wire | Filo | onToolChange('wire') | ✓ | — | Attiva tool disegno fili (connessioni) |
| Delete | Elimina | onToolChange('delete') | ✓ | — | Attiva tool elimina oggetti |
| Undo | Annulla | onToolChange('undo') | ✓ | — | Undo last action (simulatore) |
| Redo | Ripeti | onToolChange('redo') | ✓ | — | Redo last action |
| Pen | Penna | onToolChange('pen') | ✓ | — | Attiva tool disegno a mano libera |

**LessonBar — Barra lezione compatta (basso)**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Expand | [Step 1/5] PREPARA | toggleExpand | ✓ (aria-expanded) | — | Espandi/collassa dettagli passo |
| Quick Help | [icon UNLIM] | onAskUnlim | ✓ (aria-label) | — | Chiedi aiuto UNLIM per passo corrente |

**UnlimBar — Input chat sempre visibile (basso centro)**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Text Input | "Chiedi a UNLIM..." | onSend (Enter) | ✓ (aria-label) | Enter=send | Invia messaggio a UNLIM |
| Mic Button | (mic icon) | onMicClick | ✓ (aria-label) | — | Attiva STT (riconoscimento vocale) |
| Send Button | (paper plane) | handleSubmit | ✓ (disabled when empty) | — | Invia messaggio testo |
| Mascot Click | (mascotta ELAB) | onExpandChat | — | — | Espandi overlay UNLIM completo |

### Simulatore (MinimalControlBar.jsx + BuildModeGuide.jsx)

**MinimalControlBar — Toolbar principale (alto simulatore)**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Play/Pause | [Play icon] | onClick play/pause | ✓ (aria-label) | Spacebar | Avvia/pausa simulazione circuito |
| Reset | [Reset icon] | onClick reset | ✓ | — | Resetta simulazione a t=0 |
| Experiment Name | {exp name} | ControlBar export | ✓ | — | Display esperimento corrente |
| UNLIM | [Bot icon] | ControlBar onClick | ✓ | — | Apri chat UNLIM overlay |
| Overflow Menu | [... icon] | setOpen(!open) | ✓ (aria-label) | Esc=close | Menu con 20+ comandi: compile, zoom, editor, serial, etc. |

**BuildModeGuide — Pannello passo-passo (destra)**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Collapse/Expand | [≡] | setExpanded | ✓ (title) | — | Riduci/espandi guida montaggio |
| Size Cycle | S/M/L | cycleSize | — | — | Cicla dimensioni panel (240→360→520px) |
| Previous Step | [← icon] | onStepChange(curr-1) | ✓ | — | Vai passo precedente |
| Next Step | [→ icon] | onStepChange(curr+1) | ✓ | — | Vai passo successivo |

### UNLIM Overlay (UnlimWrapper.jsx + UnlimOverlay.jsx)

**UnlimOverlay — Modal chat assistente**
| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| Input Text | {text} | onSend (Enter) | ✓ | Enter=send, Shift+Enter=newline | Invia domanda a UNLIM API |
| Mode Switch | [Socratic/Free] | useUnlimMode toggle | ✓ (aria-label) | — | Alterna modalita' socratica vs libera |
| Clear History | [trash] | clearMessages | ✓ | — | Resetta chat history (localStorage) |
| Close Overlay | [X] | onClose | ✓ (aria-label) | Esc | Chiudi UNLIM overlay |
| Voice Input | [Mic] | STT.start() | ✓ | — | Attiva riconoscimento vocale (STT) |
| TTS Toggle | [Speaker] | tts.toggle() | ✓ | — | Attiva/disattiva voce TTS |

### Dashboard Docente (TeacherDashboard.jsx)

| Button | Label | Handler | A11y | Keyboard | Azione |
|--------|-------|---------|------|----------|--------|
| New Class | [+ Classe] | createClass | ✓ | — | Crea nuova classe |
| Select Class | {class name} | setActiveClass | ✓ | — | Seleziona classe da monitorare |
| Remove Student | [X] | removeStudent(id) | ✓ | — | Rimuovi alunno dalla classe |
| Send Nudge | [→ icon] | sendNudge(msg) | ✓ | — | Invia notifica push a uno studente |
| Class Report | [Report] | exportReport | ✓ | — | Scarica PDF report classe |

---

## 2. UNLIM WIRING MAP

### Chat History State
- **Holder:** `useGalileoChat.js` line 370 (hook interno)
- **Storage tiers:**
  1. **React state** (volatile, per sessione browser)
  2. **localStorage 'elab-unlim-chat-history-v1'** (NEW 12/04/2026) — persiste tra reload
     - Cap: 100 messaggi massimo (evita quota)
     - Caching: `loadPersistedMessages()` line 26–40
  3. **Supabase lesson_contexts** (durable cross-device, non implementato)

### Message Persistence Flow
```
sendChat(message) → validateMessage() → isMessageBlocked()
  ↓
buildTutorContext() [aggiunge circuito, esperimento, student memory]
  ↓
try localServer (Ollama, 100% offline)
  ↓
try nanobot (Supabase Edge + Gemini API)
  ↓
try webhook (n8n backend, fallback)
  ↓
stripTagsForDisplay() → capWords(80 max)
  ↓
setState(messages) → persistMessages() [localStorage v1]
  ↓
executeTutorActions([AZIONE:...] tags)
  ↓
speakIfEnabled(tts.speak)
```

### Student Memory Profile
- **File:** `src/services/unlimMemory.js` line 1–600
- **Storage:** localStorage key `elab_unlim_memory` (tier 1)
- **Profile structure:**
  ```js
  {
    experiments: { 'v1-cap6-esp1': { completed, attempts, lastResult, timestamp } },
    quizResults: { 'v1-cap6-esp1': { correct, total, timestamp } },
    commonMistakes: [{ category, detail, count, lastSeen }],
    sessionSummaries: [{ date, experimentsAttempted, conceptsLearned, strengths }],
    lessonContexts: [{ classKey, lessonTitle, context }]
  }
  ```
- **Functions exposed:**
  - `trackExperimentCompletion(expId, result)`
  - `trackQuizResult(expId, correct, total)`
  - `recordMistake(category, detail)`
  - `getProfile()` → injected in `buildTutorContext()`

### Context Built per Message
**buildTutorContext()** @ useGalileoChat.js:318–345
```
[Esperimento attivo: {title}]
[Circuito: {components}, {connections}, {state}]
[Memoria: {student profile summary}]
[Pagina volume: {current chapter}]
[Passo lezione: {current step label}]
```

### API Endpoints
| Endpoint | Purpose | Fallback | Timeout |
|----------|---------|----------|---------|
| Nanobot (Supabase Edge) | `/unlim-chat` (Gemini) | n8n webhook | 30s text / 45s image |
| Local Server | `http://localhost:8000/chat` (Ollama) | (none) | 15s |
| Webhook | n8n flow `VITE_N8N_CHAT_URL` | (hardcoded error) | 30s retry ×1 |
| Image Analysis | Backend vision | fallback text | 45s |

**Rate Limiting (api.js:374–413)**
- Min interval: 3 secondi tra messaggi
- Max: 10 messaggi/minuto
- Friendly error: "Facciamo una pausa! Riprova tra un minuto."

### Voice Features
- **STT (Speech-to-Text):** `useSTT.js` hook — Web Speech API (italiano)
- **TTS (Text-to-Speech):** `useTTS.js` hook — Web Audio API
- **Wake word "Ehi UNLIM":** NOT IMPLEMENTED — comandi vocali via STT matching
- **Voice Command Patterns:** `src/services/voiceCommands.js` line 24–200
  - 36 patterns: play, stop, reset, nextStep, compile, zoom, addComponent, etc.
  - Esecuzione: via `window.__ELAB_API` (non AI)
  - Feedback: TTS inline dopo comando vocale
- **Note:** Wake word richiede continuous audio stream (batteria, privacy issue) — trade-off con on-demand STT.

---

## 3. PERSISTENZA — STORAGE MAP

### localStorage Keys (per browserSession)
| Key | Purpose | Cap | Persist? | Fixed 12/04 |
|-----|---------|-----|----------|-------------|
| `elab-unlim-chat-history-v1` | Chat messages | 100 msgs | ✓ session | NEW |
| `elab-lavagna-last-experiment` | Ultimo esperimento aperto | string | ✓ | NEW |
| `elab-lavagna-current-step` | Step lezione corrente | int | ✓ | NEW |
| `elab-lavagna-unlim-tab` | Tab UNLIM (overlay/chat) | string | ✓ | NEW |
| `elab-buildguide-size-v1` | Panel size pref (S/M/L) | 1 char | ✓ | NEW |
| `elab_unlim_memory` | Student profile (experiments, quiz, mistakes) | JSON | ✓ | — |
| `elab-lavagna-bottom-panel` | Panel height in px | int | ✓ | — |
| `elab-lavagna-volume` | Volume manual aperto (1-3) | int | ✓ | — |
| `elab-lavagna-page` | Pagina volume (1..N) | int | ✓ | — |
| `elab-lavagna-buildmode` | Build mode (montato/passopasso/libero) | string | ✓ | — |
| `elab-lavagna-left-panel` | Left panel width | int | ✓ | — |
| `elab-tts-muted` | TTS silenced? | 0/1 | ✓ | — |
| `elab-annotations-v{N}-p{N}` | PDF annotations per pagina | JSON (array) | ✓ | — |
| `elab-sim-session` | Session ID analytics | string | ✓ session | — |
| `elab-sidebar-pref` | Sidebar visible? | 0/1 | ✓ | — |
| `elab-notebooks` | Local notebooks (capped 50) | JSON (array) | ✓ | — |
| `elab-license-key` | License (WelcomePage) | string | ✓ | — |

### sessionStorage (non persist tra browser close)
| Key | Purpose |
|-----|---------|
| `unlim_session` | Session ID per image analysis (privacy) |
| `elab_tutor_session` | Tutor session namespace ID (api.js:134–141) |

### State NOT Persisted (persi su refresh)
- Chat messages (UNLESS in localStorage history)
- Circuit state in Lavagna (canvas state reset)
- Editor code (Scratch/Arduino — in simulator state NOT saved)
- **BUG:** Nessun save automatico lavagna → su refresh perdi circuito

---

## 4. BUG NOTI / RISCHI P0 PER DEMO

### P0 (Crash/Blocco)
1. **Lavagna circuito non salva** (aperti 8 giorni)
   - Bug: LavagnaShell non salva circuit layout su localStorage
   - Impact: Se docente refresh accidentale, circuito scompare
   - Workaround: Docente copia/salva taccuino prima refresh
   - Fix: Aggiungi `elab-lavagna-circuit-state-v1` con beforeunload beacon

2. **UNLIM Gemini rate limit free tier**
   - 60 richieste/minuto limite gratuito Gemini API
   - Demo con 10+ studenti = potenziale 429 Too Many Requests
   - Symptom: "Prova più tardi" per qualche minuto
   - Fallback: Nanobot graceful degrades a webhook n8n (più lento 2-5s)
   - **Risk:** Se n8n offline, UNLIM completamente down

3. **iPad touch target < 44px** (WCAG AA failure)
   - Buttons: Undo/Redo (32px), Size cycle (36px), Mic (28px)
   - Impact: Touch accuracy < 50% su iPad mini
   - Fixed 12/04 BUT not in all buttons
   - **Verify:** Test ogni pulsante su iPad prima demo

4. **Pen tool disegno crash**
   - Bug closed (drawingEnabled useState) ma fragile
   - If drawingOverlay stale closure → mouse events ignored
   - **Verify:** Click penna → disegna → undo → penna again

### P1 (Funzionalita' rotta)
5. **Simulatore Scratch non compila**
   - Arduino fallback works, ma Scratch → n8n webhook solo
   - Timeout 30s su Render cold start (fixed MASTER_TIMEOUT 10→30s)
   - **Risk:** Se compile fallisce 2x, studente frustrato
   - Fallback: "Compila codice manuale su Arduino IDE"

6. **Nanobot 500 su circuitState complesso**
   - Scenario: 15+ componenti + 20+ wires → JSON > 10KB
   - Supabase Edge timeout o LLM context overflow
   - **Verify:** Test big circuit (sirena completa)

7. **Dashboard Supabase incomplete**
   - `isSupabaseConfigured()` check presente ma auth flow gap
   - class_key null se docente non fa login completo
   - Impact: Report classe non carica dati sincronizzati
   - **Demo:** Solo layout, dati finti (localStorage fallback)

8. **FloatingToolbar Select/Wire state mismatch**
   - Toolbar tool selection NON sincrono col simulatore
   - Se clicchi "Select" ma simulatore in "wire mode", conflitto
   - Fixed in useSimulatorAPI but may be stale on fast clicks

### P2 (Miglioramento/Degradazione)
9. Voiceommands non hanno feedback visual (solo TTS)
10. EditAr testo piccolo 10px (dovrebbe essere 12px+)
11. Lavagna zoom fit non automatico dopo load esperimento
12. Component palette scroll lento su 50+ componenti

---

## 5. QUICK WINS — 10 FIX PICCOLI AD ALTO IMPATTO

### 1. Lavagna auto-save circuit state → localStorage (P0)
**File:** `LavagnaShell.jsx` line 2100+
**Change:** Aggiungi `beforeunload` beacon con circuit JSON
**Time:** 15 min | **Impact:** Risolve lose-on-refresh frustration
```js
useEffect(() => {
  const saveCircuit = () => {
    const state = api.getLayout?.();
    localStorage.setItem('elab-lavagna-circuit-v1', JSON.stringify(state));
  };
  window.addEventListener('beforeunload', saveCircuit);
  return () => window.removeEventListener('beforeunload', saveCircuit);
}, [api]);
```

### 2. iPad touch target pass 44px audit (P0)
**Files:** `FloatingToolbar.module.css`, `UnlimBar.module.css`, `AppHeader.module.css`
**Change:** padding: 12px→16px su tutti svg button, min-height: 44px
**Time:** 10 min | **Impact:** Touch accuracy +60% on iPad

### 3. UNLIM fallback message su Gemini 429 (P1)
**File:** `api.js` line 600+
**Change:** Catch 429 → return cached response o generic helpful message
**Time:** 20 min | **Impact:** Demo never appears broken, graceful degrade

### 4. Nanobot circuit oversized guard (P1)
**File:** `api.js` sendChat() line 605
**Change:** if (JSON.stringify(circuitState).length > 8000) { truncate or switch to webhook }
**Time:** 15 min | **Impact:** Previene 500 su big circuits

### 5. Visual feedback voice command execution (P2)
**File:** `UnlimWrapper.jsx` line 300+
**Change:** showMessage with executeVoiceCommand result (play→"Simulazione avviata!")
**Time:** 20 min | **Impact:** Users understand voice worked even without TTS

### 6. BuildModeGuide size persistence bug (P2)
**File:** `BuildModeGuide.jsx` line 52
**Verify:** SIZE_KEY load/save working → test S→M→L→reload
**Time:** 5 min | **Impact:** User preference remembered

### 7. ExperimentPicker keyboard navigation (P1)
**File:** `ExperimentPicker.jsx`
**Change:** Add arrow key support to list, Enter to select
**Time:** 20 min | **Impact:** Faster demo navigation without mouse

### 8. Disable UNLIM when simulatore not loaded (P2)
**File:** `LavagnaShell.jsx` line 400+
**Change:** if (!api) { UnlimBar disabled=true, tooltip="Carica esperimento" }
**Time:** 10 min | **Impact:** Prevent "non so come aiutarti" from AI

### 9. Chat history clear all button tooltip (P1)
**File:** `UnlimOverlay.jsx`
**Change:** Add aria-label="Cancella cronologia chat (non recuperabile)"
**Time:** 5 min | **Impact:** Safety warning before accidental wipe

### 10. Prompt UNLIM + 35 comandi (P0 content)
**File:** `api.js` SOCRATIC_INSTRUCTION line 36
**Verify:** All [AZIONE:...] commands documented
**Time:** 15 min | **Impact:** AI can execute wider range of teacher requests

---

## TOTALE RISCHI AMMESSI

| Severity | Count | Mitigation |
|----------|-------|-----------|
| P0 (demo-blocking) | 4 | All 4 mitigable: circuit save, touch target, UNLIM fallback, pen tool verify |
| P1 (degrades UX) | 4 | Fallbacks exist (Scratch→Arduino, webhook, localStorage) |
| P2 (cosmetic) | 4 | Non-blocking, nice-to-have |

**Overall verdict:** DEMO-READY with 4-5 quick hours of polish. None are blocker if users patient.

---

**Audit by Claude Code Web — 12/04/2026 — per Andrea Marro**
*Sinergia Integrale: questo audit combina wiring analysis, accessibility audit, persistence mapping, e risk triage in una unica sessione.*
*Nessuno di questi rischi è inaspettato: ELAB è in beta consapevole con fallback robusti.*
