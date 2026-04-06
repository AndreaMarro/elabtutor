# ORDER P1 — 7 Pull Request aperte non mergiate in main

**ID**: P1-2026-04-06-prs-not-merged
**Priorità**: P1
**Creato da**: elab-auditor (scheduled, Run#3)
**Data**: 2026-04-06
**Impatto**: Tutte le correzioni di G44 non sono in produzione

---

## Problema

L'audit Run#3 ha verificato che la branch `main` (quella deployata su Vercel) NON contiene le correzioni sviluppate durante G44. Ci sono 7 PR aperte, nessuna mergiata.

Il sito in produzione sta girando con codice **precedente a G44**, inclusi:
- Canonical URL sbagliato (elab-builder.vercel.app)
- og:url e og:image sbagliate
- Mancanza dei 5 nuovi buildSteps Vol3
- Mancanza dei fix WCAG VetrinaSimulatore

## PR da Mergare (ordine priorità)

```
PR#1  fix/seo-canonical-infra-worker      ← P2 SEO critico
PR#2  fix/wcag-vetrina-unlimmemory-cleanup ← P2 A11y
PR#3  fix/lavagna-volume-page-persistence  ← P2 UX
PR#4  fix/buildsteps-vol3-cap5-cap6       ← P1 contenuto
PR#6  fix/seo-twitter-og-keywords         ← P2 SEO
PR#7  chore/copyright-date-2026-04-06     ← P3 chore
(PR#5 research — opzionale)
```

## Azione Richiesta

**UMANO RICHIESTO**: Le PR devono essere review+merge da un umano.
Nessun agente può fare merge su main (regola di sicurezza AUTOPILOT.md).

Comandi per review rapida:
```bash
export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder
gh pr list --state open
gh pr view 1  # canonical URL
gh pr merge 1 --squash  # dopo review
```

## Riproduzione

1. `curl -s -L https://www.elabtutor.school | grep canonical`
   → restituisce `https://elab-builder.vercel.app/` (SBAGLIATO)
2. `git log --oneline main | head -5`
   → non contiene commit `0267b9a fix(seo+infra): canonical URL`
