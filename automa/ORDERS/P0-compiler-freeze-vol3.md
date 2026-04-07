# P1 — Compiler Freeze Vol3 Arduino

**Data rilevazione**: 2026-04-07 (Audit ELAB Auditor v2)
**Severità**: P1 (blocca completamente l'utente)

## Problema
Cliccando `▶ Compila & Carica` in qualsiasi esperimento Vol3 Arduino, il renderer del browser si congela per 45+ secondi. L'utente (bambino di 10 anni) non può fare nulla — la pagina sembra morta.

## Riproduzione
1. Login con ELAB2026
2. Seleziona qualsiasi esperimento Vol3 (testato: Cap5 Esp1 "Blink con LED_BUILTIN", Cap7 Ese7.3 "Pulsante con INPUT_PULLUP")
3. Clicca `▶ Compila & Carica`
4. Il renderer si blocca (~45 secondi timeout)
5. Recovery solo tramite hard navigation (ricarica pagina)

## Causa probabile
La compilazione Arduino usa WebAssembly (avr-gcc o toolchain simile) che gira sul main thread del browser. Il processo è CPU-intensivo e blocca il rendering.

## Fix suggerito
- Spostare la compilazione in un **Web Worker** per evitare il blocco del main thread
- Aggiungere un indicatore di progresso/spinner visibile durante la compilazione
- Timeout esplicito con messaggio di errore se la compilazione impiega >10s

## File da investigare
- `src/components/simulator/` — componenti Arduino/compilatore
- Cerca: `compile`, `avr`, `wasm`, `Worker`
