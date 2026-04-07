# AI System Card — ELAB Tutor (Galileo / UNLIM AI)

**Data:** 2026-04-07
**Versione:** 1.0
**Riferimento normativo:** EU AI Act, Art. 52 (obbligo disclosure sistemi AI interattivi)

---

## Descrizione del sistema

ELAB Tutor include un assistente AI denominato **UNLIM** (o **Galileo**) che risponde a domande degli studenti in ambito elettronica e Arduino. Il sistema è rivolto a bambini di età 8–14 anni.

## Provider del modello LLM

| Endpoint | Provider | Modello |
|----------|----------|---------|
| Nanobot (primario) | Google Gemini (via nanobot.yml) | Gemini Flash |
| Webhook n8n (fallback) | Configurato da Andrea Marro | Configurabile |
| Ollama (locale, opzionale) | Open-source, self-hosted | Configurabile |

## Scopo del sistema

- **Uso:** Solo Q&A tecnico su elettronica, Arduino, circuiti — contesto educativo
- **Non valutazione:** Il sistema NON assegna voti, giudizi o punteggi agli studenti
- **Non emotion recognition:** Il sistema NON rileva o analizza lo stato emotivo degli studenti
- **Non profilazione automatica:** Le risposte non vengono usate per profilare lo studente senza supervisione

## Limitazioni note

- Le risposte dell'AI possono contenere errori tecnici o imprecisioni
- Il modello può dare risposte obsolete su versioni software specifiche
- Il sistema non sostituisce la supervisione dell'insegnante
- La qualità delle risposte dipende dalla disponibilità degli endpoint cloud

## Disclosure mostrata agli utenti

Ogni volta che il modulo UNLIM è attivo, viene mostrato visibilmente:

> **"Assistente AI — Le risposte possono contenere errori. Verifica sempre."**

## Monitoraggio

- I log di errore sono inviati al sistema di logging interno (`src/utils/logger.js`)
- L'insegnante può monitorare l'attività tramite la Dashboard Docente
- Non vengono trasmessi dati personali agli endpoint AI (solo testo del messaggio)

## Conformità

| Requisito | Stato |
|-----------|-------|
| Disclosure visibile prima dell'interazione (Art. 52) | ✅ Implementato |
| Nessuna emotion recognition | ✅ Conforme |
| Nessuna valutazione automatica studenti | ✅ Conforme |
| Supervisione umana (docente dashboard) | ✅ Disponibile |
| Scopo limitato (Q&A tecnico) | ✅ Conforme |

---

*Documento creato per conformità EU AI Act. Aggiornare ad ogni modifica sostanziale del sistema AI.*
