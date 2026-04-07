// ============================================
// ELAB Tutor — Test: gdprService
// Copertura: saveConsent, getConsent, hasValidConsent,
//            requiresParentalConsent, requestDataDeletion,
//            clearLocalData, getLocalDataSummary,
//            isCOPPAApplicable, isDataExpired,
//            minimizeData, getCOPPARequirements,
//            pseudonymizeUserId, callGdprWebhook fallback
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import gdprService, {
    saveConsent,
    getConsent,
    requestDataDeletion,
    isCOPPAApplicable,
} from '../../src/services/gdprService';

// ── localStorage in-memory mock ───────────────
let _ls = {};
let _ss = {};

function setupStorageMocks() {
    _ls = {};
    _ss = {};
    localStorage.getItem.mockImplementation((k) => _ls[k] ?? null);
    localStorage.setItem.mockImplementation((k, v) => { _ls[k] = String(v); });
    localStorage.removeItem.mockImplementation((k) => { delete _ls[k]; });
    localStorage.clear.mockImplementation(() => { _ls = {}; });
    Object.defineProperty(localStorage, 'length', { get: () => Object.keys(_ls).length, configurable: true });
    localStorage.key = vi.fn((i) => Object.keys(_ls)[i] ?? null);

    sessionStorage.getItem.mockImplementation((k) => _ss[k] ?? null);
    sessionStorage.setItem.mockImplementation((k, v) => { _ss[k] = String(v); });
    sessionStorage.removeItem.mockImplementation((k) => { delete _ss[k]; });
    sessionStorage.clear.mockImplementation(() => { _ss = {}; });
    Object.defineProperty(sessionStorage, 'length', { get: () => Object.keys(_ss).length, configurable: true });
    sessionStorage.key = vi.fn((i) => Object.keys(_ss)[i] ?? null);
}

// ── fetch mock ────────────────────────────────
function mockFetchOk(body = { success: true }) {
    global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
    );
}

function mockFetchFail(status = 500, text = 'Server Error') {
    global.fetch = vi.fn(() =>
        Promise.resolve({ ok: false, status, text: () => Promise.resolve(text) })
    );
}

function mockFetchNetworkError() {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network Error')));
}

// ── saveConsent / getConsent ──────────────────

describe('saveConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('salva il consenso con timestamp e version', () => {
        const result = saveConsent({ status: 'accepted' });
        expect(result).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalled();
        const stored = JSON.parse(_ls['elab_gdpr_consent']);
        expect(stored.status).toBe('accepted');
        expect(stored.version).toBe('1.0');
        expect(stored.timestamp).toBeTruthy();
    });

    it('merge i dati extra nel consenso salvato', () => {
        saveConsent({ status: 'parental_required', childAge: 10 });
        const stored = JSON.parse(_ls['elab_gdpr_consent']);
        expect(stored.childAge).toBe(10);
    });

    it('restituisce false se localStorage lancia eccezione', () => {
        localStorage.setItem.mockImplementation(() => { throw new Error('QuotaExceeded'); });
        const result = saveConsent({ status: 'accepted' });
        expect(result).toBe(false);
    });

    it('sovrascrive un consenso precedente', () => {
        saveConsent({ status: 'pending' });
        saveConsent({ status: 'accepted' });
        const stored = JSON.parse(_ls['elab_gdpr_consent']);
        expect(stored.status).toBe('accepted');
    });
});

describe('getConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('restituisce null se non c\'è consenso salvato', () => {
        expect(getConsent()).toBeNull();
    });

    it('restituisce il consenso salvato', () => {
        saveConsent({ status: 'accepted' });
        const consent = getConsent();
        expect(consent).not.toBeNull();
        expect(consent.status).toBe('accepted');
    });

    it('restituisce null se il valore in storage non è JSON valido', () => {
        _ls['elab_gdpr_consent'] = 'not-json';
        expect(getConsent()).toBeNull();
    });

    it('restituisce null se localStorage.getItem lancia eccezione', () => {
        localStorage.getItem.mockImplementation(() => { throw new Error('SecurityError'); });
        expect(getConsent()).toBeNull();
    });
});

// ── hasValidConsent ───────────────────────────

