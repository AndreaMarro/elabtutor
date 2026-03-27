# GALILEO / UNLIM — Mappa Completa Capacità

> Ultimo aggiornamento: 27/03/2026 (post G4)
> Fonte: audit diretto del codice ElabTutorV4.jsx, api.js, UnlimWrapper.jsx, unlimMemory.js

---

## Architettura

```
UTENTE (docente/studente su LIM o tablet)
    │ testo (barra input) / voce (Web Speech API — non ancora implementata)
    ▼
UNLIM WRAPPER (React frontend)
    │ sendChat(message, images, options)
    ▼
FALLBACK CHAIN:
    1. Local Server (Brain VPS 72.60.129.50:11434 — galileo-brain-v13, Qwen3.5-2B)
    2. Nanobot Cloud (Render — DeepSeek + Groq racing text, Gemini vision)
    3. Backend Webhook (n8n Hostinger)
    4. Local Knowledge Base (offline fallback)
    ▼
RISPOSTA con [AZIONE:cmd:args] tags
    │ parsing regex in ElabTutorV4.jsx riga 1755+
    ▼
SIMULATORE (esecuzione azioni via window.__ELAB_API)
```

---

## 26+ Azioni sul Simulatore

Ogni azione è un tag `[AZIONE:comando:argomenti]` generato dall'AI nella risposta.
Parsato da ElabTutorV4.jsx, eseguito via `window.__ELAB_API`.

### Controllo Simulazione
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `play` | Avvia simulazione DC/AVR | `[AZIONE:play]` |
| `pause` | Ferma simulazione | `[AZIONE:pause]` |
| `reset` | Reset stato simulazione | `[AZIONE:reset]` |

### Navigazione
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `loadexp` | Carica esperimento (componenti + wires + layout) | `[AZIONE:loadexp:v1-cap6-esp1]` |
| `opentab` | Naviga a tab (simulatore/manuale/video/lavagna/detective/poe/reverse/review) | `[AZIONE:opentab:simulatore]` |
| `openvolume` | Apre volume PDF a pagina specifica | `[AZIONE:openvolume:1:33]` |

### Componenti
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `addcomponent` | Aggiunge componente al canvas (tipo + x,y) | `[AZIONE:addcomponent:resistor:200:150]` |
| `removecomponent` | Rimuove componente per ID | `[AZIONE:removecomponent:r1]` |
| `movecomponent` | Sposta componente a coordinate | `[AZIONE:movecomponent:led1:300:200]` |
| `highlight` | Glow 4s su componenti (comma-separated) | `[AZIONE:highlight:led1,r1]` |
| `highlightpin` | Glow su pin specifici | `[AZIONE:highlightpin:bb1:a5,bb1:f9]` |

### Fili (Wires)
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `addwire` | Collega due pin | `[AZIONE:addwire:bat1:positive:bb1:bus-top-plus-1]` |
| `removewire` | Rimuove filo per indice | `[AZIONE:removewire:3]` |
| `clearall` | Pulisci canvas completo | `[AZIONE:clearall]` |

### Interazione Componenti
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `interact` | Premi pulsante, gira pot, muovi slider | `[AZIONE:interact:btn1:press]` |
| `setvalue` | Cambia valore (resistance, position, lightLevel) | `[AZIONE:setvalue:r1:resistance:470]` |
| `measure` | Leggi tensione/corrente da componente | `[AZIONE:measure:led1]` |
| `diagnose` | Diagnosi automatica circuito completo | `[AZIONE:diagnose]` |

### Editor Codice
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `compile` | Compila codice Arduino corrente | `[AZIONE:compile]` |
| `openeditor` | Mostra editor codice | `[AZIONE:openeditor]` |
| `closeeditor` | Nascondi editor | `[AZIONE:closeeditor]` |
| `switcheditor` | Cambia modo (scratch/arduino) | `[AZIONE:switcheditor:scratch]` |
| `loadblocks` | Carica workspace Scratch XML | `[AZIONE:loadblocks:...]` |

### Altro
| Comando | Cosa fa | Esempio |
|---------|---------|---------|
| `quiz` | Lancia quiz contestuale | `[AZIONE:quiz:v1-cap6-esp1]` |
| `youtube` | Cerca video YouTube | `[AZIONE:youtube:come funziona LED]` |
| `createnotebook` | Crea taccuino appunti | `[AZIONE:createnotebook:Lezione LED]` |
| `undo` / `redo` | Annulla/ripeti ultima operazione | `[AZIONE:undo]` |

### Risoluzione ID Intelligente
L'executor risolve nomi naturali in ID componenti:
- "il LED" → trova l'unico LED nel circuito
- "la resistenza" → trova il resistore
- "il pulsante" → trova il push-button
- Alias tipo: `TYPE_ALIASES` mappa nomi italiani/inglesi ai tipi corretti

---

## Capacità AI (Backend Nanobot)

### Testo
| Capacità | Provider | Stato |
|----------|----------|-------|
| Risponde in italiano a domande di elettronica | DeepSeek + Groq (racing) | ✅ Funziona |
| Genera azioni `[AZIONE:...]` nel testo | System prompt nanobot.yml | ✅ Funziona |
| Multi-component intent ("costruisci LED + resistenza") | Parsing intelligente | ✅ Funziona |
| Safety filter (blocca contenuto pericoloso/volgare) | Nanobot filter | ✅ Funziona |
| Linguaggio 10-14 anni con analogie quotidiane | System prompt | ✅ Funziona |
| Non rivela mai l'implementazione di ELAB Tutor | System prompt | ✅ Funziona |

