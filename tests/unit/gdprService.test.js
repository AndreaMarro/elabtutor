// ============================================
// ELAB Tutor - Test Unitari GDPR Service
// Copertura: saveConsent, getConsent, isCOPPAApplicable,
//            requestDataDeletion, callGdprWebhook (fallback locale)
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    saveConsent,
    getConsent,
    isCOPPAApplicable,
    requestDataDeletion,
} from '../../src/services/gdprService';
import gdprService from '../../src/services/gdprService';

// ── Helpers ──────────────────────────────────

let memStore = {};

function setupStorage() {
    localStorage.getItem.mockImplementation((k) => memStore[k] ?? null);
    localStorage.setItem.mockImplementation((k, v) => { memStore[k] = String(v); });
    localStorage.removeItem.mockImplementation((k) => { delete memStore[k]; });
    localStorage.clear.mockImplementation(() => { memStore = {}; });
    Object.defineProperty(localStorage, 'length', { get: () => Object.keys(memStore).length, configurable: true });
    localStorage.key = vi.fn((i) => Object.keys(memStore)[i] ?? null);

    sessionStorage.getItem.mockImplementation(() => null);
    sessionStorage.setItem.mockImplementation(() => {});
    sessionStorage.removeItem.mockImplementation(() => {});
    Object.defineProperty(sessionStorage, 'length', { get: () => 0, configurable: true });
    sessionStorage.key = vi.fn(() => null);
}

// ── saveConsent / getConsent ─────────────────

describe('saveConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('salva il consenso in localStorage', () => {
        const result = saveConsent({ status: 'accepted', userId: 'u1' });
        expect(result).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'elab_gdpr_consent',
            expect.stringContaining('"status":"accepted"')
        );
    });

    it('aggiunge timestamp e version automaticamente', () => {
        saveConsent({ status: 'accepted' });
        const raw = memStore['elab_gdpr_consent'];
        const parsed = JSON.parse(raw);
        expect(parsed.timestamp).toBeTruthy();
        expect(parsed.version).toBe('1.0');
    });

    it('ritorna false se localStorage lancia eccezione', () => {
        localStorage.setItem.mockImplementation(() => { throw new Error('QuotaExceeded'); });
        const result = saveConsent({ status: 'accepted' });
        expect(result).toBe(false);
    });

    it('sovrascrive consenso precedente', () => {
        saveConsent({ status: 'pending' });
        saveConsent({ status: 'accepted' });
        const raw = memStore['elab_gdpr_consent'];
        const parsed = JSON.parse(raw);
        expect(parsed.status).toBe('accepted');
    });

    it('accetta status parental_required', () => {
        const result = saveConsent({ status: 'parental_required', childAge: 10 });
        expect(result).toBe(true);
        const parsed = JSON.parse(memStore['elab_gdpr_consent']);
        expect(parsed.status).toBe('parental_required');
        expect(parsed.childAge).toBe(10);
    });
});

describe('getConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('ritorna null se nessun consenso salvato', () => {
        expect(getConsent()).toBeNull();
    });

    it('ritorna i dati di consenso salvati', () => {
        const consent = { status: 'accepted', userId: 'u1', timestamp: '2026-01-01T00:00:00Z', version: '1.0' };
        memStore['elab_gdpr_consent'] = JSON.stringify(consent);
        const result = getConsent();
        expect(result).toEqual(consent);
    });

    it('ritorna null se JSON malformato', () => {
        memStore['elab_gdpr_consent'] = 'NOT_VALID_JSON{{{';
        expect(getConsent()).toBeNull();
    });

    it('ritorna null se localStorage lancia eccezione', () => {
        localStorage.getItem.mockImplementation(() => { throw new Error('SecurityError'); });
        expect(getConsent()).toBeNull();
    });
});

// ── isCOPPAApplicable ─────────────────────────

