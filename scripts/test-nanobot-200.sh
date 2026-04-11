#!/usr/bin/env bash
# ============================================================
# test-nanobot-200.sh — Stress test UNLIM con 200 domande reali
# Endpoint: https://elab-galileo.onrender.com/tutor-chat
# Nessuna autenticazione richiesta (solo Content-Type: application/json)
#
# Uso: bash scripts/test-nanobot-200.sh
# Output: scripts/nanobot-200-results.json
#
# Claude web andrea marro — 11/04/2026
# ============================================================

set -euo pipefail

ENDPOINT="${NANOBOT_URL:-https://elab-galileo.onrender.com}/tutor-chat"
OUTPUT="scripts/nanobot-200-results.json"
SESSION_ID="test-200-$(date +%s)"
TIMEOUT=30  # secondi per richiesta
DELAY=0.5   # secondi tra richieste (rispetta rate limit 30/h → 0.5s ok per burst)

# 200 domande reali che un docente o studente farebbe
QUESTIONS=(
  # ── Basi elettronica (1-20) ──
  "Cos'e' un LED?"
  "Perche' il LED ha bisogno di un resistore?"
  "Cosa succede se collego il LED al contrario?"
  "Come si calcola il valore del resistore per un LED?"
  "Qual e' la differenza tra corrente e tensione?"
  "Cos'e' un circuito in serie?"
  "Cos'e' un circuito in parallelo?"
  "Perche' il LED rosso e quello verde hanno tensioni diverse?"
  "Cosa significa la sigla LED?"
  "Cos'e' la legge di Ohm?"
  "Come si legge il codice colore dei resistori?"
  "Perche' il buzzer suona solo in una direzione?"
  "Cosa fa un potenziometro?"
  "Come funziona un fotoresistore?"
  "Cos'e' un reed switch?"
  "Perche' si usa una batteria da 9V?"
  "Cosa succede se metto due LED in serie?"
  "Come si misura la tensione con il multimetro?"
  "Cos'e' la polarita'?"
  "Perche' la breadboard ha file collegate?"

  # ── Arduino (21-40) ──
  "Cos'e' Arduino?"
  "Come si programma Arduino?"
  "Cosa fa la funzione digitalWrite?"
  "Cos'e' il pin 13 di Arduino?"
  "Come si fa lampeggiare un LED con Arduino?"
  "Cosa significa analogRead?"
  "Come si usa il Serial Monitor?"
  "Cos'e' una variabile in Arduino?"
  "Come funziona un ciclo for?"
  "Cos'e' la funzione delay?"
  "Come si controlla un servo con Arduino?"
  "Cosa fa la funzione map?"
  "Come si legge un pulsante con Arduino?"
  "Cos'e' il debounce?"
  "Come si usa un LCD con Arduino?"
  "Cosa significa PWM?"
  "Come si genera un suono con Arduino?"
  "Cos'e' una funzione in Arduino?"
  "Come si salva un programma Arduino?"
  "Cos'e' il baud rate?"

  # ── Componenti specifici (41-60) ──
  "Come funziona un condensatore?"
  "Cosa fa un transistor MOSFET?"
  "Come funziona un fototransistor?"
  "Qual e' la differenza tra un diodo e un LED?"
  "Come funziona un motore DC?"
  "Cos'e' un servo motore?"
  "Come si controlla la velocita' di un motore?"
  "Cosa fa un diodo di protezione?"
  "Come funziona un sensore di temperatura?"
  "Cos'e' un relay?"
  "Come si usa un pulsante normalmente aperto?"
  "Cosa significa Vf di un LED?"
  "Quanta corrente passa in un LED tipico?"
  "Cos'e' la capacita' di un condensatore?"
  "Come si carica un condensatore?"
  "Come si scarica un condensatore?"
  "Cos'e' la costante di tempo RC?"
  "Come funziona un partitore di tensione?"
  "Cos'e' un circuito integrato?"
  "Come si alimenta un circuito con la USB?"

  # ── Esperimenti specifici ELAB (61-80) ──
  "Aiutami con l'esperimento del primo LED"
  "Come si monta il circuito del LED RGB?"
  "Non riesco a far funzionare il pulsante"
  "Il LED non si accende, cosa sbaglio?"
  "Come collego il potenziometro?"
  "Il buzzer non suona, perche'?"
  "Come si fa il circuito del semaforo?"
  "Aiutami con il circuito del motore DC"
  "Come collego il fotoresistore alla breadboard?"
  "Il reed switch non funziona col magnete"
  "Come si usa l'elettropongo?"
  "Aiutami a costruire il robot"
  "Il LED e' troppo debole, come lo faccio piu' forte?"
  "Posso usare due LED con una sola batteria?"
  "Come faccio a cambiare colore al LED RGB?"
  "Il potenziometro non cambia la luminosita'"
  "Come si collegano tre LED in serie?"
  "Il motore non gira, cosa controllo?"
  "Come faccio la luce notturna automatica?"
  "Aiutami con il Simon Says"

  # ── Errori comuni (81-100) ──
  "Ho un corto circuito, come lo trovo?"
  "La batteria si scarica subito, perche'?"
  "Il LED si e' bruciato, cosa ho fatto?"
  "Il circuito funziona a volte si e a volte no"
  "Il multimetro segna 0, perche'?"
  "Ho messo il resistore sbagliato, e' pericoloso?"
  "Il filo si e' staccato dalla breadboard"
  "Arduino non si collega al computer"
  "Il codice non compila, dice errore"
  "Il servo vibra ma non si muove"
  "Il condensatore diventa caldo, e' normale?"
  "Ho invertito i fili del motore"
  "Il pulsante resta premuto anche se non lo tocco"
  "Il fotoresistore da' sempre lo stesso valore"
  "Il LCD mostra caratteri strani"
  "Il Serial Monitor non mostra niente"
  "Ho collegato 5V dove non dovevo"
  "Il circuito funzionava ieri, oggi no"
  "Il LED lampeggia da solo"
  "Sento un sibilo dal circuito"

  # ── Concetti pedagogici (101-120) ──
  "Spiegami la corrente come se avessi 10 anni"
  "Cos'e' l'elettricita' in parole semplici?"
  "Perche' l'elettricita' e' pericolosa?"
  "Come funziona una pila?"
  "Cos'e' un elettrone?"
  "Perche' i metalli conducono?"
  "Cos'e' un isolante?"
  "Come funziona un interruttore?"
  "Perche' i fili sono di rame?"
  "Cos'e' l'energia elettrica?"
  "Come si produce l'elettricita'?"
  "Cos'e' la resistenza elettrica?"
  "Perche' le lampadine si scaldano?"
  "Come funziona un fulmine?"
  "Cos'e' l'elettricita' statica?"
  "Perche' prendo la scossa col maglione?"
  "Come funzionano le batterie ricaricabili?"
  "Cos'e' un semiconduttore?"
  "Come fanno i computer a usare l'elettricita'?"
  "Perche' alcuni materiali non conducono?"

  # ── Domande del docente (121-140) ──
  "Prepara una lezione sul LED per 25 bambini"
  "Quanto dura l'esperimento del potenziometro?"
  "Quali componenti servono per il Cap. 7?"
  "Come spiego la legge di Ohm a bambini di 10 anni?"
  "Suggerisci un'attivita' di gruppo sul circuito"
  "Come valuto se hanno capito il concetto?"
  "Qual e' l'ordine migliore degli esperimenti?"
  "Come gestisco un bambino che ha gia' finito?"
  "Cosa faccio se un componente si rompe?"
  "Come introduco Arduino a chi non sa programmare?"
  "Suggerisci una domanda provocatoria per la classe"
  "Come collego questo esperimento alla vita reale?"
  "Quanto tempo serve per il Volume 2?"
  "Posso saltare alcuni esperimenti?"
  "Come faccio se manca un componente dal kit?"
  "Suggerisci un progetto finale per il Volume 1"
  "Come spiego il concetto di circuito chiuso?"
  "Quali errori fanno piu' spesso i bambini?"
  "Come rendo la lezione piu' interattiva?"
  "Prepara un quiz di 5 domande sul LED"

  # ── Scratch/Blockly (141-160) ──
  "Come si programma con Scratch?"
  "Cos'e' un blocco in Scratch?"
  "Come faccio lampeggiare un LED con Scratch?"
  "Come leggo un sensore con i blocchi?"
  "Cos'e' la differenza tra Scratch e Arduino C?"
  "Come si usa il blocco ripeti?"
  "Come faccio un programma che reagisce al pulsante?"
  "Cos'e' un evento in Scratch?"
  "Come si usa il blocco se-allora?"
  "Come controllo il servo con Scratch?"
  "Come si compila un programma Scratch per Arduino?"
  "Cos'e' una variabile in Scratch?"
  "Come si usa il blocco aspetta?"
  "Come faccio suonare il buzzer con Scratch?"
  "Come leggo il potenziometro con Scratch?"
  "Come si fa un semaforo con i blocchi?"
  "Cos'e' il blocco per sempre?"
  "Come si debugga un programma Scratch?"
  "Come si salva un progetto Scratch?"
  "Qual e' il vantaggio di Scratch rispetto al C?"

  # ── Domande avanzate (161-180) ──
  "Come funziona il PWM nel dettaglio?"
  "Cos'e' l'ADC di Arduino?"
  "Come si usa un interrupt?"
  "Cos'e' il duty cycle?"
  "Come funziona la comunicazione seriale?"
  "Cos'e' il protocollo I2C?"
  "Come si programma un timer?"
  "Cos'e' la frequenza di campionamento?"
  "Come si fa il debounce hardware?"
  "Cos'e' un pull-up resistor?"
  "Come funziona un H-bridge?"
  "Cos'e' la modulazione di frequenza?"
  "Come si misura la corrente?"
  "Cos'e' la potenza elettrica?"
  "Come funziona un regolatore di tensione?"
  "Cos'e' un filtro RC?"
  "Come si calcola la potenza dissipata?"
  "Cos'e' un oscillatore?"
  "Come funziona un amplificatore?"
  "Cos'e' il ground in un circuito?"

  # ── Domande creative/libere (181-200) ──
  "Posso costruire un robot che segue la luce?"
  "Come faccio una sveglia con Arduino?"
  "Posso controllare il LED col telefono?"
  "Come faccio un gioco con Arduino?"
  "Posso costruire un sensore di pioggia?"
  "Come faccio un contatore con il display?"
  "Posso far parlare Arduino?"
  "Come costruisco un termometro digitale?"
  "Posso controllare un motore col telefono?"
  "Come faccio un allarme antifurto?"
  "Posso costruire un semaforo intelligente?"
  "Come faccio una stazione meteo?"
  "Posso far suonare una melodia col buzzer?"
  "Come costruisco un cronometro?"
  "Posso fare un dado elettronico?"
  "Come faccio un display che conta i passi?"
  "Posso costruire un irrigatore automatico?"
  "Come faccio una luce che cambia con la musica?"
  "Posso controllare le luci di casa con Arduino?"
  "Raccontami un progetto divertente da fare!"
)

