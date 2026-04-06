# ELAB Researcher — Score Tracking
> Registro dei topic investigati dall'agente autonomo elab-researcher.
> Aggiornato automaticamente ad ogni run.

---

## Topic Completati

| Data | Topic | Report | Findings Chiave | Actionable |
|------|-------|--------|-----------------|-----------|
| 2026-04-06 | Vocabulary scaffolding electronics children | `RESEARCH-VOCAB-SCAFFOLDING-2026-04-06.md` | forbidden_terms → anticipatory prompts; analogia prima del termine; cluster 3-4 concetti | Sì → R001 in queue |
| 2026-04-06 | UX Wizard pattern per docenti inesperti | `RESEARCH-UX-WIZARD-CTCGO-2026-04-06.md` | wizard = una azione per step; progress bar con nomi; preview+confirm per azioni irreversibili | Sì → R002 in queue |
| 2026-04-06 | Competitor Arduino CTC GO! analisi struttura lezioni | `RESEARCH-UX-WIZARD-CTCGO-2026-04-06.md` | CTC GO: 20 sessioni, teacher guide digitale, LMS; ELAB vantaggio: AI real-time, simulatore browser, LIM-first | Integrato in R002 |

---

## ORDERS Creati

| ID | Titolo | Priorità | Effort | Data |
|----|--------|----------|--------|------|
| R001 | Galileo forbidden_terms → anticipatory prompts | P1 | 2-4h | 2026-04-06 |
| R002 | LessonPathPanel wizard redesign | P1 | sessione interattiva | 2026-04-06 |

---

## Topic Pool da Investigare
> Derivato da MASTER-PLAN.md sezione "RICERCA collegata"

### Fase 1 (priorità alta)
- [x] Vocabulary scaffolding electronics education children
- [ ] GDPR: verifica YAML curriculum — contengono dati personali?
- [ ] Mistral Nemo latency test per risposte teoria (<3s?)

### Fase 2 (priorità alta)
- [x] UX wizard pattern per docenti inesperti
- [x] Competitor: Arduino CTC GO! struttura lezioni
- [ ] Paper: "lesson planning AI scaffolding primary education"
- [ ] AI proactivity effects on teacher autonomy (parzialmente coperto in R-UX-WIZARD)

### Fase 3+ (priorità media)
- [ ] Analisi competitor: Tinkercard Circuits struttura lezioni
- [ ] Progressive Web App performance: service worker caching strategies 2026
- [ ] Scratch 3.0 pedagogy — cosa imparano prima di passare a C++
- [ ] Voice NLU accuracy children 8-14 anni (accento italiano, pronuncia imprecisa)

### Business (priorità bassa)
- [ ] PNRR FESR bandi aperti 2026 — update state scadenze
- [ ] Erasmus+ K2 opportunità per EdTech italiani
- [ ] MePa: processo di certificazione per forniture scuole

---

## Audit Produzione

| Data | Auditor | Report | Verdict | Problemi |
|------|---------|--------|---------|----------|
| 2026-04-06 | elab-auditor | `AUDIT-PRODUZIONE-2026-04-06.md` | PASS — nessun P0/P1 | P2: canonical URL sbagliato; P2: Kimi provider senza modello; P3: 24 elementi font<14px |
| 2026-04-06 | elab-auditor | `AUDIT-PRODUZIONE-2026-04-06-RUN2.md` | PASS — nessun P0/P1 | P3: CSP frame-ancestors ridondante nel meta tag; P2 confermati da Run#1 |
| 2026-04-06 | elab-auditor | `AUDIT-PRODUZIONE-2026-04-06-RUN3.md` | ⚠️ PASS con regressioni P2 | P1: 7 PR non mergiate (prod = pre-G44); P2: canonical ancora sbagliato; P2: n8n compile webhook 404 |

### Stato Produzione (2026-04-06, Run #3 — Audit autonomo curl+source)
- **Homepage**: 200 OK, 169ms, tutti asset caricano
- **Esperimenti testati (curl)**: 5/5 HTTP 200 (v1-cap10-esp3, v1-cap13-esp1, v2-cap4-esp2, v3-cap7-esp3, v3-extra-servo-sweep)
- **JS Errors browser**: N/A (headless run, JS Apple Events disattivato)
- **Galileo AI**: v5.5.0 UP, /health 200, /tutor-chat 200 ✓
- **n8n**: App UP, ma webhook `/compile-blink` → 404 ⚠️
- **Kimi provider**: model stringa vuota — P2 confermato
- **NUOVO P1**: 7 PR aperte non mergiate → main è pre-G44 → canonical sbagliato, buildSteps Vol3 parziali, WCAG fix non deployati
- **buildSteps Vol3**: 6/27 (22%) — PR#4 aggiunge 5 ma non mergiata
- **scratchXml**: 11/92 (12%) — P1 invariato
- **ORDERS creato**: `automa/ORDERS/P1-2026-04-06-prs-not-merged.md`

---

## Note Operative
- Automa usa ~/ELAB/elab-builder (NON ~/ELAB/elabtutor che non esiste)
- AUTOPILOT.md trovato in ~/ELAB/elab-builder/AUTOPILOT.md (non in ~/ELAB/elabtutor)
- Run schedulati: vedere ~/.claude/scheduled-tasks/elab-researcher/SKILL.md e elab-auditor/SKILL.md
- ATTENZIONE: AUTOPILOT.md segna issue #1/#2 come "CHIUSO G44" ma fix non è in main (PR non mergiata)
