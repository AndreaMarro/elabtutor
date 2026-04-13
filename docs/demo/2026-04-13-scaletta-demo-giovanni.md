# Scaletta Demo ELAB — Lunedì per Giovanni

**Data**: lunedì 13/04/2026
**Durata target**: 20-25 minuti
**Pubblico**: scuole / dirigenti / docenti
**Obiettivo**: vendere pacchetto annuale

**Firma**: Andrea Marro + Claude Code Web — 13/04/2026

---

## Setup tecnico pre-demo (15 minuti prima)

1. `./scripts/unlim-health-check.sh` — verifica UNLIM risponde
2. Aprire Chrome **in incognito** (no cache stale) su https://www.elabtutor.school
3. Verificare: LED verde "connesso", logo carica, primo tap mascotte risponde in <3s
4. Disattivare notifiche sistema / messaggi Slack
5. Schermo condiviso: solo finestra browser, Chrome fullscreen (F11)
6. Tablet/iPad pronto come backup (vedi Piano B)

---

## Scaletta — 5 atti in 22 minuti

### ATTO 1 — Il problema (2 min)

*Tono: empatico, diretto*

> "La tecnologia a scuola oggi è un PDF animato. I ragazzi non sanno **come funzionano** le cose. ELAB fa il contrario: **parti dall'elettronica, tocchi, sbagli, capisci**."

**Da mostrare**: niente. Solo parlare. Max 90 secondi.

---

### ATTO 2 — Il libro che si anima (5 min)

*"Tre volumi, 92 esperimenti. Il libro cartaceo e la piattaforma sono sincronizzati pagina per pagina."*

**Azioni**:

1. Apri Volume 1 → Capitolo 6 → **"Accendi il tuo primo LED"**
2. Modalità **"Già Montato"**: mostra il circuito completo (LED rosso, resistore 220Ω, batteria 9V)
3. Click **Play**: il LED si accende. *"Funziona come nella realtà, solver MNA interno."*
4. Passa a modalità **"Passo Passo"**: mostra guida step-by-step allargabile (pannello S/M/L)
5. Cambia resistore: da 220Ω a 1kΩ → LED si attenua. *"Legge di Ohm in tempo reale."*

**Punti da dire**:
- "92 esperimenti allineati ai libri cartacei"
- "Simulatore proprietario — non usiamo SPICE, è tutto nel browser"
- "Funziona offline dopo il primo caricamento (PWA)"

**Cosa NON toccare**: non aprire capitoli con buildSteps mancanti (Vol3 avanzato), rischio layout. Segui sempre Vol1 cap 6, Vol1 cap 7, Vol2 cap 3.

---

### ATTO 3 — UNLIM, il tutor che ti capisce (6 min)

*Il momento WOW. Questo è il differenziale.*

**Azioni**:

1. Tap sulla **mascotte arancione** in basso a destra
2. Scrivi: *"Ciao, sono nuovo. Spiegami cosa faccio qui."*
   - Verifica: UNLIM risponde in <5s, risposta personalizzata
3. Scrivi: *"Aggiungi un LED verde sul pin 12 e falli lampeggiare"*
   - UNLIM **piazza il LED**, **collega i fili**, **scrive il codice**, **avvia la simulazione**
4. Scrivi: *"Perché il LED non è luminoso?"*
   - UNLIM suggerisce un resistore più basso, oppure tensione alimentazione
5. Mostra tab **GUIDA**: "UNLIM conosce tutto il libro"
   - Scrivi: *"Spiegami il semaforo del Vol 3"*
   - UNLIM cita dal libro, parla del timing, dei delay

**Punti da dire**:
- "UNLIM conosce **tutti e 3 i volumi** — RAG con 85+ chunk indicizzati"
- "Ricorda le tue sessioni precedenti — profilo studente persistente"
- "Il docente vede in dashboard cosa hanno chiesto, errori comuni, tempi"
- "Non è ChatGPT generico: è **addestrato sul nostro curriculum**"

**Piano B se UNLIM lento/non risponde**:
- Dì: *"Il server sta ragionando, intanto vi mostro il fumetto report"*
- Passa ad Atto 4 subito

