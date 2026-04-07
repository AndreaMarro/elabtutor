/**
 * Tests for activityBuffer.js
 * Ring buffer for user activity tracking (UNLIM context awareness).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  pushActivity,
  getRecentActivities,
  formatForContext,
  clearActivities,
} from '../../src/services/activityBuffer.js';

describe('activityBuffer', () => {
  beforeEach(() => {
    clearActivities();
  });

  describe('clearActivities', () => {
    it('empties the buffer', () => {
      pushActivity('compile_error', 'some error');
      clearActivities();
      expect(getRecentActivities()).toEqual([]);
    });

    it('allows adding after clear', () => {
      pushActivity('play');
      clearActivities();
      pushActivity('stop');
      expect(getRecentActivities()).toHaveLength(1);
    });
  });

  describe('pushActivity', () => {
    it('adds an activity with type and detail', () => {
      pushActivity('compile_error', 'undefined reference');
      const activities = getRecentActivities();
      expect(activities).toHaveLength(1);
      expect(activities[0].type).toBe('compile_error');
      expect(activities[0].detail).toBe('undefined reference');
    });

    it('adds timestamp', () => {
      const before = Date.now();
      pushActivity('play');
      const after = Date.now();
      const activity = getRecentActivities()[0];
      expect(activity.ts).toBeGreaterThanOrEqual(before);
      expect(activity.ts).toBeLessThanOrEqual(after);
    });

    it('defaults detail to empty string', () => {
      pushActivity('play');
      const activity = getRecentActivities()[0];
      expect(activity.detail).toBe('');
    });

    it('truncates detail to 120 chars', () => {
      const longDetail = 'x'.repeat(200);
      pushActivity('event', longDetail);
      const activity = getRecentActivities()[0];
      expect(activity.detail.length).toBe(120);
    });

    it('converts non-string detail to string', () => {
      pushActivity('event', 42);
      const activity = getRecentActivities()[0];
      expect(activity.detail).toBe('42');
    });

    it('handles object detail gracefully', () => {
      pushActivity('event', { key: 'val' });
      const activity = getRecentActivities()[0];
      expect(typeof activity.detail).toBe('string');
    });

    it('caps buffer at 20 entries', () => {
      for (let i = 0; i < 25; i++) {
        pushActivity(`event-${i}`);
      }
      const all = getRecentActivities(25);
      expect(all.length).toBe(20);
    });

    it('drops oldest when over limit', () => {
      for (let i = 0; i < 22; i++) {
        pushActivity(`event-${i}`);
      }
      const all = getRecentActivities(25);
      expect(all[0].type).toBe('event-2');
    });
  });

  describe('getRecentActivities', () => {
    it('returns empty array when buffer is empty', () => {
      expect(getRecentActivities()).toEqual([]);
    });

    it('returns last n activities', () => {
      pushActivity('a');
      pushActivity('b');
      pushActivity('c');
      const result = getRecentActivities(2);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('b');
      expect(result[1].type).toBe('c');
    });

    it('defaults n to 5', () => {
      for (let i = 0; i < 8; i++) pushActivity(`e${i}`);
      expect(getRecentActivities()).toHaveLength(5);
    });

    it('returns all if fewer than n', () => {
      pushActivity('only');
      expect(getRecentActivities(10)).toHaveLength(1);
    });

    it('returns activities in chronological order', () => {
      pushActivity('first');
      pushActivity('second');
      const result = getRecentActivities(2);
      expect(result[0].type).toBe('first');
      expect(result[1].type).toBe('second');
    });
  });

  describe('formatForContext', () => {
    it('returns empty string when buffer is empty', () => {
      expect(formatForContext()).toBe('');
    });

    it('returns ATTIVITÀ RECENTE header', () => {
      pushActivity('play');
      const ctx = formatForContext();
      expect(ctx).toContain('[ATTIVITÀ RECENTE]');
    });

    it('includes activity type in output', () => {
      pushActivity('compile_error', 'syntax error');
      const ctx = formatForContext();
      expect(ctx).toContain('compile_error');
      expect(ctx).toContain('syntax error');
    });

    it('formats timestamp as HH:MM:SS', () => {
      pushActivity('play');
      const ctx = formatForContext();
      expect(ctx).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
    });

    it('numbers activities starting from 1', () => {
      pushActivity('a');
      pushActivity('b');
      const ctx = formatForContext(2);
      expect(ctx).toContain('1.');
      expect(ctx).toContain('2.');
    });

    it('omits colon when detail is empty', () => {
      pushActivity('play');
      const ctx = formatForContext();
      expect(ctx).not.toContain('play:');
    });

    it('includes colon separator between type and detail', () => {
      pushActivity('compile', 'error msg');
      const ctx = formatForContext();
      expect(ctx).toContain('compile: error msg');
    });

    it('limits output to n activities', () => {
      for (let i = 0; i < 10; i++) pushActivity(`ev${i}`);
      const ctx = formatForContext(3);
      const lines = ctx.split('\n').filter(l => l.match(/^\d+\./));
      expect(lines).toHaveLength(3);
    });
  });

  describe('window.__ELAB_ACTIVITY', () => {
    it('is exposed on window', () => {
      expect(window.__ELAB_ACTIVITY).toBeDefined();
    });

    it('pushActivity works via window', () => {
      window.__ELAB_ACTIVITY.pushActivity('window-test');
      const result = getRecentActivities(1);
      expect(result[0].type).toBe('window-test');
    });

    it('exposes all expected methods', () => {
      expect(typeof window.__ELAB_ACTIVITY.pushActivity).toBe('function');
      expect(typeof window.__ELAB_ACTIVITY.getRecentActivities).toBe('function');
      expect(typeof window.__ELAB_ACTIVITY.formatForContext).toBe('function');
      expect(typeof window.__ELAB_ACTIVITY.clearActivities).toBe('function');
    });
  });
});
