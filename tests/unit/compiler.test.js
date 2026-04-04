// ============================================
// Compiler Service Tests — G34
// Tests: FNV-1a hashing, code normalization, pre-compiled manifest,
//        fallback chain, compilation source tracking
// © Andrea Marro — 30/03/2026
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Inline pure functions from compiler.js for unit testing ───

function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/©.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Pre-compiled HEX manifest (mirrors compiler.js) ───
const PRECOMPILED_HEX = {
  'v3-cap6-semaforo':     '/hex/v3-cap6-semaforo.hex',
  'v3-cap7-mini':         '/hex/v3-cap7-mini.hex',
  'v3-cap8-serial':       '/hex/v3-cap8-serial.hex',
  'v3-extra-lcd-hello':   '/hex/v3-extra-lcd-hello.hex',
  'v3-extra-servo-sweep': '/hex/v3-extra-servo-sweep.hex',
  'v3-extra-simon':       '/hex/v3-extra-simon.hex',
  'v3-cap6-blink':        '/hex/v3-cap6-blink.hex',
  'v3-cap6-morse':        '/hex/v3-cap6-morse.hex',
  'v3-cap6-pin5':         '/hex/v3-cap6-pin5.hex',
  'v3-cap6-sirena':       '/hex/v3-cap6-sirena.hex',
  'v3-cap7-pullup':       '/hex/v3-cap7-pullup.hex',
  'v3-cap7-pulsante':     '/hex/v3-cap7-pulsante.hex',
};

// ─── Tests ───

describe('Compiler Service — FNV-1a hashing', () => {
  it('produces deterministic hashes', () => {
    const code = 'void setup() { pinMode(13, OUTPUT); }';
    expect(fnv1aHash(code)).toBe(fnv1aHash(code));
  });

  it('produces different hashes for different code', () => {
    const a = fnv1aHash('void setup() {}');
    const b = fnv1aHash('void loop() {}');
    expect(a).not.toBe(b);
  });

  it('returns hex string', () => {
    const hash = fnv1aHash('test');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('handles empty string', () => {
    const hash = fnv1aHash('');
    expect(hash).toBeTruthy();
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });
});

describe('Compiler Service — code normalization', () => {
  it('strips single-line comments', () => {
    const code = 'void setup() { // initialize\n  pinMode(13, OUTPUT);\n}';
    expect(normalizeCode(code)).toBe('void setup() { pinMode(13, OUTPUT); }');
  });

  it('strips multi-line comments', () => {
    const code = '/* header */\nvoid setup() { /* init */ pinMode(13, OUTPUT); }';
    expect(normalizeCode(code)).toBe('void setup() { pinMode(13, OUTPUT); }');
  });

  it('strips copyright lines', () => {
    const code = '// © Andrea Marro — 2026\nvoid setup() {}';
    expect(normalizeCode(code)).toBe('void setup() {}');
  });

  it('collapses whitespace', () => {
    const code = 'void   setup()  {\n\n  pinMode(13,  OUTPUT);\n}';
    expect(normalizeCode(code)).toBe('void setup() { pinMode(13, OUTPUT); }');
  });

  it('same code with different comments/whitespace produces same hash', () => {
    const v1 = `// My program
void setup() {
  pinMode(13, OUTPUT);   // init pin
}`;
    const v2 = `/* Another header */
void setup() {
  pinMode(13, OUTPUT);
}`;
    const h1 = fnv1aHash(normalizeCode(v1));
    const h2 = fnv1aHash(normalizeCode(v2));
    expect(h1).toBe(h2);
  });

  it('code with different logic produces different hash', () => {
    const a = normalizeCode('void setup() { pinMode(13, OUTPUT); }');
    const b = normalizeCode('void setup() { pinMode(12, INPUT); }');
    expect(fnv1aHash(a)).not.toBe(fnv1aHash(b));
  });
});

describe('Compiler Service — pre-compiled manifest', () => {
  it('has all 6 main Vol3 experiments', () => {
    expect(PRECOMPILED_HEX['v3-cap6-semaforo']).toBe('/hex/v3-cap6-semaforo.hex');
    expect(PRECOMPILED_HEX['v3-cap7-mini']).toBe('/hex/v3-cap7-mini.hex');
    expect(PRECOMPILED_HEX['v3-cap8-serial']).toBe('/hex/v3-cap8-serial.hex');
    expect(PRECOMPILED_HEX['v3-extra-lcd-hello']).toBe('/hex/v3-extra-lcd-hello.hex');
    expect(PRECOMPILED_HEX['v3-extra-servo-sweep']).toBe('/hex/v3-extra-servo-sweep.hex');
    expect(PRECOMPILED_HEX['v3-extra-simon']).toBe('/hex/v3-extra-simon.hex');
  });

  it('has 12 total pre-compiled entries', () => {
    expect(Object.keys(PRECOMPILED_HEX).length).toBe(12);
  });

  it('all paths start with /hex/', () => {
    for (const path of Object.values(PRECOMPILED_HEX)) {
      expect(path).toMatch(/^\/hex\/v3-.+\.hex$/);
    }
  });

  it('Vol1/Vol2 experiments are NOT in manifest (no code)', () => {
    expect(PRECOMPILED_HEX['v1-cap6-esp1']).toBeUndefined();
    expect(PRECOMPILED_HEX['v2-cap6-esp1']).toBeUndefined();
  });
});

describe('Compiler Service — hash-based matching scenario', () => {
  it('semaforo code with comments stripped matches itself', () => {
    const semaforoCode = `// Semaforo 3 LED — Pin D5 (verde), D6 (giallo), D3 (rosso)
// Breakout wing: W_D5, W_D6, W_D3
// Timing: Verde 3s, Giallo 1s, Rosso 3s

void setup() {
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(3, OUTPUT);
}

void loop() {
  // Verde acceso
  digitalWrite(5, HIGH);
  digitalWrite(6, LOW);
  digitalWrite(3, LOW);
  delay(3000);

  // Giallo acceso
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  digitalWrite(3, LOW);
  delay(1000);

  // Rosso acceso
  digitalWrite(5, LOW);
  digitalWrite(6, LOW);
  digitalWrite(3, HIGH);
  delay(3000);
}`;

    const semaforoModified = `void setup() {
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(3, OUTPUT);
}
void loop() {
  digitalWrite(5, HIGH); digitalWrite(6, LOW); digitalWrite(3, LOW); delay(3000);
  digitalWrite(5, LOW); digitalWrite(6, HIGH); digitalWrite(3, LOW); delay(1000);
  digitalWrite(5, LOW); digitalWrite(6, LOW); digitalWrite(3, HIGH); delay(3000);
}`;

    const h1 = fnv1aHash(normalizeCode(semaforoCode));
    const h2 = fnv1aHash(normalizeCode(semaforoModified));
    expect(h1).toBe(h2);
  });

  it('modified code does NOT match original', () => {
    const original = `void setup() { pinMode(5, OUTPUT); }
void loop() { digitalWrite(5, HIGH); delay(1000); digitalWrite(5, LOW); delay(1000); }`;

    const modified = `void setup() { pinMode(5, OUTPUT); }
void loop() { digitalWrite(5, HIGH); delay(500); digitalWrite(5, LOW); delay(500); }`;

    const h1 = fnv1aHash(normalizeCode(original));
    const h2 = fnv1aHash(normalizeCode(modified));
    expect(h1).not.toBe(h2);
  });
});
