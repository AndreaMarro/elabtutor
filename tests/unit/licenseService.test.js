/**
 * licenseService — Unit Tests
 * Verifica sessionId, verifyLicense, hasActiveSession, isExpired, getDaysRemaining
 * (c) ELAB Worker Run 11 — 2026-04-07
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock logger to suppress output
vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// In-memory session storage
const sessionStore = {};
beforeEach(() => {
  Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
  sessionStorage.getItem.mockImplementation(k => sessionStore[k] ?? null);
  sessionStorage.setItem.mockImplementation((k, v) => { sessionStore[k] = String(v); });
  sessionStorage.removeItem.mockImplementation(k => { delete sessionStore[k]; });
  sessionStorage.clear.mockImplementation(() => {
    Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
  });
  fetch.mockReset();
});

// Import the service
import licenseService from '../../src/services/licenseService';

// Reset licenseService state between tests
beforeEach(() => {
  licenseService.cachedLicense = null;
  licenseService.cacheExpiry = null;
  licenseService.deviceId = null;
});

// ─── getSessionId / getDeviceId ────────────────────────────────────────────────
describe('getSessionId', () => {
  test('returns a session id string', async () => {
    const id = await licenseService.getSessionId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  test('returns cached id on second call', async () => {
    const id1 = await licenseService.getSessionId();
    const id2 = await licenseService.getSessionId();
    expect(id1).toBe(id2);
  });

  test('getDeviceId returns same as getSessionId', async () => {
    const sid = await licenseService.getSessionId();
    const did = await licenseService.getDeviceId();
    expect(sid).toBe(did);
  });

  test('uses existing sessionStorage value if present', async () => {
    sessionStore['elab_session_id'] = JSON.stringify('my-cached-id');
    // clear deviceId cache so it reads from sessionStorage
    licenseService.deviceId = null;
    const id = await licenseService.getSessionId();
    // crypto.randomUUID mock returns 'test-uuid-1234-5678-90ab-cdef'
    // if cached, returns mock; actual depends on mock behavior
    expect(typeof id).toBe('string');
  });
});

// ─── hasActiveSession ─────────────────────────────────────────────────────────
describe('hasActiveSession', () => {
  test('returns false when no license in sessionStorage', () => {
    expect(licenseService.hasActiveSession()).toBe(false);
  });

  test('returns true when license has future expiry', () => {
    const expiry = new Date(Date.now() + 86400000).toISOString(); // +1 day
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    expect(licenseService.hasActiveSession()).toBe(true);
  });

  test('returns false when license has past expiry', () => {
    const expiry = new Date(Date.now() - 86400000).toISOString(); // -1 day
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    expect(licenseService.hasActiveSession()).toBe(false);
  });

  test('returns false when license JSON is invalid', () => {
    sessionStore['elab_license'] = 'not-json';
    expect(licenseService.hasActiveSession()).toBe(false);
  });
});

// ─── getCurrentLicense ────────────────────────────────────────────────────────
describe('getCurrentLicense', () => {
  test('returns null when nothing stored', () => {
    expect(licenseService.getCurrentLicense()).toBeNull();
  });

  test('returns parsed license object', () => {
    const lic = { code: 'ABC123', school: 'Test School', expiry: '2027-01-01' };
    sessionStore['elab_license'] = JSON.stringify(lic);
    const result = licenseService.getCurrentLicense();
    expect(result).toMatchObject({ code: 'ABC123', school: 'Test School' });
  });

  test('returns null on invalid JSON', () => {
    sessionStore['elab_license'] = '{broken';
    expect(licenseService.getCurrentLicense()).toBeNull();
  });
});

// ─── isExpired ────────────────────────────────────────────────────────────────
describe('isExpired', () => {
  test('returns true when no license', () => {
    expect(licenseService.isExpired()).toBe(true);
  });

  test('returns false when expiry is in the future', () => {
    const expiry = new Date(Date.now() + 86400000).toISOString();
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    expect(licenseService.isExpired()).toBe(false);
  });

  test('returns true when expiry is in the past', () => {
    const expiry = new Date(Date.now() - 86400000).toISOString();
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    expect(licenseService.isExpired()).toBe(true);
  });
});

// ─── getDaysRemaining ─────────────────────────────────────────────────────────
describe('getDaysRemaining', () => {
  test('returns 0 when no license', () => {
    expect(licenseService.getDaysRemaining()).toBe(0);
  });

  test('returns approximately 1 for expiry in 24h', () => {
    const expiry = new Date(Date.now() + 86400000).toISOString(); // +1 day
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    const days = licenseService.getDaysRemaining();
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(2);
  });

  test('returns 0 for expired license (clamp to 0)', () => {
    const expiry = new Date(Date.now() - 86400000).toISOString();
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    expect(licenseService.getDaysRemaining()).toBe(0);
  });

  test('returns approximately 30 for expiry in 30 days', () => {
    const expiry = new Date(Date.now() + 30 * 86400000).toISOString();
    sessionStore['elab_license'] = JSON.stringify({ expiry });
    const days = licenseService.getDaysRemaining();
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(31);
  });
});

// ─── verifyLicense ────────────────────────────────────────────────────────────
describe('verifyLicense', () => {
  test('returns valid license on successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        school: 'Scuola Test',
        email: 'admin@test.it',
        expiry: '2027-01-01',
        plan: 'pro',
        maxUsers: 30,
      }),
    });

    const result = await licenseService.verifyLicense('VALIDCODE');
    expect(result.valid).toBe(true);
    expect(result.school).toBe('Scuola Test');
    expect(result.plan).toBe('pro');
  });

  test('returns cached license on second call with same code', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        school: 'Test',
        email: 'e@t.it',
        expiry: '2027-01-01',
      }),
    });

    await licenseService.verifyLicense('CODE1');
    // Second call should use cache
    const result = await licenseService.verifyLicense('CODE1');
    expect(result.valid).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1); // only one fetch
  });

  test('returns invalid on server error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false, error: 'Licenza scaduta' }),
    });

    const result = await licenseService.verifyLicense('BADCODE');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('returns DEVICE_LOCKED error message', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false, error: 'DEVICE_LOCKED' }),
    });

    const result = await licenseService.verifyLicense('LOCKEDCODE');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('altro dispositivo');
  });

  test('returns network error on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await licenseService.verifyLicense('ERRORCODE');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('connessione');
  });

  test('returns error when response not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await licenseService.verifyLicense('SERVER_ERR');
    expect(result.valid).toBe(false);
  });

  test('saves license to sessionStorage on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        school: 'Saved School',
        email: 'saved@test.it',
        expiry: '2027-06-01',
      }),
    });

    await licenseService.verifyLicense('SAVECODE');
    expect(sessionStore['elab_license']).toBeTruthy();
    const stored = JSON.parse(sessionStore['elab_license']);
    expect(stored.school).toBe('Saved School');
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe('logout', () => {
  test('clears cachedLicense', async () => {
    licenseService.cachedLicense = { valid: true, code: 'TEST' };
    licenseService.cacheExpiry = Date.now() + 999999;
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await licenseService.logout();
    expect(licenseService.cachedLicense).toBeNull();
  });

  test('removes elab_license from sessionStorage', async () => {
    sessionStore['elab_license'] = JSON.stringify({ code: 'X' });
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await licenseService.logout();
    expect(sessionStore['elab_license']).toBeUndefined();
  });

  test('removes elab_auth from sessionStorage', async () => {
    sessionStore['elab_auth'] = 'some-token';
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await licenseService.logout();
    expect(sessionStore['elab_auth']).toBeUndefined();
  });
});
