# Setup Cron — Autopilot ELAB

## Attivare (prima di partire)

Esegui questo comando nel terminale:

```bash
(crontab -l 2>/dev/null; echo "
# ELAB Autopilot — Worker ogni 4 ore (6:00, 10:00, 14:00, 18:00, 22:00, 2:00)
0 2,6,10,14,18,22 * * * /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder/automa/launch-worker.sh

# ELAB Autopilot — Director ogni 12 ore (8:00, 20:00)
0 8,20 * * * /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder/automa/launch-director.sh
") | crontab -
```

## Verificare

```bash
crontab -l
```

Dovresti vedere le 2 righe del cron.

## Disattivare (quando torni)

```bash
crontab -l | grep -v "ELAB Autopilot" | grep -v "launch-worker" | grep -v "launch-director" | crontab -
```

## Cosa succede

- **6 worker al giorno** (ogni 4 ore) — ognuno lavora 2-4 cicli di codice/test/ricerca
- **2 director al giorno** (ogni 12 ore) — revisiona, pianifica, genera task, fa ricerca strategica
- **~160 sessioni in 20 giorni** — di cui ~120 worker + ~40 director
- Tutto loggato in `automa/logs/`
- Tutto committato su branch `auto/*`
- Tu mergi da GitHub mobile quando vuoi

## Requisiti

- Mac acceso e connesso a internet
- Claude Code CLI installato e autenticato
- `npm` funzionante nella directory del progetto
