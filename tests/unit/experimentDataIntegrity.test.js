/**
 * Experiment Data Integrity — Verifica integrità dati esperimenti
 * Ogni esperimento deve avere campi obbligatori e dati coerenti
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';

const vol1 = await import('../../src/data/experiments-vol1.js');
const vol2 = await import('../../src/data/experiments-vol2.js');
const vol3 = await import('../../src/data/experiments-vol3.js');

function getExperiments(mod) {
  const exp = mod.default || mod.experiments || [];
  if (Array.isArray(exp)) return exp;
  return Object.values(exp).flat().filter(e => e?.id);
}

function getAllMainExperiments() {
  const all = [...getExperiments(vol1), ...getExperiments(vol2), ...getExperiments(vol3)];
  return all.filter(e => e.id?.match(/^v\d-cap\d/));
}

describe('Experiment Data Integrity', () => {
  const experiments = getAllMainExperiments();

  test('at least 89 main experiments exist', () => {
    expect(experiments.length).toBeGreaterThanOrEqual(89);
  });

  test('every experiment has id, title, desc', () => {
    experiments.forEach(e => {
      expect(e.id, 'missing id').toBeTruthy();
      expect(e.title, `${e.id} missing title`).toBeTruthy();
      expect(e.desc || e.description, `${e.id} missing desc`).toBeTruthy();
    });
  });

  test('every experiment has chapter', () => {
    experiments.forEach(e => {
      expect(e.chapter, `${e.id} missing chapter`).toBeTruthy();
    });
  });

  test('every experiment has difficulty 1-3', () => {
    experiments.forEach(e => {
      expect(e.difficulty, `${e.id} missing difficulty`).toBeDefined();
      expect(e.difficulty).toBeGreaterThanOrEqual(1);
      expect(e.difficulty).toBeLessThanOrEqual(3);
    });
  });

  test('experiment IDs follow pattern v{N}-cap{N}-esp{N}', () => {
    experiments.forEach(e => {
      expect(e.id).toMatch(/^v[123]-cap\d+/);
    });
  });

  test('Vol1 experiments have v1 prefix', () => {
    const v1 = getExperiments(vol1).filter(e => e.id?.match(/^v\d-cap/));
    v1.forEach(e => {
      expect(e.id.startsWith('v1-'), `${e.id} in Vol1 but not v1- prefix`).toBe(true);
    });
  });

  test('Vol2 experiments have v2 prefix', () => {
    const v2 = getExperiments(vol2).filter(e => e.id?.match(/^v\d-cap/));
    v2.forEach(e => {
      expect(e.id.startsWith('v2-'), `${e.id} in Vol2 but not v2- prefix`).toBe(true);
    });
  });

  test('Vol3 experiments have v3 prefix', () => {
    const v3 = getExperiments(vol3).filter(e => e.id?.match(/^v\d-cap/));
    v3.forEach(e => {
      expect(e.id.startsWith('v3-'), `${e.id} in Vol3 but not v3- prefix`).toBe(true);
    });
  });

  test('no duplicate experiment IDs', () => {
    const ids = experiments.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('simulable field is boolean when present', () => {
    experiments.forEach(e => {
      if (e.simulable !== undefined) {
        expect(typeof e.simulable, `${e.id} simulable not boolean`).toBe('boolean');
      }
    });
  });

  test('simulableReason is string when simulable is false', () => {
    experiments.forEach(e => {
      if (e.simulable === false) {
        expect(e.simulableReason, `${e.id} false but no reason`).toBeTruthy();
        expect(typeof e.simulableReason).toBe('string');
      }
    });
  });
});

describe('Experiment Components', () => {
  const experiments = getAllMainExperiments();
  const withComponents = experiments.filter(e => e.components?.length > 0);

  test('most experiments have components', () => {
    expect(withComponents.length).toBeGreaterThan(60);
  });

  test('components have type and id', () => {
    withComponents.forEach(e => {
      e.components.forEach((c, i) => {
        expect(c.type, `${e.id} component ${i} missing type`).toBeTruthy();
        expect(c.id, `${e.id} component ${i} missing id`).toBeTruthy();
      });
    });
  });
});

describe('Experiment Connections', () => {
  const experiments = getAllMainExperiments();
  const withConnections = experiments.filter(e => e.connections?.length > 0);

  test('experiments with components have connections', () => {
    // Most experiments with components should have connections
    const withBoth = experiments.filter(e => e.components?.length > 1 && e.connections?.length > 0);
    expect(withBoth.length).toBeGreaterThan(40);
  });

  test('connections are arrays or objects', () => {
    withConnections.forEach(e => {
      e.connections.forEach((conn, i) => {
        // Connections can be [from, to] arrays or {from, to} objects
        const valid = Array.isArray(conn) || (typeof conn === 'object' && conn !== null);
        expect(valid, `${e.id} connection ${i} invalid type`).toBe(true);
      });
    });
  });
});