describe('gdprService.hasValidConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('restituisce false se non c\'è consenso', () => {
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    it('restituisce true per status accepted', () => {
        saveConsent({ status: 'accepted' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    it('restituisce true per status parental_verified', () => {
        saveConsent({ status: 'parental_verified' });
        expect(gdprService.hasValidConsent()).toBe(true);
    });

    it('restituisce false per status pending', () => {
        saveConsent({ status: 'pending' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    it('restituisce false per status parental_required', () => {
        saveConsent({ status: 'parental_required' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });

    it('restituisce false per status revoked', () => {
        saveConsent({ status: 'revoked' });
        expect(gdprService.hasValidConsent()).toBe(false);
    });
});

// ── requiresParentalConsent ───────────────────

describe('gdprService.requiresParentalConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('restituisce false se non c\'è consenso', () => {
        expect(gdprService.requiresParentalConsent()).toBe(false);
    });

    it('restituisce true per status parental_required', () => {
        saveConsent({ status: 'parental_required' });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    it('restituisce true per status parental_sent', () => {
        saveConsent({ status: 'parental_sent' });
        expect(gdprService.requiresParentalConsent()).toBe(true);
    });

    it('restituisce false per status accepted', () => {
        saveConsent({ status: 'accepted' });
        expect(gdprService.requiresParentalConsent()).toBe(false);
    });
});

// ── isCOPPAApplicable (named export + default) ────

describe('isCOPPAApplicable', () => {
    it('restituisce true per età < 13', () => {
        expect(isCOPPAApplicable(12)).toBe(true);
        expect(isCOPPAApplicable(0)).toBe(true);
        expect(isCOPPAApplicable(1)).toBe(true);
    });

    it('restituisce false per età >= 13', () => {
        expect(isCOPPAApplicable(13)).toBe(false);
        expect(isCOPPAApplicable(18)).toBe(false);
    });

    it('via default export', () => {
        expect(gdprService.isCOPPAApplicable(10)).toBe(true);
        expect(gdprService.isCOPPAApplicable(16)).toBe(false);
    });
});

// ── getCOPPARequirements ──────────────────────

describe('gdprService.getCOPPARequirements', () => {
    it('applicabile per età < 13', () => {
        const req = gdprService.getCOPPARequirements(8);
        expect(req.applicable).toBe(true);
        expect(req.requiresVerifiedConsent).toBe(true);
        expect(req.requiresEmailVerification).toBe(true);
        expect(req.minimumAge).toBe(13);
        expect(req.documentationRequired).toBe(true);
    });

    it('non applicabile per età >= 13', () => {
        const req = gdprService.getCOPPARequirements(15);
        expect(req.applicable).toBe(false);
        expect(req.requiresVerifiedConsent).toBe(false);
        expect(req.requiresEmailVerification).toBe(false);
        expect(req.minimumAge).toBe(13);
    });

    it('esattamente 13 anni — non applicabile', () => {
        const req = gdprService.getCOPPARequirements(13);
        expect(req.applicable).toBe(false);
    });
});

// ── isDataExpired ─────────────────────────────

describe('gdprService.isDataExpired', () => {
    it('non scaduto per data recente', () => {
        const recent = new Date().toISOString();
        expect(gdprService.isDataExpired(recent, 730)).toBe(false);
    });

    it('scaduto per data vecchia di 3 anni', () => {
        const old = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(old, 730)).toBe(true);
    });

    it('usa 730 giorni come default', () => {
        const old = new Date(Date.now() - 731 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(old)).toBe(true);
    });

    it('non scaduto per data di ieri', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(yesterday, 730)).toBe(false);
    });

    it('scaduto esattamente alla scadenza (maxDays=1)', () => {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
        expect(gdprService.isDataExpired(twoDaysAgo, 1)).toBe(true);
    });
});

// ── minimizeData ──────────────────────────────

describe('gdprService.minimizeData', () => {
    it('mantiene solo i campi consentiti', () => {
        const data = { name: 'Mario', email: 'mario@test.it', age: 15, school: 'Liceo' };
        const result = gdprService.minimizeData(data, ['name', 'age']);
        expect(result).toEqual({ name: 'Mario', age: 15 });
        expect(result.email).toBeUndefined();
        expect(result.school).toBeUndefined();
    });

    it('restituisce oggetto vuoto se nessun campo consentito esiste', () => {
        const data = { name: 'Mario' };
        const result = gdprService.minimizeData(data, ['email', 'age']);
        expect(result).toEqual({});
    });

    it('include campo solo se presente nei dati originali', () => {
        const data = { name: 'Mario' };
        const result = gdprService.minimizeData(data, ['name', 'email']);
        expect(result).toEqual({ name: 'Mario' });
    });

    it('gestisce dati vuoti', () => {
        expect(gdprService.minimizeData({}, ['name'])).toEqual({});
    });

    it('gestisce allowedFields vuoto', () => {
        const data = { name: 'Mario', email: 'x@y.it' };
        expect(gdprService.minimizeData(data, [])).toEqual({});
    });
});

// ── clearLocalData ────────────────────────────

describe('gdprService.clearLocalData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('rimuove le chiavi elab_ da localStorage', () => {
        _ls['elab_user_prefs'] = 'value1';
        _ls['elab_gdpr_consent'] = '{}';
        _ls['other_key'] = 'should stay';
        gdprService.clearLocalData();
        expect(_ls['elab_user_prefs']).toBeUndefined();
        expect(_ls['elab_gdpr_consent']).toBeUndefined();
        expect(_ls['other_key']).toBe('should stay');
    });

    it('rimuove le chiavi elab_ da sessionStorage', () => {
        _ss['elab_session_data'] = 'data';
        _ss['non_elab_key'] = 'keep';
        gdprService.clearLocalData();
        expect(_ss['elab_session_data']).toBeUndefined();
        expect(_ss['non_elab_key']).toBe('keep');
    });

    it('funziona con storage vuoto', () => {
        expect(() => gdprService.clearLocalData()).not.toThrow();
    });
});

// ── getLocalDataSummary ───────────────────────

describe('gdprService.getLocalDataSummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('restituisce riepilogo con localStorage keys elab_', () => {
        _ls['elab_progress'] = JSON.stringify({ completed: 3 });
        _ls['unrelated_key'] = 'ignore';
        const summary = gdprService.getLocalDataSummary();
        expect(summary.localStorage['elab_progress']).toEqual({ completed: 3 });
        expect(summary.localStorage['unrelated_key']).toBeUndefined();
    });

    it('segna i valori non parsabili come stringa sentinel', () => {
        _ls['elab_corrupt'] = 'not-valid-json';
        const summary = gdprService.getLocalDataSummary();
        expect(summary.localStorage['elab_corrupt']).toBe('[Non parsabile]');
    });

    it('calcola approximateSize (ha struttura corretta)', () => {
        const summary = gdprService.getLocalDataSummary();
        expect(typeof summary.approximateSize).toBe('number');
        expect(summary.approximateSize).toBeGreaterThanOrEqual(0);
    });

    it('restituisce riepilogo con sessionStorage keys elab_', () => {
        _ss['elab_temp'] = JSON.stringify({ x: 1 });
        const summary = gdprService.getLocalDataSummary();
        expect(summary.sessionStorage['elab_temp']).toEqual({ x: 1 });
    });
});

// ── requestDataDeletion (con fetch mock) ────

describe('requestDataDeletion', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
        _ls['elab_gdpr_consent'] = JSON.stringify({ status: 'accepted' });
        mockFetchOk({ success: true, action: 'delete' });
    });

    it('restituisce successo quando il webhook risponde OK', async () => {
        const result = await requestDataDeletion('user123', 'pass', 'test reason');
        expect(result).toBeTruthy();
        expect(result.success).toBe(true);
    });

    it('cancella i dati locali dopo la chiamata di eliminazione', async () => {
        _ls['elab_some_data'] = 'to_be_deleted';
        await requestDataDeletion('user456', 'password', 'richiesta utente');
        expect(_ls['elab_some_data']).toBeUndefined();
    });

    it('lancia eccezione se il webhook restituisce errore', async () => {
        mockFetchFail(500, 'Server Error');
        await expect(requestDataDeletion('user789', 'pass', 'reason')).rejects.toThrow();
    });

    it('lancia eccezione se il network non è disponibile', async () => {
        mockFetchNetworkError();
        await expect(requestDataDeletion('user789', 'pass', 'reason')).rejects.toThrow('Network Error');
    });
});

