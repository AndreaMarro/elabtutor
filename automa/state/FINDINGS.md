# Scout Findings — 2026-04-07 13:40

## Score attuale: 43/100

**Breakdown:**
- build: 0/20 (BUG evaluate script — vedi P0 #1)
- test: 0/25 (7 test falliti bloccano il punteggio)
- bundle: 15/15 ✓
- coverage: 10/15
- lint: 3/10
- experiments: 15/15 ✓

## TOP 5 Problemi (ordinati per impatto)

1. [P0] automa/evaluate-v3.sh:27 — Build check usa `npm run build --silent` che sopprime l'output "built in"; il build PASSA (21.74s) ma il check non lo rileva → 0/20 invece di 20/20. PR #33 esiste ma ha CI fail. FIX: rimuovere `--silent` o usare `npm run build 2>&1`.

2. [P0] tests/unit/aiSafetyFilter.test.js — 6 test falliti (filtri "suicid", "inserire nella presa", etc.) → blocca l'intero punteggio test a 0/25. 1532 passano, 7 falliscono. La baseline è 1700 quindi serve anche aumentare i test.

3. [P0] Tutte le 25 PR aperte hanno CI fail — ORDINE 1 non eseguito. Nessuna PR è mergeabile. Fix: `git merge origin/main` su ogni branch (PR da #1 a #34).

4. [P1] tests/unit/contentFilter.test.js:272 — `sanitizeOutput('Cretino! ...')` ritorna stringa con `***!` ma il test cerca `'ora'` lowercase. 1 test fallisce. tests/unit/activityBuffer.test.js — `getRecentActivities(0)` edge case fallisce.

5. [P1] src/components/admin/gestionale/shared/GestionaleUtils.js:33,52,159,194 + src/context/AuthContext.jsx:61 — 20+ blocchi `catch {}` completamente vuoti in admin. Errori ingoiati silenziosamente, impossibile debuggare problemi in produzione.

## Aree con gap maggiore

- test: 0/25 (gap 25) — 7 test falliti + baseline 1700 vs 1532 passanti
- build (evaluate script): 0/20 (gap 20) — BUG nello script, non nel build
- lint: 3/10 (gap 7)
- coverage: 10/15 (gap 5)

## Stato PR

- Aperte: 25
- CI fail: 25 (TUTTE)
- Duplicate da chiudere: #9, #10, #12, #13 (vecchie evaluate-v3 fix), #4 (vecchio buildsteps-vol3)

## Problemi codice trovati

**Empty catch blocks (20+ occorrenze):**
- src/context/AuthContext.jsx:61
- src/components/admin/gestionale/shared/GestionaleUtils.js:33,52,159,194
- src/components/admin/tabs/AdminDashboard.jsx:120,542,565
- src/components/admin/gestionale/shared/GlobalSearch.jsx:24,65
- (altri ~12 in admin/)

**addEventListener senza removeEventListener (risk memory leak):**
- src/utils/codeProtection.js:105-107 (3 listener globali, mai rimossi)
- src/components/unlim/UnlimWrapper.jsx:242,387,397
- src/components/simulator/panels/WhiteboardOverlay.jsx:309,326

**setInterval senza clearInterval:**
- src/components/simulator/engine/avrWorker.js:330,333 (pinBatchTimer, pwmTimer — worker, probabile OK)
- src/components/lavagna/LavagnaShell.jsx:280
- src/components/lavagna/PercorsoPanel.jsx:40

**fetch() senza AbortSignal.timeout (14 occorrenze):**
- src/services/voiceService.js:35,47,229,260,275
- src/services/unlimMemory.js:416,435
- src/components/admin/AdminPage.jsx:153
- (altri 6)

**localStorage senza try/catch:**
- src/components/admin/gestionale/shared/GlobalSearch.jsx:31
- src/components/admin/gestionale/modules/SetupWizard.jsx:98,386
- src/components/admin/gestionale/services/FatturaElettronicaService.js:49,58,74,75

**Bottoni senza aria-label (accessibility):**
- src/components/auth/LoginPage.jsx:126,140
- src/components/auth/RegisterPage.jsx:200,226,242,252
- (altri in WelcomePage, DataDeletion)

## Raccomandazione per lo Strategist

- Il problema più impattante da fixare è: **Fix evaluate-v3.sh build detection** (rimuovere `--silent`) + **Fix 7 test falliti in aiSafetyFilter + contentFilter + activityBuffer** → sblocca 45 punti (0→20 build + 0→25 test) portando lo score da 43 a ~88/100.
- PRIORITY: Prima fare `git merge origin/main` su tutti i 25 branch (ORDINE 1) poi fixare i test falliti.
- NON creare nuove feature (ORDINE 3 violato: PR #14 EU AI Act, PR #16 activation tracker, PR #18 gamification sono fuori scope).
