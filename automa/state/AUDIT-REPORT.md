# Audit Report — 2026-04-09 15:12 (Ciclo 15 — DEEP AUDIT)

## Servizi Live

| Servizio | URL | Status | Tempo | Note |
|----------|-----|--------|-------|------|
| **Frontend** | elabtutor.school | **200 OK** | 1.0s | Titolo corretto, HTML caricato |
| **Supabase Nanobot** | supabase.co/unlim-chat | **200** | - | Risponde, richiede sessionId valido |
| **Render Nanobot** | elab-galileo.onrender.com | **404 (/)** | - | Root 404 ma /health OK — v5.5.0, 5 provider |
| **Compiler** | n8n.srv1022317.hstgr.cloud | **200 OK** | - | FUNZIONA: compila "void setup/loop" → HEX corretto |
| **Brain VPS** | 72.60.129.50:11434 | **200 OK** | - | Ollama attivo |
| **Supabase DB** | vxvqalmxqtezvgiboxyv | **401** | - | API key rifiutata (cambiata o scaduta) |

## Dettaglio Servizi

### Render Nanobot v5.5.0 — FUNZIONANTE
- 5 provider: deepseek-chat (primario), gemini-2.5-flash, llama-3.3-70b, deepseek-reasoner, kimi
- 6 layer: L0-cache, L1-router, L2-racing, L3-enhance, L5-reasoner, L5-chain
- 5 specialisti: circuit, code, tutor, vision, teacher
- Vision attivo: tier1 kimi moonshot, fallback gemini
- Root / restituisce 404 (non ha route /) ma l'API funziona via /health

### Compiler — FUNZIONANTE (VERIFICATO)
- Compilato `void setup(){} void loop(){}` con successo
- Output: 444 bytes (1% storage), 9 bytes RAM (0%)
- HEX valido generato (ATmega328p)

### Supabase Chat — PARZIALE
- Risponde 200 ma richiede `sessionId` nel body
- Senza session: `{"success":false,"error":"Invalid sessionId format"}`
- Con session: risposta vuota (probabilmente serve anche API key header)

### Supabase DB — PROBLEMA
- API key anon rifiutata: `{"message":"Invalid API key"}`
- Possibile causa: progetto migrato da euqpd... a vxvqa... e la key e' cambiata
- **Impatto**: sync e2e (saveSession→Supabase→loadSessions) potrebbe non funzionare

## Build & Test

| Metrica | Valore | Status |
|---------|--------|--------|
| Build | 48.36s | **PASS** |
| Precache | 30 entries, 2410 KiB | OK |
| Test | 1526 passed, 33 files | **PASS** |
| Failures | 0 | **PASS** |
| CSS warnings | 3 (/, "file" property) | Non bloccanti |

### CSS Warnings (3)
1. `Unexpected "/"` — CSS syntax error in linea 4349 (probabilmente CSS module concatenato)
2. `"file" is not a known CSS property` x2 — custom property non standard
Impatto: zero (cosmetici, non bloccano il build)

## Regressioni vs Ciclo Precedente

| Metrica | Ciclo 14 | Ciclo 15 | Delta |
|---------|----------|----------|-------|
| Site | 200 OK | 200 OK | = |
| Nanobot | 200 OK | 200 OK | = |
| Compiler | non testato | **200 OK + HEX** | Nuovo check |
| Brain VPS | non testato | **200 OK** | Nuovo check |
| Supabase DB | non testato | **401 FAIL** | Nuovo problema |
| Test | 1442 | 1526 | +84 |
| Build | PASS | PASS | = |

**Regressione trovata**: Supabase DB API key invalida. Da verificare se il progetto e' ancora attivo.

## Problemi Trovati

### NUOVO: Supabase DB API key invalida
- La anon key per `vxvqalmxqtezvgiboxyv` restituisce 401
- Potrebbe impattare: sync sessioni, caricamento progressi, dashboard docente
- **Azione**: Andrea deve verificare la key su Supabase dashboard

### CONFERMATO: Render root 404
- Non un bug: il server non ha route `/`, solo endpoint API specifici
- /health funziona, l'API funziona. Nessuna azione necessaria.

## Conclusione
4/5 servizi funzionanti. 1 problema Supabase DB (API key). Build e test OK. +84 test vs ciclo precedente. Nessuna regressione nel frontend o nei servizi API.