// ── pseudonymizeUserId ────────────────────────

describe('gdprService.pseudonymizeUserId', () => {
    it('restituisce stringa hex di 16 caratteri', async () => {
        const hash = await gdprService.pseudonymizeUserId('user123');
        expect(typeof hash).toBe('string');
        expect(hash).toHaveLength(16);
        expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('stesso input produce stesso output (deterministico)', async () => {
        const hash1 = await gdprService.pseudonymizeUserId('testuser');
        const hash2 = await gdprService.pseudonymizeUserId('testuser');
        expect(hash1).toBe(hash2);
    });

    it('restituisce sempre stringa hex di 16 caratteri', async () => {
        const hash1 = await gdprService.pseudonymizeUserId('user1');
        const hash2 = await gdprService.pseudonymizeUserId('another-user');
        expect(hash1).toHaveLength(16);
        expect(hash2).toHaveLength(16);
        // Entrambi devono avere solo caratteri hex
        expect(hash1).toMatch(/^[0-9a-f]+$/);
        expect(hash2).toMatch(/^[0-9a-f]+$/);
    });
});

// ── callGdprWebhook via revokeConsent ─────────

describe('gdprService.revokeConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
        mockFetchOk({ success: true, action: 'revoke' });
    });

    it('aggiorna lo stato locale a revoked', async () => {
        saveConsent({ status: 'accepted' });
        await gdprService.revokeConsent('user123');
        const consent = getConsent();
        expect(consent.status).toBe('revoked');
        expect(consent.revokedAt).toBeTruthy();
    });

    it('non fallisce se non c\'è consenso da aggiornare', async () => {
        await expect(gdprService.revokeConsent('user123')).resolves.toBeDefined();
    });

    it('lancia eccezione se il webhook fallisce', async () => {
        mockFetchNetworkError();
        await expect(gdprService.revokeConsent('user123')).rejects.toThrow();
    });
});