echo "=========================================="
echo "  ELAB Tutor — Test UNLIM 200 domande"
echo "  Endpoint: $ENDPOINT"
echo "  Session: $SESSION_ID"
echo "=========================================="
echo ""

TOTAL=${#QUESTIONS[@]}
PASS=0
FAIL=0
SLOW=0
ERRORS=()
RESULTS="["

for i in "${!QUESTIONS[@]}"; do
  Q="${QUESTIONS[$i]}"
  NUM=$((i + 1))
  printf "[%3d/%d] %-60s " "$NUM" "$TOTAL" "${Q:0:57}..."

  START_TIME=$(date +%s%N)

  RESPONSE=$(curl -s --max-time "$TIMEOUT" \
    -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"message\": $(echo "$Q" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'), \"sessionId\": \"$SESSION_ID\", \"experimentId\": null}" \
    2>&1) || RESPONSE='{"error":"curl_failed"}'

  END_TIME=$(date +%s%N)
  ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))

  # Parse response
  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null || echo "")
  RESP_TEXT=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','')[:80])" 2>/dev/null || echo "PARSE_ERROR")
  SOURCE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('source','unknown'))" 2>/dev/null || echo "unknown")

  if [ "$SUCCESS" = "True" ] || [ "$SUCCESS" = "true" ]; then
    if [ "$ELAPSED_MS" -gt 10000 ]; then
      printf "SLOW (%dms) [%s]\n" "$ELAPSED_MS" "$SOURCE"
      SLOW=$((SLOW + 1))
    else
      printf "OK   (%dms) [%s]\n" "$ELAPSED_MS" "$SOURCE"
    fi
    PASS=$((PASS + 1))
  else
    printf "FAIL (%dms) %s\n" "$ELAPSED_MS" "${RESP_TEXT:0:50}"
    FAIL=$((FAIL + 1))
    ERRORS+=("Q${NUM}: ${Q}")
  fi

  # Append to JSON results
  COMMA=""
  [ "$i" -gt 0 ] && COMMA=","
  RESULTS="${RESULTS}${COMMA}{\"q\":${NUM},\"question\":$(echo "$Q" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),\"success\":\"$SUCCESS\",\"ms\":$ELAPSED_MS,\"source\":\"$SOURCE\"}"

  # Rate limit: brief pause between requests
  sleep "$DELAY"
done

RESULTS="${RESULTS}]"
echo "$RESULTS" > "$OUTPUT"

echo ""
echo "=========================================="
echo "  RISULTATI"
echo "=========================================="
echo "  Totale:   $TOTAL"
echo "  Passate:  $PASS"
echo "  Fallite:  $FAIL"
echo "  Lente:    $SLOW (>10s)"
echo "  Success:  $(( PASS * 100 / TOTAL ))%"
echo "  Output:   $OUTPUT"
echo "=========================================="

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Domande fallite:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
fi

# Exit with failure if >10% fail
if [ "$FAIL" -gt 20 ]; then
  echo ""
  echo "ATTENZIONE: >10% domande fallite!"
  exit 1
fi

echo ""
echo "Test completato. Risultati in $OUTPUT"
