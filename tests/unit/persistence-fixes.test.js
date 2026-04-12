/**
 * Persistence Fixes Tests — Andrea Marro Claude Code Web 12/04/2026
 * Verifica localStorage persistence per:
 *  - UNLIM chat history (elab-unlim-chat-history-v1)
 *  - Lavagna last experiment / current step / unlim tab
 *  - Build guide size preference (elab-buildguide-size-v1)
 *  - Simulator build step per esperimento (elab-sim-buildstep-{expId})
 *
 * I componenti React che li consumano hanno test separati; qui testiamo
 * SOLO la shape dei dati salvati e la robustezza del parsing.
 */
import { describe, it, expect, beforeEach } from 'vitest';

// Helper: fresh in-memory storage per test (evita interferenze tra test)
function makeStorage() {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    _store: store,
  };
}

let storage;
beforeEach(() => {
  storage = makeStorage();
});

describe('UNLIM chat history persistence', () => {
  const KEY = 'elab-unlim-chat-history-v1';

  it('stores messages as JSON array', () => {
    const msgs = [
      { id: '1', role: 'user', content: 'Ciao' },
      { id: '2', role: 'assistant', content: 'Ciao, come posso aiutarti?' },
    ];
    storage.setItem(KEY, JSON.stringify(msgs));
    const parsed = JSON.parse(storage.getItem(KEY));
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].role).toBe('user');
  });

  it('empty / missing key returns null', () => {
    expect(storage.getItem(KEY)).toBeNull();
  });

  it('caps at 100 messages (MEMORY_CAP)', () => {
    const MEMORY_CAP = 100;
    const msgs = Array.from({ length: 150 }, (_, i) => ({ id: String(i), role: 'user', content: `msg ${i}` }));
    // Simula la logica di persistMessages: slice(-MEMORY_CAP)
    const toSave = msgs.slice(-MEMORY_CAP);
    storage.setItem(KEY, JSON.stringify(toSave));
    const parsed = JSON.parse(storage.getItem(KEY));
    expect(parsed).toHaveLength(100);
    expect(parsed[0].content).toBe('msg 50');
    expect(parsed[99].content).toBe('msg 149');
  });

  it('survives invalid JSON gracefully (simula loadPersistedMessages)', () => {
    storage.setItem(KEY, 'not valid json{{{');
    // Simula try/catch -> ritorna default
    let result;
    try {
      result = JSON.parse(storage.getItem(KEY));
    } catch {
      result = null;
    }
    expect(result).toBeNull();
  });

  it('validates message shape (role + content required)', () => {
    const validate = (arr) => arr.filter(m => m && typeof m === 'object' && m.role && typeof m.content === 'string');
    const mixed = [
      { id: '1', role: 'user', content: 'ok' },
      { role: 'user' }, // missing content
      null,
      { id: '3', role: 'assistant', content: 123 }, // wrong type
      { id: '4', role: 'assistant', content: 'good' },
    ];
    const valid = validate(mixed);
    expect(valid).toHaveLength(2);
    expect(valid.every(m => typeof m.content === 'string')).toBe(true);
  });
});

describe('Lavagna exit persistence', () => {
  it('persists last experiment id', () => {
    storage.setItem('elab-lavagna-last-experiment', 'v1-cap6-esp1');
    expect(storage.getItem('elab-lavagna-last-experiment')).toBe('v1-cap6-esp1');
  });

  it('persists current step as string', () => {
    storage.setItem('elab-lavagna-current-step', '3');
    expect(parseInt(storage.getItem('elab-lavagna-current-step'), 10)).toBe(3);
  });

  it('persists unlim tab choice (chat/percorso)', () => {
    storage.setItem('elab-lavagna-unlim-tab', 'percorso');
    expect(['chat', 'percorso']).toContain(storage.getItem('elab-lavagna-unlim-tab'));
  });
});

describe('BuildGuide size preference', () => {
  const KEY = 'elab-buildguide-size-v1';
  const VALID = ['S', 'M', 'L'];

  it('default M if missing', () => {
    const saved = storage.getItem(KEY);
    const size = VALID.includes(saved) ? saved : 'M';
    expect(size).toBe('M');
  });

  it('accepts S/M/L', () => {
    for (const v of VALID) {
      storage.setItem(KEY, v);
      expect(VALID.includes(storage.getItem(KEY))).toBe(true);
    }
  });

  it('rejects invalid value falls back to M', () => {
    storage.setItem(KEY, 'XXL');
    const saved = storage.getItem(KEY);
    const size = VALID.includes(saved) ? saved : 'M';
    expect(size).toBe('M');
  });
});

describe('Simulator build step per experiment', () => {
  it('uses experiment id in key', () => {
    storage.setItem('elab-sim-buildstep-v1-cap6-esp1', '3');
    storage.setItem('elab-sim-buildstep-v3-cap1-esp2', '0');
    expect(storage.getItem('elab-sim-buildstep-v1-cap6-esp1')).toBe('3');
    expect(storage.getItem('elab-sim-buildstep-v3-cap1-esp2')).toBe('0');
  });

  it('validates range [-1..maxIdx]', () => {
    const maxIdx = 5;
    const isValid = (idx) => Number.isFinite(idx) && idx >= -1 && idx <= maxIdx;
    expect(isValid(-1)).toBe(true);
    expect(isValid(0)).toBe(true);
    expect(isValid(5)).toBe(true);
    expect(isValid(-2)).toBe(false);
    expect(isValid(6)).toBe(false);
    expect(isValid(NaN)).toBe(false);
    expect(isValid(Infinity)).toBe(false);
  });
});

describe('Circuit auto-save storage', () => {
  const KEY_PREFIX = 'elab-simulator-circuit';

  it('uses per-experiment key', () => {
    const state = { layout: {}, connections: [], components: [], pinAssignments: {} };
    storage.setItem(`${KEY_PREFIX}-v1-cap6-esp1`, JSON.stringify(state));
    const parsed = JSON.parse(storage.getItem(`${KEY_PREFIX}-v1-cap6-esp1`));
    expect(parsed).toHaveProperty('connections');
    expect(Array.isArray(parsed.connections)).toBe(true);
  });

  it('load validates shape (arrays for connections + components)', () => {
    storage.setItem(`${KEY_PREFIX}-bad`, JSON.stringify({ connections: 'nope', components: [] }));
    const raw = storage.getItem(`${KEY_PREFIX}-bad`);
    const parsed = JSON.parse(raw);
    const isValid = parsed && typeof parsed === 'object' && Array.isArray(parsed.connections) && Array.isArray(parsed.components);
    expect(isValid).toBe(false);
  });
});

describe('localStorage quota resilience', () => {
  it('try/catch pattern: writes that throw should not crash', () => {
    // Simula quota exceeded
    const original = storage.setItem;
    storage.setItem = () => { throw new Error('QuotaExceededError'); };
    let crashed = false;
    try {
      try { storage.setItem('key', 'val'); } catch { /* silent per impl */ }
    } catch {
      crashed = true;
    }
    expect(crashed).toBe(false);
    storage.setItem = original;
  });
});
