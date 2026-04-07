/**
 * Tests for studentTracker.js
 * © Worker run 12 — 2026-04-07
 */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// ── Mocks ────────────────────────────────────────────────
vi.mock('../../src/services/studentService', () => ({
  default: {
    startSession: vi.fn().mockReturnValue('session-abc'),
    endSession: vi.fn(),
    flushSync: vi.fn(),
    logActivity: vi.fn(),
    logConcetto: vi.fn(),
    logExperiment: vi.fn(),
  },
}));
vi.mock('../../src/services/gdprService', () => ({
  default: {
    hasValidConsent: vi.fn().mockReturnValue(true),
  },
}));
vi.mock('../../src/services/gamificationService', () => ({
  default: {
    onGameWon: vi.fn(),
  },
}));
vi.mock('../../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import studentTracker from '../../src/services/studentTracker.js';
import studentService from '../../src/services/studentService';
import gdprService from '../../src/services/gdprService';
import gamification from '../../src/services/gamificationService';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: () => store,
    _reset: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// crypto.randomUUID is available in jsdom — no mock needed

// Use fake timers to prevent setInterval leaks across tests
beforeAll(() => { vi.useFakeTimers(); });
afterAll(() => { vi.useRealTimers(); studentTracker.destroy(); });

// Mock document.addEventListener
const documentEventListeners = {};
vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
  documentEventListeners[event] = handler;
});
vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});

// ── init ─────────────────────────────────────────────────
describe('studentTracker.init', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentService.startSession.mockReturnValue('session-abc');
    studentTracker.destroy(); // reset state
  });

  it('starts a session when consent is given', () => {
    studentTracker.init();
    expect(studentService.startSession).toHaveBeenCalled();
  });

  it('does NOT start session without GDPR consent', () => {
    gdprService.hasValidConsent.mockReturnValueOnce(false);
    studentTracker.destroy();
    studentTracker.init();
    expect(studentService.startSession).not.toHaveBeenCalled();
  });

  it('is idempotent — calling init twice does not double-start session', () => {
    studentTracker.init();
    studentTracker.init(); // second call should be no-op
    expect(studentService.startSession).toHaveBeenCalledTimes(1);
  });

  it('creates a device userId via localStorage', () => {
    studentTracker.init();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('elab_device_id', expect.any(String));
  });

  it('reuses existing device userId from localStorage', () => {
    localStorageMock._store()['elab_device_id'] = 'existing-device-id';
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    studentTracker.destroy();
    studentTracker.init();
    // setItem for device_id should NOT be called again
    const setCalls = localStorageMock.setItem.mock.calls.filter(c => c[0] === 'elab_device_id');
    expect(setCalls.length).toBe(0);
  });
});

// ── getUserId ────────────────────────────────────────────
describe('studentTracker.getUserId', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentTracker.destroy();
  });

  it('returns a string userId', () => {
    studentTracker.init();
    const id = studentTracker.getUserId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns the same userId on repeated calls', () => {
    studentTracker.init();
    expect(studentTracker.getUserId()).toBe(studentTracker.getUserId());
  });

  it('returns a userId even without init (uses device id)', () => {
    // getUserId falls back to getDeviceUserId() which reads/creates from localStorage
    const id = studentTracker.getUserId();
    expect(typeof id).toBe('string');
  });
});

// ── setStudentName / getStudentName ──────────────────────
describe('studentTracker name management', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
  });

  it('getStudentName returns null when not set', () => {
    expect(studentTracker.getStudentName()).toBeNull();
  });

  it('setStudentName stores the name', () => {
    studentTracker.setStudentName('Giulia');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('elab_student_name', 'Giulia');
  });

  it('getStudentName returns previously set name', () => {
    localStorageMock._store()['elab_student_name'] = 'Marco';
    expect(studentTracker.getStudentName()).toBe('Marco');
  });

  it('handles localStorage error in setStudentName gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => { throw new Error('QuotaExceeded'); });
    expect(() => studentTracker.setStudentName('Errore')).not.toThrow();
  });

  it('handles localStorage error in getStudentName gracefully', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('Security error'); });
    expect(studentTracker.getStudentName()).toBeNull();
  });
});

// ── logChatInteraction ───────────────────────────────────
describe('studentTracker.logChatInteraction', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentService.startSession.mockReturnValue('session-abc');
    studentTracker.destroy();
    studentTracker.init();
  });

  it('calls studentService.logActivity with tipo=chat', () => {
    studentTracker.logChatInteraction('Come funziona un resistore?', 'good');
    expect(studentService.logActivity).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ tipo: 'chat' }),
    );
  });

  it('truncates long questions to 100 chars', () => {
    const longQ = 'x'.repeat(200);
    studentTracker.logChatInteraction(longQ, 'good');
    const call = studentService.logActivity.mock.calls[0];
    expect(call[2].dettaglio.length).toBeLessThanOrEqual(100);
  });

  it('does not throw when called before init', () => {
    studentTracker.destroy();
    expect(() => studentTracker.logChatInteraction('question', 'good')).not.toThrow();
  });

  it('handles null question gracefully', () => {
    expect(() => studentTracker.logChatInteraction(null, 'bad')).not.toThrow();
  });
});

