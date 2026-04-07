/**
 * Tests for nudgeService.js
 * © Worker run 12 — 2026-04-07
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────
vi.mock('../../src/components/simulator/api/AnalyticsWebhook', () => ({
  sendAnalyticsEvent: vi.fn(),
}));
vi.mock('../../src/services/supabaseSync', () => ({
  sendNudge: vi.fn().mockResolvedValue({}),
  subscribeToNudges: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  markNudgeRead: vi.fn().mockResolvedValue({}),
}));
vi.mock('../../src/services/supabaseClient', () => ({
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
}));

import { sendNudge, consumeNudges, startNudgeListener } from '../../src/services/nudgeService.js';
import { sendAnalyticsEvent } from '../../src/components/simulator/api/AnalyticsWebhook';
import { isSupabaseConfigured } from '../../src/services/supabaseClient';

// localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: () => store,
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// BroadcastChannel mock
class BroadcastChannelMock {
  constructor() { this._listeners = []; this.postMessage = vi.fn(); }
  addEventListener(_, fn) { this._listeners.push(fn); }
  removeEventListener(_, fn) { this._listeners = this._listeners.filter(l => l !== fn); }
  close() {}
}
global.BroadcastChannel = BroadcastChannelMock;

// ── sendNudge ────────────────────────────────────────────
describe('nudgeService.sendNudge', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { localStorageMock._store()[key] = String(value); });
  });

  it('returns a nudge object with id and timestamp', () => {
    const nudge = sendNudge('student1', 'Mario', 'Guarda questo componente!');
    expect(nudge).toBeDefined();
    expect(nudge.id).toBeTruthy();
    expect(nudge.timestamp).toBeTruthy();
    expect(nudge.studentId).toBe('student1');
    expect(nudge.message).toBe('Guarda questo componente!');
    expect(nudge.from).toBe('teacher');
  });

  it('saves nudge to localStorage', () => {
    sendNudge('student1', 'Mario', 'Test message');
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const setCall = localStorageMock.setItem.mock.calls.find(c => c[0] === 'elab-nudge-pending');
    expect(setCall).toBeTruthy();
    const stored = JSON.parse(setCall[1]);
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.length).toBe(1);
    expect(stored[0].studentId).toBe('student1');
  });

  it('does NOT store studentName (GDPR PII minimization)', () => {
    sendNudge('student1', 'Mario Rossi', 'Test');
    const setCall = localStorageMock.setItem.mock.calls.find(c => c[0] === 'elab-nudge-pending');
    const stored = JSON.parse(setCall[1]);
    expect(JSON.stringify(stored)).not.toContain('Mario Rossi');
  });

  it('fires analytics event', () => {
    sendNudge('student2', 'Luisa', 'Bravo!');
    expect(sendAnalyticsEvent).toHaveBeenCalledWith('teacher_nudge_sent', expect.objectContaining({
      studentId: 'student2',
      message: 'Bravo!',
    }));
  });

  it('accumulates multiple nudges in localStorage', () => {
    sendNudge('s1', 'A', 'msg1');
    sendNudge('s1', 'A', 'msg2');
    sendNudge('s2', 'B', 'msg3');
    const stored = JSON.parse(localStorageMock._store()['elab-nudge-pending']);
    expect(stored.length).toBe(3);
  });

  it('caps pending nudges at 50', () => {
    // Pre-fill with 49 nudges
    const existing = Array.from({ length: 49 }, (_, i) => ({ id: `n${i}`, studentId: 'sX', message: 'm' }));
    localStorageMock._store()['elab-nudge-pending'] = JSON.stringify(existing);
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);

    sendNudge('sX', 'X', 'overflow');
    const stored = JSON.parse(localStorageMock._store()['elab-nudge-pending']);
    expect(stored.length).toBe(50);
  });

  it('trims to 50 when over limit', () => {
    const existing = Array.from({ length: 55 }, (_, i) => ({ id: `n${i}`, studentId: 'sX', message: 'm' }));
    localStorageMock._store()['elab-nudge-pending'] = JSON.stringify(existing);
    localStorageMock.getItem.mockImplementation((key) => localStorageMock._store()[key] ?? null);

    sendNudge('sX', 'X', 'trim');
    const stored = JSON.parse(localStorageMock._store()['elab-nudge-pending']);
    expect(stored.length).toBe(50);
  });

  it('generates unique ids for consecutive nudges', () => {
    const n1 = sendNudge('s1', 'A', 'msg1');
    const n2 = sendNudge('s1', 'A', 'msg2');
    expect(n1.id).not.toBe(n2.id);
  });

  it('accepts options.classId and options.teacherId', () => {
    const nudge = sendNudge('s1', 'A', 'msg', { classId: 'cls1', teacherId: 'tch1' });
    expect(nudge).toBeDefined();
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('QuotaExceededError'); });
    expect(() => sendNudge('s1', 'A', 'fail-gracefully')).not.toThrow();
  });
});

// ── consumeNudges ────────────────────────────────────────
describe('nudgeService.consumeNudges', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    const store = localStorageMock._store();
    localStorageMock.getItem.mockImplementation((key) => store[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { store[key] = String(value); });
  });

  it('returns empty array when no nudges exist', () => {
    const result = consumeNudges('student1');
    expect(result).toEqual([]);
  });

  it('returns nudges for the correct studentId', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'a1', studentId: 'student1', message: 'Hi!', timestamp: new Date().toISOString() },
      { id: 'a2', studentId: 'student2', message: 'Hello!', timestamp: new Date().toISOString() },
    ]);
    const result = consumeNudges('student1');
    expect(result.length).toBe(1);
    expect(result[0].studentId).toBe('student1');
    expect(result[0].message).toBe('Hi!');
  });

  it('removes consumed nudges from localStorage', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'b1', studentId: 'student1', message: 'Clean me', timestamp: new Date().toISOString() },
    ]);
    consumeNudges('student1');
    const remaining = JSON.parse(store['elab-nudge-pending']);
    expect(remaining).toEqual([]);
  });

  it('keeps nudges for other students after consume', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'c1', studentId: 'student1', message: 'For s1', timestamp: new Date().toISOString() },
      { id: 'c2', studentId: 'student2', message: 'For s2', timestamp: new Date().toISOString() },
    ]);
    consumeNudges('student1');
    const remaining = JSON.parse(store['elab-nudge-pending']);
    expect(remaining.length).toBe(1);
    expect(remaining[0].studentId).toBe('student2');
  });

  it('does not return already-read nudges (deduplication)', () => {
    const store = localStorageMock._store();
    store['elab-nudge-read'] = JSON.stringify(['d1']);
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'd1', studentId: 'student1', message: 'Already read', timestamp: new Date().toISOString() },
    ]);
    const result = consumeNudges('student1');
    expect(result).toEqual([]);
  });

  it('marks consumed nudges as read', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'e1', studentId: 'student1', message: 'New', timestamp: new Date().toISOString() },
    ]);
    consumeNudges('student1');
    const read = JSON.parse(store['elab-nudge-read']);
    expect(read).toContain('e1');
  });

  it('keeps last 100 read ids (cap)', () => {
    const store = localStorageMock._store();
    const existingRead = Array.from({ length: 100 }, (_, i) => `old${i}`);
    store['elab-nudge-read'] = JSON.stringify(existingRead);
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'new1', studentId: 'student1', message: 'hi', timestamp: new Date().toISOString() },
    ]);
    consumeNudges('student1');
    const read = JSON.parse(store['elab-nudge-read']);
    expect(read.length).toBeLessThanOrEqual(100);
  });

  it('returns empty array when no nudges exist for studentId', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'f1', studentId: 'studentX', message: 'Not mine', timestamp: new Date().toISOString() },
    ]);
    const result = consumeNudges('student1');
    expect(result).toEqual([]);
  });

  it('handles malformed localStorage data gracefully', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = 'NOT_JSON{{{';
    expect(() => consumeNudges('student1')).not.toThrow();
    expect(consumeNudges('student1')).toEqual([]);
  });
});

// ── startNudgeListener ───────────────────────────────────
describe('nudgeService.startNudgeListener', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    const store = localStorageMock._store();
    localStorageMock.getItem.mockImplementation((key) => store[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { store[key] = String(value); });
    // Mock window.addEventListener
    vi.spyOn(global.window, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(global.window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a cleanup function', () => {
    const cleanup = startNudgeListener('student1', vi.fn());
    expect(typeof cleanup).toBe('function');
    cleanup(); // should not throw
  });

  it('returns a no-op function when studentId is empty', () => {
    const cleanup = startNudgeListener('', vi.fn());
    expect(typeof cleanup).toBe('function');
    cleanup(); // should not throw
  });

  it('returns a no-op function when studentId is null', () => {
    const cleanup = startNudgeListener(null, vi.fn());
    expect(typeof cleanup).toBe('function');
  });

  it('calls onNudge immediately if there are pending nudges', () => {
    const store = localStorageMock._store();
    store['elab-nudge-pending'] = JSON.stringify([
      { id: 'g1', studentId: 'student1', message: 'Immediate', timestamp: new Date().toISOString() },
    ]);
    const cb = vi.fn();
    const cleanup = startNudgeListener('student1', cb);
    expect(cb).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'g1' }),
    ]));
    cleanup();
  });

  it('does not call onNudge if no pending nudges exist', () => {
    const cb = vi.fn();
    const cleanup = startNudgeListener('student1', cb);
    expect(cb).not.toHaveBeenCalled();
    cleanup();
  });

  it('cleanup function can be called multiple times without error', () => {
    const cleanup = startNudgeListener('student1', vi.fn());
    expect(() => { cleanup(); cleanup(); }).not.toThrow();
  });

  it('registers window storage listener', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    const cleanup = startNudgeListener('student3', vi.fn());
    expect(addEventSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    cleanup();
    addEventSpy.mockRestore();
  });
});

// ── integration: send + consume ──────────────────────────
describe('nudgeService: send + consume integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    const store = localStorageMock._store();
    localStorageMock.getItem.mockImplementation((key) => store[key] ?? null);
    localStorageMock.setItem.mockImplementation((key, value) => { store[key] = String(value); });
  });

  it('send then consume returns the nudge', () => {
    sendNudge('student1', 'Mario', 'Integration test!');
    const result = consumeNudges('student1');
    expect(result.length).toBe(1);
    expect(result[0].message).toBe('Integration test!');
  });

  it('double consume returns empty (idempotent)', () => {
    sendNudge('student1', 'Mario', 'Once');
    consumeNudges('student1'); // first consume
    const second = consumeNudges('student1'); // second consume
    expect(second).toEqual([]);
  });

  it('consuming for wrong student leaves nudge intact', () => {
    sendNudge('student1', 'Mario', 'Mine');
    consumeNudges('student2'); // wrong student
    const correct = consumeNudges('student1');
    expect(correct.length).toBe(1);
  });

  it('multiple nudges for same student are all consumed at once', () => {
    sendNudge('student1', 'Mario', 'msg A');
    sendNudge('student1', 'Mario', 'msg B');
    sendNudge('student1', 'Mario', 'msg C');
    const result = consumeNudges('student1');
    expect(result.length).toBe(3);
  });

  it('interleaved nudges for multiple students consumed independently', () => {
    sendNudge('s1', 'A', 'for s1');
    sendNudge('s2', 'B', 'for s2');
    sendNudge('s1', 'A', 'also for s1');

    const s1 = consumeNudges('s1');
    const s2 = consumeNudges('s2');

    expect(s1.length).toBe(2);
    expect(s2.length).toBe(1);
  });
});
