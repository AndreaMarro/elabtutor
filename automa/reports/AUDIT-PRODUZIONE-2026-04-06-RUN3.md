# Audit Produzione — 2026-04-06 Run #3

**Auditor**: elab-auditor (scheduled task autonomo)
**Timestamp**: 2026-04-06 (G44+)
**Sito**: https://www.elabtutor.school
**Verdict**: ⚠️ PASS CON REGRESSIONI P2 — nessun P0, 1 nuovo P1, 3 P2 regressionati

---

## 1. Homepage

| Check | Risultato |
|-------|-----------|
| HTTP status | 307 → 200 OK |
| TTFB (curl) | ~169ms |
| Title | "ELAB Tutor — Simulatore di Elettronica e Arduino per la Scuola" ✓ |
| JS bundle `/assets/index-Ds9vSCgJ.js` | 200 OK ✓ |
| Service Worker `/registerSW.js` | 200 OK ✓ |
| Font OpenSans-variable.woff2 | 200 OK ✓ |
| Font Oswald-variable.woff2 | 200 OK ✓ |

**Conclusione**: Homepage raggiungibile e asset caricano correttamente.

---

## 2. API & Servizi Backend

| Servizio | Endpoint | Status | Note |
|----------|----------|--------|------|
| Galileo AI | `/health` | 200 OK ✓ | v5.5.0, 5 provider attivi |
| Galileo AI | `/tutor-chat` | 200 OK ✓ | Risponde correttamente |
| n8n | root | 200 OK ✓ | App accessibile |
| n8n compile | `/webhook/compile-blink` | **404** ⚠️ | Webhook non trovato |
| Kimi provider | model | `""` (vuoto) | **P2 confermato** |

**Nota compile**: `VITE_COMPILE_WEBHOOK_URL` non è presente nel bundle deployato (bundle non contiene URL compile). La compilazione Arduino in produzione dipende esclusivamente da `VITE_COMPILE_URL` (server standalone). Se questo non è configurato, la compilazione è non funzionante. **Richiede verifica Vercel env vars.**

---

## 3. Esperimenti Testati (5/5 HTTP 200)

Selezionati a rotazione rispetto agli audit precedenti (che avevano testato v1-cap6-esp1, v1-cap9-esp6, v2-cap3-esp1, v2-cap7-esp1, v3-cap5-esp1).

| # | ID Esperimento | Titolo | URL | HTTP | buildSteps | Note |
|---|---------------|--------|-----|------|-----------|------|
| 1 | v1-cap10-esp3 | 3 LDR controllano RGB | `/#/vol1/cap10/esp3` | 200 ✓ | ✓ (vol1 completo) | OK |
| 2 | v1-cap13-esp1 | Cap.13 Esp.1 | `/#/vol1/cap13/esp1` | 200 ✓ | ✓ (vol1 completo) | OK |
| 3 | v2-cap4-esp2 | Cap.4 Esp.2 | `/#/vol2/cap4/esp2` | 200 ✓ | Parziale vol2 | OK |
| 4 | v3-cap7-esp3 | Trimmer controlla 3 LED | `/#/vol3/cap7/esp3` | 200 ✓ | **MANCANTE** ⚠️ | P1 buildSteps |
| 5 | v3-extra-servo-sweep | Extra - Servo Sweep | `/#/vol3/extra/servo-sweep` | 200 ✓ | ✓ | OK |

**Errori JS browser**: Non rilevabili in run autonomo (JS Apple Events disattivato in Chrome).
**Nota**: Tutti i caricamenti HTTP rispondono 200 OK (SPA). La verifica visiva non è stata possibile in modalità headless-autonoma.

---

## 4. Problemi Trovati

### 🔴 P1 (NUOVO) — 7 Pull Request aperte, nessuna mergiata in main

**Severità**: P1
**Impatto**: Tutte le correzioni di G44 non sono in produzione.

```
PR#1  fix/seo-canonical-infra-worker          — canonical URL fix
PR#2  fix/wcag-vetrina-unlimmemory-cleanup    — WCAG fix
PR#3  fix/lavagna-volume-page-persistence     — persistenza lavagna
PR#4  fix/buildsteps-vol3-cap5-cap6          — 5 nuovi buildSteps Vol3
PR#5  research/gdpr-mistral-nemo-2026-04-06  — ricerca
PR#6  fix/seo-twitter-og-keywords            — Twitter Card + og miglioramenti
PR#7  chore/copyright-date-2026-04-06        — date-stamp 64 file
```

