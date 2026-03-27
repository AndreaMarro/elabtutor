# UNLIM Brain — Design del Cervello Pedagogico
> Questo documento sviscera l'idea. NON è implementazione — è analisi profonda.
> Da qui nascono i task concreti. Prima capire, poi fare.

---

## COS'È IL CERVELLO PEDAGOGICO

Oggi UNLIM ha:
- **Mani** (26+ action tags) → può manipolare il simulatore
- **Occhi** (vision Kimi/Gemini) → può vedere il circuito
- **Voce** (Whisper) → può ascoltare il docente
- **Memoria corta** (contesto sessione) → sa cosa è stato detto

Gli manca:
- **Sapere COSA insegnare** → non conosce il curriculum dei volumi
- **Sapere QUANDO** → non sa a che punto è la classe
- **Sapere COME** → non sa preparare una lezione
- **Sapere PERCHÉ** → non sa quali misconcezioni hanno i bambini
- **Sapere QUANDO TACERE** → non sa quando il docente vuole parlare lui

---

## ANALISI PROFONDA DEI 3 PEZZI

### PEZZO 1: UNLIM conosce i volumi

**Cosa serve concretamente:**
Per ogni esperimento (67 totali) UNLIM deve avere nel contesto:
```
ID: v1-cap6-esp1
Volume: 1 (SCOPERTA)
Capitolo: 6 — Cos'è il diodo LED?
Titolo: Accendi il tuo primo LED
Componenti: batteria 9V, resistore 470Ω, LED rosso, breadboard, 3 fili
Obiettivo didattico: capire che il LED ha una polarità (anodo/catodo)
Prerequisiti: nessuno (primo esperimento)
Concetti introdotti: LED, anodo, catodo, polarità, circuito chiuso
Vocabolario permesso: LED, batteria, filo, acceso, spento, polo
Vocabolario VIETATO: resistenza (si introduce cap 7), parallelo (cap 9)
Misconcezioni comuni:
  - "Il LED funziona in entrambi i versi" → NO, ha polarità
  - "Se non si accende è rotto" → probabilmente è al contrario
  - "Il LED non ha bisogno di niente" → senza resistore brucia (cap 7)
Domanda provocatoria per la classe: "Secondo voi, se giro il LED funziona lo stesso?"
Esperimento successivo: v1-cap6-esp2 (LED senza resistore — cosa NON fare)
Teacher briefing: "Non dire subito che il LED ha una polarità. Fallo provare al contrario."
```

**Dove mettere questa conoscenza:**
- NON nel prompt di sistema (troppo lungo per 67 esperimenti)
- SÌ nel curriculum YAML (61/62 già esistono in `automa/curriculum/`)
- SÌ nel contesto dell'API call `/chat` (il campo `experiment_id` già esiste)
- Il nanobot deve CARICARE il YAML dell'esperimento corrente nel contesto

**Gap attuale:**
- I curriculum YAML esistono ma NON vengono iniettati nel prompt di Galileo
- Il campo `experiment_id` viene passato ma il nanobot non lo usa per caricare il YAML
- api.js ha SOCRATIC_INSTRUCTION ma non include il curriculum specifico

**Complessità:** MEDIA — il dato esiste, serve il wiring

---

### PEZZO 2: UNLIM prepara la lezione

**Cosa significa "preparare la lezione":**

Il docente apre l'esperimento v1-cap8-esp1 (Il Pulsante).
UNLIM non aspetta domande. UNLIM dice:

