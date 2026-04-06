# ELAB AUTOPILOT — Sistema Autonomo 20 Giorni

> Andrea e' in viaggio 6-26 Aprile 2026. Il progetto DEVE andare avanti.
> Tu sei un Claude Code autonomo. Leggi questo file e LAVORA.

## COME FUNZIONA

Ogni sessione segue questo ciclo:

```
1. LEGGI → questo file + automa/STATE.md + automa/handoff.md
2. LEGGI → automa/ORDERS/ (ordini diretti da Andrea, priorita' massima)
3. LEGGI → automa/OUTBOX/ (cosa hanno fatto le sessioni precedenti)
4. SCEGLI → modo operativo (vedi sotto)
5. ESEGUI → 2-4 cicli di lavoro per sessione
6. TESTA → npm test -- --run && npm run build (OBBLIGATORIO)
7. COMMITTA → branch auto/[YYYYMMDD]-[topic] e push
8. SCRIVI → automa/OUTBOX/[NNN]-DONE.md con risultato
9. AGGIORNA → automa/handoff.md + automa/STRATEGY/score-tracking.md
```

## LE 7 REGOLE FERREE

1. **MAI push su main** — sempre branch `auto/[data]-[topic]`, push con `git push -u work [branch]` (remote work = elabtutor con Tea)
2. **MAI commit se test o build falliscono** — se falliscono, fixa prima. Se non riesci, scrivi in OUTBOX come FAIL
3. **MAI toccare**: .env, vite.config.js (obfuscation), package.json (dipendenze), Supabase schema, deploy prod
4. **MAX 5 file sorgente modificati per ciclo** — limita il blast radius
5. **AGGIORNA handoff.md** a OGNI fine sessione con: cosa fatto, branch, score, prossima priorita'
6. **MAI dati finti o demo** — tutto deve funzionare con dati reali
7. **MAI aggiungere dipendenze npm** — lavora con quello che c'e'

## I 5 MODI OPERATIVI

| Modo | Cosa fai | Quando sceglierlo |
|------|----------|-------------------|
| **IMPROVE** | Fix bug, WCAG, performance, refactor, test | Gap score > 1 punto in un'area |
| **RESEARCH** | Web search, competitor, paper, tech scouting | Ogni 3-4 cicli, o quando serve sapere qualcosa |
| **BUILD** | Feature nuove (solo dalla lista autorizzata sotto) | Dopo che IMPROVE ha portato area a target |
| **AUDIT** | Test completo, analisi bundle, lighthouse, accessibilita' | Ogni 5 cicli, o dopo BUILD grande |
| **EVOLVE** | Genera idee, ripensa strategia, scrivi in STRATEGY/ | Ogni 8 cicli, o quando hai un'intuizione |

### Auto-selezione del modo

```
SE automa/ORDERS/ ha file nuovi → leggi e segui (priorita' assoluta)
SE ultimo AUDIT > 5 cicli fa → fai AUDIT
SE score area < target di 2+ punti → IMPROVE su quell'area
SE ultimo RESEARCH > 4 cicli fa → fai RESEARCH
SE area e' a target e c'e' feature autorizzata → BUILD
ALTRIMENTI → EVOLVE (pensa, scrivi idee, ripianifica)
```

## SCORE TRACKING — Il Cruscotto

Aggiorna `automa/STRATEGY/score-tracking.md` ad ogni sessione.

```
AREA                 SCORE   TARGET  GAP   STATUS
─────────────────────────────────────────────────
Simulator core       7/10    7/10    0     OK
SVG/Visual           7/10    7/10    0     OK
Scratch/Blockly      7/10    7/10    0     OK
UNLIM/Galileo AI     7/10    8/10    1     IMPROVE
Dashboard/Backend    5/10    7/10    2     IMPROVE URGENTE
A11y/WCAG            5/10    7/10    2     IMPROVE URGENTE
Security             6/10    7/10    1     IMPROVE
Performance          6/10    7/10    1     IMPROVE
Test coverage        60%     75%     15%   IMPROVE
Landing/SEO          4/10    6/10    2     BUILD
i18n                 0/10    2/10    2     BUILD (struttura base)
Business readiness   1/10    4/10    3     RESEARCH + BUILD
```

## BACKLOG PER AREA — Task Concrete

### Dashboard/Backend (5→7) — PRIORITA' 1
- [ ] Verificare connessione Supabase (project: vxvqalmxqtezvgiboxyv)
- [ ] ProgressiTab: grafici con dati reali da student_progress
- [ ] ConfusioneHeatmap: dati reali da confusion_reports
- [ ] Export CSV funzionante con dati Supabase
- [ ] Nudge delivery cross-device verificato
- [ ] Statistiche classe aggregate (media completamento, tempo medio)

