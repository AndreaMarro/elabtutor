# Next Task — 2026-04-07 13:38

## TASK
Aggiungere `css: false` in `vitest.config.js` per fixare il CI lightningcss su Linux e sbloccare TUTTE le 25 PR aperte.

## PERCHE'
**Audit CI (Run 12 / MEGA-ORDERS)**: Tutte le PR hanno CI che fallisce non per il codice, ma perché `lightningcss.linux-x64-gnu.node` manca sull'ambiente Linux di GitHub Actions. Questo causa il fallimento di 5 file `.jsx` di test, che portano il conteggio totale a soli 28 test passati vs baseline di 1700. Il quality-ratchet rifiuta tutto: `28 < 1666 (minimo consentito)`.

Il fix `css: false` è già PROVATO e funzionante sul branch `fix/evaluate-v3-run4-macos` (commit f60f3b7, handoff Run 5: "1442/1442 test OK"). Non è mai stato portato su main.

Finché questo fix NON è su main, NESSUNA delle 25 PR potrà passare il CI → ZERO merge → sistema bloccato.

## FILE DA MODIFICARE (max 5)
- `vitest.config.js` — aggiunge `css: false` nel blocco `test:`

## APPROCCIO
1. `bash automa/evaluate-v3.sh` → score PRIMA (atteso ~48 su main broken, ok)
2. Checkout branch pulito: `git checkout -b fix/ci-lightningcss-linux origin/main`
3. In `vitest.config.js`, dentro `test: { ... }`, aggiungere `css: false,`
   (Riferimento esatto: `git show origin/fix/evaluate-v3-run4-macos:vitest.config.js | grep -A2 css`)
4. `npm test -- --run` locale → verifica che il count sia vicino a 1442+
5. `bash automa/evaluate-v3.sh` → score DOPO
6. Se DOPO >= PRIMA: `git add vitest.config.js && git commit -m "fix(ci): css:false in vitest.config.js — lightningcss Linux fix"` + `git push origin fix/ci-lightningcss-linux`
7. `gh pr create --title "fix(ci): lightningcss Linux — css:false in vitest.config.js"` con body che spiega che sblocca tutte le 25 PR e include score PRIMA→DOPO
8. Aggiornare `automa/handoff.md`

## CRITERIO DI SUCCESSO
- Il nuovo PR ha CI verde (test: PASS, quality-ratchet: PASS con 1400+ test)
- `vitest.config.js` contiene `css: false` nel blocco `test:`
- Il PR body contiene "Score PRIMA: X → Score DOPO: Y"

## RISCHI
- `vitest.config.js` non è nella lista dei file protetti (quella è `vite.config.js`) → OK modificarlo
- `css: false` potrebbe nascondere errori CSS reali → accettabile per CI su Linux, il comportamento reale è testato localmente
- Il fix richiede merge su main da parte di Andrea → il Builder crea solo il PR, non fa il merge
- Il branch `fix/evaluate-v3-run4-macos` potrebbe avere altri cambiamenti insieme al `css:false` → copiare SOLO quella riga, non fare cherry-pick dell'intero branch

## NON FARE (da learned-lessons)
- NON auto-scorare: usare solo `bash automa/evaluate-v3.sh` per misurare
- NON fare sessioni lunghe: questo è un task di 1 file, deve completarsi in 1 ciclo
- NON usare `opacity` per fix CSS (non rilevante qui ma ricordarlo)
- NON creare feature nuove (activation tracker, EU AI Act) — solo questo fix
- NON toccare `vite.config.js`, `.env`, `package.json`
- NON fare push direttamente su main — solo branch + PR
