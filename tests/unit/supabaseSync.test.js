/**
 * Supabase Sync + UNLIM Memory — Stress Test
 * Verifica: fallback localStorage, coda offline, limiti
 * Nota: localStorage is mocked in setup.js — tests use the mock system.
 * (c) Andrea Marro — 01/04/2026
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock supabaseClient — Supabase NOT configured
vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: () => false,
}));

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// Use a REAL in-memory localStorage for these tests
const store = {};
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  localStorage.getItem.mockImplementation(k => store[k] ?? null);
  localStorage.setItem.mockImplementation((k, v) => { store[k] = String(v); });
  localStorage.removeItem.mockImplementation(k => { delete store[k]; });
  localStorage.clear.mockImplementation(() => { Object.keys(store).forEach(k => delete store[k]); });
});

import {
  saveSession,
  loadSessions,
  saveProgress,
  loadProgress,
  saveConfusionReport,
  syncSession,
  syncMood,
} from '../../src/services/supabaseSync';

import { unlimMemory } from '../../src/services/unlimMemory';

describe('supabaseSync — offline fallback', () => {
  test('saveSession queues to localStorage when Supabase not configured', async () => {
    const session = {
      id: 'sess_test_1',
      experimentId: 'v1-cap6-esp1',
      startTime: '2026-04-01T10:00:00Z',
      endTime: '2026-04-01T10:30:00Z',
      messages: [{ role: 'user', text: 'Ciao' }],
      actions: [{ type: 'experiment_loaded', detail: 'v1-cap6-esp1' }],
      errors: [],
      summary: 'Test session',
    };
    const result = await saveSession(session);
    expect(result.success).toBe(false);
    expect(result.error).toContain('coda offline');

    const queue = JSON.parse(store['elab_sync_queue'] || '[]');
    expect(queue.length).toBe(1);
    expect(queue[0].table).toBe('student_sessions');
  });

  test('saveProgress queues when Supabase not configured', async () => {
    const result = await saveProgress('student1', 'v1-cap6-esp1', {
      completed: true,
      attempts: 2,
      bestScore: 80,
    });
    expect(result.success).toBe(false);

    const queue = JSON.parse(store['elab_sync_queue'] || '[]');
    expect(queue.some(q => q.table === 'student_progress')).toBe(true);
  });

  test('loadSessions falls back to localStorage', async () => {
    store['elab_unlim_sessions'] = JSON.stringify([
      { id: 's1', experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z' },
      { id: 's2', experimentId: 'v1-cap7-esp1', startTime: '2026-04-01T11:00:00Z' },
    ]);

    const result = await loadSessions();
    expect(result.length).toBe(2);
  });

  test('loadSessions filters by experimentId from localStorage', async () => {
    store['elab_unlim_sessions'] = JSON.stringify([
      { id: 's1', experimentId: 'v1-cap6-esp1' },
      { id: 's2', experimentId: 'v1-cap7-esp1' },
      { id: 's3', experimentId: 'v1-cap6-esp1' },
    ]);

    const result = await loadSessions(null, 'v1-cap6-esp1');
    expect(result.length).toBe(2);
  });

  test('loadProgress falls back to unlimMemory localStorage', async () => {
    store['elab_unlim_memory'] = JSON.stringify({
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 3, lastResult: 'success' },
        'v1-cap7-esp1': { completed: false, attempts: 1, lastResult: 'partial' },
      },
    });

    const result = await loadProgress('anyId');
    expect(result.length).toBe(2);
    expect(result.find(p => p.experiment_id === 'v1-cap6-esp1').completed).toBe(true);
  });

  test('saveConfusionReport queues when offline', async () => {
    await saveConfusionReport({
      experimentId: 'v1-cap6-esp1',
      conceptId: 'polarita',
      level: 7,
      context: 'LED collegato al contrario',
    });

    const queue = JSON.parse(store['elab_sync_queue'] || '[]');
    expect(queue.some(q => q.table === 'confusion_reports')).toBe(true);
  });

  test('syncSession queues when offline', async () => {
    await syncSession({
      student_id: 'test',
      experiment_id: 'v1-cap6-esp1',
      session_type: 'experiment',
    });

    const queue = JSON.parse(store['elab_sync_queue'] || '[]');
    expect(queue.some(q => q.table === 'student_sessions')).toBe(true);
  });

  test('syncMood queues when offline', async () => {
    await syncMood({
      student_id: 'test',
      mood: 'felice',
      context: 'Tutto bene',
    });

    const queue = JSON.parse(store['elab_sync_queue'] || '[]');
    expect(queue.some(q => q.table === 'mood_reports')).toBe(true);
  });

  test('queue is bounded to MAX_QUEUE_SIZE (200)', async () => {
    // Pre-fill queue directly to avoid 210 slow sequential async calls
    const prefilled = [];
    for (let i = 0; i < 195; i++) {
      prefilled.push({ table: 'student_sessions', data: { id: `pre_${i}` }, timestamp: Date.now() });
    }
    store['elab_sync_queue'] = JSON.stringify(prefilled);
    for (let i = 195; i < 210; i++) {
      await saveSession({
        id: `sess_${i}`,
        experimentId: `exp-${i}`,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        messages: [], actions: [], errors: [],
        summary: `Session ${i}`,
      });
    }

    const queue = JSON.parse(store['elab_sync_queue'] || '[]');
    expect(queue.length).toBeLessThanOrEqual(200);
    expect(queue.length).toBeGreaterThan(0);
  });
});

describe('unlimMemory — localStorage persistence', () => {
  test('trackExperimentCompletion persists to localStorage', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1', 'success');

    const stored = JSON.parse(store['elab_unlim_memory'] || '{}');
    expect(stored.experiments?.['v1-cap6-esp1']?.completed).toBe(true);
    expect(stored.experiments?.['v1-cap6-esp1']?.attempts).toBe(1);
  });

  test('trackMistake caps at MAX_MISTAKES (50)', () => {
    for (let i = 0; i < 60; i++) {
      unlimMemory.trackMistake('polarita', `mistake ${i}`);
    }

    const stored = JSON.parse(store['elab_unlim_memory'] || '{}');
    expect(stored.mistakes).toBeDefined();
    expect(stored.mistakes.length).toBeLessThanOrEqual(50);
  });

  test('saveSessionSummary caps at 10', () => {
    for (let i = 0; i < 15; i++) {
      unlimMemory.saveSessionSummary(`Summary ${i}`);
    }

    const stored = JSON.parse(store['elab_unlim_memory'] || '{}');
    expect(stored.sessionSummaries).toBeDefined();
    expect(stored.sessionSummaries.length).toBeLessThanOrEqual(10);
  });

  test('buildMemoryContext returns empty string when no data', () => {
    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toBe('');
  });

  test('buildMemoryContext includes completed experiments', () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    unlimMemory.trackExperimentCompletion('v1-cap7-esp1');

    const ctx = unlimMemory.buildMemoryContext();
    expect(ctx).toContain('Esperimenti completati: 2/69');
  });

  test('saveContext persists to localStorage', async () => {
    await unlimMemory.saveContext('class1', 'v1-cap6-esp1', {
      summary: 'LED con resistore',
      concepts_covered: ['circuito', 'LED', 'resistenza'],
    });

    const stored = JSON.parse(store['elab_lesson_contexts'] || '{}');
    expect(stored.class1).toBeDefined();
    expect(stored.class1.length).toBe(1);
    expect(stored.class1[0].experimentId).toBe('v1-cap6-esp1');
  });

  test('loadContext returns from localStorage', async () => {
    await unlimMemory.saveContext('class1', 'v1-cap6-esp1', { summary: 'LED' });
    await unlimMemory.saveContext('class1', 'v1-cap7-esp1', { summary: 'Resistore' });

    const contexts = await unlimMemory.loadContext('class1');
    expect(contexts.length).toBe(2);
    expect(contexts[0].experimentId).toBe('v1-cap7-esp1');
  });

  test('getLastLesson returns most recent', async () => {
    await unlimMemory.saveContext('class1', 'v1-cap6-esp1', { summary: 'LED' });
    await unlimMemory.saveContext('class1', 'v1-cap7-esp1', { summary: 'Resistore' });

    const last = await unlimMemory.getLastLesson('class1');
    expect(last).not.toBeNull();
    expect(last.experimentId).toBe('v1-cap7-esp1');
  });

  test('getProgress aggregates experiments from both tiers', async () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    await unlimMemory.saveContext('class1', 'v1-cap7-esp1', {
      concepts_covered: ['resistenza', 'ohm'],
    });

    const progress = await unlimMemory.getProgress('class1');
    expect(progress.completedExperiments).toContain('v1-cap6-esp1');
    expect(progress.completedExperiments).toContain('v1-cap7-esp1');
    expect(progress.conceptsAcquired).toContain('resistenza');
  });

  test('resetMemory clears both keys', async () => {
    unlimMemory.trackExperimentCompletion('v1-cap6-esp1');
    await unlimMemory.saveContext('class1', 'v1-cap6-esp1', { summary: 'test' });

    unlimMemory.resetMemory();

    expect(store['elab_unlim_memory']).toBeUndefined();
    expect(store['elab_lesson_contexts']).toBeUndefined();
  });
});