```
PREPARA (prima che il docente faccia nulla):
"Oggi il Capitolo 8: il Pulsante! 🔘
 Ti servono: 1 pulsante, 1 LED, 1 resistore 470Ω.
 La classe ha già fatto il LED (cap 6) e il resistore (cap 7).
 Concetto nuovo: il circuito può essere APERTO o CHIUSO.
 Vuoi che monto il circuito per te? O fai tu?"

MOSTRA (se il docente dice sì):
[INTENT: piazza pulsante, LED, resistore, collega]
"Ecco il circuito montato. Il LED è spento perché il pulsante è aperto."

CHIEDI (suggerimento per il docente):
"Prova a chiedere alla classe: 'Secondo voi, cosa succede se premo il pulsante?'"

OSSERVA (quando il docente preme play):
[AZIONE:play]
[AZIONE:highlight:btn1]
"Guarda! Quando premi il pulsante, il circuito si chiude e il LED si accende."

CONCLUDI:
"Oggi abbiamo imparato: il pulsante APRE e CHIUDE il circuito.
 È come un interruttore: acceso = circuito chiuso, spento = circuito aperto.
 Prossimo: Cap 8 Esp 2 — due LED con un pulsante!"
```

**Il punto chiave:** UNLIM non è reattivo (aspetta domande). È PROATTIVO (prepara il percorso).

**Dove questo accade nell'interfaccia:**
- NON nella chat (troppo nascosta)
- SÌ nel pannello esperimento (LessonPathPanel già esiste con 668 LOC)
- SÌ come overlay contestuale sopra il simulatore
- SÌ come suggerimenti inline accanto ai componenti

**Gap attuale:**
- LessonPathPanel esiste ma non è connesso a UNLIM/Galileo
- I suggerimenti sono statici (hardcoded negli step), non generati da AI
- Non c'è il flusso PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI
- Non c'è proattività — UNLIM aspetta sempre una domanda

**Complessità:** ALTA — serve redesign del flusso, non solo wiring

---

### PEZZO 3: UNLIM inline (non in una chat)

**Cosa significa "inline":**

Oggi: il docente ha una domanda → apre la chat → scrive → aspetta 20s → legge risposta.
Domani: UNLIM mostra suggerimenti DENTRO il simulatore, senza che il docente chieda.

Esempi concreti:
- Il docente piazza un LED al contrario → un tooltip appare: "Il LED è al contrario! L'anodo (+) va in alto."
- Il docente non fa nulla per 30s → un suggerimento appare nel pannello: "Prova a premere ▶ per vedere cosa succede."
- Il docente finisce l'esperimento → un banner appare: "Complimenti! Vuoi passare al prossimo esperimento?"
- Il docente è al passo 3 di 8 → il pannello mostra: "Passo 3: Collega il filo rosso al polo + della batteria."

**Dove questo appare:**
```
┌─────────────────────────────────────────────────────┐
│ [UNLIM] Oggi: Il Pulsante (Cap 8)                   │ ← header esperimento
│ Passo 3 di 5: MOSTRA                                │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │      BREADBOARD + CIRCUITO               │
│ volumi   │                                          │
│          │   ┌──────────────────┐                   │
│          │   │ 💡 Il LED è al   │ ← tooltip inline  │
│          │   │ contrario!       │                   │
│          │   └──────────────────┘                   │
│          │                                          │
├──────────┼──────────────────────────────────────────┤
│          │ PREPARA │ MOSTRA │ CHIEDI │ OSSERVA │ ✓  │ ← progress bar
│          ├──────────────────────────────────────────┤
│          │ "Prova a chiedere: cosa succede se       │ ← suggerimento
│          │  premo il pulsante?"                     │   contestuale
└──────────┴──────────────────────────────────────────┘
```

La chat esiste ancora ma è SECONDARIA. Il flusso principale è:
progress bar 5-step + suggerimenti inline + tooltip sui componenti.

**Gap attuale:**
- La chat è il canale PRIMARIO di comunicazione con UNLIM
- Non esistono tooltip contestuali sui componenti
- Non esiste una progress bar PREPARA→CONCLUDI
- I suggerimenti non sono proattivi

**Complessità:** MOLTO ALTA — è un redesign dell'interazione, non una feature

---

## ONESTÀ BRUTALE: COSA È FATTIBILE E COSA NO