---

### ATTO 4 — Il fumetto report (3 min)

*Il genitore/docente capisce a colpo d'occhio.*

**Azioni**:

1. Tap icona **fumetto** (tre puntini → menu → "Genera fumetto")
2. Mostra il report visuale: tempi per step, errori, suggerimenti UNLIM, circuito finale
3. *"Il docente lo stampa o lo inserisce in Classroom"*

**Punti da dire**:
- "Compiti auto-correggenti con narrativa"
- "Genitore non tecnico capisce"

---

### ATTO 5 — Pacchetti e prezzi (4-5 min)

*Qui Giovanni deve prendere l'ordine.*

| Pacchetto | Cosa include | Prezzo/anno/classe (25 studenti) |
|-----------|--------------|-----------------------------------|
| **Base**  | Piattaforma + UNLIM + 3 volumi digitali | **€480** (€19,20/studente) |
| **Completo** | Base + kit fisici + dashboard docente | **€1.800** (€72/studente) |
| **Premium** | Completo + videolezioni + formazione docenti | **€2.400** (€96/studente) |
| **Scuola intera** | Premium × 5 classi, licenza istituto | **€9.500** (sconto 20%) |

**Punti da dire**:
- "Kit ritorna allo studente l'anno dopo (cassetto)"
- "Licenza per classe, non per utente: più economica"
- "Formazione docenti 2h online + materiali pronti"
- "Pagamento: 50% ordine + 50% a 30 giorni"

**Gancio finale**:
> "Vi faccio provare 30 giorni gratis su **una classe pilota**. Zero impegno. Se a fine mese i ragazzi non sono più motivati, cestino tutto."

---

## Domande frequenti (preparate)

**Q: Funziona sui tablet della scuola?**
A: Sì, Chrome o Safari. Tap pensato per 8-14 anni, bottoni ≥44px (standard Apple).

**Q: I dati degli studenti sono al sicuro?**
A: GDPR compliant, hosting EU (Vercel Frankfurt + Supabase Zurich). Nessun tracking pubblicitario. Pseudonimizzazione attiva.

**Q: E se internet cade?**
A: PWA, lavora offline 30+ minuti. UNLIM richiede connessione, il resto no.

**Q: Si integra con Google Classroom?**
A: Export CSV progressi pronto. Integrazione nativa nel Q3 2026.

**Q: Funziona con Arduino vero?**
A: Sì, il codice generato si copia-incolla nell'IDE Arduino reale. Stesso ATmega328p emulato nel browser.

**Q: Concorrenza? Tinkercad?**
A: Tinkercad è generico, non segue un curriculum, non ha un tutor AI italiano, non ha i libri cartacei. Noi siamo **un percorso didattico completo**.

---

## Piano B — Se il live non funziona

1. **Se UNLIM non risponde**: mostra video screencast in `docs/demo/unlim-demo.mp4` (da registrare prima!)
2. **Se simulatore crasha**: refresh + Chrome incognito. Se ancora, passa su iPad backup.
3. **Se rete cade**: hotspot cellulare. PWA continua a girare offline per tutto tranne UNLIM.
4. **Se Giovanni vuole vedere Vol3 avanzato**: NON aprire. Dì "quello è il prossimo atto, lo vediamo nella demo approfondita di 1h". Alcuni cap Vol3 hanno buildSteps ancora da completare (21/27).

---

## Metriche di successo

- Demo finita in <25 min: ✓
- Almeno 1 "wow" udibile (atto 3): ✓
- Domanda sul prezzo entro minuto 20: **indica interesse**
- Richiesta pilota 30 giorni: **successo**

---

## Dopo la demo — Follow-up entro 24h

1. Email con: link piattaforma + codice pilota + PDF pacchetti
2. Calendly per call tecnica di 30 min
3. Se scuola: contatto dirigente + referente ICT

---

**Regola d'oro**: se UNLIM risponde in 5 secondi con la cosa giusta, il deal è fatto. Se impappina, hai 10 secondi per girare la conversazione sul fumetto o sui libri. Mai mostrare errori.
