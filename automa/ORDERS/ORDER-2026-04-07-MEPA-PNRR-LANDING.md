# ORDER — Landing Page PNRR DM219 + Badge MePA
**Data**: 2026-04-07
**Generato da**: elab-researcher
**Basato su**: automa/knowledge/RESEARCH-2026-04-07-PNRR-DM219-MEPA.md
**Priorità**: CRITICA (scadenza domande DM219: 17/04/2026)
**Effort stimato**: 3-4 ore (dev) + azione umana per iscrizione MePA
**Tipo**: FEATURE + CONTENT

---

## Contesto

Il bando DM219/2025 stanzia 100M EUR per AI nelle scuole. Le scuole devono presentare domanda **entro il 17 aprile 2026**. Ogni scuola può ricevere fino a 25.000 EUR per acquistare software AI come ELAB.

**Le scuole che fanno domanda ora cercheranno fornitori su MePA nelle prossime settimane.**

---

## Task 1 — Badge "PNRR Compatible" sulla homepage (1h)

**File**: `src/components/ShowcasePage.jsx` (o componente homepage principale)

Aggiungere un banner/badge visibile nella vetrina principale:

```jsx
// Badge da aggiungere vicino al CTA principale
<div className="pnrr-badge">
  <span>✓ Acquistabile con fondi PNRR DM219</span>
  <span>Disponibile su MePA | Codice ATECO: 62.01</span>
</div>
```

Stile: sfondo verde scuro (#1E4D8C navy o #4A7A25 lime), testo bianco, font Oswald, padding 8px 16px, border-radius 6px.

Posizionamento: sotto il titolo principale della vetrina, sopra la CTA "Inizia gratis".

### Testo da aggiungere anche nella meta description:
`"ELAB Tutor — Software AI per elettronica e Arduino nelle scuole medie. Acquistabile con fondi PNRR DM219. Disponibile su MePA."`

---

## Task 2 — Sezione "Acquistalo con i fondi PNRR" (2h)

**File**: Nuova sezione in `ShowcasePage.jsx` o pagina dedicata `PNRRPage.jsx`

Aggiungere sezione informativa per dirigenti scolastici:

**Titolo**: "Acquista ELAB con i fondi PNRR DM219"

**Contenuto**:
- ✅ ELAB Tutor è acquistabile con i fondi DM219 del PNRR
- ✅ Categoria: Software AI per la didattica (rientra nell'Investimento 2.1)
- ✅ Disponibile su MePA — acquisto diretto senza gara formale fino a 140.000 EUR
- ✅ Pacchetto scuola: include kit fisici + licenza software + formazione docente

**Istruzioni acquisto** (3 passi):
1. Presentate domanda DM219 su pnrr.istruzione.it (scadenza 17/04/2026)
2. Contattate il team ELAB: [email] — prepareremo l'offerta MePA
3. Acquistate su acquistinretepa.it o tramite assegnazione diretta

**CTA**: "Richiedi informazioni per la tua scuola" → link a form/email

---

## Task 3 — AZIONE UMANA RICHIESTA (non automatizzabile)

**Questa parte richiede Andrea o il titolare:**

1. Andare su https://www.acquistinretepa.it
2. Registrarsi come rappresentante legale (serve firma digitale)
3. Abilitare l'azienda al bando "Software e Servizi ICT"
4. Caricare la scheda prodotto ELAB con prezzo e descrizione
5. Tempo stimato: 2-3 ore + 2-3 settimane per approvazione

**Urgenza**: Più veloce è l'iscrizione, prima le scuole con fondi DM219 possono trovare ELAB su MePA.

---

## Verifica

Dopo le modifiche di codice:
1. `npm run build` deve passare
2. La homepage mostra il badge PNRR
3. La sezione informativa è visibile e linkabile
4. Testo SEO aggiornato (meta description)
5. Nessuna regressione sui test esistenti

---

## Note

- NON usare emoji nel codice (regola CLAUDE.md) — usare ✓ solo nel testo marketing, non in componenti React
- Il badge deve essere accessibile (contrasto WCAG AA)
- Touch target ≥ 44px per tutti i nuovi elementi interattivi
