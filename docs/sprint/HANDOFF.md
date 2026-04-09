# Sprint Handoff — Principio Zero

> Aggiornato: 2026-04-09 20:00
> Sessione corrente: S0 (setup)
> Prossima: S1

## Stato Metriche

| Metrica | Valore | Target | % |
|---------|--------|--------|---|
| BuildSteps Vol1 | 38/38 exp hanno buildSteps | 38/38 | 100% (MA: verificare qualità) |
| BuildSteps Vol2 | 18/27 exp | 27/27 | 67% |
| BuildSteps Vol3 | 6/27 exp | 27/27 | 22% |
| ScratchXml | 11 (solo Vol3) | ~27 Vol3 | 41% |
| Lesson Paths | 84/92 | 92/92 | 91% |
| Alias Mapping Tea | 0/92 | 92/92 | 0% |
| UNLIM Onniscienza | non misurata | test 92 domande | ? |
| CI | test+build+e2e GREEN | GREEN | OK |
| Test count | 1595 | >= 1595 | OK |

## Cosa è stato fatto (sessioni precedenti)

- P1 safety regex fix (child safety) ✓
- P2 fetch timeout 11/11 calls ✓ 
- CI lightningcss fix ✓
- 1595 test, 36 file, 35 moduli ✓
- 17 research report ✓
- Deploy Vercel prod ✓

## Cosa deve fare S1

1. Creare `src/data/chapter-map.js` con alias mapping Tea
2. Verificare che tutti 92 esperimenti siano mappati
3. Test automatico per chapter-map
4. Audit parità: contare buildSteps reali per volume

## Regole FERREE

- MAI pushare su main — sempre branch + PR
- MAI dichiarare "finito" senza prova oggettiva
- CI deve essere verde prima di qualsiasi merge
- Ogni sessione aggiorna QUESTO file prima di finire
