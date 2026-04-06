# AUDIT PRODUZIONE — ELAB Tutor (Run #3)
**Data**: 2026-04-06
**Timestamp**: 2026-04-06T23:45:00+02:00
**Auditor**: Agente autonomo elab-auditor (scheduled task)
**Target**: https://www.elabtutor.school
**Metodo**: curl HTTP checks + bundle analysis
**Riferimento**: Terzo run di oggi. Run #1 e #2 erano già stati eseguiti (vedi AUDIT-PRODUZIONE-2026-04-06.md e ...-RUN2.md).

---

## EXECUTIVE SUMMARY

Il sito è **ONLINE e FUNZIONANTE**. Nessuna regressione P0 o P1. Tuttavia, vengono confermati **bug SEO P2** già noti (canonical/og:url/og:image che puntano a `elab-builder.vercel.app`): il fix esiste su branch `fix/seo-canonical-infra-worker` (commit `0267b9a`) ma **non è stato ancora merged né deployato**. Tutti e 5 gli esperimenti testati passano. 92 esperimenti totali confermati in produzione.

**Verdict: PASS (con P2 SEO persistente)**

---

## 1. HOMEPAGE — STATO

| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| HTTP Status | ✅ 200 OK | |
| TTFB | ✅ 91ms | Vercel CDN HIT |
| CDN Cache | ✅ HIT | age=50416s |
| Titolo | ✅ Corretto | "ELAB Tutor — Simulatore di Elettronica e Arduino per la Scuola" |
| Main JS bundle | ✅ 200 OK | /assets/index-Ds9vSCgJ.js (405KB) |
| Font OpenSans | ✅ 200 OK | /fonts/OpenSans-variable.woff2 |
| Font Oswald | ✅ 200 OK | /fonts/Oswald-variable.woff2 |
| Mascotte | ✅ 200 OK | /elab-mascot.png |
| PWA registerSW | ✅ 200 OK | /registerSW.js |
| Manifest | ✅ 200 OK | /manifest.webmanifest |
| Robots.txt | ✅ 200 OK | (ma URL Sitemap errato — vedi P2) |
| Sitemap.xml | ✅ 200 OK | (ma URLs errate — vedi P2) |
| CSP header HTTP | ✅ Presente | frame-ancestors 'none' nell'header HTTP |
| HSTS | ✅ Attivo | max-age=63072000, includeSubDomains, preload |
| X-Frame-Options | ✅ DENY | |
| X-Content-Type | ✅ nosniff | |
| Permissions-Policy | ✅ Presente | camera=(), microphone=(self)... |
| COOP | ✅ same-origin | |
| CORP | ✅ same-origin | |

### Problemi rilevati sulla homepage

**P2 - SEO: canonical e OG URLs ancora errate in produzione**
- `<link rel="canonical" href="https://elab-builder.vercel.app/" />` ← deve essere `https://www.elabtutor.school/`
- `<meta property="og:url" content="https://elab-builder.vercel.app/" />` ← errata
- `<meta property="og:image" content="https://elab-builder.vercel.app/elab-mascot.png" />` ← errata
- `/sitemap.xml`: tutti i `<loc>` puntano a `elab-builder.vercel.app`
- `/robots.txt`: `Sitemap: https://elab-builder.vercel.app/sitemap.xml` ← errata

**Causa root**: Il fix esiste nel commit `0267b9a` su branch `fix/seo-canonical-infra-worker`, ma il branch **non è stato merged in main**. Il deploy attuale (last-modified: 07:39) usa il commit `befc0c3` di main, precedente al fix.
**Azione richiesta**: Merge e re-deploy di `fix/seo-canonical-infra-worker` + `fix/lavagna-volume-page-persistence` in main.

