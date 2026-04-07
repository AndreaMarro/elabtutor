/**
 * activityBuffer — Unit Tests
 * Verifica pushActivity, getRecentActivities, formatForContext, clearActivities
 * (c) ELAB Worker Run 11 — 2026-04-07
 */

import { describe, test, expect, beforeEach } from 'vitest';

import {
  pushActivity,
  getRecentActivities,
  formatForContext,
  clearActivities,
} from '../../src/services/activityBuffer';

beforeEach(() => {
  clearActivities();
});

// ─── pushActivity ─────────────────────────────────────────────────────────────
describe('pushActivity', () => {
  test('adds an activity to the buffer', () => {
    pushActivity('compile_error', 'undefined');
    expect(getRecentActivities(10)).toHaveLength(1);
  });

  test('stored activity has correct type', () => {
    pushActivity('component_added', 'led');
    const acts = getRecentActivities(1);
    expect(acts[0].type).toBe('component_added');
  });

  test('stored activity has correct detail', () => {
    pushActivity('tab_switch', 'simulator');
    expect(getRecentActivities(1)[0].detail).toBe('simulator');
  });

  test('detail defaults to empty string when omitted', () => {
    pushActivity('play');
    expect(getRecentActivities(1)[0].detail).toBe('');
  });

  test('detail is truncated at 120 chars', () => {
    const longDetail = 'x'.repeat(200);
    pushActivity('test', longDetail);
    expect(getRecentActivities(1)[0].detail).toHaveLength(120);
  });

  test('buffer max size is 20 (old entries discarded)', () => {
    for (let i = 0; i < 25; i++) pushActivity(`event_${i}`);
    expect(getRecentActivities(100)).toHaveLength(20);
  });

  test('most recent entry is preserved after overflow', () => {
    for (let i = 0; i < 25; i++) pushActivity(`event_${i}`);
    const acts = getRecentActivities(20);
    expect(acts[acts.length - 1].type).toBe('event_24');
  });

  test('numeric detail is converted to string', () => {
    pushActivity('count', 42);
    expect(typeof getRecentActivities(1)[0].detail).toBe('string');
  });
});

// ─── getRecentActivities ──────────────────────────────────────────────────────
describe('getRecentActivities', () => {
  test('returns empty array when buffer is empty', () => {
    expect(getRecentActivities()).toEqual([]);
  });

  test('default n=5 returns last 5', () => {
    for (let i = 0; i < 8; i++) pushActivity(`e${i}`);
    expect(getRecentActivities()).toHaveLength(5);
  });

  test('returns all entries when n > buffer size', () => {
    pushActivity('a');
    pushActivity('b');
    expect(getRecentActivities(100)).toHaveLength(2);
  });

  test('returns activities in chronological order (oldest first)', () => {
    pushActivity('first');
    pushActivity('second');
    const acts = getRecentActivities(2);
    expect(acts[0].type).toBe('first');
    expect(acts[1].type).toBe('second');
  });

  test('each activity has ts (timestamp)', () => {
    pushActivity('test');
    const act = getRecentActivities(1)[0];
    expect(typeof act.ts).toBe('number');
    expect(act.ts).toBeGreaterThan(0);
  });
});

// ─── clearActivities ─────────────────────────────────────────────────────────
describe('clearActivities', () => {
  test('empties the buffer', () => {
    pushActivity('a');
    pushActivity('b');
    clearActivities();
    expect(getRecentActivities(100)).toHaveLength(0);
  });

  test('buffer can be used after clear', () => {
    pushActivity('before');
    clearActivities();
    pushActivity('after');
    expect(getRecentActivities(1)[0].type).toBe('after');
  });
});

// ─── formatForContext ─────────────────────────────────────────────────────────
describe('formatForContext', () => {
  test('returns empty string when buffer is empty', () => {
    expect(formatForContext()).toBe('');
  });

  test('starts with [ATTIVITÀ RECENTE]', () => {
    pushActivity('compile_error', 'some error');
    expect(formatForContext()).toMatch(/^\[ATTIVITÀ RECENTE\]/);
  });

  test('contains the activity type', () => {
    pushActivity('component_added', 'led');
    expect(formatForContext()).toContain('component_added');
  });

  test('contains the detail', () => {
    pushActivity('tab_switch', 'simulator');
    expect(formatForContext()).toContain('simulator');
  });

  test('shows line number (1.)', () => {
    pushActivity('play');
    expect(formatForContext()).toContain('1.');
  });

  test('shows timestamp in HH:MM:SS format', () => {
    pushActivity('compile');
    expect(formatForContext()).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  test('respects n parameter', () => {
    for (let i = 0; i < 10; i++) pushActivity(`e${i}`);
    const ctx = formatForContext(3);
    const lines = ctx.split('\n');
    // Header + 3 activity lines
    expect(lines).toHaveLength(4);
  });

  test('activity without detail shows just type', () => {
    pushActivity('play');
    const ctx = formatForContext();
    expect(ctx).not.toContain(': \n');
  });
});
