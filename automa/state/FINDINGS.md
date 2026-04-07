# Scout Findings — 2026-04-07 13:40

## Score attuale: 48/100

**Dettaglio:** build=20 test=0(0 passed) bundle=0(11860KB) coverage=10(?%) lint=3(0 errors) experiments=15(577)
**Errori critici:** NO_TESTS | BUNDLE_HUGE (11860KB)

---

## TOP 5 Problemi (ordinati per impatto)

1. [P0] evaluate-v3.sh — `grep -P` non compatibile con macOS BSD grep → test/coverage score = 0, score soffre -40pt per bug strumentazione (PR #33 aperta ma non mergeata)
2. [P0] BUNDLE HUGE 11860KB → score bundle = 0/15. Chunk più pesanti: react-pdf (1.8MB), index (1.5MB), NewElabSimulator (1.2MB). Serve lazy loading / code-splitting aggressivo.
3. [P0] CI fail su TUTTE le 25 PR aperte → nessuna PR può essere mergeata. Causa: fix su main non propagato ai branch (vedere ORDINE 1 MEGA-ORDERS).
4. [P1] 32 chiamate `fetch()` senza `AbortSignal.timeout` in src/ → nessun timeout = possibili hang infiniti, es: `src/components/admin/AdminPage.jsx:153`, `src/components/tutor/ElabTutorV4.jsx:970`, `src/services/gdprService.js:31`.
5. [P1] 114 `localStorage.getItem/setItem` senza try/catch in src/ → crash silenzioso in modalità privata o storage pieno. Es: `src/components/WelcomePage.jsx:112` ha catch ma mancano decine di altri siti.

---

## Problemi secondari rilevati

- **Empty catch blocks (silenziano errori):** `src/context/AuthContext.jsx:61`, `src/utils/whiteboardScreenshot.js:22`, `src/components/admin/tabs/AdminWaitlist.jsx:61`, `src/components/admin/tabs/AdminEventi.jsx:76,86`, `src/components/admin/tabs/AdminDashboard.jsx:120`
- **console.log in produzione:** `src/utils/codeProtection.js:74` (attivo, non in DEV guard), `src/utils/logger.js:9-11` (controlled ma esposto)
- **Bottoni senza aria-label:** ~1165 `<button>` nel JSX, molti senza `aria-label` — es: `src/components/WelcomePage.jsx:142`, `src/components/auth/LoginPage.jsx:126,140`
- **setInterval senza clearInterval:** `src/components/simulator/panels/ScratchCompileBar.jsx:58`, `src/components/simulator/panels/CodeEditorCM6.jsx:450`, `src/components/lavagna/LavagnaShell.jsx:280` + altri
- **addEventListener senza removeEventListener:** 84 occorrenze, es: `src/utils/codeProtection.js:105-107` (document-level, mai rimossi), `src/components/student/StudentDashboard.jsx:96`

---

## Aree con gap maggiore

- **Test coverage**: 0/25 (score -25) — evaluate-v3.sh usa grep -P non supportato da macOS → conteggio test = 0. Gap reale stimato: test esistono ma non contati.
- **Bundle size**: 0/15 (gap 15) — 11860KB vs target <5000KB. Problema strutturale, serve code-splitting.
- **A11y/WCAG**: ~5/10 → target 7 (gap 2) — bottoni senza aria-label, contrasto non verificato automaticamente.
- **Dashboard/Backend**: ~5/10 → target 7 (gap 2) — dati reali non collegati al frontend.

---

## Stato PR

- **Aperte:** 25
- **CI fail:** 25/25 (tutte falliscono — fix grep -P su main non propagato ai branch)
- **Duplicate da chiudere:**
  - evaluate-v3 fix: chiudere #9, #10, #12 → tenere #33 (più recente con Perl fix)
  - BuildSteps Vol3: chiudere #4 → tenere #15
  - Test services duplicati potenziali: #29, #30, #32 (simili contenuti) — verificare overlap

---

## Raccomandazione per lo Strategist

- Il problema più impattante da fixare è: **ORDINE 1 — merge origin/main in TUTTI i 25 branch aperti** per sbloccare CI. Senza questo, zero PR possono essere mergeate e tutto il lavoro è bloccato. Secondo step immediato: mergiare #33 (evaluate-v3 fix macOS) per sbloccare il calcolo corretto di test/coverage e recuperare ~25pt di score.