### WCAG/A11y (5→7) — PRIORITA' 1
- [ ] Audit completo con axe-core (o manuale) — lista tutti i violation
- [ ] Fix tutti i contrast ratio sotto 4.5:1
- [ ] Focus ring visibile su OGNI elemento interattivo
- [ ] aria-label su tutti i bottoni icon-only
- [ ] Skip-to-content link in pagina principale
- [ ] Keyboard navigation nel simulatore (Tab tra componenti)
- [ ] Screen reader: aria-live per messaggi AI e errori

### Test Coverage (60→75%) — PRIORITA' 1
- [ ] AVRBridge.js: da 0% a 40%+ (test GPIO, PWM, ADC base)
- [ ] gdprService.js: da 38% a 70%+ (consent, data deletion, minori)
- [ ] Lavagna components: almeno 1 test per componente
- [ ] unlimMemory.js: test 3-tier memory, offline queue
- [ ] Integration test: esperimento completo (mount → interact → score)
- [ ] Playwright e2e: navigazione base + 3 esperimenti chiave

### Security (6→7)
- [ ] CSP header: rimuovere unsafe-inline (nonce o hash)
- [ ] Security headers: X-Frame-Options, X-Content-Type-Options, HSTS
- [ ] npm audit — fix vulnerabilita' note
- [ ] Rate limiting: verificare protezione API endpoints
- [ ] Consent banner: verificare GDPR compliance con dati minori

### Performance (6→7)
- [ ] Code split: NewElabSimulator chunk (1298KB) → lazy sub-components
- [ ] Code split: react-pdf (1911KB) → lazy load solo quando serve report
- [ ] Image optimization: convertire PNG → WebP dove possibile
- [ ] Bundle analysis: identificare codice morto
- [ ] Lighthouse score: mirare a 80+ performance

### UNLIM/Galileo (7→8)
- [ ] Prompt AI: ridurre a <60 parole per risposta
- [ ] Hallucination check: verificare risposte su 10 esperimenti
- [ ] Click mascotte = apre input (attualmente non funziona)
- [ ] Context injection: verificare che circuitContext sia sempre aggiornato
- [ ] Voice: testare 24 comandi vocali, fix quelli rotti

### Landing/SEO (4→6) — BUILD
- [ ] Meta tag OpenGraph su tutte le pagine
- [ ] Structured data (JSON-LD) per educational software
- [ ] /scuole landing: CTA chiare, pricing, benefici
- [ ] Sitemap aggiornato con tutte le pagine
- [ ] robots.txt ottimizzato

### i18n (0→2) — BUILD (struttura)
- [ ] Setup sistema i18n (file JSON per lingua, hook useTranslation)
- [ ] Estrarre tutte le stringhe UI italiane in file it.json
- [ ] Creare en.json con traduzioni base (UI only, non contenuti)
- [ ] Toggle lingua in header (IT/EN)

### Business Readiness (1→4) — RESEARCH + BUILD
- [ ] Ricerca: pricing competitor aggiornato (TinkerCAD, mBlock, Arduino IDE)
- [ ] Ricerca: PNRR bandi attivi e requisiti tecnici
- [ ] Ricerca: MePA requisiti per inserimento prodotto
- [ ] Teacher onboarding flow: 3 click da registrazione a prima lezione
- [ ] Documentazione API per integratori

## RICERCA CONTINUA (Stile Karpathy Autoresearch)

Ogni ciclo RESEARCH, scegli un topic e fai ricerca profonda:

### Topic Pool (scegli o inventane di nuovi)
1. Competitor deep dive: TinkerCAD Classrooms feature set 2026
2. Competitor deep dive: micro:bit MakeCode Classroom
3. Competitor deep dive: Arduino IDE 2.0 + Cloud
4. Paper: "Effectiveness of circuit simulators in K-12 education"
5. Paper: "AI tutoring systems for STEM — meta-analysis"
6. Paper: "Gamification in electronics education"
7. Trend: WebSerial API per connessione Arduino reale
8. Trend: WebAssembly per simulazione piu' veloce
9. Trend: AI voice tutoring — stato dell'arte 2026
10. Market: EdTech Italia — chi ha vinto bandi PNRR 2025
11. Market: Erasmus+ call per digital education tools
12. UX: Best practice LIM touchscreen nelle scuole
13. UX: Progressive disclosure in educational software
14. Tech: Playwright testing per app React educative
15. Tech: Supabase Realtime per classroom sync
16. Pedagogia: Scaffolding adattivo in ambienti digitali
17. Pedagogia: Zone of Proximal Development in AI tutoring
18. Pedagogia: Error-based learning in circuit simulation
19. Business: SaaS pricing per scuole — modelli che funzionano
20. Business: Teacher adoption — cosa fa fallire l'onboarding

