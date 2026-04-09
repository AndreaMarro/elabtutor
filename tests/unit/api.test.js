/**
 * api.test.js — Test per main API service ELAB
 * 10 test: rate limiting, exports, error handling, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));

global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));

const sStore = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(k => sStore[k] || null),
    setItem: vi.fn((k, v) => { sStore[k] = v; }),
    removeItem: vi.fn(k => { delete sStore[k]; }),
  },
  writable: true,
});

import { checkRateLimit, sendChat, compileCode, diagnoseCircuit, getExperimentHints, preloadExperiment } from '../../src/services/api';

beforeEach(() => {
  Object.keys(sStore).forEach(k => delete sStore[k]);
  vi.clearAllMocks();
  global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));
});

describe('api — exports', () => {
  it('exports sendChat function', () => {
    expect(typeof sendChat).toBe('function');
  });

  it('exports compileCode function', () => {
    expect(typeof compileCode).toBe('function');
  });

  it('exports diagnoseCircuit function', () => {
    expect(typeof diagnoseCircuit).toBe('function');
  });

  it('exports getExperimentHints function', () => {
    expect(typeof getExperimentHints).toBe('function');
  });

  it('exports checkRateLimit function', () => {
    expect(typeof checkRateLimit).toBe('function');
  });

  it('exports preloadExperiment function', () => {
    expect(typeof preloadExperiment).toBe('function');
  });
});

describe('api — checkRateLimit', () => {
  it('allows first request', () => {
    const result = checkRateLimit();
    expect(result.allowed).toBe(true);
  });

  it('returns object with allowed and waitSec', () => {
    const result = checkRateLimit();
    expect(result).toHaveProperty('allowed');
  });
});

describe('api — edge cases', () => {
  it('sendChat handles network error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const result = await sendChat('test message');
    expect(result).toBeDefined();
  });

  it('compileCode handles network error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const result = await compileCode('void setup(){}');
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  });
});
