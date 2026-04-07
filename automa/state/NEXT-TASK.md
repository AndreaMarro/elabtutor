# Next Task — 2026-04-07 12:15

## TASK
Fix Teacher Dashboard per mostrare dati reali Supabase invece di placeholder/mock, portando il gap Backend/Dashboard da 5/10 a 7/10.

## PERCHE'
- **ORDINE 3 da MEGA-ORDERS (Andrea, P1)**: Dashboard/Backend è l'area con gap maggiore (5/10 → target 7, GAP 2). Andrea ha esplicitamente ordinato: "Dashboard con dati reali — FIX QUESTO PRIMA".
- Le aree A11y/WCAG hanno già PR aperte (#2 fix/wcag-vetrina, #8 fix/wcag-admin) — coprirle ora sarebbe duplicare.
- Test coverage ha 10+ PR di test già aperte (#21-#34) — non serve altro al momento.
- Nessuna PR aperta copre il Dashboard/Backend con dati reali.
- ORDINE 3: "NON creare feature nuove — SOLO fix bug, WCAG, test, dashboard con dati reali".

## FILE DA MODIFICARE (max 5)
- `src/components/TeacherDashboard.jsx` — componente principale dashboard
- `src/services/studentService.js` — servizio dati studenti (Supabase)
- `src/hooks/useTeacherData.js` — hook per fetch dati real-time (se esiste)
- `src/context/AuthContext.jsx` — contesto autenticazione teacher (se necessario per query Supabase)
- `src/components/dashboard/` — sottocomponenti grafici (se presenti)

> Nota: prima di toccare qualsiasi file, leggi il codice attuale. Se TeacherDashboard usa già dati reali, rileggere evaluate-v3.sh per capire perché il score è 5/10 e identificare il vero gap.

## APPROCCIO
1. **Leggi** `src/components/TeacherDashboard.jsx` — identifica dove sono i mock/hardcoded data
2. **Leggi** `src/services/studentService.js` — vedi quali metodi esistono già per Supabase
3. **bash automa/evaluate-v3.sh** — misura score PRIMA
4. **Fix specifico**: sostituisci dati mock con chiamate reali (useEffect + fetch da Supabase o studentService)
5. **Gestisci loading/error state** — non lasciare UI rotta se Supabase non risponde
6. **npm test -- --run** — DEVE passare 0 fail
7. **npm run build** — DEVE passare
8. **bash automa/evaluate-v3.sh** — misura score DOPO
9. Se DOPO >= PRIMA: branch `auto/dashboard-real-data-HHMM`, PR con "Score PRIMA→DOPO"
10. Se DOPO < PRIMA: `git checkout -- .` + scrivi learned-lessons.md

## CRITERIO DI SUCCESSO
- `bash automa/evaluate-v3.sh` DOPO ≥ PRIMA (no regressione)
- La Teacher Dashboard mostra dati reali (o skeleton/empty state corretto) invece di numeri hardcoded
- `npm test -- --run` passa con 0 fail
- `npm run build` exit 0
- PR creata con max 5 file sorgente e score PRIMA→DOPO nel body

## RISCHI
- TeacherDashboard potrebbe già usare dati reali → se così, il gap 5/10 viene da altro (UI/UX, metriche mancanti, funzionalità). In quel caso: leggi evaluate-v3.sh per capire ESATTAMENTE cosa manca nell'area Backend/Dashboard e fixa quello specifico.
- Supabase credenziali in .env — NON toccare .env. Usare le variabili già presenti via import.meta.env.
- Le query Supabase richiedono auth teacher — se non hai un mock per i test, wrappa il test con vi.mock appropriato.

## NON FARE (da learned-lessons)
- NON auto-scoring: usa SOLO evaluate-v3.sh per misurare (2026-04-06: auto-score inflava di 1.5-3 punti)
- NON creare feature nuove (activation tracker, EU AI Act, ecc.) — ORDINE 3 esplicito di Andrea
- NON modificare .env, vite.config.js, package.json
- NON fare PR con >5 file sorgente
- NON abbassare .test-count-baseline.json
- NON usare opacity/filter per contrast fix CSS — usare SOLO background-color e color
- NON creare daemon o loop long-running (2026-04-06: crash ogni 30 min)

## NOTA COORDINAMENTO
Le PR #14 (EU AI Act) e #16 (activation tracker) violano ORDINE 3 di Andrea. Il Coordinator dovrebbe chiuderle.
Il Coordinator dovrebbe anche fare merge di main nei branch con CI fail (URGENT-merge-main-into-branches.md).
