# Setup Cron — ELAB Autopilot v2 (AGGRESSIVE)

## Attivare (prima di partire)

```bash
# Previeni sleep del Mac
caffeinate -d &

# Installa cron (copia e incolla TUTTO)
(crontab -l 2>/dev/null; echo "
# ELAB Worker — ogni 3 ore (0:00, 3:00, 6:00, 9:00, 12:00, 15:00, 18:00, 21:00)
0 0,3,6,9,12,15,18,21 * * * /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder/automa/launch-worker.sh

# ELAB Director — ogni 8 ore (7:00, 15:00, 23:00)
0 7,15,23 * * * /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder/automa/launch-director.sh
") | crontab -
```

## Output Atteso

- **8 worker/giorno** x 4-6 cicli = 32-48 cicli/giorno
- **3 director/giorno** = 9-15 ricerche + 9-15 task generate
- **20 giorni** = ~640-960 cicli worker + 60-300 ricerche

## Verificare

```bash
crontab -l | grep ELAB
```

## Monitorare (da Filippine)

```bash
# Ultimi 5 log worker
ls -lt automa/logs/worker-*.log | head -5

# Storia
tail -20 automa/logs/history.log

# Ultimo handoff
cat automa/handoff.md
```

## Disattivare (quando torni)

```bash
crontab -l | grep -v "ELAB" | crontab -
kill $(pgrep caffeinate) 2>/dev/null
```

## Anti-Sleep

Il Mac DEVE restare acceso. Prima di partire:
1. System Settings > Energy Saver > Prevent sleep ON
2. `caffeinate -d &` nel terminale
3. Verifica: `pmset -g | grep sleep` (deve dire 0)
