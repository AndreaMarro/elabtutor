// ============================================
// ELAB Tutor - Test Extra Utilities
// cleanAndTruncate varianti + classProfile edge cases + gdprService aggiunte
// ============================================

import { describe, it, expect } from 'vitest';
import { cleanAndTruncate } from '../../src/utils/truncateResponse';

// ── cleanAndTruncate ──────────────────────────

describe('cleanAndTruncate — casi estesi', () => {
    it('ritorna stringa vuota per input null', () => {
        expect(cleanAndTruncate(null)).toBe('');
    });

    it('ritorna stringa vuota per input undefined', () => {
        expect(cleanAndTruncate(undefined)).toBe('');
    });

    it('ritorna stringa vuota per stringa vuota', () => {
        expect(cleanAndTruncate('')).toBe('');
    });

    it('non tronca testo sotto il limite', () => {
        const text = 'Ciao bambini! Il LED è acceso.';
        const result = cleanAndTruncate(text, 80);
        expect(result).toBe(text.trim());
        expect(result.includes('…')).toBe(false);
    });

    it('tronca esattamente a maxWords specifico', () => {
        const words = Array(20).fill('parola');
        const text = words.join(' ');
        const result = cleanAndTruncate(text, 10);
        const wordCount = result.replace('…', '').trim().split(/\s+/).length;
        expect(wordCount).toBe(10);
        expect(result.endsWith('…')).toBe(true);
    });

    it('rimuove hallucination "Ho analizzato l\'immagine"', () => {
        const text = 'Ho analizzato l\'immagine che hai inviato. Il LED è rosso.';
        const result = cleanAndTruncate(text, 80);
        expect(result).not.toContain('Ho analizzato');
        expect(result).toContain('LED è rosso');
    });

    it('gestisce testo con apostrofo curvo senza crash', () => {
        const text = 'Ho analizzato l\u2019immagine che hai inviato. Bene!';
        const result = cleanAndTruncate(text, 80);
        expect(typeof result).toBe('string');
    });

    it('usa 80 parole come default', () => {
        const longText = Array(100).fill('word').join(' ');
        const result = cleanAndTruncate(longText);
        const wordCount = result.replace('…', '').trim().split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(80);
    });

    it('gestisce testo con solo spazi', () => {
        const result = cleanAndTruncate('   ', 80);
        expect(typeof result).toBe('string');
    });

    it('mantiene testo esattamente uguale a maxWords', () => {
        const words = Array(5).fill('test');
        const text = words.join(' ');
        const result = cleanAndTruncate(text, 5);
        expect(result).toBe(text);
        expect(result.endsWith('…')).toBe(false);
    });

    it('tronca con maxWords=1', () => {
        const result = cleanAndTruncate('uno due tre quattro', 1);
        expect(result).toBe('uno…');
    });

    it('case insensitive per hallucination removal', () => {
        const text = 'HO ANALIZZATO L\'IMMAGINE CHE HAI INVIATO. Fine.';
        const result = cleanAndTruncate(text, 80);
        expect(result).not.toContain('HO ANALIZZATO');
    });

    it('gestisce testo con a capo', () => {
        const text = 'Ciao\ncome\nstai';
        const result = cleanAndTruncate(text, 80);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});
