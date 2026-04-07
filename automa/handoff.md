# Handoff — 2026-04-07 13:55

## Score: 43/100
**ATTENZIONE**: Score probabilmente inaffidabile. evaluate-v3.sh riporta BUILD_FAIL localmente ma dist/ esiste (build precedente ok). PR#33 + PR#11 fixano automa/evaluate-v3.sh — merge urgente per avere score accurato.

---

## Ultimo Ciclo (Coordinator run 13:36-13:55)

### Diagnosi CI
- **TUTTE** le 22 PR falliscono CI
- **Causa principale**: lightningcss.linux-x64-gnu.node mancante su GitHub Actions ubuntu-latest
- **Causa secondaria**: quality-ratchet fallisce perché i test non girano (baseline=1700, actual=26)
- `npm ci || npm install` già in workflow test.yml ma NON risolve lightningcss (npm ci riesce con macOS binary, il fallback npm install non scatta)
- Anche main fallisce CI → problema infrastrutturale sistemico, NON bug nel codice delle PR

### FASE 1 — Merge main nei branch
- **22 branch** processati, nessun conflitto
- **3 branch aggiornati** (nuovi commit pushati):
  - `fix/evaluate-v3-macos-perl-compat-g45` (PR#33)
  - `auto/test-factory-1002` (PR#22)
  - `auto/test-factory-0747` (PR#21)
- **19 branch** già aggiornati con main (nessuna azione)

### FASE 2 — PR duplicate chiuse
| PR chiusa | Titolo | Sostituita da |
|-----------|--------|---------------|
| #25 | test(gdpr): +58 test gdprService | PR#27 (superset) |
| #26 | test(auth+voice): +64 test | PR#27 (superset) |
| #23 | test: +27 test gamificationService | PR#30 (superset) |

### FASE 3 — Commenti CI PASS
- Nessuna PR con CI verde. Nessun commento aggiunto.

### FASE 4 — Stato file automa/state/
- BUILD-RESULT.md: **non trovato**
- TEST-RESULT.md: **non trovato**
- AUDIT-REPORT.md: **non trovato**
- shared-results.md: ultimo aggiornamento 2026-03-25 (stale)
- last-eval-v3.json: score 43/100 @ 11:38:14 (BUILD_FAIL, NO_TESTS, BUNDLE=15, COVERAGE=10, LINT=3, EXPERIMENTS=15)

---

## PR Aperte: 22

| # | Titolo | CI | Nota |
|---|--------|-----|------|
| 34 | test(services): +126 test sessionReport+lessonPrep | RUNNING | Più recente test run |
| 33 | fix(automa): evaluate-v3.sh macOS compat | FAIL | Fix critico per score accurato |
| 32 | test(services): +134 test sessionMetrics+projectHistory+license+classProfile | FAIL | Ultimo run completo |
| 30 | test(utils+services): +123 test activityBuffer+aiSafety+gamification | FAIL | |
| 29 | test(services): +76 test sessionMetrics+license+nudge | FAIL | |
| 27 | test(classProfile+utils): +71 test | FAIL | Superset di PR#25,#26 (chiuse) |
| 22 | test: +22 test simulator-api.js | FAIL | Aggiornato con main |
| 21 | test: +29 test voiceCommands | FAIL | Aggiornato con main |
| 20 | fix(gdpr): hash parentEmail | FAIL | |
| 19 | chore(baseline): alza baseline 1442→1460 | FAIL | PERICOLOSA — main ha 1700 |
| 18 | feat(gamification): buildSteps → gamification | FAIL | |
| 17 | feat(data): buildSteps Vol2 Cap3-Cap5 | FAIL | |
| 16 | feat(retention): activation tracker | FAIL | |
| 15 | feat(data): buildSteps Vol3 Cap5-Cap6 | FAIL | |
| 14 | feat(ai-compliance): EU AI Act disclosure | FAIL | |
| 11 | fix(unlimMemory): destroy() cleanup | FAIL | |
| 8 | fix(a11y): admin contrast WCAG AA | FAIL | |
| 6 | fix(seo): Twitter Card + og:site_name | FAIL | |
| 5 | research(automa): GDPR audit + Mistral Nemo | FAIL | |
| 3 | feat(lavagna): persist volume/page | FAIL | |
| 2 | fix(a11y): WCAG AA VetrinaSimulatore | FAIL | |
| 1 | fix(seo+infra): canonical URL + infra | FAIL | |

**CI PASS: 0 | In esecuzione: 1 (PR#34) | Pronte per review: 0**

---

## Prossimo Ciclo

### Priorità 1 — Fix infrastrutturale CI (CRITICO)
Il problema lightningcss.linux-x64-gnu.node blocca TUTTO. Opzioni:
1. Aggiungere `npm rebuild lightningcss` esplicito nel workflow dopo npm ci
2. Rimuovere @tailwindcss/postcss v4 dal postcss.config.js e usare PostCSS/tailwindcss v3
3. Aggiungere `.npmrc` con `node-linker=node-modules` e rebuild lightningcss esplicitamente

### Priorità 2 — PR#19 da chiudere
Alza baseline a 1442→1460 ma main ha già baseline=1700. PR#19 è stale e pericolosa.

### Priorità 3 — Merge PR test serie (dopo fix CI)
Ordine suggerito: PR#21 → PR#22 → PR#27 → PR#29 → PR#30 → PR#32 → PR#34

### Attenzione
- **PR#19**: PERICOLOSA — abbassa il ratchet (1700 → 1460). Chiudere.
- **Score 43/100**: non fidarsi finché evaluate-v3.sh non è fixato (PR#33 o PR#11 merged)
- **lightningcss**: NESSUN worker deve aprire nuove PR finché CI non è verde. Spreco di cicli.