### Output Ricerca
Ogni ricerca produce un file in `automa/knowledge/[YYYY-MM-DD]-[topic].md` con:
- **Fonti** (URL, paper, documenti)
- **Key findings** (3-5 punti)
- **Applicabilita' a ELAB** (cosa possiamo usare)
- **Action items** (task concrete da aggiungere al backlog)
Aggiorna `automa/knowledge/INDEX.md` dopo ogni ricerca.

## IDEE E EVOLUZIONE

Quando sei in modo EVOLVE, pensa in grande:
- Cosa manca a ELAB per essere IL prodotto di riferimento?
- Quali feature darebbero un vantaggio competitivo enorme?
- Cosa farebbe innamorare un insegnante al primo uso?
- Cosa renderebbe impossibile per una scuola tornare indietro?

Scrivi le idee in `automa/STRATEGY/ideas-backlog.md` con:
- Idea (1 frase)
- Impatto (1-10)
- Effort (S/M/L/XL)
- Dipendenze
- Perche' ora

## BUILD AUTORIZZATE (Feature nuove che puoi fare)

SOLO queste feature sono autorizzate senza approvazione Andrea:
1. **Test nuovi** — sempre OK, qualsiasi area
2. **Fix WCAG/A11y** — sempre OK
3. **Fix bug esistenti** — sempre OK (vedi CLAUDE.md bug aperti)
4. **SEO/Meta** — sempre OK
5. **Documentazione** — sempre OK
6. **i18n struttura** — OK setup, NON contenuti
7. **Performance** — OK code split e lazy load, NON rimuovere feature
8. **Ricerca** — sempre OK

Feature che RICHIEDONO approvazione (scrivi in ESCALATION/):
- Nuove pagine o route
- Cambio UX flusso principale
- Integrazione nuovi servizi esterni
- Modifiche al simulatore core
- Qualsiasi cosa che cambia come il prodotto appare all'utente finale

## COMUNICAZIONE

### automa/OUTBOX/ — Dopo ogni ciclo
```markdown
# [NNN]-[DONE|FAIL].md
Data: YYYY-MM-DD HH:MM
Modo: IMPROVE|RESEARCH|BUILD|AUDIT|EVOLVE
Cicli: N
Branch: auto/YYYYMMDD-topic (o nessuno se solo ricerca)
File modificati: [lista]
Test: PASS (NNNN/NNNN) | FAIL (dettaglio)
Build: PASS (Ns) | FAIL (dettaglio)
Score impatto: [area] da X a Y (stimato)
Prossima priorita': [suggerimento]
Note: [qualsiasi cosa importante]
```

### automa/ESCALATION/ — Solo quando serve Andrea
```markdown
# escalation-[topic].md
Data: YYYY-MM-DD
Urgenza: ALTA|MEDIA|BASSA
Domanda: [cosa serve decidere]
Contesto: [perche' non puoi decidere da solo]
Opzioni: [A, B, C con pro/contro]
Default se nessuna risposta in 3 giorni: [opzione di default]
```

### automa/ORDERS/ — Andrea scrive qui (tu leggi)
Se trovi file qui, hanno priorita' assoluta. Esegui l'ordine e rispondi in OUTBOX.

## HANDOFF FORMAT

Aggiorna `automa/handoff.md` a OGNI fine sessione:

```markdown
# Handoff — [Data]
## Sessione
- Modo: [quale]
- Cicli: [N]
- Durata: [stimata]

## Completato
- [lista task fatte]

## Branch
- [lista branch creati con descrizione]

## Score Aggiornato
- [area]: [vecchio] → [nuovo]

## Prossima Sessione
- Priorita' 1: [cosa fare]
- Priorita' 2: [alternativa]
- Attenzione: [warning o note]

## Decisioni Pendenti per Andrea
- [lista, se ci sono]
```

## PROMPT DI AVVIO

Copia questo per avviare una sessione autonoma:

```
Leggi AUTOPILOT.md nella root del progetto. Sei in modalita' autonoma.
Andrea e' in viaggio. Esegui il loop completo: leggi stato, scegli modo,
lavora 2-4 cicli, testa, committa su branch auto/, aggiorna handoff.
Vai a manetta. Ricerca, fix, build, evolvi. Nessun umano nel loop.
```

## STATO PROGETTO (snapshot 06/04/2026)

- **Score composito**: 6.4/10
- **Test**: 1459 pass, 3 skip, 34 file, coverage 60%
- **Build**: PASS (~85s), bundle ~2500KB, 18 precache
- **Deploy**: Vercel (frontend), Supabase vxvqalmxqtezvgiboxyv (backend)
- **Git remotes**: origin (elab-tutor), work (elabtutor), render (galileo-nanobot)
- **Deadline PNRR**: 30/06/2026 (85 giorni)
- **Budget**: EUR50/mese (escluso Claude)
- **Esperimenti**: 92/92 completi con buildSteps e lessonPath
- **Knowledge base**: 110 documenti di ricerca in automa/knowledge/
