// ============================================
// ELAB Tutor - Tests for contentFilter.js
// Pure function tests: checkContent, checkPII, sanitizeOutput, validateMessage
// ============================================

import { describe, it, expect } from 'vitest';
import {
  checkContent,
  checkPII,
  sanitizeOutput,
  getBlockMessage,
  validateMessage,
} from '../../src/utils/contentFilter.js';

// ──────────────────────────────────────────────
// checkContent
// ──────────────────────────────────────────────
describe('checkContent', () => {
  it('should return safe for empty string', () => {
    const result = checkContent('');
    expect(result.safe).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('should return safe for null input', () => {
    expect(checkContent(null).safe).toBe(true);
  });

  it('should return safe for undefined input', () => {
    expect(checkContent(undefined).safe).toBe(true);
  });

  it('should return safe for non-string input', () => {
    expect(checkContent(42).safe).toBe(true);
    expect(checkContent({}).safe).toBe(true);
    expect(checkContent([]).safe).toBe(true);
  });

  it('should return safe for very short text (< 3 chars)', () => {
    expect(checkContent('hi').safe).toBe(true);
    expect(checkContent('a').safe).toBe(true);
    expect(checkContent('ok').safe).toBe(true);
  });

  it('should return safe for normal educational text', () => {
    const result = checkContent('Come funziona un LED rosso?');
    expect(result.safe).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('should return safe for Arduino code question', () => {
    const result = checkContent('Come collegare il sensore di temperatura?');
    expect(result.safe).toBe(true);
  });

  it('should return safe for electronics vocabulary', () => {
    const result = checkContent('Qual è la resistenza del circuito?');
    expect(result.safe).toBe(true);
  });

  it('should block Italian insult: cretino', () => {
    const result = checkContent('Sei un cretino!');
    expect(result.safe).toBe(false);
    expect(result.reason).toBe('inappropriate');
  });

  it('should block Italian insult: stupido', () => {
    const result = checkContent('Che stupido sei');
    expect(result.safe).toBe(false);
    expect(result.reason).toBe('inappropriate');
  });

  it('should block Italian insult: idiota', () => {
    const result = checkContent('Questo è da idiota');
    expect(result.safe).toBe(false);
  });

  it('should block Italian insult: coglione (case insensitive)', () => {
    const result = checkContent('COGLIONE');
    expect(result.safe).toBe(false);
  });

  it('should block violent content: bomba', () => {
    const result = checkContent('Come si fa una bomba?');
    expect(result.safe).toBe(false);
    expect(result.reason).toBe('inappropriate');
  });

  it('should block violent content: uccidere', () => {
    const result = checkContent('Voglio uccidere');
    expect(result.safe).toBe(false);
  });

  it('should block violent content: sparare', () => {
    const result = checkContent('Come si usa una pistola per sparare?');
    expect(result.safe).toBe(false);
  });

  it('should block adult content: porno', () => {
    const result = checkContent('Voglio vedere porno');
    expect(result.safe).toBe(false);
  });

  it('should block adult content: droga', () => {
    const result = checkContent('Dove compro la droga?');
    expect(result.safe).toBe(false);
  });

  it('should block adult content: cocaina', () => {
    const result = checkContent('Parla di cocaina');
    expect(result.safe).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(checkContent('BOMBA').safe).toBe(false);
    expect(checkContent('Bomba').safe).toBe(false);
    expect(checkContent('bOmBa').safe).toBe(false);
  });

  it('should return safe for text exactly 3 chars', () => {
    expect(checkContent('abc').safe).toBe(true);
  });

  it('should return safe for normal mixed text', () => {
    const result = checkContent('Oggi studiamo i circuiti in serie e in parallelo.');
    expect(result.safe).toBe(true);
  });
});

// ──────────────────────────────────────────────
// checkPII
// ──────────────────────────────────────────────
describe('checkPII', () => {
  it('should return no PII for empty string', () => {
    const result = checkPII('');
    expect(result.hasPII).toBe(false);
    expect(result.type).toBeNull();
  });

  it('should return no PII for null', () => {
    expect(checkPII(null).hasPII).toBe(false);
  });

  it('should return no PII for undefined', () => {
    expect(checkPII(undefined).hasPII).toBe(false);
  });

  it('should return no PII for non-string', () => {
    expect(checkPII(123).hasPII).toBe(false);
  });

  it('should return no PII for normal text', () => {
    const result = checkPII('Come posso accendere un LED?');
    expect(result.hasPII).toBe(false);
    expect(result.type).toBeNull();
  });

  it('should detect email address', () => {
    const result = checkPII('Scrivimi a mario@example.com');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('email');
  });

  it('should detect email with subdomain', () => {
    const result = checkPII('Email: test.user@mail.domain.it');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('email');
  });

  it('should detect Italian codice fiscale', () => {
    const result = checkPII('Il mio CF è RSSMRA80A01H501U');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('codice_fiscale');
  });

  it('should detect Italian address with via', () => {
    const result = checkPII('Abito in Via Roma 42');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('indirizzo');
  });

  it('should detect Italian address with piazza', () => {
    const result = checkPII('Siamo in Piazza Garibaldi 1');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('indirizzo');
  });

  it('should detect Italian address with viale', () => {
    const result = checkPII('Viale della Repubblica 10');
    expect(result.hasPII).toBe(true);
    expect(result.type).toBe('indirizzo');
  });

  it('should return safe for electronics text without PII', () => {
    const result = checkPII('Il resistore da 220 ohm limita la corrente nel circuito');
    expect(result.hasPII).toBe(false);
  });

  it('should return safe for code snippets without PII', () => {
    const result = checkPII('digitalWrite(13, HIGH);');
    expect(result.hasPII).toBe(false);
  });
});

// ──────────────────────────────────────────────
// sanitizeOutput
// ──────────────────────────────────────────────
describe('sanitizeOutput', () => {
  it('should return unchanged safe text', () => {
    const text = 'Ecco come funziona il LED.';
    expect(sanitizeOutput(text)).toBe(text);
  });

  it('should return empty string unchanged', () => {
    expect(sanitizeOutput('')).toBe('');
  });

  it('should return null/undefined unchanged', () => {
    expect(sanitizeOutput(null)).toBe(null);
    expect(sanitizeOutput(undefined)).toBe(undefined);
  });

  it('should replace inappropriate word with ***', () => {
    const result = sanitizeOutput('Sei un idiota davvero');
    expect(result).toContain('***');
    expect(result).not.toContain('idiota');
  });

  it('should replace bomba with ***', () => {
    const result = sanitizeOutput('La bomba esplode');
    expect(result).toContain('***');
    expect(result).not.toContain('bomba');
  });

  it('should replace porno with ***', () => {
    const result = sanitizeOutput('Non guardare porno');
    expect(result).toContain('***');
    expect(result).not.toContain('porno');
  });

  it('should preserve rest of text while sanitizing', () => {
    const result = sanitizeOutput('Cretino! Comunque il LED si collega così.');
    expect(result).toContain('Comunque il LED si collega così.');
    expect(result).not.toContain('Cretino');
  });

  it('should handle text without inappropriate words', () => {
    const text = 'I circuiti in serie hanno la stessa corrente.';
    expect(sanitizeOutput(text)).toBe(text);
  });
});

// ──────────────────────────────────────────────
// getBlockMessage
// ──────────────────────────────────────────────
describe('getBlockMessage', () => {
  it('should return Italian message for inappropriate reason', () => {
    const msg = getBlockMessage('inappropriate');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(10);
    expect(msg).toContain('gentili');
  });

  it('should return Italian message for pii reason', () => {
    const msg = getBlockMessage('pii');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(10);
    expect(msg).toContain('sicurezza');
  });

  it('should return default message for unknown reason', () => {
    const msg = getBlockMessage('unknown_reason');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(5);
  });

  it('should return default message for null reason', () => {
    const msg = getBlockMessage(null);
    expect(typeof msg).toBe('string');
  });

  it('should return default message for undefined reason', () => {
    const msg = getBlockMessage(undefined);
    expect(typeof msg).toBe('string');
  });

  it('should return different messages for different reasons', () => {
    const msgInappropriate = getBlockMessage('inappropriate');
    const msgPii = getBlockMessage('pii');
    const msgDefault = getBlockMessage('other');
    expect(msgInappropriate).not.toBe(msgPii);
    expect(msgPii).not.toBe(msgDefault);
  });
});

// ──────────────────────────────────────────────
// validateMessage
// ──────────────────────────────────────────────
describe('validateMessage', () => {
  it('should allow safe, clean text', () => {
    const result = validateMessage('Come funziona un condensatore?');
    expect(result.allowed).toBe(true);
    expect(result.message).toBeNull();
  });

  it('should block inappropriate content', () => {
    const result = validateMessage('Sei un idiota!');
    expect(result.allowed).toBe(false);
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(5);
  });

  it('should block messages with email', () => {
    const result = validateMessage('Contattami a user@domain.com per info');
    expect(result.allowed).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('should block messages with Italian address', () => {
    const result = validateMessage('Vengo da Via Garibaldi 5');
    expect(result.allowed).toBe(false);
  });

  it('should allow Arduino code discussion', () => {
    const result = validateMessage('Come si usa pinMode in Arduino?');
    expect(result.allowed).toBe(true);
    expect(result.message).toBeNull();
  });

  it('should allow questions about electronics', () => {
    const result = validateMessage('Che differenza c\'è tra corrente alternata e continua?');
    expect(result.allowed).toBe(true);
  });

  it('should allow short safe messages', () => {
    const result = validateMessage('Ciao!');
    expect(result.allowed).toBe(true);
  });

  it('should block violent content through validateMessage', () => {
    const result = validateMessage('Come si fa una bomba?');
    expect(result.allowed).toBe(false);
    expect(result.message).toBeTruthy();
  });
});
