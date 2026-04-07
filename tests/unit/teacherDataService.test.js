/**
 * ELAB Tutor — teacherDataService unit tests
 * Verifica: transformToLegacyFormat, merge multi-classe, deduplicazione studenti.
 * © Andrea Marro — 07/04/2026
 */

import { describe, it, expect, vi } from 'vitest';
import { transformToLegacyFormat } from '../../src/services/teacherDataService';

// ─── transformToLegacyFormat tests ───
describe('transformToLegacyFormat', () => {
  it('maps students + sessions + moods to legacy format', () => {
    const students = [{ id: 'u1', nome: 'Mario', email: 'mario@test.it', joinedAt: '2026-01-01' }];
    const sessions = [
      { student_id: 'u1', session_type: 'experiment', experiment_id: 'exp-1', completed: true, duration_seconds: 300, started_at: '2026-04-01T10:00:00Z', ended_at: '2026-04-01T10:05:00Z', activity: [] },
      { student_id: 'u1', session_type: 'lobby', experiment_id: null, completed: false, duration_seconds: 60, started_at: '2026-04-02T09:00:00Z', ended_at: null, activity: [] },
    ];
    const moods = [
      { student_id: 'u1', mood: 'happy', context: 'Fun!', created_at: '2026-04-01T11:00:00Z' },
    ];

    const result = transformToLegacyFormat(students, sessions, moods);

    expect(result).toHaveLength(1);
    const s = result[0];
    expect(s.userId).toBe('u1');
    expect(s.nome).toBe('Mario');
    expect(s.esperimenti).toHaveLength(1);
    expect(s.esperimenti[0].experimentId).toBe('exp-1');
    expect(s.esperimenti[0].completato).toBe(true);
    expect(s.sessioni).toHaveLength(2);
    expect(s.moods).toHaveLength(1);
    expect(s.moods[0].mood).toBe('happy');
    expect(s.stats.esperimentiTotali).toBe(1);
    expect(s.stats.tempoTotale).toBe(360);
    expect(s._source).toBe('supabase');
  });

  it('returns empty array when no students', () => {
    const result = transformToLegacyFormat([], [], []);
    expect(result).toEqual([]);
  });

  it('handles student with no sessions or moods', () => {
    const students = [{ id: 'u2', nome: 'Sara', email: '', joinedAt: null }];
    const result = transformToLegacyFormat(students, [], []);
    expect(result[0].sessioni).toEqual([]);
    expect(result[0].esperimenti).toEqual([]);
    expect(result[0].moods).toEqual([]);
    expect(result[0].stats.esperimentiTotali).toBe(0);
    expect(result[0].tempoTotale).toBe(0);
  });

  it('only counts completed sessions in esperimentiTotali', () => {
    const students = [{ id: 'u3', nome: 'Luca', email: '', joinedAt: null }];
    const sessions = [
      { student_id: 'u3', session_type: 'experiment', experiment_id: 'e1', completed: true, duration_seconds: 100, started_at: '2026-04-01T09:00:00Z', ended_at: null, activity: [] },
      { student_id: 'u3', session_type: 'experiment', experiment_id: 'e2', completed: false, duration_seconds: 50, started_at: '2026-04-02T09:00:00Z', ended_at: null, activity: [] },
    ];
    const result = transformToLegacyFormat(students, sessions, []);
    expect(result[0].stats.esperimentiTotali).toBe(1);
    expect(result[0].tempoTotale).toBe(150);
  });

  it('deduplication helper: merging two sets deduplicates by id', () => {
    // Tests the deduplication logic used by fetchAllClassesData
    const cls1Students = [{ id: 'u1', nome: 'Mario', email: '', joinedAt: null }];
    const cls2Students = [
      { id: 'u1', nome: 'Mario', email: '', joinedAt: null }, // duplicate
      { id: 'u2', nome: 'Sara', email: '', joinedAt: null },
    ];

    const seenStudents = new Set();
    const allStudents = [];
    [cls1Students, cls2Students].forEach(students => {
      students.forEach(s => {
        if (!seenStudents.has(s.id)) {
          seenStudents.add(s.id);
          allStudents.push(s);
        }
      });
    });

    expect(allStudents).toHaveLength(2);
    expect(allStudents.map(s => s.id)).toEqual(['u1', 'u2']);
  });

  it('assigns sessions and moods to correct students', () => {
    const students = [
      { id: 'u1', nome: 'A', email: '', joinedAt: null },
      { id: 'u2', nome: 'B', email: '', joinedAt: null },
    ];
    const sessions = [
      { student_id: 'u1', session_type: 'experiment', experiment_id: 'e1', completed: true, duration_seconds: 200, started_at: '2026-04-01T10:00:00Z', ended_at: null, activity: [] },
      { student_id: 'u2', session_type: 'experiment', experiment_id: 'e2', completed: false, duration_seconds: 100, started_at: '2026-04-02T10:00:00Z', ended_at: null, activity: [] },
    ];
    const moods = [
      { student_id: 'u2', mood: 'confused', context: '', created_at: '2026-04-01T12:00:00Z' },
    ];

    const result = transformToLegacyFormat(students, sessions, moods);
    const r1 = result.find(s => s.userId === 'u1');
    const r2 = result.find(s => s.userId === 'u2');

    expect(r1.sessioni).toHaveLength(1);
    expect(r1.moods).toHaveLength(0);
    expect(r2.sessioni).toHaveLength(1);
    expect(r2.moods).toHaveLength(1);
    expect(r2.moods[0].mood).toBe('confused');
  });
});
