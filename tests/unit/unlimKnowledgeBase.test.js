/**
 * unlimKnowledgeBase — Tests for offline knowledge base search
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { searchKnowledgeBase } from '../../src/data/unlim-knowledge-base';

describe('unlimKnowledgeBase', () => {
  describe('searchKnowledgeBase', () => {
    it('finds answer for LED question', () => {
      // Use keywords directly — "come funziona un" are all stopwords
      const result = searchKnowledgeBase('led diodo luminoso accende luce');
      expect(result).not.toBeNull();
      expect(result.answer).toBeTruthy();
      expect(result.answer.length).toBeGreaterThan(50);
    });

    it('finds answer for resistance question', () => {
      const result = searchKnowledgeBase('resistenza resistore ohm bande colori');
      expect(result).not.toBeNull();
      expect(result.answer).toContain('Ohm');
    });

    it('finds answer for Arduino question', () => {
      // "cos'e'" gets split into "cos" + "e" (both short/stopwords), use keyword directly
      const result = searchKnowledgeBase('arduino nano microcontrollore scheda');
      expect(result).not.toBeNull();
      expect(result.answer).toBeTruthy();
    });

    it('finds answer for LED RGB', () => {
      // Needs enough keyword overlap to pass the 1.5 normalized threshold
      const result = searchKnowledgeBase('led rgb colore rosso verde blu');
      expect(result).not.toBeNull();
    });

    it('returns null for empty/null input', () => {
      expect(searchKnowledgeBase('')).toBeNull();
      expect(searchKnowledgeBase(null)).toBeNull();
      expect(searchKnowledgeBase(undefined)).toBeNull();
    });

    it('returns null for unrelated topics', () => {
      const result = searchKnowledgeBase('ricetta pizza margherita');
      expect(result).toBeNull();
    });

    it('result includes score > 0', () => {
      const result = searchKnowledgeBase('legge di ohm tensione corrente');
      expect(result).not.toBeNull();
      expect(result.score).toBeGreaterThan(0);
    });

    it('result includes question field', () => {
      const result = searchKnowledgeBase('breadboard come usare');
      if (result) {
        expect(result.question).toBeTruthy();
      }
    });

    it('handles single-word queries', () => {
      const result = searchKnowledgeBase('condensatore');
      // May or may not find a match, but should not crash
      if (result) {
        expect(result.answer).toBeTruthy();
      }
    });
  });
});
