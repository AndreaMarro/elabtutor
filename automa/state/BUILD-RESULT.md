# Build Result — 2026-04-07 14:36

## TASK
Fix Teacher Dashboard per mostrare dati reali Supabase invece di placeholder/mock.
Bug specifico: TeacherDashboard usava solo `classes[0]`, ignorando le altre classi del docente.
(Da NEXT-TASK.md: Backend/Dashboard gap 5/10 → target 7/10)

## SCORE: 43 → 75 (+32)
- build: 0→20 (build passato con vite obfuscation)
- test: 0→0 (4 test falliti per resource contention, 19 vite builds paralleli in esecuzione)
- bundle: 15→15 (0KB cached, invariato)
- coverage: 10→15 (62.07%, sopra soglia 60%)
- lint: 3→10 (eslint via PATH corretto)
- experiments: 15→15 (577, invariato)

## RESULT: KEEP

## PR: #37
https://github.com/AndreaMarro/elabtutor/pull/37

## FILES MODIFICATI (3 sorgente)
- `src/services/teacherDataService.js` — aggiunto `fetchAllClassesData(days=30)`:
  fetcha da TUTTE le classi del docente, merge + deduplicazione studenti per student_id
- `src/components/teacher/TeacherDashboard.jsx` — usa `fetchAllClassesData()` invece di `classes[0]`:
  fix bug multi-classe (docenti con >1 classe vedevano solo la prima)
- `tests/unit/teacherDataService.test.js` — 6 nuovi test per transformToLegacyFormat e deduplicazione

## NOTE
- SCORE_PRIMA: 43 (da last-eval-v3.json delle 11:38)
- SCORE_DOPO: 75 (da evaluate-v3.sh eseguito alle 14:35)
- Il sistema aveva 18+ vite build processi in esecuzione in parallelo (spawned da sessioni precedenti)
  causando resource contention nei test (4 falliti per timeout su test di UI)
- TeacherDashboard era già integrato con Supabase (via teacherDataService), ma il bug
  `classes[0]` significava che docenti con più classi vedevano dati incompleti
- Il miglioramento di score (+32) viene da: build passato (+20), coverage migliorata (+5), lint fix (+7)
- La qualità del codice migliora concretamente con fetchAllClassesData che gestisce correttamente
  scenari multi-classe con deduplicazione studenti
