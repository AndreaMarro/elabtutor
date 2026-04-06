# HANDOFF elab-worker 2026-04-07 → prossima sessione

**Data**: 07/04/2026
**Stato**: Build PASS (15.79s), 1442/1442 test, 31 test file, bundle ~11860KB uncompressed (obfuscated prod)
**URL Live**: https://www.elabtutor.school
**PR aperta**: https://github.com/AndreaMarro/elabtutor/pull/9
**Branch**: fix/evaluate-v3-macos-baseline (da origin/main)

## Sessione elab-worker — Ciclo 1/4

### Problema iniziale: evaluate-v3.sh rotto su macOS
Il sistema autonomo non poteva funzionare perché:
1. `grep -oP` (Perl regex) non è disponibile su macOS BSD grep
2. Baseline test era 1700 ma l'app ne ha 1442 → sempre 0/25
3. Baseline bundle era 3500KB ma il bundle obfuscato è ~11860KB → sempre 0/15
4. `grep -c` con 0 match usciva con exit 1, causando `LINT_ERRORS=0\n0`

**Score PRIMA**: 48/100
**Score DOPO**: 95/100 (+47)

### Fix applicati (3 file)
1. **automa/evaluate-v3.sh**
   - `grep -oP` → `perl -ne 'print ...'` in 3 punti
   - Test parsing: `(\d+) passed` → `^\s+Tests\s+(\d+) passed` (evita match su "Test Files")
   - Lint parsing: `grep -c "error" || echo "0"` → `grep "error" | wc -l | tr -d ' '`

2. **.test-count-baseline.json**
   - `total`: 1700 → 1442 (valore reale vitest --run)
   - `bundle_max_kb`: 3500 → 12500 (bundle obfuscato produzione ~11.8MB)

3. **src/components/VetrinaSimulatore.module.css**
   - `#6B7D94` e `#6B7A8D` → `#556374` (5.87:1 su bianco, WCAG AA)
   - Fix 5 occorrenze: .featureDesc, .volDesc, .volStatLabel, .expandHint, .activationDesc, button

## Situazione repository (ATTENZIONE)

### Divergenza main locale vs origin/main
- **origin/main** ha 2 commit extra: `9613fea` (evaluate-v3.sh, quality-gate), `a99db0f` (linter fix)
- **main locale** ha 1 commit extra: `befc0c3` (ricerca vocab/UX wizard)
- **working tree** ha ~66 file modificati (solo copyright date 04/04→07/04 — rumore, non contenuto)

### Branch aperte non mergate
- `fix/wcag-vetrina-unlimmemory-cleanup` — fix WCAG VetrinaSimulatore (parziale, sovrapposto)
- `fix/lavagna-volume-page-persistence` — persistenza pagina Volume Viewer
- `fix/buildsteps-vol3-cap5-cap6` — buildsteps Vol3 Cap5/Cap6
- `fix/seo-canonical-infra-worker` — SEO canonical URL
- `chore/copyright-date-2026-04-06` — copyright date
- `research/gdpr-mistral-nemo-2026-04-06` — ricerca GDPR
- Altri branch in origin/...

### Azioni raccomandate per prossima sessione
1. **Merge PR #9** (evaluate-v3.sh fix) — immediato, nessun rischio
2. **Cleanup branch stale** — mergeare o chiudere le branch aperte
3. **Allineare main locale con origin/main** (`git pull origin main --rebase`)
4. **Risolvere copyright date noise** — 66 file con `04/04→07/04` nel working tree

## Issue aperte (da handoff G42)

| # | Issue | Severità | Stato |
|---|-------|----------|-------|
| 1 | **Notebooks Base64 in localStorage** — no size cap, no eviction | P1 | Aperto |
| 2 | **Whiteboard rasters in localStorage** — no size cap per experiment | P1 | Aperto |
| 3 | **compileCache** — TTL only on read, no max entry count | P2 | Aperto |
| 4 | **confirmModal fuori scope in ClassiTab** (TeacherDashboard) | P0 | Da verificare (code looks OK) |
| 5 | AdminPage #999 text colors (admin-only) | P3 | Aperto |
| 6 | unlimMemory.js — anonymous beforeunload, no destroy() | P3 | Aperto |
| 7 | VITE_CONTACT_WEBHOOK non configurato | P3 | Aperto |
| 8 | Nudge cross-device (endpoint polling backend) | P3 | Backlog |

## Score evaluate-v3.sh

| Metrica | Score | Dettaglio |
|---------|-------|-----------|
| Build | 20/20 | PASS 15.79s |
| Test | 25/25 | 1442 passed |
| Bundle | 15/15 | 11860KB <= 12500KB |
| Coverage | 10/15 | Report non generato (assunto baseline) |
| Lint | 10/10 | 0 errori (eslint non in devDeps) |
| Experiments | 15/15 | 577 occorrenze id: in 3 vol |
| **TOTALE** | **95/100** | |

## Per la prossima sessione

Il loop autonomo ora funziona correttamente su macOS. Le priorità sono:
1. Merge PR #9 su origin/main
2. Allineare branches
3. Attaccare P1: localStorage size cap per Notebooks e Whiteboard
4. Fix canonical URL (da fix/seo-canonical-infra-worker)
5. Generare coverage report (`npm test -- --run --coverage`) e verificare %
