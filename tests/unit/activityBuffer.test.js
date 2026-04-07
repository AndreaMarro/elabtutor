// ============================================
// ELAB Tutor - Tests for activityBuffer.js
// Ring buffer for recent user activities (UNLIM context)
// ============================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  pushActivity,
  getRecentActivities,
  formatForContext,
  clearActivities,
} from '../../src/services/activityBuffer.js';

beforeEach(() => {
  clearActivities();
});

// ──────────────────────────────────────────────
// clearActivities
// ──────────────────────────────────────────────
describe('clearActivities', () => {
  it('should start with empty buffer after clear', () => {
    pushActivity('test', 'detail');
    clearActivities();
    expect(getRecentActivities()).toHaveLength(0);
  });

  it('should be safe to call multiple times', () => {
    expect(() => {
      clearActivities();
      clearActivities();
    }).not.toThrow();
  });

  it('should result in empty formatForContext after clear', () => {
    pushActivity('compile_error', 'some error');
    clearActivities();
    expect(formatForContext()).toBe('');
  });
});

// ──────────────────────────────────────────────
// pushActivity
// ──────────────────────────────────────────────
describe('pushActivity', () => {
  it('should not throw when pushing a valid activity', () => {
    expect(() => pushActivity('compile_error', 'undefined reference')).not.toThrow();
  });

  it('should not throw without detail argument', () => {
    expect(() => pushActivity('play')).not.toThrow();
  });

  it('should not throw with empty string detail', () => {
    expect(() => pushActivity('tab_switch', '')).not.toThrow();
  });

  it('should add one activity to buffer', () => {
    pushActivity('component_added', 'led (led-1)');
    expect(getRecentActivities()).toHaveLength(1);
  });

  it('should add multiple activities to buffer', () => {
    pushActivity('compile_error', 'error 1');
    pushActivity('play', '');
    pushActivity('compile_success', '');
    expect(getRecentActivities(10)).toHaveLength(3);
  });

  it('should store the correct type', () => {
    pushActivity('component_added', 'resistor');
    const activities = getRecentActivities();
    expect(activities[0].type).toBe('component_added');
  });

  it('should store the correct detail', () => {
    pushActivity('compile_error', 'missing semicolon');
    const activities = getRecentActivities();
    expect(activities[0].detail).toBe('missing semicolon');
  });

  it('should truncate detail to 120 chars', () => {
    const longDetail = 'a'.repeat(200);
    pushActivity('long_event', longDetail);
    const activities = getRecentActivities();
    expect(activities[0].detail.length).toBeLessThanOrEqual(120);
  });

  it('should store a timestamp', () => {
    const before = Date.now();
    pushActivity('test_event', 'detail');
    const after = Date.now();
    const activities = getRecentActivities();
    expect(activities[0].ts).toBeGreaterThanOrEqual(before);
    expect(activities[0].ts).toBeLessThanOrEqual(after);
  });

  it('should handle numeric detail by converting to string', () => {
    expect(() => pushActivity('score', 42)).not.toThrow();
    const activities = getRecentActivities();
    expect(typeof activities[0].detail).toBe('string');
  });

  it('should handle null detail gracefully', () => {
    expect(() => pushActivity('event', null)).not.toThrow();
  });

  it('should cap buffer at 20 activities', () => {
    for (let i = 0; i < 25; i++) {
      pushActivity('event_' + i, 'detail');
    }
    // Buffer should not exceed 20
    const all = getRecentActivities(30);
    expect(all.length).toBeLessThanOrEqual(20);
  });

  it('should keep the most recent activities when buffer overflows', () => {
    for (let i = 0; i < 25; i++) {
      pushActivity('event', String(i));
    }
    const all = getRecentActivities(20);
    // The last item should be event 24 (most recent)
    expect(all[all.length - 1].detail).toBe('24');
  });
});

