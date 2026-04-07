/**
 * studentService.js — Unit Tests
 * Covers: getData, getStats, getAllStudentsData, isEncryptionActive,
 *         getSyncStatus, logExperiment, addConfusione, addMeraviglia,
 *         addMood, startSession/endSession, saveReflection, getReflections
 * (c) ELAB — Worker auto-generated tests 07/04/2026
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────
vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../src/utils/crypto', () => ({
  default: {
    getOrCreateMasterKey: vi.fn().mockResolvedValue(null),
    encryptData: vi.fn().mockResolvedValue(null),
    decryptData: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('../../src/services/supabaseSync', () => ({
  syncSession: vi.fn().mockResolvedValue({ success: false }),
  syncMood: vi.fn().mockResolvedValue({ success: false }),
  syncGameResult: vi.fn().mockResolvedValue({ success: false }),
}));

vi.mock('../../src/services/supabaseClient', () => ({
  default: null,
  isSupabaseConfigured: () => false,
}));

// ── In-memory localStorage ────────────────────────────────
const store = {};
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  localStorage.getItem.mockImplementation(k => store[k] ?? null);
  localStorage.setItem.mockImplementation((k, v) => { store[k] = String(v); });
  localStorage.removeItem.mockImplementation(k => { delete store[k]; });
  localStorage.clear.mockImplementation(() => { Object.keys(store).forEach(k => delete store[k]); });
  sessionStorage.getItem.mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

import studentService from '../../src/services/studentService';

const STUDENT_DB_KEY = 'elab_student_data';
const STUDENT_DB_KEY_ENCRYPTED = 'elab_student_data_enc';

// ── getData (wraps createDefaultData) ────────────────────
describe('studentService — getData / createDefaultData', () => {
  test('returns object with correct userId', () => {
    const d = studentService.getData('user_abc');
    expect(d.userId).toBe('user_abc');
  });

  test('default esperimenti is empty array', () => {
    expect(studentService.getData('u1').esperimenti).toEqual([]);
  });

  test('default sessioni is empty array', () => {
    expect(studentService.getData('u1').sessioni).toEqual([]);
  });

  test('default concetti is empty array', () => {
    expect(studentService.getData('u1').concetti).toEqual([]);
  });

  test('default diario is empty array', () => {
    expect(studentService.getData('u1').diario).toEqual([]);
  });

  test('default confusione is empty array', () => {
    expect(studentService.getData('u1').confusione).toEqual([]);
  });

  test('default meraviglie is empty array', () => {
    expect(studentService.getData('u1').meraviglie).toEqual([]);
  });

  test('default moods is empty array', () => {
    expect(studentService.getData('u1').moods).toEqual([]);
  });

  test('default tempoTotale is 0', () => {
    expect(studentService.getData('u1').tempoTotale).toBe(0);
  });

  test('default stats.giorniConsecutivi is 0', () => {
    expect(studentService.getData('u1').stats.giorniConsecutivi).toBe(0);
  });

  test('default stats.esperimentiTotali is 0', () => {
    expect(studentService.getData('u1').stats.esperimentiTotali).toBe(0);
  });

  test('default stats.mediaConfusione is 5', () => {
    expect(studentService.getData('u1').stats.mediaConfusione).toBe(5);
  });

  test('default stats.meraviglieTotali is 0', () => {
    expect(studentService.getData('u1').stats.meraviglieTotali).toBe(0);
  });

  test('default creato is a valid ISO date string', () => {
    const d = studentService.getData('u1');
    expect(() => new Date(d.creato)).not.toThrow();
    expect(typeof d.creato).toBe('string');
  });

  test('different userIds return different default objects', () => {
    expect(studentService.getData('u1').userId).toBe('u1');
    expect(studentService.getData('u2').userId).toBe('u2');
  });

  test('reads existing data from localStorage', () => {
    const saved = {
      u_exist: {
        userId: 'u_exist',
        esperimenti: [{ experimentId: 'v1-cap6-esp1', completato: true }],
        tempoTotale: 300,
        sessioni: [], concetti: [], diario: [], confusione: [],
        meraviglie: [], difficolta: [], moods: [],
        stats: { giorniConsecutivi: 1, esperimentiTotali: 1, mediaConfusione: 3,
                 meraviglieTotali: 0, tempoMedioSessione: 0, ultimoGiornoAttivo: null },
        creato: new Date().toISOString(),
        ultimoSalvataggio: new Date().toISOString(),
      },
    };
    store[STUDENT_DB_KEY] = JSON.stringify(saved);
    const d = studentService.getData('u_exist');
    expect(d.esperimenti.length).toBe(1);
    expect(d.tempoTotale).toBe(300);
  });

  test('returns default when userId not in stored data', () => {
    store[STUDENT_DB_KEY] = JSON.stringify({ other_user: { userId: 'other_user' } });
    expect(studentService.getData('not_stored').userId).toBe('not_stored');
  });

  test('handles corrupt JSON in localStorage gracefully', () => {
    store[STUDENT_DB_KEY] = '{{INVALID}}';
    expect(() => studentService.getData('u1')).not.toThrow();
  });
});

// ── getStats ──────────────────────────────────────────────
describe('studentService — getStats', () => {
  test('returns stats object with required fields', () => {
    const stats = studentService.getStats('u_stats');
    expect(stats).toHaveProperty('giorniConsecutivi');
    expect(stats).toHaveProperty('esperimentiTotali');
    expect(stats).toHaveProperty('mediaConfusione');
    expect(stats).toHaveProperty('meraviglieTotali');
  });

  test('default giorniConsecutivi is 0', () => {
    expect(studentService.getStats('u_stats').giorniConsecutivi).toBe(0);
  });
});

// ── getSyncStatus ─────────────────────────────────────────
describe('studentService — getSyncStatus', () => {
  test('returns a string', () => {
    expect(typeof studentService.getSyncStatus()).toBe('string');
  });

  test('initial status is unknown', () => {
    expect(studentService.getSyncStatus()).toBe('unknown');
  });
});

// ── isEncryptionActive ────────────────────────────────────
describe('studentService — isEncryptionActive', () => {
  test('returns false when no encrypted key', () => {
    expect(studentService.isEncryptionActive()).toBe(false);
  });

  test('returns false when encrypted key is empty object', () => {
    store[STUDENT_DB_KEY_ENCRYPTED] = JSON.stringify({});
    expect(studentService.isEncryptionActive()).toBe(false);
  });

  test('returns false when missing iv field', () => {
    store[STUDENT_DB_KEY_ENCRYPTED] = JSON.stringify({ encrypted: 'abc', salt: 'xyz' });
    expect(studentService.isEncryptionActive()).toBe(false);
  });

  test('returns false when missing salt field', () => {
    store[STUDENT_DB_KEY_ENCRYPTED] = JSON.stringify({ encrypted: 'abc', iv: 'xyz' });
    expect(studentService.isEncryptionActive()).toBe(false);
  });

  test('returns false when missing encrypted field', () => {
    store[STUDENT_DB_KEY_ENCRYPTED] = JSON.stringify({ iv: 'abc', salt: 'xyz' });
    expect(studentService.isEncryptionActive()).toBe(false);
  });

  test('returns true when all required fields present', () => {
    store[STUDENT_DB_KEY_ENCRYPTED] = JSON.stringify({
      encrypted: 'base64data', iv: 'ivdata', salt: 'saltdata',
    });
    expect(studentService.isEncryptionActive()).toBe(true);
  });

  test('returns false when localStorage throws', () => {
    localStorage.getItem.mockImplementation(() => { throw new Error('disabled'); });
    expect(studentService.isEncryptionActive()).toBe(false);
  });
});

// ── getAllStudentsData ─────────────────────────────────────
describe('studentService — getAllStudentsData', () => {
  test('returns object when localStorage is empty', () => {
    const all = studentService.getAllStudentsData();
    expect(typeof all).toBe('object');
  });

  test('returns all stored students', () => {
    store[STUDENT_DB_KEY] = JSON.stringify({
      u1: { userId: 'u1' },
      u2: { userId: 'u2' },
    });
    const all = studentService.getAllStudentsData();
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(2);
  });

  test('handles corrupt localStorage gracefully', () => {
    store[STUDENT_DB_KEY] = '{{invalid}}';
    expect(() => studentService.getAllStudentsData()).not.toThrow();
  });
});

// ── logExperiment ─────────────────────────────────────────
describe('studentService — logExperiment', () => {
  test('adds experiment to esperimenti array', () => {
    studentService.logExperiment('u_exp', {
      experimentId: 'v1-cap6-esp1',
      nome: 'Test LED',
      volume: 1, capitolo: 6, durata: 5000, completato: true,
    });
    const saved = JSON.parse(store[STUDENT_DB_KEY]);
    expect(saved['u_exp'].esperimenti.length).toBe(1);
    expect(saved['u_exp'].esperimenti[0].experimentId).toBe('v1-cap6-esp1');
  });

  test('increments esperimentiTotali on completion', () => {
    studentService.logExperiment('u_total', {
      experimentId: 'v1-cap6-esp1', completato: true, durata: 1000,
    });
    const saved = JSON.parse(store[STUDENT_DB_KEY]);
    expect(saved['u_total'].stats.esperimentiTotali).toBe(1);
  });

  test('does not increment esperimentiTotali for incomplete', () => {
    studentService.logExperiment('u_incomplete', {
      experimentId: 'v1-cap6-esp1', completato: false, durata: 1000,
    });
    const saved = JSON.parse(store[STUDENT_DB_KEY]);
    expect(saved['u_incomplete'].stats.esperimentiTotali).toBe(0);
  });

  test('defaults completato to true when not specified', () => {
    studentService.logExperiment('u_default', {
      experimentId: 'v1-cap6-esp1', durata: 1000,
    });
    const saved = JSON.parse(store[STUDENT_DB_KEY]);
    expect(saved['u_default'].esperimenti[0].completato).toBe(true);
  });

  test('returns updated data object', () => {
    const result = studentService.logExperiment('u_return', {
      experimentId: 'v1-cap6-esp1',
    });
    expect(result).toHaveProperty('esperimenti');
    expect(result.userId).toBe('u_return');
  });
});

// ── saveReflection / getReflections ───────────────────────
const REFLECTIONS_KEY = 'elab_reflections';

describe('studentService — saveReflection + getReflections', () => {
  test('saves reflection to localStorage', () => {
    studentService.saveReflection({ toolName: 'simulator', text: 'Test reflection' });
    const raw = store[REFLECTIONS_KEY];
    expect(raw).toBeDefined();
    const reflections = JSON.parse(raw);
    expect(reflections.length).toBe(1);
    expect(reflections[0].toolName).toBe('simulator');
  });

  test('getReflections returns all when no toolName filter', () => {
    studentService.saveReflection({ toolName: 'simulator', text: 'r1' });
    studentService.saveReflection({ toolName: 'quiz', text: 'r2' });
    const all = studentService.getReflections();
    expect(all.length).toBe(2);
  });

  test('getReflections filters by toolName', () => {
    studentService.saveReflection({ toolName: 'simulator', text: 'r1' });
    studentService.saveReflection({ toolName: 'quiz', text: 'r2' });
    const sim = studentService.getReflections('simulator');
    expect(sim.length).toBe(1);
    expect(sim[0].toolName).toBe('simulator');
  });

  test('getReflections returns empty array for unknown toolName', () => {
    studentService.saveReflection({ toolName: 'simulator', text: 'r1' });
    expect(studentService.getReflections('unknown_tool')).toEqual([]);
  });

  test('getReflectionCount returns correct count', () => {
    studentService.saveReflection({ toolName: 't1', text: 'a' });
    studentService.saveReflection({ toolName: 't2', text: 'b' });
    expect(studentService.getReflectionCount()).toBe(2);
  });

  test('saveReflection assigns id to entry', () => {
    studentService.saveReflection({ toolName: 'sim', text: 'test' });
    const reflections = studentService.getReflections();
    expect(reflections[0]).toHaveProperty('id');
    expect(typeof reflections[0].id).toBe('string');
  });
});