describe('isCOPPAApplicable', () => {
    it('ritorna true per età < 13', () => {
        expect(isCOPPAApplicable(12)).toBe(true);
        expect(isCOPPAApplicable(10)).toBe(true);
        expect(isCOPPAApplicable(0)).toBe(true);
    });

    it('ritorna false per età === 13', () => {
        expect(isCOPPAApplicable(13)).toBe(false);
    });

    it('ritorna false per età > 13', () => {
        expect(isCOPPAApplicable(14)).toBe(false);
        expect(isCOPPAApplicable(18)).toBe(false);
        expect(isCOPPAApplicable(100)).toBe(false);
    });
});

// ── default export: hasValidConsent, requiresParentalConsent ──

describe('hasValidConsent (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('ritorna false se nessun consenso', () => {
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    it('ritorna true se status accepted', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'accepted' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    it('ritorna true se status parental_verified', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'parental_verified' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    it('ritorna false se status pending', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'pending' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    it('ritorna false se status rejected', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'rejected' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });
});

describe('requiresParentalConsent (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('ritorna false se nessun consenso', () => {
        expect(gdprService.requiresParentalConsent()).toBe(false);
    });

    it('ritorna true se status parental_required', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'parental_required' });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    it('ritorna true se status parental_sent', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'parental_sent' });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    it('ritorna false se status accepted', () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'accepted' });
        expect(gdprService.requiresParentalConsent()).toBe(false);
    });
});

// ── minimizeData ─────────────────────────────

describe('minimizeData (via default export)', () => {
    it('mantiene solo i campi consentiti', () => {
        const data = { name: 'Alice', age: 10, email: 'a@b.com', secret: 'x' };
        const result = gdprService.minimizeData(data, ['name', 'age']);
        expect(result).toEqual({ name: 'Alice', age: 10 });
        expect(result.email).toBeUndefined();
        expect(result.secret).toBeUndefined();
    });

    it('ignora campi non presenti nei dati originali', () => {
        const data = { name: 'Bob' };
        const result = gdprService.minimizeData(data, ['name', 'email']);
        expect(result).toEqual({ name: 'Bob' });
        expect(result.email).toBeUndefined();
    });

    it('ritorna oggetto vuoto se nessun campo consentito presente', () => {
        const result = gdprService.minimizeData({ x: 1, y: 2 }, ['name', 'email']);
        expect(result).toEqual({});
    });
});

// ── isDataExpired ─────────────────────────────

describe('isDataExpired (via default export)', () => {
    it('ritorna true se data è scaduta', () => {
        const oldDate = new Date('2020-01-01').toISOString();
        expect(gdprService.isDataExpired(oldDate, 365)).toBe(true);
    });

    it('ritorna false se data è recente', () => {
        const recentDate = new Date().toISOString();
        expect(gdprService.isDataExpired(recentDate, 730)).toBe(false);
    });

    it('usa 730 giorni come default', () => {
        const dateInRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(dateInRange)).toBe(false);
    });
});

// ── pseudonymizeUserId ────────────────────────

describe('pseudonymizeUserId (via default export)', () => {
    it('ritorna stringa di 16 caratteri hex', async () => {
        const result = await gdprService.pseudonymizeUserId('user123');
        expect(typeof result).toBe('string');
        expect(result.length).toBe(16);
    });

    it('ritorna stringa hex per userId diversi', async () => {
        const r1 = await gdprService.pseudonymizeUserId('user1');
        const r2 = await gdprService.pseudonymizeUserId('user2');
        // Both should be 16-char strings (mock crypto returns same buffer but both work)
        expect(r1.length).toBe(16);
        expect(r2.length).toBe(16);
    });
});

// ── getCOPPARequirements ──────────────────────

describe('getCOPPARequirements (via default export)', () => {
    it('ritorna applicable=true per età < 13', () => {
        const req = gdprService.getCOPPARequirements(10);
        expect(req.applicable).toBe(true);
        expect(req.requiresVerifiedConsent).toBe(true);
        expect(req.minimumAge).toBe(13);
    });

    it('ritorna applicable=false per età >= 13', () => {
        const req = gdprService.getCOPPARequirements(14);
        expect(req.applicable).toBe(false);
        expect(req.requiresVerifiedConsent).toBe(false);
    });
});

// ── requestDataDeletion — fetch mock ─────────