### Visione
| Capacità | Provider | Stato |
|----------|----------|-------|
| Analisi screenshot circuito | Gemini vision specialist | ✅ Funziona |
| Foto reale del kit → diagnosi | Gemini + circuit specialist | ✅ Funziona |
| Auto-screenshot del simulatore | Canvas → base64 → Gemini | ✅ Funziona |

### Diagnostica
| Capacità | Endpoint | Stato |
|----------|----------|-------|
| Diagnosi proattiva circuito | `/diagnose` | ✅ Funziona |
| Hint progressivi per esperimento | `/hints` | ✅ Funziona |
| Preload contesto esperimento | `/preload` | ✅ Funziona |

### Contesto
| Capacità | Come | Stato |
|----------|------|-------|
| Sa quale esperimento è aperto | `experimentId` in ogni richiesta | ✅ |
| Sa lo stato del circuito | `circuitState` serializzato | ✅ |
| Sa il contesto del simulatore | `simulatorContext` oggetto | ✅ |
| Curriculum/lesson path come contesto | `experimentContext` stringa | ✅ |

---

## Memoria Studente (Frontend)

File: `src/services/unlimMemory.js`
Storage: `localStorage` (chiave `elab_unlim_memory`)

| Capacità | Dettaglio |
|----------|-----------|
| Esperimenti completati | Per ID, con risultato (success/partial/skipped) e timestamp |
| Tentativi per esperimento | Contatore incrementale |
| Risultati quiz | Per esperimento, con score |
| Errori comuni | Categoria + dettaglio, max 50 |
| Sessioni salvate | Ultime 10, con riassunto |
| Profilo globale | `window.__unlimMemory` accessibile da `buildTutorContext()` |

### Limiti attuali
- **Solo localStorage** — ogni device è isolato, non c'è sync backend
- **Non condiviso con Teacher Dashboard** — il docente non vede i progressi
- **Non usato nei lesson paths** — UNLIM non adatta i percorsi in base alla storia

---

## Frontend UNLIM (5 Componenti React)

| Componente | Righe | Cosa fa |
|-----------|-------|---------|
| `UnlimWrapper.jsx` | ~210 | Wrappa ElabTutorV4, auto-rileva esperimento, gestisce sendChat, mostra benvenuto |
| `UnlimMascot.jsx` | ~80 | Mascotte nell'angolo (lettera "U"), stati idle/active/speaking, onClick toggle |
| `UnlimOverlay.jsx` | ~120 | Toast/messaggi contestuali, posizionamento, auto-dismiss, animazioni |
| `UnlimInputBar.jsx` | ~150 | Barra input testo + mic + invio, auto-focus, loading state |
| `UnlimModeSwitch.jsx` | ~60 | Toggle UNLIM/Classic mode, persist in localStorage |

### Lesson Path Panel
| File | Righe | Cosa fa |
|------|-------|---------|
| `LessonPathPanel.jsx` | ~850 | Percorso 5 fasi (PREPARA→CONCLUDI), progress bar, "Monta il circuito", analogie, errori comuni |
| `lesson-paths/index.js` | ~55 | Registry 13 JSON, getLessonPath(), hasLessonPath() |
| `lesson-paths/*.json` | ~170 ciascuno | 13 file JSON con 5 fasi, vocabolario, analogie, assessment |

---

## Cosa NON Esiste Ancora

### Critico (bloccante per la visione UNLIM)
| Gap | Impatto | Dove servirebbe |
|-----|---------|----------------|
| **Controllo vocale** | `onMicClick` prop vuota | Web Speech API → UnlimInputBar |
| **TTS (text-to-speech)** | UNLIM non "parla" sulla LIM | `useTTS.js` esiste ma non integrato in UNLIM |
| **54 lesson paths mancanti** | 13/67 coperti | Batch generazione (automa) |
| **Mascotte reale** | È una lettera "U" | SVG/animazione del robottino ELAB |
| **Annotazioni sulla breadboard** | Solo Annotation.jsx generico | Appunti posizionati su componenti |
| **PDF report fumetto** | Non esiste | Generazione PDF con storia lezione |
| **Struttura lezione adattiva** | I 5 step sono fissi | UNLIM che varia in base al contesto |
| **Messaggi contestuali posizionati** | Toast sempre in top-center | Overlay accanto al componente rilevante |

### Importante (non bloccante ma di valore)
| Gap | Impatto |
|-----|---------|
| Teacher Dashboard ↔ lesson paths | Docente non vede quali percorsi esistono |
| Memoria cross-device (backend sync) | Ogni tablet ricomincia da zero |
| Brain V13 collegato al nanobot | Risposte più specifiche per ELAB |
| Nanobot risposte < 60 parole | Troppe parole per la LIM |
| `/gdpr-status` endpoint | Compliance documentazione |

---

## Numeri Reali (da audit G4)

| Metrica | Valore |
|---------|--------|
| Azioni implementate | 26+ |
| Lesson paths pronti | 13/67 (19%) |
| Esperimenti totali | 67 (38 Vol1 + 18 Vol2 + 11 Vol3) |
| Componenti SVG simulatore | 21 tipi |
| Blocchi Scratch | 22 |
| Build time | ~26s |
| Bundle ElabTutorV4 | 1,108 KB (258 KB gzip) |
| Console errors | 0 nuovi (solo borderColor pre-esistente) |
| Vocab violations lesson paths | 0 reali |
| Bug critici aperti | 0 |
