#!/bin/bash
# ELAB Autopilot — Worker Launcher
# Lanciato da cron ogni 4 ore. Avvia una sessione Claude Code autonoma.

ELAB_DIR="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
LOG_DIR="$ELAB_DIR/automa/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="$LOG_DIR/worker-$TIMESTAMP.log"

# Crea log dir se non esiste
mkdir -p "$LOG_DIR"

echo "=== ELAB Autopilot Worker — $TIMESTAMP ===" > "$LOG_FILE"
echo "Starting at $(date)" >> "$LOG_FILE"

# Vai nella directory del progetto
cd "$ELAB_DIR"

# Verifica che build e test passano PRIMA di iniziare
echo "Pre-flight check..." >> "$LOG_FILE"
npm test -- --run >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    echo "ABORT: test falliti pre-sessione" >> "$LOG_FILE"
    echo "$(date) ABORT test-fail" >> "$LOG_DIR/history.log"
    exit 1
fi

echo "Tests OK. Launching Claude Code worker..." >> "$LOG_FILE"

# Lancia Claude Code in modalita' autonoma
claude --dangerously-skip-permissions \
    --print \
    --output-format text \
    "Leggi AUTOPILOT.md nella root del progetto. Sei in modalita' autonoma.
Andrea e' in viaggio. Esegui il loop completo: leggi stato, scegli modo,
lavora 2-4 cicli, testa, committa su branch auto/, aggiorna handoff.
Vai a manetta. Ricerca, fix, build, evolvi. Nessun umano nel loop.
Data corrente: $(date +%Y-%m-%d). Giorno $((( $(date +%s) - $(date -j -f '%Y-%m-%d' '2026-04-06' +%s) ) / 86400 + 1))/20 di autopilot." \
    >> "$LOG_FILE" 2>&1

echo "Worker finished at $(date)" >> "$LOG_FILE"
echo "$(date) DONE" >> "$LOG_DIR/history.log"