// ── requestParentalConsent ─────────────────────

describe('gdprService.requestParentalConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
        mockFetchOk({ success: true, emailSent: true });
    });

    it('salva lo stato parental_sent localmente', async () => {
        const data = {
            childName: 'Luca',
            childAge: 10,
            parentEmail: 'genitore@test.it',
            parentName: 'Mario',
            consentMethod: 'email',
        };
        await gdprService.requestParentalConsent(data);
        const consent = getConsent();
        expect(consent.status).toBe('parental_sent');
        expect(consent.childAge).toBe(10);
        expect(consent.parentEmail).toBe('genitore@test.it');
    });

    it('salva sentAt nel consenso', async () => {
        const data = { childName: 'Sofia', childAge: 8, parentEmail: 'mamma@test.it', parentName: 'Anna', consentMethod: 'email' };
        await gdprService.requestParentalConsent(data);
        const consent = getConsent();
        expect(consent.sentAt).toBeTruthy();
    });

    it('lancia eccezione se il webhook fallisce', async () => {
        mockFetchNetworkError();
        const data = { childName: 'Test', childAge: 11, parentEmail: 'x@y.it', parentName: 'Parent', consentMethod: 'email' };
        await expect(gdprService.requestParentalConsent(data)).rejects.toThrow();
    });
});

// ── verifyParentalConsent ──────────────────────

describe('gdprService.verifyParentalConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStorageMocks();
    });

    it('aggiorna stato a parental_verified se verified=true', async () => {
        mockFetchOk({ verified: true });
        saveConsent({ status: 'parental_sent' });
        await gdprService.verifyParentalConsent('valid-token');
        const consent = getConsent();
        expect(consent.status).toBe('parental_verified');
        expect(consent.verifiedAt).toBeTruthy();
    });

    it('non aggiorna stato se verified=false', async () => {
        mockFetchOk({ verified: false });
        saveConsent({ status: 'parental_sent' });
        await gdprService.verifyParentalConsent('invalid-token');
        const consent = getConsent();
        expect(consent.status).toBe('parental_sent');
    });

    it('lancia eccezione se il webhook fallisce', async () => {
        mockFetchNetworkError();
        await expect(gdprService.verifyParentalConsent('token123')).rejects.toThrow();
    });
});

// ── requestDataExport / requestDataCorrection ─

describe('gdprService.requestDataExport', () => {
    beforeEach(() => { mockFetchOk({ success: true, data: [] }); });

    it('restituisce risultato dal webhook', async () => {
        const result = await gdprService.requestDataExport('user789');
        expect(result.success).toBe(true);
    });

    it('lancia eccezione se il webhook fallisce', async () => {
        mockFetchNetworkError();
        await expect(gdprService.requestDataExport('user789')).rejects.toThrow();
    });
});

describe('gdprService.requestDataCorrection', () => {
    beforeEach(() => { mockFetchOk({ success: true }); });

    it('restituisce risultato dal webhook', async () => {
        const result = await gdprService.requestDataCorrection('user789', { name: 'Nuovo Nome' });
        expect(result.success).toBe(true);
    });

    it('lancia eccezione se il network non è disponibile', async () => {
        mockFetchNetworkError();
        await expect(gdprService.requestDataCorrection('user789', {})).rejects.toThrow();
    });
});
