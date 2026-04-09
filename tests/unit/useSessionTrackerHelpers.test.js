/**
 * useSessionTrackerHelpers.test.js — Test per session tracker helper functions
 * 8 test: getSavedSessions, getLastSession, loadSessions, saveSessions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../src/data/lesson-paths', () => ({
  getLessonPath: vi.fn(() => ({ title: 'Test', concepts_covered: [] })),
}));
vi.mock('../../src/services/supabaseSync', () => ({
  saveSession: vi.fn(() => Promise.resolve({ success: true })),
}));
vi.mock('../../src/services/gamificationService', () => ({
  default: { onExperimentCompleted: vi.fn(() => ({ total: 10, newBadges: [], streak: { current: 1 } })) },
}));

const store = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => store[k] || null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k => { delete store[k]; }),
  },
  writable: true,
});

import { getSavedSessions, getLastSession } from '../../src/hooks/useSessionTracker';

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('useSessionTracker — getSavedSessions', () => {
  it('returns empty array when no sessions', () => {
    expect(getSavedSessions()).toEqual([]);
  });

  it('returns sessions from localStorage', () => {
    store['elab_unlim_sessions'] = JSON.stringify([
      { experimentId: 'v1-cap1-esp1', messages: [] },
    ]);
    const sessions = getSavedSessions();
    expect(sessions.length).toBe(1);
    expect(sessions[0].experimentId).toBe('v1-cap1-esp1');
  });

  it('handles corrupted localStorage', () => {
    store['elab_unlim_sessions'] = 'NOT JSON';
    expect(getSavedSessions()).toEqual([]);
  });
});

describe('useSessionTracker — getLastSession', () => {
  it('returns null when no sessions', () => {
    expect(getLastSession()).toBeNull();
  });

  it('returns last session', () => {
    store['elab_unlim_sessions'] = JSON.stringify([
      { experimentId: 'v1-cap1-esp1' },
      { experimentId: 'v1-cap2-esp1' },
    ]);
    const last = getLastSession();
    expect(last.experimentId).toBe('v1-cap2-esp1');
  });

  it('returns null on corrupted data', () => {
    store['elab_unlim_sessions'] = 'BROKEN';
    expect(getLastSession()).toBeNull();
  });

  it('returns null on empty array', () => {
    store['elab_unlim_sessions'] = '[]';
    expect(getLastSession()).toBeNull();
  });

  it('returns session object with experimentId', () => {
    store['elab_unlim_sessions'] = JSON.stringify([{ experimentId: 'test' }]);
    const last = getLastSession();
    expect(last).toHaveProperty('experimentId');
  });
});