**P3 - CSP meta tag ridondante**
- `<meta http-equiv="Content-Security-Policy" content="...frame-ancestors 'none'...">`
- La direttiva `frame-ancestors` è ignorata nei meta tag (funziona solo via HTTP header). Il tag è ridondante ma non causa problemi di sicurezza (l'header HTTP è corretto). Può essere rimosso per pulizia.

---

## 2. BACKEND GALILEO

| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| Health endpoint | ✅ OK | https://elab-galileo.onrender.com/health |
| Version | ✅ v5.5.0 | |
| Providers | ✅ 5 attivi | deepseek, gemini, groq, deepseek-reasoner, kimi |
| Primary | ✅ deepseek-chat | |
| Vision | ✅ disponibile | |
| Multi-Galileo | ✅ abilitato | |
| Reasoner | ✅ deepseek-reasoner | |
| V5 Routing | ✅ attivo | |
| Kimi model | ⚠️ vuoto | `{"provider":"kimi","model":""}` — Issue #10 aperto |

---

## 3. ESPERIMENTI TESTATI — 5 CAMPIONI

Metodo: curl bundle analysis + HTTP check hex files. Esperimenti scelti a rotazione (seed 42 per questa run): Vol1 ×4 + Vol3 ×1.

| # | ID Esperimento | Volume | In Bundle | buildSteps | scratchXml | Hex File | Stato |
|---|---------------|--------|-----------|------------|------------|----------|-------|
| 1 | v1-cap9-esp3 | Vol1 | ✅ | ✅ | ❌ | ✅ 200 | ✅ PASS |
| 2 | v1-cap14-esp1 | Vol1 | ✅ | ✅ | ❌ | ✅ 200 | ✅ PASS |
| 3 | v1-cap10-esp4 | Vol1 | ✅ | ✅ | ❌ | ✅ 200 | ✅ PASS |
| 4 | v1-cap9-esp7 | Vol1 | ✅ | ✅ | ❌ | ✅ 200 | ✅ PASS |
| 5 | v3-extra-servo-sweep | Vol3 | ✅ | ❌ (usa `steps`) | ✅ | ✅ 200 | ✅ PASS |

**Note**:
- `v3-extra-servo-sweep` usa `steps` (non `buildSteps`) + `scratchXml` + `simulationMode: "avr"` — struttura corretta per questo tipo di esperimento AVR con blocchi Scratch.
- Nessun esperimento mancante o corrotto nel bundle.
- Experiment chunks su produzione: `experiments-vol1-CryA1AdA.js` (38 esp), `experiments-vol2-KaQKnzaO.js` (27 esp), `experiments-vol3-DS0fkiNX.js` (27 esp) → **92 totali** ✅

---

## 4. CONTEGGIO ESPERIMENTI IN PRODUZIONE

| Volume | IDs nel bundle | Atteso |
|--------|---------------|--------|
| Vol1 | 38 | 38 |
| Vol2 | 27 | 27 |
| Vol3 | 27 | 27 |
| **Totale** | **92** | **92** ✅ |

---

## 5. ISSUES TROVATE

| # | Severità | URL | Problema | Fix disponibile? |
|---|----------|-----|----------|-----------------|
| 1 | P2 | https://www.elabtutor.school | canonical href punta a elab-builder.vercel.app | Sì, su branch fix/seo-canonical-infra-worker |
| 2 | P2 | https://www.elabtutor.school | og:url punta a elab-builder.vercel.app | Sì, stesso branch |
| 3 | P2 | https://www.elabtutor.school | og:image punta a elab-builder.vercel.app | Sì, stesso branch |
| 4 | P2 | https://www.elabtutor.school/sitemap.xml | Tutti i `<loc>` puntano a elab-builder.vercel.app | Da fare (sitemap non aggiornata nel fix) |
| 5 | P2 | https://www.elabtutor.school/robots.txt | Sitemap URL punta a elab-builder.vercel.app | Da fare |
| 6 | P2 | https://elab-galileo.onrender.com/health | Kimi provider: model="", nessun modello configurato | Issue #10 aperto |
| 7 | P3 | https://www.elabtutor.school | CSP frame-ancestors in meta tag (ridondante) | Fix cosmetic, bassa priorità |

**Nessuna regressione P0 (sito down) o P1 (funzionalità core rotta).**

---

## 6. CONFRONTO CON RUN PRECEDENTI

| Check | Run #1 (mattina) | Run #2 (pomeriggio) | Run #3 (sera) |
|-------|-----------------|---------------------|---------------|
| Homepage | ✅ | ✅ | ✅ |
| Esperimenti (5) | ✅ | ✅ | ✅ |
| Galileo backend | ✅ | ✅ | ✅ |
| SEO canonical | ❌ P2 | ❌ P2 | ❌ P2 |
| Fix deployato | No | No | No |

Il P2 SEO persiste per l'intera giornata. Il fix è pronto ma non merged.

---

## 7. AZIONI CONSIGLIATE

**Priorità Alta (P2)**:
1. Merge `fix/seo-canonical-infra-worker` in main → re-deploy Vercel
2. Verificare che `sitemap.xml` e `robots.txt` vengano aggiornati nel fix (i file pubblici ora puntano a elab-builder.vercel.app)
3. Merge anche `fix/lavagna-volume-page-persistence` (contiene fix WCAG e persistenza lavagna)

**Priorità Bassa (P3)**:
4. Rimuovere `<meta http-equiv="Content-Security-Policy">` dal HTML (ridondante con HTTP header)
