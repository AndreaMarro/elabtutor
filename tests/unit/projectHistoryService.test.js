/**
 * projectHistoryService — Unit Tests
 * Verifica snapshot, timeline, getStory, listProjects, deleteProject
 * (c) ELAB Worker Run 11 — 2026-04-07
 */

import { describe, test, expect, beforeEach } from 'vitest';

// In-memory store for localStorage mock
const store = {};
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  localStorage.getItem.mockImplementation(k => store[k] ?? null);
  localStorage.setItem.mockImplementation((k, v) => { store[k] = String(v); });
  localStorage.removeItem.mockImplementation(k => { delete store[k]; });
  localStorage.clear.mockImplementation(() => { Object.keys(store).forEach(k => delete store[k]); });
});

import projectHistoryService from '../../src/services/projectHistoryService';

const HISTORY_KEY = 'elab_project_history';

// ─── saveSnapshot ─────────────────────────────────────────────────────────────
describe('saveSnapshot', () => {
  test('creates a new project when projectId does not exist', () => {
    projectHistoryService.saveSnapshot('proj-led', {
      code: 'void loop() {}',
      note: 'primo salvataggio',
      experimentId: 'v1-cap6-esp1',
      volume: 1,
      chapter: 6,
    });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-led']).toBeDefined();
    expect(data['proj-led'].experimentId).toBe('v1-cap6-esp1');
    expect(data['proj-led'].volume).toBe(1);
    expect(data['proj-led'].chapter).toBe(6);
  });

  test('snapshot has correct code and note', () => {
    projectHistoryService.saveSnapshot('proj-led', {
      code: 'int x = 0;',
      note: 'test note',
    });
    const data = JSON.parse(store[HISTORY_KEY]);
    const snap = data['proj-led'].snapshots[0];
    expect(snap.code).toBe('int x = 0;');
    expect(snap.note).toBe('test note');
  });

  test('snapshot has an id starting with snap_', () => {
    projectHistoryService.saveSnapshot('proj-led', { code: 'a', note: '' });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-led'].snapshots[0].id).toMatch(/^snap_/);
  });

  test('snapshot has a timestamp', () => {
    projectHistoryService.saveSnapshot('proj-led', { code: 'a', note: '' });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-led'].snapshots[0].timestamp).toBeTruthy();
  });

  test('linesChanged for first snapshot equals number of code lines', () => {
    projectHistoryService.saveSnapshot('proj-led', {
      code: 'line1\nline2\nline3',
      note: '',
    });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-led'].snapshots[0].linesChanged).toBe(3);
  });

  test('adds second snapshot to existing project', () => {
    projectHistoryService.saveSnapshot('proj-led', { code: 'v1', note: '' });
    projectHistoryService.saveSnapshot('proj-led', { code: 'v2', note: '' });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-led'].snapshots).toHaveLength(2);
  });

  test('returns the updated project object', () => {
    const result = projectHistoryService.saveSnapshot('proj-led', {
      code: 'abc',
      note: 'first',
    });
    expect(result).toBeDefined();
    expect(result.snapshots).toHaveLength(1);
  });

  test('handles missing code gracefully (defaults to empty string)', () => {
    expect(() =>
      projectHistoryService.saveSnapshot('proj-led', { note: 'no code' })
    ).not.toThrow();
  });

  test('project without volume/chapter stores null', () => {
    projectHistoryService.saveSnapshot('proj-minimal', { code: 'x', note: '' });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-minimal'].volume).toBeNull();
    expect(data['proj-minimal'].chapter).toBeNull();
  });

  test('project has creato timestamp', () => {
    projectHistoryService.saveSnapshot('proj-ts', { code: 'a', note: '' });
    const data = JSON.parse(store[HISTORY_KEY]);
    expect(data['proj-ts'].creato).toBeTruthy();
  });
});

// ─── getTimeline ──────────────────────────────────────────────────────────────
describe('getTimeline', () => {
  test('returns empty array for unknown project', () => {
    expect(projectHistoryService.getTimeline('nonexistent')).toEqual([]);
  });

  test('returns snapshots after saveSnapshot', () => {
    projectHistoryService.saveSnapshot('proj-led', { code: 'v1', note: '' });
    projectHistoryService.saveSnapshot('proj-led', { code: 'v2', note: '' });
    const timeline = projectHistoryService.getTimeline('proj-led');
    expect(timeline).toHaveLength(2);
  });

  test('returns snapshots in insertion order', () => {
    projectHistoryService.saveSnapshot('proj-led', { code: 'first', note: '' });
    projectHistoryService.saveSnapshot('proj-led', { code: 'second', note: '' });
    const timeline = projectHistoryService.getTimeline('proj-led');
    expect(timeline[0].code).toBe('first');
    expect(timeline[1].code).toBe('second');
  });
});

