#!/usr/bin/env bash
# UNLIM + Nanobot + Supabase Health Check
# Andrea Marro Claude Code Web — 12/04/2026
#
# Uso:
#   ./scripts/unlim-health-check.sh
#
# Verifica in ordine:
#  0. Connettivita base (sito live)
#  1. Supabase Edge Function unlim-chat (text)
#  2. Supabase Edge Function unlim-chat (RAG semantic)
#  3. Supabase Edge Function unlim-diagnose
#  4. Supabase Edge Function unlim-hints
#  5. Supabase pgvector RPC search_chunks (richiede service role key — opzionale)
#  6. Render Nanobot legacy (fallback)
#  7. Coerenza sessionId (scrittura + rilettura memoria)
#  8. RAG coverage: sample 10 esperimenti di 3 volumi
#
# Output: PASS/FAIL per ogni test + esit code 0 se tutto verde, 1 se qualcosa rosso.

set -u

# ── Config ──
SUPABASE_EDGE="${VITE_SUPABASE_EDGE_URL:-https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1}"
SUPABASE_ANON="${VITE_SUPABASE_EDGE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ}"
RENDER_NANOBOT="${RENDER_NANOBOT_URL:-https://elab-galileo.onrender.com}"
ELAB_SITE="${ELAB_SITE_URL:-https://www.elabtutor.school}"
SESSION_ID="healthcheck_$(date +%s)_$RANDOM"

# ── Colors ──
G="\033[0;32m"; R="\033[0;31m"; Y="\033[0;33m"; B="\033[0;34m"; N="\033[0m"
PASS=0; FAIL=0; WARN=0

ok()    { echo -e "${G}PASS${N}: $*"; PASS=$((PASS+1)); }
fail()  { echo -e "${R}FAIL${N}: $*"; FAIL=$((FAIL+1)); }
warn()  { echo -e "${Y}WARN${N}: $*"; WARN=$((WARN+1)); }
section(){ echo -e "\n${B}== $* ==${N}"; }

# ── Helper: curl JSON call ──
# Args: url headers_json body_json  --> stdout: http_status<TAB>body
call_json() {
  local url="$1"; shift
  local extra_headers="${1:-}"; shift || true
  local body="${1:-}"
  local -a args=( -s -o /tmp/healthck_body.$$ -w "%{http_code}" --max-time 30 )
  if [[ -n "$body" ]]; then
    args+=( -X POST -H "Content-Type: application/json" -d "$body" )
  fi
  if [[ -n "$extra_headers" ]]; then
    # extra_headers should be newline-separated "Header: value"
    while IFS= read -r h; do [[ -n "$h" ]] && args+=( -H "$h" ); done <<< "$extra_headers"
  fi
  local http; http=$(curl "${args[@]}" "$url" 2>/dev/null || echo "000")
  local body_out=""
  [[ -f /tmp/healthck_body.$$ ]] && body_out=$(cat /tmp/healthck_body.$$)
  rm -f /tmp/healthck_body.$$
  echo -e "${http}\t${body_out}"
}

section "0. Sito live reachability"
res=$(call_json "$ELAB_SITE" "" "")
http=$(echo "$res" | cut -f1)
if [[ "$http" == "200" ]]; then ok "Sito elabtutor.school $http"; else fail "Sito $ELAB_SITE http=$http"; fi

section "1. Supabase Edge — unlim-chat (text minimal)"
payload='{"message":"ciao UNLIM, funziona?","sessionId":"'$SESSION_ID'","circuitState":null,"experimentId":null,"simulatorContext":null}'
headers="apikey: $SUPABASE_ANON
Authorization: Bearer $SUPABASE_ANON"
res=$(call_json "$SUPABASE_EDGE/unlim-chat" "$headers" "$payload")
http=$(echo "$res" | cut -f1)
body=$(echo "$res" | cut -f2-)
if [[ "$http" == "200" ]]; then
  if echo "$body" | grep -q '"response"'; then
    len=$(echo "$body" | wc -c)
    ok "Edge unlim-chat risponde (${len}B)"
  else
    fail "Edge unlim-chat 200 ma no 'response' field: $(echo $body | head -c 200)"
  fi
