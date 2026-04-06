#!/bin/bash
# ELAB Autopilot — Director v2 (STRATEGIC + RESEARCH HEAVY)
# Lanciato da cron ogni 8 ore. Pensa, ricerca, pianifica, genera idee.

ELAB_DIR="/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
LOG_DIR="$ELAB_DIR/automa/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="$LOG_DIR/director-$TIMESTAMP.log"
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | tail -1)/bin:$PATH"

mkdir -p "$LOG_DIR"

echo "=== ELAB Director v2 — $TIMESTAMP ===" > "$LOG_FILE"
cd "$ELAB_DIR"

DAY=$(( ($(date +%s) - $(date -j -f '%Y-%m-%d' '2026-04-06' +%s 2>/dev/null || echo 1743897600)) / 86400 + 1 ))

claude --auto \
    --print \
    --output-format text \
    --max-tokens 128000 \
    "Sei il DIRETTORE ELAB Autopilot. Sessione STRATEGICA + RICERCA.

LEGGI ORA: AUTOPILOT.md + automa/handoff.md + automa/OUTBOX/ + automa/ORDERS/ + automa/STRATEGY/

GIORNO $DAY/20.

IL TUO LAVORO (in ordine):

1. ANALIZZA: leggi tutto OUTBOX/ — cosa hanno fatto i worker? Aggiorna score-tracking.md.

2. RICERCA PROFONDA (2-3 topic): Usa web search per ricercare:
   - 1 topic competitor/market (TinkerCAD, mBlock, Arduino IDE, PNRR bandi)
   - 1 topic tecnico (testing React, performance Vite, accessibility automation)
   - 1 topic pedagogico (AI tutoring, circuit simulation education, scaffolding)
   Scrivi ogni report in automa/knowledge/$(date +%Y-%m-%d)-[topic].md

3. GENERA IDEE: Scrivi 3-5 idee nuove in automa/STRATEGY/ideas-backlog.md
   Ogni idea: cosa, impatto 1-10, effort S/M/L, perche ora

4. PIANIFICA: Aggiorna automa/STRATEGY/current-sprint.md con:
   - Cosa hanno fatto i worker
   - Cosa devono fare nelle prossime 8h
   - Quali aree hanno il gap piu grande
   - Se serve cambiare strategia

5. GENERA TASK: Scrivi 3-5 task in automa/INBOX/ per i prossimi worker:
   Formato: [NNN]-[topic].md con istruzioni precise

6. ESCALATION: Se serve una decisione di Andrea, scrivi in automa/ESCALATION/

7. AGGIORNA handoff.md

SEI IL CERVELLO STRATEGICO. Non scrivi codice. Pensi, ricerchi, dirigi.
Fai ricerca web AGGRESSIVA — 10+ query per topic.
Genera IDEE BREAKTHROUGH — cosa farebbe di ELAB il prodotto #1 per scuole?" \
    >> "$LOG_FILE" 2>&1

echo "Director finished at $(date)" >> "$LOG_FILE"
echo "$(date) DIRECTOR-DONE" >> "$LOG_DIR/history.log"