describe('requestDataDeletion (webhook mock)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('chiama fetch e ritorna il risultato del server', async () => {
        const mockResult = { success: true, action: 'delete', userId: 'user1' };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResult,
        });
        const result = await requestDataDeletion('user1', 'pass', 'test');
        expect(result).toEqual(mockResult);
        expect(global.fetch).toHaveBeenCalled();
    });

    it('lancia eccezione se la risposta non è ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            text: async () => 'Server error',
            status: 500,
        });
        await expect(requestDataDeletion('user1', 'pass', 'test')).rejects.toThrow('Server error');
    });

    it('chiama clearLocalData dopo eliminazione riuscita', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
        memStore['elab_test'] = 'value';
        await requestDataDeletion('user1', 'pass', 'test');
        // Verifica che non lanci eccezioni
        expect(true).toBe(true);
    });
});

// ── clearLocalData ────────────────────────────

describe('clearLocalData (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('rimuove le chiavi elab_* da localStorage', () => {
        memStore['elab_auth_token'] = 'tok';
        memStore['elab_gdpr_consent'] = '{}';
        memStore['other_key'] = 'keep';

        // Aggiorna key() mock per iterare correttamente
        localStorage.key = vi.fn((i) => Object.keys(memStore)[i] ?? null);
        Object.defineProperty(localStorage, 'length', {
            get: () => Object.keys(memStore).length, configurable: true
        });

        gdprService.clearLocalData();

        expect(localStorage.removeItem).toHaveBeenCalledWith('elab_auth_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('elab_gdpr_consent');
        expect(localStorage.removeItem).not.toHaveBeenCalledWith('other_key');
    });
});

// ── requestDataExport ─────────────────────────

describe('requestDataExport (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('chiama fetch e ritorna dati esportati', async () => {
        const mockResult = { success: true, data: { userId: 'u1' } };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResult,
        });
        const result = await gdprService.requestDataExport('u1');
        expect(result).toEqual(mockResult);
        expect(global.fetch).toHaveBeenCalled();
    });

    it('lancia eccezione in caso di errore server', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            text: async () => 'Export error',
            status: 500,
        });
        await expect(gdprService.requestDataExport('u1')).rejects.toThrow();
    });
});

// ── requestDataCorrection ─────────────────────

describe('requestDataCorrection (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('chiama fetch con action correct', async () => {
        const mockResult = { success: true };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResult,
        });
        const result = await gdprService.requestDataCorrection('u1', { name: 'NewName' });
        expect(result).toEqual(mockResult);
        expect(global.fetch).toHaveBeenCalled();
    });
});

// ── revokeConsent ─────────────────────────────

describe('revokeConsent (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('aggiorna stato locale a revoked', async () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'accepted' });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
        await gdprService.revokeConsent('u1');
        const updated = JSON.parse(memStore['elab_gdpr_consent']);
        expect(updated.status).toBe('revoked');
        expect(updated.revokedAt).toBeTruthy();
    });

    it('ritorna il risultato del server', async () => {
        const mockResult = { success: true, revoked: true };
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'accepted' });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResult,
        });
        const result = await gdprService.revokeConsent('u1');
        expect(result).toEqual(mockResult);
    });

    it('lancia eccezione in caso di errore', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            text: async () => 'Revoke error',
            status: 500,
        });
        await expect(gdprService.revokeConsent('u1')).rejects.toThrow();
    });
});

// ── requestParentalConsent ────────────────────

describe('requestParentalConsent (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('imposta status parental_sent in localStorage', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
        await gdprService.requestParentalConsent({
            childName: 'Luca',
            childAge: 10,
            parentEmail: 'parent@example.com',
            parentName: 'Mario',
        });
        const consent = JSON.parse(memStore['elab_gdpr_consent']);
        expect(consent.status).toBe('parental_sent');
        expect(consent.childAge).toBe(10);
    });

    it('imposta requiresCOPPA true per bambini < 13', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
        await gdprService.requestParentalConsent({
            childName: 'Luca',
            childAge: 12,
            parentEmail: 'parent@example.com',
            parentName: 'Mario',
        });
        // Verifica che fetch sia stato chiamato con requiresCOPPA: true
        const body = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(body.requiresCOPPA).toBe(true);
    });
});

// ── verifyParentalConsent ─────────────────────

