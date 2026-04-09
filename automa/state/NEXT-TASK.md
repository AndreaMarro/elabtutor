# Next Task — 2026-04-09 16:18 (Ciclo 17)

## TASK: FIX P2 — Add AbortSignal.timeout to HIGH-RISK fetch calls
## FILES: src/services/authService.js, src/services/compiler.js, src/services/licenseService.js
## SCOPE: Only the 3 HIGH-RISK services (5 fetch calls). Leave MEDIUM-risk for next cycle.

## APPROACH:
1. Read authService.js — find the 2 fetch calls (line ~122, ~362)
2. Add `signal: AbortSignal.timeout(10000)` to each fetch options
3. Read compiler.js — find the 1 fetch call (line ~295)
4. Add `signal: AbortSignal.timeout(30000)` (compiler needs more time)
5. Read licenseService.js — find the 2 fetch calls (line ~80, ~157)
6. Add `signal: AbortSignal.timeout(10000)` to each
7. Run all tests — verify zero regressions
8. Build — verify pass

## PATTERN TO FOLLOW (from api.js):
```javascript
const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(10000),
});
```

## SUCCESS CRITERIA:
- All 5 HIGH-RISK fetch calls have AbortSignal.timeout
- grep "AbortSignal" on those 3 files shows 5 matches
- 1554 existing tests pass (zero regressions)
- npm run build passes

## RISK: BASSO
- AbortSignal.timeout is standard Web API (supported in all modern browsers)
- If timeout fires, the existing catch blocks handle the error gracefully
- Pattern already proven in api.js (9 uses) and voiceService.js (1 use)

## TIMEOUT VALUES:
- authService: 10000ms (10s) — login should be fast
- compiler: 30000ms (30s) — compilation can take time
- licenseService: 10000ms (10s) — license check should be fast

## NON FARE:
- Non toccare gdprService, unlimMemory, studentService (MEDIUM risk — next cycle)
- Non aggiungere AbortController dove basta AbortSignal.timeout
- Non riscrivere la gestione errori — il catch esistente gestisce gia' gli abort
- Non aggiungere retry logic — fuori scope
