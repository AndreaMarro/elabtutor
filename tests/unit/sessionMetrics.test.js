// ============================================
// ELAB Tutor - Tests for sessionMetrics.js
// Tracks session-level metrics for UNLIM context
// ============================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackExperimentLoad,
  trackCompilation,
  trackInteraction,
  formatForContext,
  resetMetrics,
  sessionMetrics,
} from '../../src/services/sessionMetrics.js';

// Reset state before each test
beforeEach(() => {
  resetMetrics();
});

// ──────────────────────────────────────────────
// resetMetrics
// ──────────────────────────────────────────────
describe('resetMetrics', () => {
  it('should reset metrics to initial state', () => {
    trackExperimentLoad('exp-001');
    trackCompilation(false);
    resetMetrics();

    // After reset, formatForContext should return empty (no experiment loaded)
    const ctx = formatForContext();
    expect(ctx).toBe('');
  });

  it('should allow calling reset multiple times without error', () => {
    expect(() => {
      resetMetrics();
      resetMetrics();
      resetMetrics();
    }).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// trackExperimentLoad
// ──────────────────────────────────────────────
describe('trackExperimentLoad', () => {
  it('should not throw when called with a valid experiment id', () => {
    expect(() => trackExperimentLoad('exp-001')).not.toThrow();
  });

  it('should not throw with null experiment id', () => {
    expect(() => trackExperimentLoad(null)).not.toThrow();
  });

  it('should not throw with undefined experiment id', () => {
    expect(() => trackExperimentLoad(undefined)).not.toThrow();
  });

  it('should cause formatForContext to return non-empty after load', () => {
    trackExperimentLoad('exp-002');
    const ctx = formatForContext();
    expect(ctx).not.toBe('');
  });

  it('should reset compilation counters on new experiment load', () => {
    trackExperimentLoad('exp-001');
    trackCompilation(false);
    trackCompilation(false);

    // Load new experiment — resets counters
    trackExperimentLoad('exp-002');

    const ctx = formatForContext();
    // Should not have compilazioni in output (0 attempts after reset)
    expect(ctx).not.toContain('compilazioni=');
  });

  it('should be callable with numeric id', () => {
    expect(() => trackExperimentLoad(42)).not.toThrow();
  });

  it('should be callable with string ids of various formats', () => {
    expect(() => trackExperimentLoad('exp-vol1-cap2-001')).not.toThrow();
    expect(() => trackExperimentLoad('LED_BLINK')).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// trackCompilation
// ──────────────────────────────────────────────
describe('trackCompilation', () => {
  beforeEach(() => {
    trackExperimentLoad('exp-test');
  });

  it('should not throw on successful compilation', () => {
    expect(() => trackCompilation(true)).not.toThrow();
  });

  it('should not throw on failed compilation', () => {
    expect(() => trackCompilation(false)).not.toThrow();
  });

  it('should show compilation count in context after tracking', () => {
    trackCompilation(true);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=1');
  });

  it('should track multiple compilations', () => {
    trackCompilation(true);
    trackCompilation(true);
    trackCompilation(false);
    const ctx = formatForContext();
    expect(ctx).toContain('compilazioni=3');
  });

  it('should track failed compilations separately', () => {
    trackCompilation(true);
    trackCompilation(false);
    trackCompilation(false);
    const ctx = formatForContext();
    expect(ctx).toContain('fallite=2');
  });

  it('should not show fallite if all compilations succeeded', () => {
    trackCompilation(true);
    trackCompilation(true);
    const ctx = formatForContext();
    expect(ctx).not.toContain('fallite=');
  });

  it('should not show compilazioni if count is 0', () => {
    // After experiment load, no compilations
    const ctx = formatForContext();
    expect(ctx).not.toContain('compilazioni=');
  });

  it('should handle calling without prior experiment load gracefully', () => {
    resetMetrics();
    expect(() => trackCompilation(true)).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// trackInteraction
// ──────────────────────────────────────────────
describe('trackInteraction', () => {
  it('should not throw', () => {
    expect(() => trackInteraction()).not.toThrow();
  });

  it('should be callable multiple times', () => {
    expect(() => {
      trackInteraction();
      trackInteraction();
      trackInteraction();
    }).not.toThrow();
  });

  it('should reset idle timer so inattivo is not shown immediately', () => {
    trackExperimentLoad('exp-001');
    trackInteraction();
    const ctx = formatForContext();
    // idle should be very small after interaction — no 'inattivo' expected
    expect(ctx).not.toContain('inattivo=');
  });
});

// ──────────────────────────────────────────────
// formatForContext
// ──────────────────────────────────────────────
describe('formatForContext', () => {
  it('should return empty string when no experiment is loaded', () => {
    const ctx = formatForContext();
    expect(ctx).toBe('');
  });

  it('should return string starting with [METRICHE] after experiment load', () => {
    trackExperimentLoad('exp-001');
    const ctx = formatForContext();
    expect(ctx).toMatch(/^\[METRICHE\]/);
  });

  it('should include sessione= in output', () => {
    trackExperimentLoad('exp-001');
    const ctx = formatForContext();
    expect(ctx).toContain('sessione=');
  });

  it('should include esperimento= in output', () => {
    trackExperimentLoad('exp-001');
    const ctx = formatForContext();
    expect(ctx).toContain('esperimento=');
  });

  it('should return a non-empty string with correct prefix format', () => {
    trackExperimentLoad('exp-001');
    const ctx = formatForContext();
    expect(typeof ctx).toBe('string');
    expect(ctx.startsWith('[METRICHE]')).toBe(true);
  });

  it('should show compilazioni when compilation tracked', () => {
    trackExperimentLoad('exp-001');
    trackCompilation(true);
    expect(formatForContext()).toContain('compilazioni=1');
  });

  it('should not throw on repeated calls', () => {
    trackExperimentLoad('exp-001');
    expect(() => {
      formatForContext();
      formatForContext();
      formatForContext();
    }).not.toThrow();
  });

  it('should return consistent results on repeated calls', () => {
    trackExperimentLoad('exp-001');
    const ctx1 = formatForContext();
    const ctx2 = formatForContext();
    // Both should start with [METRICHE]
    expect(ctx1.startsWith('[METRICHE]')).toBe(true);
    expect(ctx2.startsWith('[METRICHE]')).toBe(true);
  });
});

// ──────────────────────────────────────────────
// sessionMetrics object export
// ──────────────────────────────────────────────
describe('sessionMetrics object', () => {
  it('should export trackExperimentLoad function', () => {
    expect(typeof sessionMetrics.trackExperimentLoad).toBe('function');
  });

  it('should export trackCompilation function', () => {
    expect(typeof sessionMetrics.trackCompilation).toBe('function');
  });

  it('should export trackInteraction function', () => {
    expect(typeof sessionMetrics.trackInteraction).toBe('function');
  });

  it('should export formatForContext function', () => {
    expect(typeof sessionMetrics.formatForContext).toBe('function');
  });

  it('should export resetMetrics function', () => {
    expect(typeof sessionMetrics.resetMetrics).toBe('function');
  });

  it('should work via sessionMetrics.trackExperimentLoad', () => {
    sessionMetrics.resetMetrics();
    expect(() => sessionMetrics.trackExperimentLoad('exp-999')).not.toThrow();
    const ctx = sessionMetrics.formatForContext();
    expect(ctx).toContain('[METRICHE]');
  });

  it('should work via sessionMetrics.trackCompilation', () => {
    sessionMetrics.resetMetrics();
    sessionMetrics.trackExperimentLoad('exp-001');
    sessionMetrics.trackCompilation(false);
    const ctx = sessionMetrics.formatForContext();
    expect(ctx).toContain('fallite=1');
  });
});
