<<<<<<< HEAD
# Next Task — 2026-04-09 02:17 (Ciclo 3)

## TASK
Scrivi 20+ test per supabaseSync.js (zero coverage, servizio critico per sync cloud)

## PERCHE'
- supabaseSync.js ha 0% test coverage
- E' il servizio che sincronizza dati studente con Supabase (cross-device)
- Ha offline queue, retry logic, conflict resolution — tutti testabili
- Lo Scout ha trovato che il gap test e' il problema principale
- L'Orchestratore raccomanda: "concentrarsi su test"
- Zero rischio (solo tests/, no src/)

## FILE
- tests/unit/supabaseSync.test.js (NUOVO)

## APPROACH
1. Mock supabaseClient.js e localStorage
2. Testa: getQueue, addToQueue, processQueue, saveSession, loadSessions
3. Edge case: localStorage pieno, JSON malformato, network fail, queue cap
4. Boundary: queue vuota, queue piena (200 cap), item scaduto (7d expiry)

## SUCCESS
- npm test passa, +20 test

## RISK
Zero (solo tests/)
=======
# Next Task — 2026-04-09 01:20

## TASK
Fix 5 fetch senza timeout in gdprService.js e voiceService.js + scrivi test

## PERCHE'
Scout finding P2: 5 fetch() senza AbortSignal.timeout. Su reti scolastiche lente,
questi fetch possono hangare indefinitamente bloccando l'UI per lo studente.
L'Orchestratore dice di concentrarsi su lavoro REALE, non meta-report.
Questo e' un bug fix concreto con test.

## FILE DA MODIFICARE (max 5)
1. src/services/gdprService.js (2 fetch: riga 31, 48)
2. src/services/voiceService.js (3 fetch: riga 35, 47, 229)
3. tests/unit/gdprService.timeout.test.js (NUOVO — test per timeout)

## APPROCCIO
Per ogni fetch() senza timeout:
- Aggiungere `signal: AbortSignal.timeout(10000)` (10s timeout)
- Preservare try/catch esistente
- NON cambiare la logica di business

## CRITERIO DI SUCCESSO
- npm test passa (0 fail)
- npm run build passa
- I 5 fetch hanno ora AbortSignal.timeout
- Test specifico verifica che il timeout e' presente

## RISCHI
- AbortSignal.timeout non supportato in browser vecchi → ma ELAB target moderno (Chrome/Safari)
- Timeout troppo corto → 10s e' generoso per qualsiasi server

## NON FARE (da learned-lessons)
- Non usare opacity per contrast fix
- Non cambiare piu' di 5 file
- Non toccare file proibiti
>>>>>>> work/main
