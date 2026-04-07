/**
 * Tests for licenseService.js
 * License verification, caching, session management.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetchSuccess, mockFetchError, mockSessionStorage } from '../setup.js';

// We import the default singleton after setting up mocks
let licenseService;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  // Re-import fresh instance for each test
  const mod = await import('../../src/services/licenseService.js');
  licenseService = mod.default;
});

describe('licenseService', () => {
  describe('getSessionId / getDeviceId', () => {
    it('generates a session ID using crypto.randomUUID', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      const id = await licenseService.getSessionId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('returns cached session ID on second call', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      const id1 = await licenseService.getSessionId();
      const id2 = await licenseService.getSessionId();
      expect(id1).toBe(id2);
    });

    it('reads from sessionStorage if already set', async () => {
      sessionStorage.getItem.mockReturnValue('"existing-session-id"');
      const id = await licenseService.getSessionId();
      expect(id).toBeTruthy();
    });

    it('getDeviceId delegates to getSessionId', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      const id = await licenseService.getDeviceId();
      expect(id).toBeTruthy();
    });
  });

  describe('verifyLicense', () => {
    it('returns valid license on success', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      mockFetchSuccess({
        valid: true,
        school: 'Scuola Test',
        email: 'admin@test.it',
        expiry: '2027-01-01T00:00:00Z',
        plan: 'pro',
        maxUsers: 30,
      });

      const result = await licenseService.verifyLicense('ABC-123');
      expect(result.valid).toBe(true);
      expect(result.school).toBe('Scuola Test');
      expect(result.plan).toBe('pro');
      expect(result.maxUsers).toBe(30);
    });

    it('stores valid license in sessionStorage', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      mockFetchSuccess({
        valid: true,
        school: 'Scuola',
        email: 'a@b.it',
        expiry: '2027-01-01T00:00:00Z',
      });

      await licenseService.verifyLicense('XYZ');
      expect(sessionStorage.setItem).toHaveBeenCalled();
    });

    it('returns error when license is invalid', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      mockFetchSuccess({
        valid: false,
        error: 'Licenza scaduta',
      });

      const result = await licenseService.verifyLicense('BAD-CODE');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Licenza scaduta');
    });

    it('returns DEVICE_LOCKED error message', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      mockFetchSuccess({
        valid: false,
        error: 'DEVICE_LOCKED',
      });

      const result = await licenseService.verifyLicense('CODE');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('licenza è già attiva');
    });

    it('returns error when network fails', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await licenseService.verifyLicense('CODE');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Impossibile verificare');
    });

    it('returns error when response is not ok', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await licenseService.verifyLicense('CODE');
      expect(result.valid).toBe(false);
    });

    it('uses default plan=base when not provided', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      mockFetchSuccess({
        valid: true,
        school: 'S',
        email: 'e@e.it',
        expiry: '2027-01-01T00:00:00Z',
      });

      const result = await licenseService.verifyLicense('CODE');
      expect(result.plan).toBe('base');
    });

    it('uses default maxUsers=1 when not provided', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      mockFetchSuccess({
        valid: true,
        school: 'S',
        email: 'e@e.it',
        expiry: '2027-01-01T00:00:00Z',
      });

      const result = await licenseService.verifyLicense('CODE');
      expect(result.maxUsers).toBe(1);
    });
  });

  describe('hasActiveSession', () => {
    it('returns false when no stored license', () => {
      sessionStorage.getItem.mockReturnValue(null);
      expect(licenseService.hasActiveSession()).toBe(false);
    });

    it('returns true when license is not expired', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: future });
        return null;
      });
      expect(licenseService.hasActiveSession()).toBe(true);
    });

    it('returns false when license is expired', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: past });
        return null;
      });
      expect(licenseService.hasActiveSession()).toBe(false);
    });

    it('returns false when stored JSON is invalid', () => {
      sessionStorage.getItem.mockReturnValue('invalid-json{{{');
      expect(licenseService.hasActiveSession()).toBe(false);
    });
  });

  describe('getCurrentLicense', () => {
    it('returns null when nothing stored', () => {
      sessionStorage.getItem.mockReturnValue(null);
      expect(licenseService.getCurrentLicense()).toBeNull();
    });

    it('returns parsed license object', () => {
      const license = { code: 'XYZ', expiry: '2027-01-01', school: 'S' };
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify(license);
        return null;
      });
      expect(licenseService.getCurrentLicense()).toEqual(license);
    });

    it('returns null on invalid JSON', () => {
      sessionStorage.getItem.mockReturnValue('{{invalid}}');
      expect(licenseService.getCurrentLicense()).toBeNull();
    });
  });

  describe('isExpired', () => {
    it('returns true when no license', () => {
      sessionStorage.getItem.mockReturnValue(null);
      expect(licenseService.isExpired()).toBe(true);
    });

    it('returns false for future expiry', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: future });
        return null;
      });
      expect(licenseService.isExpired()).toBe(false);
    });

    it('returns true for past expiry', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: past });
        return null;
      });
      expect(licenseService.isExpired()).toBe(true);
    });
  });

  describe('getDaysRemaining', () => {
    it('returns 0 when no license', () => {
      sessionStorage.getItem.mockReturnValue(null);
      expect(licenseService.getDaysRemaining()).toBe(0);
    });

    it('returns approximately 1 day for 24h expiry', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: future });
        return null;
      });
      expect(licenseService.getDaysRemaining()).toBe(1);
    });

    it('returns 0 for expired license', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: past });
        return null;
      });
      expect(licenseService.getDaysRemaining()).toBe(0);
    });

    it('returns correct days for 7-day expiry', () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify({ expiry: future });
        return null;
      });
      expect(licenseService.getDaysRemaining()).toBe(7);
    });
  });

  describe('releaseLicense', () => {
    it('does nothing when no stored license', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      await licenseService.releaseLicense();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('calls fetch to release license', async () => {
      const license = { code: 'XYZ', expiry: '2027-01-01', school: 'S' };
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify(license);
        return null;
      });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await licenseService.releaseLicense();
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('does not throw on network failure', async () => {
      const license = { code: 'XYZ' };
      sessionStorage.getItem.mockImplementation((k) => {
        if (k === 'elab_license') return JSON.stringify(license);
        return null;
      });
      fetch.mockRejectedValueOnce(new Error('Network'));

      await expect(licenseService.releaseLicense()).resolves.not.toThrow();
    });
  });

  describe('logout', () => {
    it('clears sessionStorage items', async () => {
      sessionStorage.getItem.mockReturnValue(null);
      await licenseService.logout();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('elab_license');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('elab_auth');
    });
  });
});
