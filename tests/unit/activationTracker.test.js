/**
 * Activation Tracker — Unit Tests
 * Tests: aha moment detection, weekly retention signal, idempotency, persistence
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Real in-memory localStorage for these tests
const store = {};
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  localStorage.getItem.mockImplementation(k => store[k] ?? null);
  localStorage.setItem.mockImplementation((k, v) => { store[k] = String(v); });
  localStorage.removeItem.mockImplementation(k => { delete store[k]; });
  localStorage.clear.mockImplementation(() => { Object.keys(store).forEach(k => delete store[k]); });
});

import activationTracker from '../../src/services/activationTracker';

describe('activationTracker — markExperimentCompleted', () => {
  test('first experiment is detected as aha moment', () => {
    const result = activationTracker.markExperimentCompleted('v1-cap6-esp1');
    expect(result.isFirstEver).toBe(true);
    expect(result.totalCompleted).toBe(1);
  });

  test('second experiment is NOT isFirstEver', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    const result = activationTracker.markExperimentCompleted('v1-cap7-esp1');
    expect(result.isFirstEver).toBe(false);
    expect(result.totalCompleted).toBe(2);
  });

  test('re-completing same experiment is idempotent (no duplicate in count)', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    const status = activationTracker.getActivationStatus();
    expect(status.totalCompleted).toBe(1);
  });

  test('re-completing same experiment does NOT count as weekly second', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    const result = activationTracker.markExperimentCompleted('v1-cap6-esp1');
    expect(result.isWeeklySecond).toBe(false);
  });

  test('second unique experiment in same week triggers retention signal', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    const result = activationTracker.markExperimentCompleted('v1-cap7-esp1');
    expect(result.isWeeklySecond).toBe(true);
  });

  test('third unique experiment does NOT trigger weekly second again', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    activationTracker.markExperimentCompleted('v1-cap7-esp1');
    const result = activationTracker.markExperimentCompleted('v1-cap8-esp1');
    expect(result.isWeeklySecond).toBe(false);
  });

  test('stores volume and chapter metadata', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1', { volume: 1, chapter: 6 });
    const entries = activationTracker.getCompletedExperiments();
    expect(entries[0].volume).toBe(1);
    expect(entries[0].chapter).toBe(6);
  });

  test('stores completedAt timestamp', () => {
    const before = Date.now();
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    const after = Date.now();
    const entries = activationTracker.getCompletedExperiments();
    expect(entries[0].completedAt).toBeGreaterThanOrEqual(before);
    expect(entries[0].completedAt).toBeLessThanOrEqual(after);
  });
});

describe('activationTracker — getActivationStatus', () => {
  test('empty state: no aha, no retention', () => {
    const status = activationTracker.getActivationStatus();
    expect(status.totalCompleted).toBe(0);
    expect(status.ahaAchieved).toBe(false);
    expect(status.weeklyRetentionAchieved).toBe(false);
    expect(status.firstCompletedAt).toBeNull();
    expect(status.firstExperimentId).toBeNull();
  });

  test('after first experiment: aha achieved', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    const status = activationTracker.getActivationStatus();
    expect(status.ahaAchieved).toBe(true);
    expect(status.firstExperimentId).toBe('v1-cap6-esp1');
    expect(status.firstCompletedAt).not.toBeNull();
  });

  test('after two unique experiments: weekly retention achieved', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    activationTracker.markExperimentCompleted('v1-cap7-esp1');
    const status = activationTracker.getActivationStatus();
    expect(status.weeklyRetentionAchieved).toBe(true);
    expect(status.totalCompleted).toBe(2);
  });
});

describe('activationTracker — getCompletedExperiments', () => {
  test('returns empty array when nothing completed', () => {
    expect(activationTracker.getCompletedExperiments()).toEqual([]);
  });

  test('returns all completed entries', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1', { volume: 1, chapter: 6 });
    activationTracker.markExperimentCompleted('v1-cap7-esp1', { volume: 1, chapter: 7 });
    const entries = activationTracker.getCompletedExperiments();
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.experimentId)).toEqual(['v1-cap6-esp1', 'v1-cap7-esp1']);
  });
});

describe('activationTracker — clearAll', () => {
  test('clears all data', () => {
    activationTracker.markExperimentCompleted('v1-cap6-esp1');
    activationTracker.clearAll();
    expect(activationTracker.getCompletedExperiments()).toEqual([]);
    expect(activationTracker.getActivationStatus().totalCompleted).toBe(0);
  });
});

describe('activationTracker — _getISOWeekStart', () => {
  test('Monday returns itself at midnight', () => {
    const monday = new Date('2026-04-06T14:30:00'); // Monday
    const weekStart = activationTracker._getISOWeekStart(monday);
    const d = new Date(weekStart);
    expect(d.getDay()).toBe(1); // Monday
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  test('Sunday returns previous Monday', () => {
    const sunday = new Date('2026-04-12T10:00:00'); // Sunday
    const weekStart = activationTracker._getISOWeekStart(sunday);
    const d = new Date(weekStart);
    expect(d.getDay()).toBe(1); // Monday
    expect(d.getDate()).toBe(6); // Mon April 6
  });

  test('Saturday returns same week Monday', () => {
    const saturday = new Date('2026-04-11T20:00:00'); // Saturday
    const weekStart = activationTracker._getISOWeekStart(saturday);
    const d = new Date(weekStart);
    expect(d.getDay()).toBe(1); // Monday
    expect(d.getDate()).toBe(6); // Mon April 6
  });
});

describe('activationTracker — weekly signal across weeks', () => {
  test('experiments from different weeks do not combine for weekly signal', () => {
    // Simulate first experiment last week
    const lastWeekTimestamp = Date.now() - 8 * 24 * 3600 * 1000; // 8 days ago

    // Manually inject an entry from last week
    const entries = [{
      experimentId: 'v1-cap6-esp1',
      volume: 1,
      chapter: 6,
      completedAt: lastWeekTimestamp,
      isFirstEver: true,
    }];
    localStorage.setItem.mockImplementation((k, v) => { store[k] = String(v); });
    store['elab_completed_experiments'] = JSON.stringify(entries);

    // Complete second experiment this week
    const result = activationTracker.markExperimentCompleted('v1-cap7-esp1');
    // Should NOT be weekly second because first was last week
    expect(result.isWeeklySecond).toBe(false);
  });
});