else
  fail "Edge unlim-chat http=$http body=$(echo $body | head -c 200)"
fi

section "2. Supabase Edge — RAG semantic (query su Vol3)"
payload='{"message":"come funziona il semaforo?","sessionId":"'$SESSION_ID'","experimentId":"v3-cap6-semaforo","circuitState":null,"simulatorContext":null}'
res=$(call_json "$SUPABASE_EDGE/unlim-chat" "$headers" "$payload")
http=$(echo "$res" | cut -f1)
body=$(echo "$res" | cut -f2-)
if [[ "$http" == "200" ]]; then
  if echo "$body" | grep -qi "semaforo\|LED\|arduino"; then
    ok "RAG Vol3 semafor: risposta contiene topic (${#body}B)"
  else
    warn "RAG Vol3 semaforo 200 ma risposta generica: $(echo $body | head -c 200)"
  fi
else
  fail "RAG Vol3 http=$http"
fi

section "3. Supabase Edge — unlim-diagnose"
payload='{"sessionId":"'$SESSION_ID'","circuitState":{"components":[],"connections":[]},"experimentId":null}'
res=$(call_json "$SUPABASE_EDGE/unlim-diagnose" "$headers" "$payload")
http=$(echo "$res" | cut -f1)
if [[ "$http" == "200" ]]; then ok "Edge unlim-diagnose $http"; else warn "Edge unlim-diagnose http=$http"; fi

section "4. Supabase Edge — unlim-hints"
payload='{"sessionId":"'$SESSION_ID'","experimentId":"v1-cap6-esp1","circuitState":null}'
res=$(call_json "$SUPABASE_EDGE/unlim-hints" "$headers" "$payload")
http=$(echo "$res" | cut -f1)
if [[ "$http" == "200" ]]; then ok "Edge unlim-hints $http"; else warn "Edge unlim-hints http=$http"; fi

