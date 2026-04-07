/**
 * Tests for nudgeService.js
 * Nudge delivery: localStorage, BroadcastChannel, analytics webhook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies before importing the module
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

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(name) { this.name = name; this.listeners = {}; }
  postMessage(msg) { this._lastMsg = msg; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  removeEventListener(type, fn) { delete this.listeners[type]; }
  close() {}
}
global.BroadcastChannel = MockBroadcastChannel;

import { sendNudge, consumeNudges, startNudgeListener } from '../../src/services/nudgeService.js';
import { sendAnalyticsEvent } from '../../src/components/simulator/api/AnalyticsWebhook';

describe('nudgeService', () => {
  let localStorageData;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageData = {};
    localStorage.getItem.mockImplementation((k) => localStorageData[k] ?? null);
    localStorage.setItem.mockImplementation((k, v) => { localStorageData[k] = v; });
  });

  describe('sendNudge', () => {
    it('returns nudge object with id and timestamp', () => {
      localStorage.getItem.mockReturnValue(null);
      const result = sendNudge('student-1', 'Mario', 'Fai attenzione al LED!');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result.studentId).toBe('student-1');
      expect(result.message).toBe('Fai attenzione al LED!');
      expect(result.from).toBe('teacher');
    });

    it('stores nudge in localStorage', () => {
      localStorage.getItem.mockReturnValue(null);
      sendNudge('student-1', 'Mario', 'Messaggio test');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('appends to existing nudges', () => {
      const existing = [{ id: 'old-1', studentId: 'student-1', message: 'old' }];
      localStorage.getItem.mockReturnValue(JSON.stringify(existing));
      sendNudge('student-1', 'Mario', 'new message');
      const call = localStorage.setItem.mock.calls[0];
      const stored = JSON.parse(call[1]);
      expect(stored.length).toBe(2);
    });

    it('caps pending list at 50 nudges', () => {
      const manyNudges = Array.from({ length: 51 }, (_, i) => ({
        id: `n${i}`,
        studentId: 'student-1',
        message: `msg ${i}`,
      }));
      localStorage.getItem.mockReturnValue(JSON.stringify(manyNudges));
      sendNudge('student-1', 'Mario', 'overflow nudge');
      const call = localStorage.setItem.mock.calls[0];
      const stored = JSON.parse(call[1]);
      expect(stored.length).toBeLessThanOrEqual(50);
    });

    it('sends analytics event', () => {
      localStorage.getItem.mockReturnValue(null);
      sendNudge('student-1', 'Mario', 'Test nudge');
      expect(sendAnalyticsEvent).toHaveBeenCalledWith('teacher_nudge_sent', expect.objectContaining({
        studentId: 'student-1',
        message: 'Test nudge',
      }));
    });

    it('does not store studentName in localStorage (GDPR)', () => {
      localStorage.getItem.mockReturnValue(null);
      sendNudge('student-1', 'Sensitive Name', 'Test');
      const call = localStorage.setItem.mock.calls[0];
      expect(call[1]).not.toContain('Sensitive Name');
    });

    it('handles localStorage failure gracefully', () => {
      localStorage.getItem.mockImplementation(() => { throw new Error('Storage full'); });
      expect(() => sendNudge('student-1', 'Mario', 'Test')).not.toThrow();
    });
  });

  describe('consumeNudges', () => {
    it('returns empty array when no nudges', () => {
      localStorage.getItem.mockReturnValue(null);
      const result = consumeNudges('student-1');
      expect(result).toEqual([]);
    });

    it('returns nudges for the specified student', () => {
      const nudges = [
        { id: 'n1', studentId: 'student-1', message: 'msg1' },
        { id: 'n2', studentId: 'student-2', message: 'msg2' },
      ];
      localStorageData['elab-nudge-pending'] = JSON.stringify(nudges);
      const result = consumeNudges('student-1');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('n1');
    });

    it('removes consumed nudges from storage', () => {
      const nudges = [
        { id: 'n1', studentId: 'student-1', message: 'msg1' },
        { id: 'n2', studentId: 'student-2', message: 'msg2' },
      ];
      localStorageData['elab-nudge-pending'] = JSON.stringify(nudges);
      consumeNudges('student-1');
      const updated = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(updated.every(n => n.studentId !== 'student-1')).toBe(true);
    });

    it('does not return already-read nudges', () => {
      const nudges = [{ id: 'n1', studentId: 'student-1', message: 'msg' }];
      localStorageData['elab-nudge-pending'] = JSON.stringify(nudges);
      localStorageData['elab-nudge-read'] = JSON.stringify(['n1']);
      const result = consumeNudges('student-1');
      expect(result).toEqual([]);
    });

    it('marks consumed nudges as read', () => {
      const nudges = [{ id: 'n-fresh', studentId: 'student-1', message: 'hello' }];
      localStorageData['elab-nudge-pending'] = JSON.stringify(nudges);
      localStorageData['elab-nudge-read'] = JSON.stringify([]);
      consumeNudges('student-1');
      // setItem should be called with updated read list
      const readCall = localStorage.setItem.mock.calls.find(c => c[0] === 'elab-nudge-read');
      expect(readCall).toBeTruthy();
      expect(readCall[1]).toContain('n-fresh');
    });

    it('handles localStorage failure gracefully', () => {
      localStorage.getItem.mockImplementation(() => { throw new Error('err'); });
      expect(() => consumeNudges('student-1')).not.toThrow();
      expect(consumeNudges('student-1')).toEqual([]);
    });

    it('returns empty when student has no nudges', () => {
      const nudges = [{ id: 'n2', studentId: 'student-2', message: 'msg' }];
      localStorageData['elab-nudge-pending'] = JSON.stringify(nudges);
      const result = consumeNudges('student-1');
      expect(result).toEqual([]);
    });
  });

  describe('startNudgeListener', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns a cleanup function', () => {
      const cleanup = startNudgeListener('student-1', vi.fn());
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('returns noop when studentId is falsy', () => {
      const cleanup = startNudgeListener('', vi.fn());
      expect(typeof cleanup).toBe('function');
      // Should not throw
      cleanup();
    });

    it('calls onNudge when nudges are present', () => {
      const nudges = [{ id: 'n1', studentId: 'student-1', message: 'ciao' }];
      localStorageData['elab-nudge-pending'] = JSON.stringify(nudges);
      const onNudge = vi.fn();
      startNudgeListener('student-1', onNudge);
      expect(onNudge).toHaveBeenCalled();
    });

    it('does not call onNudge when no nudges', () => {
      localStorage.getItem.mockReturnValue(null);
      const onNudge = vi.fn();
      startNudgeListener('student-1', onNudge);
      expect(onNudge).not.toHaveBeenCalled();
    });

    it('polls on interval', () => {
      // Pre-populate nudge so initial check passes (consumed), then add another
      const nudge1 = { id: 'n-init', studentId: 'student-1', message: 'initial' };
      const nudge2 = { id: 'n-poll', studentId: 'student-1', message: 'poll test' };
      localStorageData['elab-nudge-pending'] = JSON.stringify([nudge1]);

      const onNudge = vi.fn();
      const cleanup = startNudgeListener('student-1', onNudge);
      // Initial check consumed nudge1 → onNudge called once
      const firstCallCount = onNudge.mock.calls.length;

      // Now add nudge2 for the interval to pick up
      localStorageData['elab-nudge-pending'] = JSON.stringify([nudge2]);
      // Reset read list so nudge2 is treated as new
      delete localStorageData['elab-nudge-read'];

      vi.advanceTimersByTime(3500); // > POLL_INTERVAL (3000)
      expect(onNudge.mock.calls.length).toBeGreaterThan(firstCallCount);
      cleanup();
    });

    it('cleanup removes event listener and clears interval', () => {
      localStorage.getItem.mockReturnValue(null);
      const onNudge = vi.fn();
      const cleanup = startNudgeListener('student-1', onNudge);
      cleanup();
      // After cleanup, advancing timer should not trigger more calls
      vi.advanceTimersByTime(10000);
      expect(onNudge).not.toHaveBeenCalled();
    });
  });
});
