/**
 * UNLIM Response Cleaner — tronca risposte lunghe e rimuove hallucination.
 * Target: <80 parole per risposte kid-friendly.
 * © Andrea Marro — 31/03/2026
 */

/**
 * Pulisce e tronca un testo di risposta UNLIM.
 * @param {string} text — testo grezzo della risposta
 * @param {number} maxWords — massimo numero di parole (default 80)
 * @returns {string} testo pulito e troncato
 */
export function cleanAndTruncate(text, maxWords = 80) {
  if (!text) return '';

  // Rimuovi hallucination "Ho analizzato l'immagine che hai inviato"
  let cleaned = text.replace(/Ho analizzato l['']immagine che hai inviato\.?\s*/gi, '');

  // Tronca a maxWords parole
  const words = cleaned.trim().split(/\s+/);
  if (words.length <= maxWords) return cleaned.trim();

  return words.slice(0, maxWords).join(' ') + '…';
}
