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
| 2026-04-06 | GDPR: verifica YAML curriculum — contengono dati personali? | `RESEARCH-GDPR-YAML-CURRICULUM-2026-04-06.md` | YAML = solo contenuto pedagogico, nessun PII; problema P2: parent_email in chiaro in localStorage | Sì → R003 |
| 2026-04-06 | Mistral Nemo latency test per risposte teoria (<3s?) | `RESEARCH-MISTRAL-NEMO-LATENCY-2026-04-06.md` | Nemo: TTFT 0.33s, ~1.6s per risposta breve, ma non su Groq; Llama 3.1 8B su Groq (684 tok/s) è scelta migliore | No ORDER |

---

## ORDERS Creati

| ID | Titolo | Priorità | Effort | Data |
|----|--------|----------|--------|------|
| R001 | Galileo forbidden_terms → anticipatory prompts | P1 | 2-4h | 2026-04-06 |
| R002 | LessonPathPanel wizard redesign | P1 | sessione interattiva | 2026-04-06 |
| R003 | GDPR: parent_email in chiaro in localStorage → mask before save | P2 | 30-60 min | 2026-04-06 |

---

## Topic Pool da Investigare
> Derivato da MASTER-PLAN.md sezione "RICERCA collegata"

### Fase 1 (priorità alta)
- [x] Vocabulary scaffolding electronics education children
- [x] GDPR: verifica YAML curriculum — contengono dati personali?
- [x] Mistral Nemo latency test per risposte teoria (<3s?)

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

## Note Operative
- Automa usa ~/ELAB/elab-builder (NON ~/ELAB/elabtutor che non esiste)
- AUTOPILOT.md non trovato — usato MASTER-PLAN.md come riferimento topic
- Run schedulati: vedere ~/.claude/scheduled-tasks/elab-researcher/SKILL.md
