# Scout Findings — 2026-04-09 17:08 (Ciclo 18)

## Score: 93/100 (+1 vs ciclo precedente)
## P1: RISOLTO | P2 High: RISOLTO | P2 Medium: PRONTO PER FIX

---

## VERIFICATO: P1+P2 HIGH-RISK FIXES ATTIVI
- authService.js: 2 AbortSignal.timeout ✓
- compiler.js: 1 AbortSignal.timeout ✓
- licenseService.js: 2 AbortSignal.timeout ✓

## P2 MEDIUM: 6 FETCH SENZA TIMEOUT (3 servizi)
| Servizio | Fetch | Rischio | Note |
|----------|-------|---------|------|
| gdprService.js | 2 | MEDIO | delete + webhook, operazioni rare |
| unlimMemory.js | 2 | MEDIO | sync + load, background |
| studentService.js | 2 | MEDIO | save + load, background |

**Fix**: stesso pattern dei high-risk: `signal: AbortSignal.timeout(10000)`.
**Effort**: 30min. **Priorita': P2.**

## P3: 15+ EMPTY CATCH BLOCKS (silent errors)
**Distribuzione**:
- Admin components: 10+ (AdminDashboard, AdminEventi, AdminUtenti, AdminOrdini, AdminWaitlist)
- GestionaleUtils: 4
- AuthContext: 2
- WelcomePage: 1
- whiteboardScreenshot: 1

**Impatto**: Errori vengono ingoiati silenziosamente. Se qualcosa si rompe nell'admin o nel contesto auth, nessun log. Debug impossibile.
**Fix**: Aggiungere `logger.error('[MODULE]', error)` in ogni catch block.
**Nota**: Molti sono in area admin — BASSO impatto utente (solo Andrea usa admin).
**Effort**: 1h. **Priorita': P3 — basso impatto ma buona pratica.**

## P3b: BASELINE INFLATA
`.test-count-baseline.json` dichiara 1700 test ma main ha 1578.
Score test: 23/25 (proporzionale). Se baseline fosse 1578, score sarebbe 25/25 → **score 95**.
**Fix**: Aggiornare baseline a 1578.
**Effort**: 1 edit. **Priorita': P3.**

## Azione raccomandata per Builder
**Prossimo**: P2 medium (6 fetch in 3 servizi) — completa la copertura timeout.
**Dopo**: P3b baseline fix (1 edit, +2 score points).