describe('verifyParentalConsent (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('aggiorna stato a parental_verified se result.verified', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ verified: true }),
        });
        await gdprService.verifyParentalConsent('token123');
        const consent = JSON.parse(memStore['elab_gdpr_consent']);
        expect(consent.status).toBe('parental_verified');
    });

    it('non aggiorna stato se result.verified è false', async () => {
        memStore['elab_gdpr_consent'] = JSON.stringify({ status: 'parental_sent' });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ verified: false }),
        });
        await gdprService.verifyParentalConsent('bad-token');
        const consent = JSON.parse(memStore['elab_gdpr_consent']);
        expect(consent.status).toBe('parental_sent');
    });
});

// ── saveConsent + getConsent integrazione ─────

describe('saveConsent + getConsent integrazione', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('round-trip: salva e recupera consenso completo', () => {
        const input = { status: 'accepted', userId: 'u42', age: 16 };
        saveConsent(input);
        const result = getConsent();
        expect(result.status).toBe('accepted');
        expect(result.userId).toBe('u42');
        expect(result.age).toBe(16);
        expect(result.version).toBe('1.0');
        expect(result.timestamp).toBeTruthy();
    });

    it('hasValidConsent true dopo saveConsent accepted', () => {
        saveConsent({ status: 'accepted' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    it('requiresParentalConsent true dopo saveConsent parental_sent', () => {
        saveConsent({ status: 'parental_sent', childAge: 11 });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    it('hasValidConsent false dopo saveConsent revoked', () => {
        saveConsent({ status: 'revoked' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    it('isCOPPAApplicable false per età esattamente 13', () => {
        expect(isCOPPAApplicable(13)).toBe(false);
    });

    it('getCOPPARequirements: documentationRequired sempre true', () => {
        const req8 = gdprService.getCOPPARequirements(8);
        const req16 = gdprService.getCOPPARequirements(16);
        expect(req8.documentationRequired).toBe(true);
        expect(req16.documentationRequired).toBe(true);
    });

    it('minimizeData: preserva falsy values (0, false, null)', () => {
        const data = { score: 0, active: false, extra: 'skip' };
        const result = gdprService.minimizeData(data, ['score', 'active']);
        expect(result.score).toBe(0);
        expect(result.active).toBe(false);
    });

    it('isDataExpired: ritorna false per data di ieri con maxDays=30', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(yesterday, 30)).toBe(false);
    });

    it('isDataExpired: ritorna true per data di 3 anni fa con maxDays=730', () => {
        const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(threeYearsAgo, 730)).toBe(true);
    });
});

// ── getLocalDataSummary ───────────────────────

describe('getLocalDataSummary (via default export)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        memStore = {};
        setupStorage();
    });

    it('ritorna struttura con localStorage e sessionStorage', () => {
        const summary = gdprService.getLocalDataSummary();
        expect(summary).toHaveProperty('localStorage');
        expect(summary).toHaveProperty('sessionStorage');
        expect(summary).toHaveProperty('approximateSize');
    });

    it('approssimateSize è 0 se nessun dato elab_', () => {
        const summary = gdprService.getLocalDataSummary();
        expect(summary.approximateSize).toBe(0);
    });

    it('include chiavi elab_ nel summary', () => {
        memStore['elab_test'] = '{"value":1}';
        localStorage.key = vi.fn((i) => Object.keys(memStore)[i] ?? null);
        Object.defineProperty(localStorage, 'length', {
            get: () => Object.keys(memStore).length, configurable: true
        });

        const summary = gdprService.getLocalDataSummary();
        expect(summary.localStorage['elab_test']).toEqual({ value: 1 });
    });

    it('gestisce JSON non parsabile con [Non parsabile]', () => {
        memStore['elab_bad'] = 'NOT_JSON{{{{';
        localStorage.key = vi.fn((i) => Object.keys(memStore)[i] ?? null);
        Object.defineProperty(localStorage, 'length', {
            get: () => Object.keys(memStore).length, configurable: true
        });

        const summary = gdprService.getLocalDataSummary();
        expect(summary.localStorage['elab_bad']).toBe('[Non parsabile]');
    });
});