// ─── getProject ───────────────────────────────────────────────────────────────
describe('getProject', () => {
  test('returns null for nonexistent project', () => {
    expect(projectHistoryService.getProject('nope')).toBeNull();
  });

  test('returns project object after save', () => {
    projectHistoryService.saveSnapshot('proj-led', {
      code: 'a',
      note: '',
      experimentId: 'v1-cap6-esp1',
    });
    const p = projectHistoryService.getProject('proj-led');
    expect(p).not.toBeNull();
    expect(p.experimentId).toBe('v1-cap6-esp1');
  });
});

// ─── listProjects ─────────────────────────────────────────────────────────────
describe('listProjects', () => {
  test('returns empty array when no projects saved', () => {
    expect(projectHistoryService.listProjects()).toEqual([]);
  });

  test('returns one entry per project', () => {
    projectHistoryService.saveSnapshot('p1', { code: 'a', note: '' });
    projectHistoryService.saveSnapshot('p2', { code: 'b', note: '' });
    const list = projectHistoryService.listProjects();
    expect(list).toHaveLength(2);
  });

  test('each entry has id, snapshotCount, ultimoSnapshot', () => {
    projectHistoryService.saveSnapshot('p1', { code: 'a', note: '' });
    const list = projectHistoryService.listProjects();
    expect(list[0].id).toBe('p1');
    expect(list[0].snapshotCount).toBe(1);
    expect(list[0].ultimoSnapshot).toBeTruthy();
  });
});

// ─── deleteProject ────────────────────────────────────────────────────────────
describe('deleteProject', () => {
  test('removes project from storage', () => {
    projectHistoryService.saveSnapshot('proj-del', { code: 'a', note: '' });
    projectHistoryService.deleteProject('proj-del');
    expect(projectHistoryService.getProject('proj-del')).toBeNull();
  });

  test('deleteProject for nonexistent project does not throw', () => {
    expect(() => projectHistoryService.deleteProject('ghost')).not.toThrow();
  });

  test('other projects remain after deletion', () => {
    projectHistoryService.saveSnapshot('p1', { code: 'a', note: '' });
    projectHistoryService.saveSnapshot('p2', { code: 'b', note: '' });
    projectHistoryService.deleteProject('p1');
    expect(projectHistoryService.getProject('p2')).not.toBeNull();
  });
});

// ─── getStory ────────────────────────────────────────────────────────────────
describe('getStory', () => {
  test('returns null for nonexistent project', () => {
    expect(projectHistoryService.getStory('ghost')).toBeNull();
  });

  test('returns null for project with 0 snapshots (edge case via direct store)', () => {
    // simulate empty project in store
    const projects = { 'empty-proj': { snapshots: [] } };
    localStorage.getItem.mockImplementation(k =>
      k === HISTORY_KEY ? JSON.stringify(projects) : null
    );
    expect(projectHistoryService.getStory('empty-proj')).toBeNull();
  });

  test('story contains project id', () => {
    projectHistoryService.saveSnapshot('my-proj', { code: 'line1\nline2', note: '' });
    const story = projectHistoryService.getStory('my-proj');
    expect(story).toContain('my-proj');
  });

  test('story mentions salvataggio/salvataggi', () => {
    projectHistoryService.saveSnapshot('my-proj', { code: 'a', note: '' });
    const story = projectHistoryService.getStory('my-proj');
    expect(story).toMatch(/salvataggio/);
  });

  test('story contains volume label when volume provided', () => {
    projectHistoryService.saveSnapshot('proj-vol', {
      code: 'x',
      note: '',
      volume: 2,
      chapter: 3,
    });
    const story = projectHistoryService.getStory('proj-vol');
    expect(story).toContain('Volume 2');
  });

  test('story includes notes when present', () => {
    projectHistoryService.saveSnapshot('proj-note', {
      code: 'x',
      note: 'bella nota',
    });
    const story = projectHistoryService.getStory('proj-note');
    expect(story).toContain('bella nota');
  });

  test('story mentions perseveranza for >= 5 snapshots', () => {
    for (let i = 0; i < 5; i++) {
      projectHistoryService.saveSnapshot('proj-many', { code: `v${i}`, note: '' });
    }
    const story = projectHistoryService.getStory('proj-many');
    expect(story).toContain('perseveranza');
  });

  test('story mentions passo for 2-4 snapshots', () => {
    projectHistoryService.saveSnapshot('proj-few', { code: 'a', note: '' });
    projectHistoryService.saveSnapshot('proj-few', { code: 'b', note: '' });
    const story = projectHistoryService.getStory('proj-few');
    expect(story).toContain('passo');
  });
});
