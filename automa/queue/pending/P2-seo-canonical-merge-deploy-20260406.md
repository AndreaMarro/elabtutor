# TASK: Merge SEO canonical fix + deploy in produzione

**Priorità**: P2 (SEO — impatto indicizzazione motori di ricerca)
**Creato**: 2026-04-06T23:45:00+02:00
**Sorgente**: Audit produzione Run #3 (elab-auditor scheduled)
**Assegnato a**: Worker umano / maintainer (richiede `git merge` + trigger deploy Vercel)

---

## Problema

Il sito `https://www.elabtutor.school` in produzione ha ancora le seguenti URL SEO errate:

- `<link rel="canonical" href="https://elab-builder.vercel.app/" />` ← deve essere `https://www.elabtutor.school/`
- `<meta property="og:url" content="https://elab-builder.vercel.app/" />` ← errata
- `<meta property="og:image" content="https://elab-builder.vercel.app/elab-mascot.png" />` ← errata
- `/sitemap.xml`: tutti i `<loc>` puntano a `elab-builder.vercel.app`
- `/robots.txt`: `Sitemap: https://elab-builder.vercel.app/sitemap.xml`

Il problema persiste dall'audit di stamattina (Run #1, Run #2, Run #3 — tutta la giornata del 6 aprile).

---

## Fix disponibile

Il fix per `index.html` (canonical, og:url, og:image) è già stato committato:
- **Branch**: `fix/seo-canonical-infra-worker`
- **Commit**: `0267b9a fix(seo+infra): canonical URL → elabtutor.school + evaluate-v3.sh + AUTOPILOT.md`

Questo branch NON è ancora stato merged in `main`.

**ATTENZIONE**: Il fix nel commit `0267b9a` corregge `index.html` ma potrebbe NON aver aggiornato:
- `public/robots.txt` → `Sitemap:` punta ancora a elab-builder.vercel.app
- `public/sitemap.xml` → tutti i `<loc>` puntano a elab-builder.vercel.app

Verificare che anche questi file vengano aggiornati prima del merge.

---

## Azioni richieste

1. **Verificare** il contenuto di `fix/seo-canonical-infra-worker` per `robots.txt` e `sitemap.xml`
2. **Aggiornare** `public/robots.txt`: `Sitemap: https://www.elabtutor.school/sitemap.xml`
3. **Aggiornare** `public/sitemap.xml`: tutti i `<loc>` → `https://www.elabtutor.school/...`
4. **Merge** `fix/seo-canonical-infra-worker` in `main`
5. **Merge** anche `fix/lavagna-volume-page-persistence` (fix a11y + persistenza lavagna, non deployato)
6. **Verificare** che Vercel triggeri il deploy automaticamente dopo il push su main
7. **Confermare** post-deploy che canonical/og:url/og:image siano corretti in produzione

---

## Riproduzione

```bash
curl -s "https://www.elabtutor.school" | grep canonical
# Output attuale (errato):
# <link rel="canonical" href="https://elab-builder.vercel.app/" />

curl -s "https://www.elabtutor.school/robots.txt"
# Output attuale (errato):
# Sitemap: https://elab-builder.vercel.app/sitemap.xml
```

---

## Branches da mergiare in main

```bash
cd ~/ELAB/elab-builder
git checkout main
git merge fix/seo-canonical-infra-worker   # SEO fix
git merge fix/lavagna-volume-page-persistence  # WCAG + lavagna persistence
git push origin main
# Vercel dovrebbe deployare automaticamente
```

**Ricordare**: verificare robots.txt e sitemap.xml prima del push.
