// ELAB Tutor - helper per import dinamici Vite più resilienti
// Ritenta 3 volte con backoff prima di arrendersi. Utile quando il browser
// annulla il caricamento di un chunk per cambio rapido di route / rete lenta.
export async function importWithRetry(loader, tries = 3, baseDelayMs = 250) {
  let lastErr;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await loader();
    } catch (err) {
      lastErr = err;
      if (attempt === tries - 1) break;
      await new Promise(r => setTimeout(r, baseDelayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}
