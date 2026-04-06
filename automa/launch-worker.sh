#!/bin/bash
# ELAB Autopilot — Worker Launcher v2 (AGGRESSIVE)
# Lanciato da cron ogni 3 ore. Sessioni lunghe e produttive.

ELAB_DIR="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
LOG_DIR="$ELAB_DIR/automa/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="$LOG_DIR/worker-$TIMESTAMP.log"
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | tail -1)/bin:$PATH"

mkdir -p "$LOG_DIR"

echo "=== ELAB Worker v2 — $TIMESTAMP ===" > "$LOG_FILE"
echo "Starting at $(date)" >> "$LOG_FILE"

cd "$ELAB_DIR"

# Pre-flight: test + build
npm test -- --run --silent >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    echo "ABORT: test falliti pre-sessione" >> "$LOG_FILE"
    echo "$(date) ABORT test-fail" >> "$LOG_DIR/history.log"
    exit 1
fi

echo "Tests OK. Launching aggressive worker..." >> "$LOG_FILE"

# Calcola giorno e stato
DAY=$(( ($(date +%s) - $(date -j -f '%Y-%m-%d' '2026-04-06' +%s 2>/dev/null || echo 1743897600)) / 86400 + 1 ))
SCORE=$(grep 'Attuale' "$ELAB_DIR/automa/STRATEGY/score-tracking.md" 2>/dev/null | head -1)
LAST_MODE=$(grep 'Modo:' "$ELAB_DIR/automa/handoff.md" 2>/dev/null | head -1)

# Lancia Claude Code — sessione AGGRESSIVA
claude --auto \
    --print \
    --output-format text \
    --max-tokens 128000 \
    "Sei il Worker ELAB Autopilot. Sessione AGGRESSIVA.

LEGGI ORA: AUTOPILOT.md + automa/handoff.md + automa/STRATEGY/score-tracking.md + automa/ORDERS/

STATO: Giorno $DAY/20. $SCORE. Ultimo modo: $LAST_MODE.

OBIETTIVO: Massimo output possibile. Fai 4-6 cicli di lavoro REALE:
- Ciclo 1-2: IMPROVE (fix il gap piu grande: WCAG, test coverage, o dashboard)
- Ciclo 3-4: RESEARCH (web search su 1-2 topic, scrivi report in automa/knowledge/)
- Ciclo 5-6: BUILD o AUDIT (se tempo, feature autorizzata o test completo)

PER OGNI CICLO:
1. Fai il lavoro
2. npm test -- --run (DEVE passare)
3. npm run build (DEVE passare)
4. git checkout -b auto/[data]-[topic] && git add && git commit && git push
5. Scrivi in automa/OUTBOX/

REGOLE FERREE:
- MAI push su main
- MAI inflazionare score
- MAI aggiungere dipendenze npm
- MAX 5 file per ciclo
- AGGIORNA handoff.md a fine sessione

SEI PROATTIVO: non chiedere, AGISCI. Genera idee, trova bug, scrivi test, fai ricerca.
Ogni minuto conta. Andrea conta su di te." \
    >> "$LOG_FILE" 2>&1

# Post-flight: verifica che test passano ancora
npm test -- --run --silent >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: test falliti post-sessione! Reverting..." >> "$LOG_FILE"
    git checkout . >> "$LOG_FILE" 2>&1
    echo "$(date) WARNING post-test-fail-reverted" >> "$LOG_DIR/history.log"
else
    echo "$(date) DONE-OK" >> "$LOG_DIR/history.log"
fi

echo "Worker finished at $(date)" >> "$LOG_FILE"
