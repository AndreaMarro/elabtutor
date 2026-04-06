# ELAB Learned Lessons — Errori da NON Ripetere

> Questo file e' letto da OGNI sessione autonoma.
> Se hai fatto un errore, scrivilo qui per evitare che venga ripetuto.
> Formato: data, tentativo, risultato, motivo, regola.

---

[2026-04-06] TENTATO: Auto-scoring delle sessioni senza metriche esterne
  RISULTATO: Score inflato di 1.5-3 punti (self-score 8.6 vs reale 5.8)
  MOTIVO: L'agente valuta il proprio lavoro con ottimismo
  REGOLA: MAI auto-scoring. Solo evaluate-v3.sh determina lo score.

[2026-04-06] TENTATO: Orchestrator Python daemon (orchestrator.py) per loop continuo
  RISULTATO: Crash ogni 30 minuti per 37 ore, zero lavoro prodotto
  MOTIVO: Check Playwright hangava, heartbeat non aggiornato, UnboundLocalError
  REGOLA: Sessioni CORTE e INDIPENDENTI (cron/scheduled tasks), mai daemon long-running.

[2026-04-06] TENTATO: 25 iterazioni in una sessione (Ralph Loop v6)
  RISULTATO: Funziona MA con context degradation nelle ultime iterazioni
  MOTIVO: Dopo ~35 min / 20 step, ~2% accuracy degradation per step
  REGOLA: MAX 4 cicli per sessione, MAX 60 minuti. Poi FERMA e ricomincia fresco.

[2026-03-31] TENTATO: opacity CSS per fixare contrast ratio
  RISULTATO: Ha rotto hover state e transizioni
  MOTIVO: opacity influenza tutti i figli, non solo il colore
  REGOLA: Per contrast fix usare SOLO background-color e color, mai opacity/filter.
