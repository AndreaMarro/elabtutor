# Audit Report — 2026-04-07 (ELAB Auditor v2)

## Sito: carica (330ms)
- URL: https://www.elabtutor.school
- Titolo: ELAB Tutor — Simulatore di Elettronica e Arduino per la Scuola
- Load event: 330ms, DOMContentLoaded: 303ms ✅
- Login: funziona con chiave ELAB2026 → redirect a #lavagna ✅
- Logo immagine: carica correttamente (alt="ELAB") ✅
- 3 volumi: presenti nel selettore esperimenti (Volume 1 "Le Basi", Volume 2 "Approfondiamo", Volume 3 "Arduino") ✅

---

## Esperimenti testati

| Exp | Carica | SVG | Breadboard | Istruzioni | Codice |
|-----|--------|-----|------------|------------|--------|
| Vol1 Cap6 Esp1 — Accendi il tuo primo LED | OK | 32/40 visibili | OK | OK (Passo Passo, Già Montato) | N/A |
| Vol2 Cap3 Esp1 — Controlliamo la carica della batteria | OK | 32/40 visibili | OK | OK | N/A |
| Vol2 Cap9 Esp1 — Fototransistor come sensore | OK | 31/35 visibili | OK | OK | N/A |
| Vol3 Cap5 Esp1 — Blink con LED_BUILTIN | OK | 44/52 visibili | OK | OK | ⚠️ FREEZE (vedi P1) |
| Vol3 Cap7 Ese7.3 — Pulsante con INPUT_PULLUP | OK | 28/60 visibili | OK | OK | Editor carica |

**Note esperimenti:**
- Tutti i simulatori caricano breadboard SVG e componenti correttamente
- Modalità "Già Montato" e "Passo Passo" presenti in tutti gli esperimenti testati
- Vol3 ha editor Blockly + Arduino C++ funzionante (visivamente)
- Vol3: `▶ Compila & Carica` causa **freeze del renderer** (~45s, recuperabile solo con hard navigation) — vedi P1

---

## Responsivo

**Nota:** Il ridimensionamento finestra non era disponibile (schermo 1920x1080, finestra invisibile).
Analisi via CSS media queries e DOM:

| Viewport | Status |
|----------|--------|
| Mobile 375x812 (≤767px) | CSS breakpoint definito ✅, test visivo non eseguibile |
| Tablet 768x1024 | CSS breakpoint definito ✅, test visivo non eseguibile |
| LIM 1024x768 | CSS breakpoint definito ✅, test visivo non eseguibile |

- **16 elementi con overflow orizzontale** rilevati al viewport desktop — ⚠️ possibile problema su schermi stretti
- **4 bottoni sotto soglia 44px touch target**: "▲Monitor Seriale" (w:12px!), "Nuova" (w:42px), "Open chat" (32px), "Dismiss" (32px)

---

## Accessibilità: 6/10

| Check | Risultato |
|-------|-----------|
| ARIA landmarks (main, banner, nav) | ✅ tutti presenti |
| Focus styles (:focus CSS) | ✅ presenti |
| Immagini con alt | ✅ 0 immagini senza alt |
| Headings (H1/H2) | ❌ nessun H1/H2 nella vista esperimento |
| Elementi interattivi senza label | ⚠️ 3 (2 SVG `<g>` con tabindex=0, 1 textarea non etichettata) |
| Contrasto testi | ✅ approx OK (rgb(26,26,46) su rgb(247,247,248)) |
| Bottoni touch target <44px | ⚠️ 4 bottoni (ipad_compliance) |

---

## Console errors: 0

Nessun errore JS catturato durante la navigazione normale.
(Il freeze del compilatore non genera errori console — è un problema di performance/WebAssembly)

---

## Bug rilevati

### UNLIM identity — chatbot chiamato "UNLIM" non "Galileo"
- Il widget AI si chiama **UNLIM** in 6+ punti dell'interfaccia
- Messaggio di benvenuto: "Ciao! Sono UNLIM, il tuo assistente per l'elettronica"
- Bottone flottante: "Parla con UNLIM — trascina per spostare"
- Il precedente audit (2026-03-24) riportava `galileo_identity: 1.0000` — possibile che il fix riguardi solo le risposte AI, non il label UI
- **Severità: P2** (branding/identity issue)

### "▲Monitor Seriale" bottone invisibile
- Larghezza: 12px — quasi invisibile, non cliccabile su touch
- **Severità: P2** (usabilità)

---

## Regressioni vs precedente: N/A

Nessun AUDIT-REPORT.md precedente trovato in `automa/state/`. I file di audit precedenti sono in `automa/` con formato diverso (AUDIT-2026-03-24.md, AUDIT-TOTALE-20260327-G1.md).

Rispetto agli audit storici:
- `ipad_compliance: 0.675` (13 bottoni <44px) era il problema principale a marzo → oggi migliorato (4 bottoni <44px)
- `lighthouse_perf: 0.620` era bloccato → load time 330ms suggerisce miglioramento
- `galileo_identity: 1.0000` in eval automa, ma UI mostra ancora "UNLIM" — discrepanza non risolta

---

## P0 trovati: nessuno

## P1 trovati: 1

### P1 — Compiler freeze (Vol3 Arduino)
- **Trigger**: Click su `▶ Compila & Carica` in qualsiasi esperimento Vol3 Arduino
- **Effetto**: Renderer del browser si blocca per 45+ secondi (WebAssembly compilation?)
- **Recovery**: Solo hard navigation (ricarica pagina)
- **Impatto**: Un bambino di 10 anni che usa Arduino si blocca completamente
- **File probabile**: `src/components/simulator/` (compilatore Arduino)
- **Nota**: Il bug si è riprodotto 2 volte in sessione (Vol3 Cap5 Esp1 e durante navigazione successiva)
