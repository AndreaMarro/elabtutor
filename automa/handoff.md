# Session Handoff — S117 → S118 (23/03/2026)

## Cosa fatto
- **FASE 0**: MEMORY.md ristrutturato (309→38 righe), state.json machine-readable, backup salvato
- **FASE 1**: 5 file Python creati e testati:
  - `tools.py` — wrapper per Brain VPS, nanobot, Vercel, DeepSeek, Gemini, Kimi, Semantic Scholar, Gulpease
  - `checks.py` — 7 check veloci (health, build, galileo 9/10, content, gulpease, browser, iPad)
  - `orchestrator.py` — cuore del loop (check → prompt → claude headless → report → state)
  - `queue_manager.py` — file-based YAML task queue (pending/active/done/failed)
  - `vocab_checker.py` — vocabolario progressivo per volume/capitolo (4/4 self-test PASS)
- **FASE 2**: 10 task creati (3 P0, 7 P1) in queue/pending/
- **FASE 3**: Primo ciclo manuale — 5/7 check PASS, report JSON salvato
- **FASE 4**: Loop attivato — orchestrator PID 39815, watchdog launchd, caffeinate
- **FASE 5**: Deploy Vercel ✅, 3 curriculum YAML per Vol1 Cap6 ✅, score-trend report ✅

## Cosa NON fatto
- **API key** DeepSeek/Gemini/Kimi sono placeholder in .env — devono essere inserite
- **Claude CLI** non nel PATH — il loop gira check ma non lavora headless
- **Browser/iPad check** falliscono — Playwright non installato con browser binaries
- **Brain→nanobot** collegamento (P0-001 ancora in active)
- **iPad touch fix** (P1-002)
- **PWA offline** (P1-003)
- **8 blocchi Scratch mancanti** (P1-004)

## Decisioni prese
- orchestrator.py con fallback "interactive" quando claude CLI non disponibile
- Check browser/iPad sono "warn" non bloccanti
- Nanobot è già a v5.5.0 (non 5.3.0 come nel vecchio memory)
- Brain V13 su VPS risponde correttamente (`[AZIONE:play]`)

## File creati/cambiati
- `automa/tools.py` (NEW)
- `automa/checks.py` (NEW)
- `automa/orchestrator.py` (NEW)
- `automa/queue_manager.py` (NEW)
- `automa/vocab_checker.py` (NEW)
- `automa/.env` (NEW — placeholder keys)
- `automa/state/state.json` (NEW)
- `automa/state/MEMORY-BACKUP-309lines.md` (NEW)
- `automa/reports/score-trend.md` (NEW)
- `automa/reports/2026-03-23-cycle-1.json` (NEW)
- `automa/curriculum/v1-cap6-esp{1,2,3}.yaml` (NEW)
- `automa/queue/pending/*.yaml` (NEW — 10 task files)
- `automa/start.sh` (MODIFIED — dispatcher→orchestrator)
- `automa/watchdog.sh` (MODIFIED — heartbeat path + orchestrator)
- `~/.claude/.../memory/MEMORY.md` (REWRITTEN — 309→38 righe)
- `~/.claude/.../memory/architecture.md` (NEW)
- `~/.claude/.../memory/scores.md` (NEW)

## Prossima sessione deve
1. Inserire API key reali in `automa/.env` (DeepSeek, Gemini, Kimi)
2. Installare `claude` CLI: `npm install -g @anthropic-ai/claude-code`
3. Installare Playwright: `npx playwright install chromium`
4. Collegare Brain V13 al nanobot (env var BRAIN_URL su Render)
5. Fix iPad touch targets (P1-002)
6. Completare task P1 dalla coda

## Warning
- Il loop orchestrator gira in background (PID 39815) — per fermarlo: `touch automa/HALT`
- Watchdog launchd lo riavvia ogni 10 min se muore
- API key placeholder → i tool DeepSeek/Gemini/Kimi NON funzionano finché non si mettono key reali
- Nanobot è v5.5.0, non 5.3.0 — memory aggiornato
