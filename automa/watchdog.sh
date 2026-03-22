#!/bin/bash
# ELAB AUTOMA — Watchdog
# Controllato da launchd ogni 10 minuti.
# Se il dispatcher e' morto, lo riavvia.
# Se HALT esiste, non fa nulla.

DIR="$(cd "$(dirname "$0")" && pwd)"
HEARTBEAT="$DIR/heartbeat"
LOG="$DIR/logs/watchdog-$(date +%Y%m%d).log"

log() { echo "[$(date +%H:%M:%S)] $1" >> "$LOG"; }

# HALT check
if [ -f "$DIR/HALT" ]; then
    log "HALT active. Skipping."
    exit 0
fi

# Check heartbeat freshness
NOW=$(date +%s)
if [ -f "$HEARTBEAT" ]; then
    LAST=$(stat -f %m "$HEARTBEAT" 2>/dev/null || echo 0)
    DIFF=$((NOW - LAST))
else
    DIFF=99999
fi

# If heartbeat older than 3 hours (10800s), restart
if [ "$DIFF" -gt 10800 ]; then
    log "Dispatcher stale (${DIFF}s since heartbeat). Restarting..."

    # Kill old dispatcher
    pkill -f "dispatcher.sh" 2>/dev/null
    sleep 2

    # Restart
    cd "$DIR/.."
    nohup bash automa/dispatcher.sh >> "$DIR/logs/dispatcher-$(date +%Y%m%d).log" 2>&1 &
    log "Dispatcher restarted (PID: $!)"
else
    log "Dispatcher alive (heartbeat ${DIFF}s ago)"
fi

# Caffeinate renewal
if ! pgrep -q caffeinate; then
    caffeinate -dims -t 86400 &
    log "Renewed caffeinate"
fi