// ──────────────────────────────────────────────
// getRecentActivities
// ──────────────────────────────────────────────
describe('getRecentActivities', () => {
  it('should return empty array when buffer is empty', () => {
    expect(getRecentActivities()).toEqual([]);
  });

  it('should return default 5 activities when no n specified', () => {
    for (let i = 0; i < 10; i++) {
      pushActivity('event', String(i));
    }
    expect(getRecentActivities()).toHaveLength(5);
  });

  it('should return the last n activities', () => {
    for (let i = 0; i < 10; i++) {
      pushActivity('event', String(i));
    }
    const last3 = getRecentActivities(3);
    expect(last3).toHaveLength(3);
    expect(last3[2].detail).toBe('9'); // most recent last
  });

  it('should return all activities if n exceeds buffer size', () => {
    pushActivity('a', '1');
    pushActivity('b', '2');
    const all = getRecentActivities(100);
    expect(all).toHaveLength(2);
  });

  it('should return activities in chronological order (oldest first)', () => {
    pushActivity('first', 'A');
    pushActivity('second', 'B');
    pushActivity('third', 'C');
    const activities = getRecentActivities(3);
    expect(activities[0].type).toBe('first');
    expect(activities[1].type).toBe('second');
    expect(activities[2].type).toBe('third');
  });

  it('should return correct structure for each activity', () => {
    pushActivity('compile_error', 'undefined variable');
    const activities = getRecentActivities(1);
    expect(activities[0]).toHaveProperty('type');
    expect(activities[0]).toHaveProperty('detail');
    expect(activities[0]).toHaveProperty('ts');
  });

  it('should handle n=1 by returning only the last 1 activity', () => {
    for (let i = 0; i < 5; i++) {
      pushActivity('event', String(i));
    }
    expect(getRecentActivities(1)).toHaveLength(1);
  });

  it('should handle n=1 correctly: only last activity returned', () => {
    pushActivity('first', 'A');
    pushActivity('second', 'B');
    const result = getRecentActivities(1);
    expect(result).toHaveLength(1);
    expect(result[0].detail).toBe('B');
  });
});

// ──────────────────────────────────────────────
// formatForContext
// ──────────────────────────────────────────────
describe('formatForContext', () => {
  it('should return empty string when buffer is empty', () => {
    expect(formatForContext()).toBe('');
  });

  it('should start with [ATTIVITÀ RECENTE] header', () => {
    pushActivity('compile_error', 'test error');
    const ctx = formatForContext();
    expect(ctx).toMatch(/^\[ATTIVITÀ RECENTE\]/);
  });

  it('should include activity type in output', () => {
    pushActivity('compile_error', 'undefined reference');
    const ctx = formatForContext();
    expect(ctx).toContain('compile_error');
  });

  it('should include activity detail in output', () => {
    pushActivity('compile_error', 'my error detail');
    const ctx = formatForContext();
    expect(ctx).toContain('my error detail');
  });

  it('should include timestamp in HH:MM:SS format', () => {
    pushActivity('play', '');
    const ctx = formatForContext();
    expect(ctx).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
  });

  it('should number activities starting from 1', () => {
    pushActivity('event_a', 'detail_a');
    pushActivity('event_b', 'detail_b');
    const ctx = formatForContext(2);
    expect(ctx).toContain('1.');
    expect(ctx).toContain('2.');
  });

  it('should limit to n activities in output', () => {
    for (let i = 0; i < 10; i++) {
      pushActivity('event', String(i));
    }
    const ctx = formatForContext(3);
    // Should have only 3 numbered entries
    const lines = ctx.split('\n');
    const numbered = lines.filter(l => /^\d+\./.test(l));
    expect(numbered).toHaveLength(3);
  });

  it('should handle activity without detail', () => {
    pushActivity('play');
    const ctx = formatForContext();
    expect(ctx).toContain('play');
    // Should not have ': ' for empty detail
    // The line should just be "1. [HH:MM:SS] play" with no colon after play
    expect(ctx).toMatch(/play(?!:)/);
  });

  it('should return formatted string for single activity', () => {
    pushActivity('tab_switch', 'breadboard');
    const ctx = formatForContext(1);
    expect(typeof ctx).toBe('string');
    expect(ctx.length).toBeGreaterThan(10);
  });

  it('should use default n=5 when called without args', () => {
    for (let i = 0; i < 10; i++) {
      pushActivity('event', String(i));
    }
    const ctx = formatForContext();
    const lines = ctx.split('\n');
    const numbered = lines.filter(l => /^\d+\./.test(l));
    expect(numbered).toHaveLength(5);
  });
});
