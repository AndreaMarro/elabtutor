#!/bin/bash
# ELAB Autopilot — Director Launcher
# Lanciato da cron ogni 12 ore. Revisiona il lavoro e pianifica.

ELAB_DIR="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
LOG_DIR="$ELAB_DIR/automa/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="$LOG_DIR/director-$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

echo "=== ELAB Autopilot Director — $TIMESTAMP ===" > "$LOG_FILE"
cd "$ELAB_DIR"

claude --dangerously-skip-permissions \
    --print \
    --output-format text \
    "Sei il DIRETTORE dell'autopilot ELAB. NON scrivi codice. Dirigi.

Il tuo lavoro:
1. Leggi AUTOPILOT.md per capire il sistema
2. Leggi automa/OUTBOX/ — cosa hanno fatto i worker?
3. Leggi automa/ORDERS/ — Andrea ha dato direttive?
4. Leggi automa/STRATEGY/score-tracking.md — dove siamo?
5. Leggi automa/handoff.md — ultimo stato

Poi:
A. Aggiorna automa/STRATEGY/score-tracking.md con progressi reali
B. Aggiorna automa/STRATEGY/current-sprint.md se serve cambiare rotta
C. Fai RICERCA approfondita (web search) su 1-2 topic dal pool in AUTOPILOT.md
   Scrivi report in automa/knowledge/
D. Genera 2-3 task concrete in automa/INBOX/ per i prossimi worker
E. Se serve decisione Andrea, scrivi in automa/ESCALATION/
F. Genera idee in automa/STRATEGY/ideas-backlog.md

Pensa strategicamente. I worker eseguono, tu DIRIGI.
Data: $(date +%Y-%m-%d). Giorno $((( $(date +%s) - $(date -j -f '%Y-%m-%d' '2026-04-06' +%s) ) / 86400 + 1))/20." \
    >> "$LOG_FILE" 2>&1

echo "Director finished at $(date)" >> "$LOG_FILE"
echo "$(date) DIRECTOR" >> "$LOG_DIR/history.log"
