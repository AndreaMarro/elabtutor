// ============================================
// ELAB Tutor - Extended tests for truncateResponse
// Edge cases and additional scenarios
// ============================================

import { cleanAndTruncate } from '../../src/utils/truncateResponse';
import { describe, it, expect } from 'vitest';

describe('cleanAndTruncate - extended', () => {
  it('should handle text with exactly maxWords words (no truncation)', () => {
    const text = Array(80).fill('parola').join(' ');
    const result = cleanAndTruncate(text, 80);
    expect(result.endsWith('…')).toBe(false);
  });

  it('should truncate when text exceeds maxWords by 1', () => {
    const text = Array(81).fill('parola').join(' ');
    const result = cleanAndTruncate(text, 80);
    expect(result.endsWith('…')).toBe(true);
  });

  it('should respect custom maxWords parameter', () => {
    const text = Array(50).fill('word').join(' ');
    const result = cleanAndTruncate(text, 30);
    const wordCount = result.replace('…', '').trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(30);
    expect(result.endsWith('…')).toBe(true);
  });

  it('should handle hallucination with apostrophe variant', () => {
    const text = "Ho analizzato l'immagine che hai inviato. Vedo un circuito.";
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('Ho analizzato');
    expect(result).toContain('Vedo un circuito');
  });

  it('should handle multiple hallucination occurrences', () => {
    const text = "Ho analizzato l'immagine che hai inviato. Testo. Ho analizzato l'immagine che hai inviato. Fine.";
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('Ho analizzato');
  });

  it('should preserve technical words in truncated text', () => {
    const text = 'LED resistore condensatore transistor ' + Array(100).fill('parola').join(' ');
    const result = cleanAndTruncate(text, 10);
    expect(result).toContain('LED');
  });

  it('should handle text with only spaces', () => {
    const result = cleanAndTruncate('   ');
    // All whitespace should result in empty after trim
    expect(result.trim()).toBe('');
  });

  it('should handle single word text', () => {
    const result = cleanAndTruncate('Ciao');
    expect(result).toBe('Ciao');
  });

  it('should handle numeric input gracefully (falsy check)', () => {
    // 0 is falsy — should return ''
    expect(cleanAndTruncate(0)).toBe('');
  });

  it('should handle false input gracefully', () => {
    expect(cleanAndTruncate(false)).toBe('');
  });

  it('should use default maxWords of 80 when not specified', () => {
    const text = Array(100).fill('word').join(' ');
    const result = cleanAndTruncate(text);
    const wordCount = result.replace('…', '').trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(80);
  });

  it('should return trimmed text without leading/trailing spaces', () => {
    const result = cleanAndTruncate('  Ciao mondo  ');
    expect(result).toBe('Ciao mondo');
  });

  it('should return string type for valid input', () => {
    const result = cleanAndTruncate('Testo breve');
    expect(typeof result).toBe('string');
  });

  it('should handle text with newlines', () => {
    const text = 'Prima riga\nSeconda riga\nTerza riga';
    const result = cleanAndTruncate(text);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should append ellipsis only when truncating', () => {
    const short = 'Testo breve';
    const long = Array(100).fill('word').join(' ');
    expect(cleanAndTruncate(short).endsWith('…')).toBe(false);
    expect(cleanAndTruncate(long, 10).endsWith('…')).toBe(true);
  });

  it('should handle maxWords=1 by keeping only first word', () => {
    const text = 'Prima Seconda Terza';
    const result = cleanAndTruncate(text, 1);
    expect(result).toContain('Prima');
    expect(result.endsWith('…')).toBe(true);
  });
});
