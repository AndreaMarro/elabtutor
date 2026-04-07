/**
 * Tests for sessionMetrics.js
 * Pure module-level state tracking for UNLIM context awareness.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackExperimentLoad,
  trackCompilation,
  trackInteraction,
  formatForContext,
  resetMetrics,
  sessionMetrics,
} from '../../src/services/sessionMetrics.js';

describe('sessionMetrics', () => {
  beforeEach(() => {
    resetMetrics();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-07T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('resetMetrics', () => {
    it('clears experimentStart', () => {
      trackExperimentLoad('exp-1');
      resetMetrics();
      expect(formatForContext()).toBe('');
    });

    it('resets compilationAttempts and failures', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(false);
      trackCompilation(false);
      resetMetrics();
      trackExperimentLoad('exp-2');
      const ctx = formatForContext();
      expect(ctx).not.toContain('compilazioni');
    });
  });

  describe('trackExperimentLoad', () => {
    it('sets experiment start time', () => {
      trackExperimentLoad('exp-abc');
      const ctx = formatForContext();
      expect(ctx).toContain('[METRICHE]');
      expect(ctx).toContain('esperimento=0min');
    });

    it('resets compilation counters on new experiment', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(false);
      trackCompilation(false);
      trackExperimentLoad('exp-2');
      const ctx = formatForContext();
      expect(ctx).not.toContain('compilazioni');
    });

    it('updates experimentId', () => {
      trackExperimentLoad('my-exp');
      const ctx = formatForContext();
      expect(ctx).toContain('[METRICHE]');
    });
  });

  describe('trackCompilation', () => {
    it('increments attempts on success', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(true);
      const ctx = formatForContext();
      expect(ctx).toContain('compilazioni=1');
    });

    it('increments attempts and failures on failure', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(false);
      const ctx = formatForContext();
      expect(ctx).toContain('compilazioni=1');
      expect(ctx).toContain('fallite=1');
    });

    it('tracks multiple compilations', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(true);
      trackCompilation(false);
      trackCompilation(true);
      const ctx = formatForContext();
      expect(ctx).toContain('compilazioni=3');
      expect(ctx).toContain('fallite=1');
    });

    it('does not include fallite when all compilations succeed', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(true);
      trackCompilation(true);
      const ctx = formatForContext();
      expect(ctx).toContain('compilazioni=2');
      expect(ctx).not.toContain('fallite');
    });

    it('tracks last interaction time', () => {
      trackExperimentLoad('exp-1');
      vi.advanceTimersByTime(40000); // 40 seconds idle
      trackCompilation(true);
      const ctx = formatForContext();
      // After trackCompilation, lastInteraction updated → not idle
      expect(ctx).not.toContain('inattivo');
    });
  });

  describe('trackInteraction', () => {
    it('updates lastInteraction to reset idle timer', () => {
      trackExperimentLoad('exp-1');
      vi.advanceTimersByTime(40000); // would be idle
      trackInteraction();
      const ctx = formatForContext();
      expect(ctx).not.toContain('inattivo');
    });
  });

  describe('formatForContext', () => {
    it('returns empty string when no experiment loaded', () => {
      expect(formatForContext()).toBe('');
    });

    it('returns METRICHE prefix', () => {
      trackExperimentLoad('exp-1');
      const ctx = formatForContext();
      expect(ctx).toMatch(/^\[METRICHE\]/);
    });

    it('includes session duration in minutes', () => {
      trackExperimentLoad('exp-1');
      vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      const ctx = formatForContext();
      // sessionStart is module-level (set at import time), just verify format
      expect(ctx).toMatch(/sessione=\d+min/);
    });

    it('includes experiment duration in minutes', () => {
      trackExperimentLoad('exp-1');
      vi.advanceTimersByTime(3 * 60 * 1000); // 3 minutes
      const ctx = formatForContext();
      expect(ctx).toContain('esperimento=3min');
    });

    it('shows inattivo when idle > 30 seconds', () => {
      trackExperimentLoad('exp-1');
      vi.advanceTimersByTime(31000); // 31s idle
      const ctx = formatForContext();
      expect(ctx).toContain('inattivo=31s');
    });

    it('does not show inattivo when idle <= 30 seconds', () => {
      trackExperimentLoad('exp-1');
      vi.advanceTimersByTime(15000); // 15s idle
      const ctx = formatForContext();
      expect(ctx).not.toContain('inattivo');
    });

    it('includes all parts together', () => {
      trackExperimentLoad('exp-1');
      trackCompilation(true);
      trackCompilation(false);
      vi.advanceTimersByTime(60000); // 1 min
      const ctx = formatForContext();
      expect(ctx).toContain('sessione=');
      expect(ctx).toContain('esperimento=');
      expect(ctx).toContain('compilazioni=2');
      expect(ctx).toContain('fallite=1');
    });
  });

  describe('sessionMetrics object', () => {
    it('exposes trackExperimentLoad', () => {
      expect(typeof sessionMetrics.trackExperimentLoad).toBe('function');
    });

    it('exposes trackCompilation', () => {
      expect(typeof sessionMetrics.trackCompilation).toBe('function');
    });

    it('exposes trackInteraction', () => {
      expect(typeof sessionMetrics.trackInteraction).toBe('function');
    });

    it('exposes formatForContext', () => {
      expect(typeof sessionMetrics.formatForContext).toBe('function');
    });

    it('exposes resetMetrics', () => {
      expect(typeof sessionMetrics.resetMetrics).toBe('function');
    });

    it('delegates formatForContext correctly', () => {
      trackExperimentLoad('exp-1');
      expect(sessionMetrics.formatForContext()).toContain('[METRICHE]');
    });
  });

  describe('window.__ELAB_METRICS', () => {
    it('is exposed on window', () => {
      expect(window.__ELAB_METRICS).toBeDefined();
    });

    it('has all expected methods', () => {
      expect(typeof window.__ELAB_METRICS.trackExperimentLoad).toBe('function');
      expect(typeof window.__ELAB_METRICS.trackCompilation).toBe('function');
      expect(typeof window.__ELAB_METRICS.formatForContext).toBe('function');
    });
  });
});