AUTOPILOT.md segna issue #1, #2, #6 come "CHIUSO G44" ma sono aperti in PR non mergiate.
Nessuna sessione ha autorità di fare merge (regola: solo branch+PR). **Serve azione umana per merge.**

---

### 🟡 P2 (REGRESSIONE CONFERMATA) — Canonical URL sbagliato in produzione

**URL**: https://www.elabtutor.school
**Attuale**: `<link rel="canonical" href="https://elab-builder.vercel.app/" />`
**Atteso**: `<link rel="canonical" href="https://www.elabtutor.school/" />`
**Causa**: PR#1 non mergiato in main → fix non deployato
**Nota**: Già segnalato come P2 in Run#1 e Run#2. Erroneamente marcato "CHIUSO G44" in AUTOPILOT.md.

---

### 🟡 P2 (REGRESSIONE CONFERMATA) — og:url e og:image puntano a vercel.app

**Attuale**:
- `og:url` = `https://elab-builder.vercel.app/`
- `og:image` = `https://elab-builder.vercel.app/elab-mascot.png`
- JSON-LD `url` = `https://elab-builder.vercel.app/`

**Causa**: PR#1 e PR#6 non mergiate.

---

### 🟡 P2 (CONFERMATO) — Kimi provider senza model

**Endpoint**: `https://elab-galileo.onrender.com/health`
**Response**: `{"provider":"kimi","model":""}` — stringa vuota
**Issue originale**: #10 in AUTOPILOT.md
**Impatto**: Fallback vision Tier1 degradato per prompt con immagini.

---

### 🟡 P2 (NUOVO) — n8n compile webhook non risponde

**URL testata**: `https://n8n.srv1022317.hstgr.cloud/webhook/compile-blink`
**Status**: 404
**Impatto**: Se `VITE_COMPILE_URL` (server standalone) non è configurato in Vercel, la compilazione Arduino è non funzionante.
**Nota**: Il bundle deployato non contiene URL di compilazione (env vars non embedded). Precedente audit (Run#2) aveva verificato compilazione OK tramite browser autenticato — possibile che funzionasse tramite server standalone.

---

### 🟠 P1 (CONFERMATO, invariato) — Vol3 buildSteps: 6/27 (22%)

**Esperimenti Vol3 con buildSteps**:
- v3-cap6-semaforo, v3-cap6-esp6, v3-cap8-esp3, v3-extra-lcd-hello, v3-extra-servo-sweep, v3-extra-simon

**21 esperimenti Vol3 senza buildSteps** (incluso v3-cap7-esp3 testato in questo audit).
PR#4 aggiungerebbe 5 in più (→ 11/27, 41%) ma non è mergiata.

---

### 🟠 P1 (CONFERMATO, invariato) — Scratch XML: 11/92 esperimenti

Copertura Scratch: ~12% (11 occorrenze `scratchXml` su 92 esperimenti totali).

---

## 5. Stato Infrastruttura Produzione

| Componente | Stato | Note |
|------------|-------|------|
| Vercel (frontend) | ✓ UP | Serva bundle da branch main (pre-G44) |
| Galileo AI (Render) | ✓ UP v5.5.0 | tutor-chat funzionante |
| n8n (hstgr) | ⚠️ Parziale | App up, webhook compile 404 |
| Supabase | Non testato | URL non in bundle (env var non set?) |
| Service Worker | ✓ | registerSW.js carica |

---

## 6. Confronto con Audit Precedenti

| Area | Run#1 | Run#2 | Run#3 (oggi) |
|------|-------|-------|--------------|
| Homepage | PASS | PASS | PASS |
| Canonical URL | P2 | P2 | P2 (non risolto) |
| og:url/og:image | P2 | P2 | P2 (non risolto) |
| Galileo | PASS | PASS | PASS |
| JS Errors | 0 | 0 | N/A (headless) |
| PRs aperte | — | — | **7 PRs non mergiate** (NUOVO) |
| compile webhook | — | OK (browser) | 404 (curl) |

---

## 7. Azioni Richieste

| Priorità | Azione | Responsabile |
|----------|--------|--------------|
| **P1** | Merge PR#1 (canonical), PR#2 (WCAG), PR#3 (lavagna), PR#4 (buildSteps) | **UMANO** |
| P2 | Configurare Kimi model in Galileo env vars | Dev |
| P2 | Verificare VITE_COMPILE_URL in Vercel env vars | Dev |
| P1 | Continuare a aggiungere buildSteps a Vol3 Cap7, Cap8 (21 mancanti) | Agente |
| P1 | Aggiungere scratchXml a esperimenti mancanti (81/92) | Agente |