### Fattibile ora (1-2 settimane)
1. **Pezzo 1 parziale**: iniettare il curriculum YAML dell'esperimento corrente
   nel contesto di Galileo. Il dato esiste. Serve il wiring nel nanobot.
2. **LessonPathPanel migliorato**: connettere i 5 step (PREPARA→CONCLUDI)
   al curriculum YAML. Contenuto semi-statico generato dai YAML.
3. **Galileo proattivo al caricamento**: quando si apre un esperimento,
   UNLIM dice "Oggi facciamo..." senza aspettare domande.

### Fattibile a medio termine (1-2 mesi)
4. **Pezzo 2 completo**: UNLIM genera la lezione dinamicamente.
   Serve: curriculum nel contesto + prompt engineering + test con docenti.
5. **Tooltip inline**: suggerimenti contestuali accanto ai componenti.
   Serve: event system (già esiste) + UI layer + logica "quando suggerire".
6. **Tracking classe**: "siamo al capitolo 8" persiste tra sessioni.
   Serve: localStorage o backend.

### Difficile / Richiede decisioni architetturali
7. **Pezzo 3 completo**: eliminare la chat come canale primario.
   È un redesign dell'interazione. Serve prototipo + test con docenti.
8. **UNLIM costruisce circuiti automaticamente per la lezione**.
   Il codice esiste ([INTENT:JSON]) ma non è mai stato testato in flusso lezione.
9. **Adattamento al livello del docente**: UNLIM capisce se il docente
   sa già qualcosa. Serve: tracking + inference.

### NON fattibile senza risorse esterne
10. **Voice control completo del simulatore**: serve NLU robusto + validator.
    Il codice Whisper c'è ma non c'è il parser intent→azione strutturata.
11. **Test con docenti reali**: serve almeno 1 insegnante che prova.
    Nessun automatismo può sostituire questo.
12. **GDPR certificato**: serve consulente legale per DPIA.

---

## SEQUENZA DI IMPLEMENTAZIONE RACCOMANDATA

```
Settimana 1: WIRING (Pezzo 1)
  → Curriculum YAML nel contesto Galileo
  → UNLIM dice "Per questo esperimento ti serve..."
  → Test: 5 domande con experiment_id diversi

Settimana 2: FLUSSO (Pezzo 2 base)
  → LessonPathPanel connesso al curriculum
  → 5 step semi-statici (PREPARA→CONCLUDI) da YAML
  → UNLIM proattivo al caricamento esperimento
  → Test: simulazione docente inesperto segue percorso

Settimana 3: INLINE (Pezzo 3 base)
  → Progress bar 5-step sopra il simulatore
  → Suggerimento contestuale nel pannello (non chat)
  → Chat minimizzata per default
  → Test: il docente non apre MAI la chat e completa la lezione

Settimana 4: POLISH
  → Tooltip inline sui componenti (errore polarità LED)
  → Tracking capitolo corrente (localStorage)
  → Galileo ancora più breve nelle risposte inline
  → Test E2E completo con simulazione Prof.ssa Rossi
```

---

## RISCHI

1. **Scope creep**: "UNLIM fa tutto" è un obiettivo infinito. Limitarsi ai 3 pezzi.
2. **Over-engineering**: il Pezzo 1 (wiring YAML) vale più di 100 cicli di ricerca.
3. **Dimenticare il docente**: ogni feature DEVE essere testata con "la Prof.ssa Rossi
   lo capirebbe?" — non "è tecnicamente elegante?"
4. **Chat che non muore**: la tentazione è aggiungere l'inline SENZA ridurre la chat.
   La chat DEVE diventare secondaria, altrimenti il prodotto resta dual-channel.
5. **Latenza**: se UNLIM prepara la lezione con una API call da 20s, il docente
   aspetta 20s prima di iniziare. Serve pre-generazione o cache.
