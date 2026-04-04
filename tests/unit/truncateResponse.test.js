import { cleanAndTruncate } from '../../src/utils/truncateResponse';
import { describe, it, expect } from 'vitest';

describe('cleanAndTruncate', () => {
  it('tronca a 80 parole', () => {
    const long = Array(100).fill('parola').join(' ');
    const result = cleanAndTruncate(long, 80);
    const wordCount = result.replace('…', '').trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(80);
    expect(result.endsWith('…')).toBe(true);
  });

  it('rimuove hallucination immagine', () => {
    const text = "Ciao! Ho analizzato l'immagine che hai inviato. Il circuito ha un LED.";
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('immagine');
    expect(result).toContain('Ciao');
    expect(result).toContain('LED');
  });

  it('non tronca testi corti', () => {
    const short = 'Il LED si accende solo in un verso.';
    expect(cleanAndTruncate(short)).toBe(short);
  });

  it('gestisce null/undefined', () => {
    expect(cleanAndTruncate(null)).toBe('');
    expect(cleanAndTruncate(undefined)).toBe('');
    expect(cleanAndTruncate('')).toBe('');
  });
});
