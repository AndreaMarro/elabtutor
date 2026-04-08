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