// ── logCompilation ───────────────────────────────────────
describe('studentTracker.logCompilation', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentService.startSession.mockReturnValue('session-abc');
    studentTracker.destroy();
    studentTracker.init();
  });

  it('logs successful compilation', () => {
    studentTracker.logCompilation(true, null);
    expect(studentService.logActivity).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ tipo: 'compilazione', dettaglio: 'Compilazione OK' }),
    );
  });

  it('logs failed compilation with error message', () => {
    studentTracker.logCompilation(false, 'syntax error at line 5');
    expect(studentService.logActivity).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        tipo: 'compilazione',
        dettaglio: expect.stringContaining('syntax error'),
      }),
    );
  });

  it('truncates long error messages to 100 chars', () => {
    const longError = 'e'.repeat(200);
    studentTracker.logCompilation(false, longError);
    const call = studentService.logActivity.mock.calls[0];
    expect(call[2].dettaglio.length).toBeLessThanOrEqual(110); // "Errore: " + 100
  });

  it('does not throw when called before init', () => {
    studentTracker.destroy();
    expect(() => studentTracker.logCompilation(false, 'err')).not.toThrow();
  });
});

// ── logGameResult ────────────────────────────────────────
describe('studentTracker.logGameResult', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentService.startSession.mockReturnValue('session-abc');
    studentTracker.destroy();
    studentTracker.init();
  });

  it('logs game activity', () => {
    studentTracker.logGameResult('resistore-quiz', 8, 10, 45);
    expect(studentService.logActivity).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ tipo: 'gioco' }),
    );
  });

  it('logs experiment for Teacher Dashboard', () => {
    studentTracker.logGameResult('led-quiz', 5, 10, 30);
    expect(studentService.logExperiment).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ experimentId: 'game-led-quiz' }),
    );
  });

  it('triggers gamification onGameWon when score >= 50%', () => {
    studentTracker.logGameResult('quiz1', 5, 10, 20); // 50% → exactly at threshold
    expect(gamification.onGameWon).toHaveBeenCalledWith('quiz1');
  });

  it('triggers gamification onGameWon when score > 50%', () => {
    studentTracker.logGameResult('quiz2', 8, 10, 20); // 80%
    expect(gamification.onGameWon).toHaveBeenCalledWith('quiz2');
  });

  it('does NOT trigger gamification when score < 50%', () => {
    studentTracker.logGameResult('quiz3', 4, 10, 20); // 40%
    expect(gamification.onGameWon).not.toHaveBeenCalled();
  });

  it('does not throw when gamification throws', () => {
    gamification.onGameWon.mockImplementationOnce(() => { throw new Error('gamif error'); });
    expect(() => studentTracker.logGameResult('quiz4', 10, 10, 10)).not.toThrow();
  });

  it('does not throw when called before init', () => {
    studentTracker.destroy();
    expect(() => studentTracker.logGameResult('quiz', 5, 10, 10)).not.toThrow();
  });
});

// ── destroy ──────────────────────────────────────────────
describe('studentTracker.destroy', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentService.startSession.mockReturnValue('session-abc');
    studentTracker.destroy();
    studentTracker.init();
  });

  it('calls studentService.endSession on destroy', () => {
    studentTracker.destroy();
    expect(studentService.endSession).toHaveBeenCalled();
  });

  it('calls studentService.flushSync on destroy', () => {
    studentTracker.destroy();
    expect(studentService.flushSync).toHaveBeenCalled();
  });

  it('can be called multiple times without error', () => {
    expect(() => { studentTracker.destroy(); studentTracker.destroy(); }).not.toThrow();
  });

  it('allows re-init after destroy', () => {
    studentTracker.destroy();
    vi.clearAllMocks();
    studentTracker.init();
    expect(studentService.startSession).toHaveBeenCalled();
  });
});

// ── initAfterConsent ─────────────────────────────────────
describe('studentTracker.initAfterConsent', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
    gdprService.hasValidConsent.mockReturnValue(true);
    studentService.startSession.mockReturnValue('session-abc');
    studentTracker.destroy();
  });

  it('reinitializes the tracker', () => {
    // First init without consent
    gdprService.hasValidConsent.mockReturnValueOnce(false);
    studentTracker.init(); // no session started
    expect(studentService.startSession).not.toHaveBeenCalled();

    // Then grant consent
    gdprService.hasValidConsent.mockReturnValue(true);
    studentTracker.initAfterConsent();
    expect(studentService.startSession).toHaveBeenCalled();
  });

  it('does not throw when called without prior init', () => {
    expect(() => studentTracker.initAfterConsent()).not.toThrow();
  });
});
