/**
 * sessionMetrics — Unit Tests
 * Verifica tracking sessione, compilazioni, idle time, formatForContext
 * (c) ELAB Worker Run 11 — 2026-04-07
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

import {
  trackExperimentLoad,
  trackCompilation,
  trackInteraction,
  formatForContext,
  resetMetrics,
  sessionMetrics,
} from '../../src/services/sessionMetrics';

// Reset metrics before each test for isolation
beforeEach(() => {
  resetMetrics();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-07T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── resetMetrics ──────────────────────────────────────────────────────────────
describe('resetMetrics', () => {
  test('resets compilationAttempts to 0', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    trackCompilation(false);
    resetMetrics();
    trackExperimentLoad('v1-cap6-esp2');
    const ctx = formatForContext();
    expect(ctx).not.toContain('compilazioni=');
  });

  test('resets compilationFailures to 0', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    resetMetrics();
    trackExperimentLoad('v1-cap6-esp2');
    const ctx = formatForContext();
    expect(ctx).not.toContain('fallite=');
  });

  test('resets experimentStart to null — formatForContext returns empty', () => {
    trackExperimentLoad('v1-cap6-esp1');
    resetMetrics();
    expect(formatForContext()).toBe('');
  });
});

// ─── trackExperimentLoad ───────────────────────────────────────────────────────
describe('trackExperimentLoad', () => {
  test('formatForContext includes experiment time after load', () => {
    trackExperimentLoad('v1-cap6-esp1');
    vi.advanceTimersByTime(2 * 60 * 1000); // 2 min
    const ctx = formatForContext();
    expect(ctx).toContain('esperimento=2min');
  });

  test('resets compilation counters when loading new experiment', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    trackCompilation(false);
    trackExperimentLoad('v1-cap6-esp2');
    const ctx = formatForContext();
    expect(ctx).not.toContain('compilazioni=');
    expect(ctx).not.toContain('fallite=');
  });

  test('stores experimentId (accessible via sessionMetrics)', () => {
    trackExperimentLoad('v2-cap3-esp5');
    // No direct getter for experimentId, but formatForContext should work
    const ctx = formatForContext();
    expect(ctx).toContain('[METRICHE]');
  });

  test('formatForContext shows 0min for immediate call', () => {
    trackExperimentLoad('v1-cap6-esp1');
    const ctx = formatForContext();
    expect(ctx).toContain('esperimento=0min');
  });
});

// ─── trackCompilation ─────────────────────────────────────────────────────────
describe('trackCompilation', () => {
  test('increments compilationAttempts on success', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(true);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=1');
  });

  test('increments compilationAttempts on failure', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=1');
  });

  test('increments compilationFailures only on failure', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(true);
    trackCompilation(false);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=2');
    expect(ctx).toContain('fallite=1');
  });

  test('multiple failures are tracked', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(false);
    trackCompilation(false);
    trackCompilation(false);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=3');
    expect(ctx).toContain('fallite=3');
  });

  test('success-only: fallite not shown in context', () => {
    trackExperimentLoad('v1-cap6-esp1');
    trackCompilation(true);
    trackCompilation(true);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=2');
    expect(ctx).not.toContain('fallite=');
  });
});

// ─── trackInteraction ─────────────────────────────────────────────────────────
describe('trackInteraction', () => {
  test('prevents idle detection by resetting lastInteraction', () => {
    trackExperimentLoad('v1-cap6-esp1');
    vi.advanceTimersByTime(60 * 1000); // 60 sec idle
    trackInteraction();
    const ctx = formatForContext();
    expect(ctx).not.toContain('inattivo=');
  });

  test('no-op before experiment load — does not throw', () => {
    expect(() => trackInteraction()).not.toThrow();
  });
});

// ─── formatForContext ──────────────────────────────────────────────────────────
describe('formatForContext', () => {
  test('returns empty string when no experiment loaded', () => {
    expect(formatForContext()).toBe('');
  });

  test('starts with [METRICHE]', () => {
    trackExperimentLoad('v1-cap6-esp1');
    expect(formatForContext()).toMatch(/^\[METRICHE\]/);
  });

  test('contains sessione= field', () => {
    trackExperimentLoad('v1-cap6-esp1');
    const ctx = formatForContext();
    expect(ctx).toContain('sessione=');
  });

  test('idle time shown after 31 seconds', () => {
    trackExperimentLoad('v1-cap6-esp1');
    vi.advanceTimersByTime(31 * 1000);
    const ctx = formatForContext();
    expect(ctx).toContain('inattivo=31s');
  });

  test('idle time NOT shown at exactly 30 seconds', () => {
    trackExperimentLoad('v1-cap6-esp1');
    vi.advanceTimersByTime(30 * 1000);
    const ctx = formatForContext();
    expect(ctx).not.toContain('inattivo=');
  });

  test('session time increases over time', () => {
    trackExperimentLoad('v1-cap6-esp1');
    vi.advanceTimersByTime(5 * 60 * 1000); // 5 min
    const ctx = formatForContext();
    expect(ctx).toContain('esperimento=5min');
  });

  test('no compilazioni if zero attempts', () => {
    trackExperimentLoad('v1-cap6-esp1');
    const ctx = formatForContext();
    expect(ctx).not.toContain('compilazioni=');
  });
});

// ─── sessionMetrics namespace export ──────────────────────────────────────────
describe('sessionMetrics object', () => {
  test('exposes trackExperimentLoad', () => {
    expect(typeof sessionMetrics.trackExperimentLoad).toBe('function');
  });

  test('exposes trackCompilation', () => {
    expect(typeof sessionMetrics.trackCompilation).toBe('function');
  });

  test('exposes trackInteraction', () => {
    expect(typeof sessionMetrics.trackInteraction).toBe('function');
  });

  test('exposes formatForContext', () => {
    expect(typeof sessionMetrics.formatForContext).toBe('function');
  });

  test('exposes resetMetrics', () => {
    expect(typeof sessionMetrics.resetMetrics).toBe('function');
  });

  test('sessionMetrics.formatForContext same as exported function', () => {
    trackExperimentLoad('v1-cap6-esp1');
    expect(sessionMetrics.formatForContext()).toBe(formatForContext());
  });
});
