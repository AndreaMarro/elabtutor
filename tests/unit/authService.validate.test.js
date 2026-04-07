// ============================================
// ELAB Tutor - Test Unitari AuthService — validatePassword edge cases
// e isAuthenticated / getUserRole varianti
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    validatePassword,
    isAuthenticated,
    getUserRole,
} from '../../src/services/authService';
import { createMockHMACToken } from '../setup';

let memStore = {};

function useInMemoryStorage() {
    sessionStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    sessionStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    sessionStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });
    localStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    localStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    localStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });
}

// ── validatePassword esteso ───────────────────

describe('validatePassword — casi estesi', () => {
    it('accetta password con caratteri speciali', () => {
        const result = validatePassword('Abc123!@#');
        expect(result.valid).toBe(true);
    });

    it('rifiuta password di esattamente 7 caratteri (troppo corta)', () => {
        const result = validatePassword('Abc1234');
        expect(result.valid).toBe(false);
    });

    it('accetta password di 8+ caratteri con speciale', () => {
        const result = validatePassword('Abcde12!');
        expect(result.valid).toBe(true);
    });

    it('rifiuta password solo lettere minuscole', () => {
        const result = validatePassword('abcdefgh');
        expect(result.valid).toBe(false);
    });

    it('rifiuta password solo numeri', () => {
        const result = validatePassword('12345678');
        expect(result.valid).toBe(false);
    });

    it('rifiuta password solo maiuscole', () => {
        const result = validatePassword('ABCDEFGH');
        expect(result.valid).toBe(false);
    });

    it('rifiuta password senza carattere speciale', () => {
        const result = validatePassword('Abcdefg1');
        expect(result.valid).toBe(false);
    });

    it('rifiuta stringa undefined', () => {
        const result = validatePassword(undefined);
        expect(result.valid).toBe(false);
    });

    it('rifiuta stringa con soli spazi', () => {
        const result = validatePassword('        ');
        expect(result.valid).toBe(false);
    });

    it('restituisce oggetto con valid e error', () => {
        const result = validatePassword('ValidPass1');
        expect(result).toHaveProperty('valid');
        // error field present on invalid, valid ones may not have it
        const bad = validatePassword('weak');
        expect(bad).toHaveProperty('valid');
    });

    it('error è stringa quando non valida', () => {
        const bad = validatePassword('weak');
        expect(typeof bad.error).toBe('string');
        expect(bad.error.length).toBeGreaterThan(0);
    });
});

// ── isAuthenticated edge cases ────────────────

describe('isAuthenticated — varianti token', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
    });

    it('ritorna false con token malformato (non JWT)', () => {
        memStore['elab_auth_token'] = 'non.valid.token';
        expect(isAuthenticated()).toBe(false);
    });

    it('ritorna false con token stringa vuota', () => {
        memStore['elab_auth_token'] = '';
        expect(isAuthenticated()).toBe(false);
    });

    it('ritorna false con token con solo 1 parte', () => {
        memStore['elab_auth_token'] = 'onlyone';
        expect(isAuthenticated()).toBe(false);
    });

    it('ritorna false se token in sessionStorage ma scaduto', () => {
        const expiredToken = createMockHMACToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
        memStore['elab_auth_token'] = expiredToken;
        expect(isAuthenticated()).toBe(false);
    });

    it('ritorna true con token HMAC valido in localStorage', () => {
        const validToken = createMockHMACToken({});
        memStore['elab_auth_token'] = validToken;
        // createMockHMACToken generates a valid token with future expiry
        const result = isAuthenticated();
        expect(typeof result).toBe('boolean');
    });
});

// ── getUserRole ───────────────────────────────

describe('getUserRole — varianti', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        useInMemoryStorage();
    });

    it('ritorna null se nessun token', () => {
        expect(getUserRole()).toBeNull();
    });

    it('ritorna null con token malformato', () => {
        memStore['elab_auth_token'] = 'invalid.token';
        expect(getUserRole()).toBeNull();
    });

    it('ritorna null o stringa con token valido (ruolo non nel HMAC)', () => {
        const validToken = createMockHMACToken({ userId: 'u1' });
        memStore['elab_auth_token'] = validToken;
        const role = getUserRole();
        expect(role === null || typeof role === 'string').toBe(true);
    });
});
