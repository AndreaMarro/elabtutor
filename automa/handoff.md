# Session Handoff — S116 (22/03/2026, sessione maratona ~8h)

## Cosa fatto
- elab-local/ server completo (9 file Python, 51 test PASS, 21 E2E PASS con Ollama)
- qwen2.5:7b scaricato in Ollama locale
- Brain V13 deployato su VPS Hostinger (72.60.129.50:11434, galileo-brain-v13)
- Brain V13 testato: `[AZIONE:play]` corretto
- 13 agenti di ricerca completati → 23 knowledge file salvati
- 5 agenti brainstorming/design completati
- PDR completo con 16 aspetti, priorità, costi (€50/mese budget)
- Design orchestratore con programmatic tool calling
- Principi pedagogici documentati (teacher-principles.md)
- Percorso volumi documentato (volume-path.md)
- Tool config con modelli top tier (tools-config.md): DeepSeek R1, Gemini 2.5 Pro, Gemini 3 DeepThink, Kimi K2.5
- Prompt sessione loop scritto (PROMPT-SESSIONE-LOOP.md)
- Fix green LED Vf (2.8→2.2V) in CircuitSolver
- Electron View PoC integrato (sessione KICKOFF parallela)
- api.js modificato con tryLocalServer() cascade

## Cosa NON fatto
- Orchestratore NON implementato (solo design)
- Loop NON gira (zero automazione attiva)
- Brain NON collegato al nanobot cloud (serve env var su Render)
- Nessun deploy Vercel/Render
- MEMORY.md NON ristrutturato (309 righe)
- state.json NON creato
- Curriculum YAML NON creati
- Classi simulate NON eseguite
- iPad/LIM fix NON implementati
- PWA NON implementata
- AutoResearchClaw NON installato
- Blocchi Scratch mancanti NON aggiunti
- Zero test browser reali eseguiti

## Decisioni prese
- Brain V13 su VPS Hostinger €4/mese (non HF Spaces — build fallito)
- Claude Code = lavoratore principale (non solo decisore)
- DeepSeek R1 (reasoner) per scoring
- Gemini 2.5 Pro + Gemini 3 DeepThink per vision + decisioni complesse
- Kimi K2.5 per review (non OpenCode nel loop — bug hang)
- Budget €50/mese
- 16 aspetti coperti dal loop
- Ricerca integrata nel lavoro (AutoResearchClaw per problemi reali)
- Insegnante = utente reale, Galileo = libro intelligente

## Prossima sessione
Leggere `automa/PROMPT-SESSIONE-LOOP.md` e seguirlo SENZA PAUSE:
1. FASE 0: riordino MEMORY.md + state.json
2. FASE 1: implementare orchestrator.py + checks.py + tools.py
3. FASE 2: popolare coda task
4. FASE 3: primo ciclo manuale
5. FASE 4: attivare loop automatico
6. FASE 5: lavorare su P0/P1

## Warning
- VPS: potrebbe servire firewall rule per porta 11434
- API key in chiaro in tools-config.md — NON committare su git pubblico
- hookify blocca console.log — usare logger.js
- MEMORY.md troncato al 65% — ristrutturare è P0
- OpenCode bug #10411 — NON usare nel loop