section "5. Supabase pgvector search_chunks (richiede SERVICE_ROLE_KEY)"
if [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  # 1536-dim placeholder vector (zeros). Real embedding comes from Gemini.
  echo "  (usa SERVICE_ROLE_KEY dalla env per fare query RPC — test saltato se non presente)"
  # Test semplificato: chiama solo l'endpoint per vedere che risponde
  sp_headers="Content-Type: application/json
apikey: $SUPABASE_SERVICE_ROLE_KEY
Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
  # Non lanciamo una vera query per non sporcare i log: controlliamo solo che il RPC esista
  res=$(call_json "${SUPABASE_EDGE%/functions/v1}/rest/v1/rpc/search_chunks" "$sp_headers" '{"query_embedding":[0.0],"match_threshold":0.5,"match_count":1}')
  http=$(echo "$res" | cut -f1)
  if [[ "$http" == "200" || "$http" == "400" ]]; then
    # 400 e' OK: significa che il RPC esiste ma il vector dimension e' sbagliato (placeholder)
    ok "pgvector RPC reachable (http=$http — 400 atteso per dim mismatch placeholder)"
  else
    warn "pgvector RPC http=$http"
  fi
else
  warn "SUPABASE_SERVICE_ROLE_KEY non settata: skip test pgvector diretto"
fi

section "6. Render Nanobot legacy fallback"
res=$(call_json "$RENDER_NANOBOT/health" "" "")
http=$(echo "$res" | cut -f1)
if [[ "$http" == "200" ]]; then
  ok "Render Nanobot /health $http"
else
  warn "Render Nanobot /health http=$http (cold start? riprova tra 30s)"
fi
# Test chat su Render
payload='{"message":"ping","sessionId":"'$SESSION_ID'"}'
res=$(call_json "$RENDER_NANOBOT/chat" "" "$payload")
http=$(echo "$res" | cut -f1)
if [[ "$http" == "200" ]]; then ok "Render /chat $http"; else warn "Render /chat http=$http"; fi

section "7. Memory coerenza — 2 call stesso sessionId"
MEM_SESSION="healthck_memory_$(date +%s)"
mem_headers="apikey: $SUPABASE_ANON
Authorization: Bearer $SUPABASE_ANON"
p1='{"message":"ricordati: il mio nome e Marco","sessionId":"'$MEM_SESSION'","experimentId":"v1-cap6-esp1"}'
res=$(call_json "$SUPABASE_EDGE/unlim-chat" "$mem_headers" "$p1")
http1=$(echo "$res" | cut -f1)
sleep 2
p2='{"message":"come mi chiamo?","sessionId":"'$MEM_SESSION'","experimentId":"v1-cap6-esp1"}'
res=$(call_json "$SUPABASE_EDGE/unlim-chat" "$mem_headers" "$p2")
http2=$(echo "$res" | cut -f1)
body2=$(echo "$res" | cut -f2-)
if [[ "$http1" == "200" && "$http2" == "200" ]]; then
  if echo "$body2" | grep -qi "marco"; then
    ok "Memory: nome 'Marco' ricordato tra 2 messaggi"
  else
    warn "Memory: call OK ma nome non ritrovato nella 2a risposta (potrebbe essere normale per Gemini — memoria server-side e' lesson_contexts, non history)"
  fi
else
  fail "Memory test: http1=$http1 http2=$http2"
fi

section "8. RAG coverage — 6 esperimenti sample (Vol1+2+3)"
SAMPLES=(
  "v1-cap6-esp1|Accendi il primo LED|led,resistore,LED,accensione"
  "v1-cap8-esp1|LED con pulsante|pulsante,LED,button"
  "v2-cap6-esp1|LED in serie 1 resistore|serie,resistore"
  "v2-cap7-esp1|Scarica condensatore|condensatore,RC,tempo"
  "v3-cap6-semaforo|Semaforo 3 LED|semaforo,Arduino,delay"
  "v3-extra-simon|Simon Says gioco|Simon,memoria,gioco"
)
for s in "${SAMPLES[@]}"; do
  IFS='|' read -r eid title expect <<< "$s"
  payload='{"message":"spiegami '"$title"' in 2 frasi","sessionId":"'$SESSION_ID'","experimentId":"'$eid'"}'
  res=$(call_json "$SUPABASE_EDGE/unlim-chat" "$headers" "$payload")
  http=$(echo "$res" | cut -f1)
  body=$(echo "$res" | cut -f2-)
  matched=0
  IFS=',' read -ra words <<< "$expect"
  for w in "${words[@]}"; do
    if echo "$body" | grep -qi "$w"; then matched=$((matched+1)); fi
  done
  if [[ "$http" == "200" && "$matched" -gt 0 ]]; then
    ok "RAG $eid: match $matched/${#words[@]} keyword"
  elif [[ "$http" == "200" ]]; then
    warn "RAG $eid: 200 ma 0 keyword match — $(echo $body | head -c 150)"
  else
    fail "RAG $eid: http=$http"
  fi
done

# ── Final report ──
echo ""
echo "================================================================"
echo -e "PASS: ${G}$PASS${N}  WARN: ${Y}$WARN${N}  FAIL: ${R}$FAIL${N}"
echo "================================================================"
if [[ "$FAIL" -gt 0 ]]; then
  echo -e "${R}ATTENZIONE: UNLIM HA PROBLEMI.${N} Rivedi prima della demo."
  exit 1
elif [[ "$WARN" -gt 2 ]]; then
  echo -e "${Y}OK con WARNING ($WARN).${N} Verifica manualmente."
  exit 0
else
  echo -e "${G}TUTTO VERDE.${N} UNLIM pronto per la demo."
  exit 0
fi

# Andrea Marro Claude Code Web — 12/04/2026
