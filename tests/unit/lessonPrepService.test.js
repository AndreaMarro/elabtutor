/**
 * lessonPrepService — Tests for lesson preparation and command detection
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before import
vi.mock('../../src/data/lesson-paths', () => ({
  getLessonPath: vi.fn((id) => {
    if (id === 'v1-cap6-esp1') return {
      experiment_id: 'v1-cap6-esp1',
      title: 'Accendi il tuo primo LED',
      chapter_title: 'Cos\'e\' il diodo LED?',
      objective: 'Capire come funziona un LED',
      duration_minutes: 45,
      difficulty: 1,
      components_needed: ['led', 'resistor', 'breadboard'],
      vocabulary: { allowed: ['LED', 'resistenza', 'anodo', 'catodo'] },
      next_experiment: 'v1-cap6-esp2',
      phases: [
        { name: 'PREPARA', duration_minutes: 5, teacher_message: 'Preparate i componenti' },
        { name: 'MOSTRA', duration_minutes: 10, teacher_message: 'Guardate il circuito' },
        { name: 'CHIEDI', duration_minutes: 10, teacher_message: 'Perche\' serve la resistenza?' },
        { name: 'OSSERVA', duration_minutes: 15, teacher_message: 'Costruite il circuito' },
        { name: 'CONCLUDI', duration_minutes: 5, teacher_message: 'Cosa avete imparato?' },
      ],
    };
    return null;
  }),
}));

vi.mock('../../src/hooks/useSessionTracker', () => ({
  getSavedSessions: vi.fn(() => []),
}));

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ success: true, response: '{"gancio":"test"}' })),
}));

import { getLessonSummary, isLessonPrepCommand } from '../../src/services/lessonPrepService';
import { getSavedSessions } from '../../src/hooks/useSessionTracker';

beforeEach(() => {
  vi.clearAllMocks();
  getSavedSessions.mockReturnValue([]);
});

describe('lessonPrepService', () => {
  describe('isLessonPrepCommand', () => {
    it('detects "prepara la lezione"', () => {
      expect(isLessonPrepCommand('prepara la lezione')).toBe(true);
    });

    it('detects "pianifica lezione"', () => {
      expect(isLessonPrepCommand('pianifica lezione')).toBe(true);
    });

    it('detects "cosa faccio oggi"', () => {
      expect(isLessonPrepCommand('cosa faccio oggi')).toBe(true);
    });

    it('detects "cosa facciamo oggi"', () => {
      expect(isLessonPrepCommand('cosa facciamo oggi')).toBe(true);
    });

    it('detects "lezione di oggi"', () => {
      expect(isLessonPrepCommand('lezione di oggi')).toBe(true);
    });

    it('detects "preparami la lezione"', () => {
      expect(isLessonPrepCommand('preparami la lezione')).toBe(true);
    });

    it('detects "suggerisci una lezione"', () => {
      expect(isLessonPrepCommand('suggerisci una lezione')).toBe(true);
    });

    it('returns false for normal questions', () => {
      expect(isLessonPrepCommand('come funziona un LED?')).toBe(false);
      expect(isLessonPrepCommand('aiutami con il circuito')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isLessonPrepCommand(null)).toBe(false);
      expect(isLessonPrepCommand(undefined)).toBe(false);
      expect(isLessonPrepCommand('')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(isLessonPrepCommand('PREPARA LA LEZIONE')).toBe(true);
      expect(isLessonPrepCommand('Prepara La Lezione')).toBe(true);
    });
  });

  describe('getLessonSummary', () => {
    it('returns null for unknown experiment', () => {
      expect(getLessonSummary('nonexistent')).toBeNull();
    });

    it('returns complete summary for known experiment', () => {
      const summary = getLessonSummary('v1-cap6-esp1');
      expect(summary).not.toBeNull();
      expect(summary.title).toBe('Accendi il tuo primo LED');
      expect(summary.objective).toContain('LED');
      expect(summary.duration).toBe(45);
      expect(summary.difficulty).toBe(1);
    });

    it('includes phase list', () => {
      const summary = getLessonSummary('v1-cap6-esp1');
      expect(summary.phases).toHaveLength(5);
      expect(summary.phases[0].name).toBe('PREPARA');
      expect(summary.phases[4].name).toBe('CONCLUDI');
    });

    it('includes vocabulary', () => {
      const summary = getLessonSummary('v1-cap6-esp1');
      expect(summary.vocabulary.allowed).toContain('LED');
      expect(summary.vocabulary.allowed).toContain('resistenza');
    });

    it('marks as first time when no sessions', () => {
      getSavedSessions.mockReturnValue([]);
      const summary = getLessonSummary('v1-cap6-esp1');
      expect(summary.isFirstTime).toBe(true);
    });

    it('includes nextExperiment', () => {
      const summary = getLessonSummary('v1-cap6-esp1');
      expect(summary.nextExperiment).toBe('v1-cap6-esp2');
    });

    it('includes components needed', () => {
      const summary = getLessonSummary('v1-cap6-esp1');
      expect(summary.components).toContain('led');
      expect(summary.components).toContain('resistor');
    });
  });
});
