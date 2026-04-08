/**
 * Tests for contentFilter.js
 * Content filter for children's educational platform.
 */
import { describe, it, expect } from 'vitest';
import {
  checkContent,
  checkPII,
  sanitizeOutput,
  getBlockMessage,
  validateMessage,
} from '../../src/utils/contentFilter.js';

describe('contentFilter', () => {
  describe('checkContent', () => {
    it('allows clean educational text', () => {
      const result = checkContent('Come si collega un LED ad Arduino?');
      expect(result.safe).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns safe for empty string', () => {
      expect(checkContent('').safe).toBe(true);
    });

    it('returns safe for null', () => {
      expect(checkContent(null).safe).toBe(true);
    });

    it('returns safe for non-string input', () => {
      expect(checkContent(42).safe).toBe(true);
    });

    it('returns safe for very short text (< 3 chars)', () => {
      expect(checkContent('ok').safe).toBe(true);
      expect(checkContent('a').safe).toBe(true);
    });

    it('blocks Italian profanity', () => {
      const result = checkContent('sei un cretino!');
      expect(result.safe).toBe(false);
      expect(result.reason).toBe('inappropriate');
    });

    it('blocks violent content', () => {
      const result = checkContent('voglio sparare');
      expect(result.safe).toBe(false);
      expect(result.reason).toBe('inappropriate');
    });

    it('blocks adult content keywords', () => {
      const result = checkContent('cercavo porno online');
      expect(result.safe).toBe(false);
      expect(result.reason).toBe('inappropriate');
    });

    it('is case-insensitive', () => {
      expect(checkContent('STUPIDO').safe).toBe(false);
      expect(checkContent('Idiota').safe).toBe(false);
    });

    it('handles text with mixed case', () => {
      expect(checkContent('Sei un Cretino').safe).toBe(false);
    });
  });

  describe('checkPII', () => {
    it('returns no PII for clean text', () => {
      const result = checkPII('Ciao, mi chiamo Mario e amo Arduino!');
      expect(result.hasPII).toBe(false);
      expect(result.type).toBeNull();
    });

    it('returns no PII for null', () => {
      expect(checkPII(null).hasPII).toBe(false);
    });

    it('returns no PII for empty string', () => {
      expect(checkPII('').hasPII).toBe(false);
    });

    it('detects email address', () => {
      const result = checkPII('Contattami a mario@esempio.it per info');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('email');
    });

    it('detects italian phone number', () => {
      const result = checkPII('Chiama il 3456789012 per informazioni');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('telefono');
    });

    it('detects codice fiscale', () => {
      const result = checkPII('Il mio CF è RSSMRA80A01H501Z');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('codice_fiscale');
    });

    it('detects Italian address with via', () => {
      const result = checkPII('Abito in via Roma 12');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('indirizzo');
    });

    it('detects piazza address', () => {
      const result = checkPII('Siamo in piazza Garibaldi 5');
      expect(result.hasPII).toBe(true);
      expect(result.type).toBe('indirizzo');
    });
  });

  describe('sanitizeOutput', () => {
    it('returns clean text unchanged', () => {
      const text = 'Collega il LED al pin 13';
      expect(sanitizeOutput(text)).toBe(text);
    });

    it('returns null/undefined as-is', () => {
      expect(sanitizeOutput(null)).toBeNull();
      expect(sanitizeOutput(undefined)).toBeUndefined();
    });

    it('replaces inappropriate words with ***', () => {
      const result = sanitizeOutput('Sei un cretino stupido');
      expect(result).toContain('***');
      expect(result).not.toMatch(/cretino/i);
    });

    it('preserves surrounding text', () => {
      const result = sanitizeOutput('Prima cretino dopo');
      expect(result).toContain('Prima');
      expect(result).toContain('dopo');
    });
  });

  describe('getBlockMessage', () => {
    it('returns inappropriate message for "inappropriate" reason', () => {
      const msg = getBlockMessage('inappropriate');
      expect(msg).toContain('gentili');
    });

    it('returns PII message for "pii" reason', () => {
      const msg = getBlockMessage('pii');
      expect(msg).toContain('sicurezza');
    });

    it('returns default message for unknown reason', () => {
      const msg = getBlockMessage('unknown');
      expect(msg).toBeTruthy();
      expect(typeof msg).toBe('string');
    });

    it('returns default message for null reason', () => {
      const msg = getBlockMessage(null);
      expect(typeof msg).toBe('string');
    });
  });

  describe('validateMessage', () => {
    it('allows clean message', () => {
      const result = validateMessage('Come connetto un LED ad Arduino?');
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });

    it('blocks inappropriate content', () => {
      const result = validateMessage('sei un idiota!');
      expect(result.allowed).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('blocks PII in message', () => {
      const result = validateMessage('Mandami email a test@test.it');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('sicurezza');
    });

    it('checks content before PII', () => {
      // Inappropriate content takes priority
      const result = validateMessage('stupido test@test.it');
      expect(result.allowed).toBe(false);
      // Should be blocked by content, not PII first
      expect(result.message).toBeTruthy();
    });

    it('returns allowed:true and null message for safe content', () => {
      const result = validateMessage('Resistenza e condensatore');
      expect(result.allowed).toBe(true);
      expect(result.message).toBeNull();
    });
  });
});
