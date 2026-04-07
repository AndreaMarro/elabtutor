// ============================================
// Lesson Prep Service Tests — G45
// Tests: isLessonPrepCommand, extractCommonMistakes, buildPastContext logic
// Pattern: inline pure functions for isolation
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Inline isLessonPrepCommand ────────────────────────────────

function isLessonPrepCommand(text) {
  if (!text) return false;
  const l = text.toLowerCase().trim();
  return [
    /^(prepara|pianifica|organizza)\s+(la\s+)?lezione/,
    /^(prepara|inizia)\s+(l'?esperimento|il\s+lab)/,
    /^(cosa|come)\s+(faccio|facciamo)\s+oggi/,
    /^(sugger|consiglia).*(lezione|esperimento)/,
    /^lezione\s+(di\s+)?oggi/,
    /^preparami la lezione/,
  ].some(p => p.test(l));
}

// ─── Inline extractCommonMistakes ─────────────────────────────

function extractCommonMistakes(sessions) {
  const mistakes = {};
  for (const s of sessions) {
    for (const err of (s.errors || [])) {
      const key = err.type || err.message?.slice(0, 40) || 'unknown';
      mistakes[key] = (mistakes[key] || 0) + 1;
    }
  }
  return Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v}x)`);
}

// ─── Inline buildPastContext logic ────────────────────────────

function buildPastContext(experimentId, sessions) {
  if (!sessions || sessions.length === 0) return null;

  const chapter = experimentId?.match(/v\d+-cap(\d+)/)?.[1];
  const relatedSessions = sessions.filter(s =>
    s.experimentId === experimentId ||
    (chapter && s.experimentId?.includes(`cap${chapter}`))
  ).slice(-5);

  if (relatedSessions.length === 0) return null;

  return {
    previousExperiments: relatedSessions.map(s => ({
      id: s.experimentId,
      completed: s.completed || false,
      errors: s.errors?.length || 0,
      duration: s.duration || 0,
      date: s.startTime,
    })),
    completedCount: relatedSessions.filter(s => s.completed).length,
    totalErrors: relatedSessions.reduce((sum, s) => sum + (s.errors?.length || 0), 0),
    commonMistakes: extractCommonMistakes(relatedSessions),
    lastSessionDate: relatedSessions[relatedSessions.length - 1]?.startTime,
  };
}

// ─── Tests: isLessonPrepCommand — null/empty ──────────────────

describe('isLessonPrepCommand — null and empty inputs', () => {
  it('returns false for null', () => {
    expect(isLessonPrepCommand(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isLessonPrepCommand(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isLessonPrepCommand('')).toBe(false);
  });

  it('returns false for whitespace only', () => {
    expect(isLessonPrepCommand('   ')).toBe(false);
  });
});

// ─── Tests: isLessonPrepCommand — prepara lezione ─────────────

describe('isLessonPrepCommand — prepara/pianifica/organizza lezione', () => {
  it('matches "prepara la lezione"', () => {
    expect(isLessonPrepCommand('Prepara la lezione')).toBe(true);
  });

  it('matches "prepara lezione" without la', () => {
    expect(isLessonPrepCommand('Prepara lezione')).toBe(true);
  });

  it('matches "pianifica la lezione"', () => {
    expect(isLessonPrepCommand('Pianifica la lezione di oggi')).toBe(true);
  });

  it('matches "organizza la lezione"', () => {
    expect(isLessonPrepCommand('Organizza la lezione')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isLessonPrepCommand('PREPARA LA LEZIONE')).toBe(true);
  });

  it('matches "preparami la lezione"', () => {
    expect(isLessonPrepCommand('Preparami la lezione')).toBe(true);
  });

  it('does not match unrelated lesson text', () => {
    expect(isLessonPrepCommand('La lezione è finita')).toBe(false);
  });
});

// ─── Tests: isLessonPrepCommand — esperimento/lab ─────────────

describe('isLessonPrepCommand — prepara/inizia esperimento/lab', () => {
  it('matches "prepara l\'esperimento"', () => {
    expect(isLessonPrepCommand("prepara l'esperimento")).toBe(true);
  });

  it('matches "prepara lesperimento" (no apostrophe)', () => {
    expect(isLessonPrepCommand('prepara lesperimento')).toBe(true);
  });

  it('matches "inizia l\'esperimento"', () => {
    expect(isLessonPrepCommand("inizia l'esperimento")).toBe(true);
  });

  it('matches "prepara il lab"', () => {
    expect(isLessonPrepCommand('prepara il lab')).toBe(true);
  });

  it('matches "inizia il lab"', () => {
    expect(isLessonPrepCommand('inizia il lab')).toBe(true);
  });
});

// ─── Tests: isLessonPrepCommand — cosa/come faccio ────────────

describe('isLessonPrepCommand — cosa/come faccio/facciamo oggi', () => {
  it('matches "cosa faccio oggi"', () => {
    expect(isLessonPrepCommand('cosa faccio oggi')).toBe(true);
  });

  it('matches "cosa facciamo oggi"', () => {
    expect(isLessonPrepCommand('cosa facciamo oggi')).toBe(true);
  });

  it('matches "come faccio oggi"', () => {
    expect(isLessonPrepCommand('come faccio oggi')).toBe(true);
  });

  it('matches "come facciamo oggi"', () => {
    expect(isLessonPrepCommand('come facciamo oggi')).toBe(true);
  });

  it('does not match "cosa faccio dopo"', () => {
    expect(isLessonPrepCommand('cosa faccio dopo')).toBe(false);
  });
});

// ─── Tests: isLessonPrepCommand — suggerisce/consiglia ────────

describe('isLessonPrepCommand — suggerisci/consiglia lezione/esperimento', () => {
  it('matches "suggeriscimi una lezione"', () => {
    expect(isLessonPrepCommand('suggeriscimi una lezione')).toBe(true);
  });

  it('matches "consigliami un esperimento"', () => {
    expect(isLessonPrepCommand('consigliami un esperimento')).toBe(true);
  });

  it('matches "suggerisci la lezione"', () => {
    expect(isLessonPrepCommand('suggerisci la lezione')).toBe(true);
  });

  it('does not match "suggerisci qualcosa"', () => {
    expect(isLessonPrepCommand('suggerisci qualcosa')).toBe(false);
  });
});

// ─── Tests: isLessonPrepCommand — lezione di oggi ─────────────

describe('isLessonPrepCommand — lezione oggi', () => {
  it('matches "lezione di oggi"', () => {
    expect(isLessonPrepCommand('lezione di oggi')).toBe(true);
  });

  it('matches "lezione oggi" without di', () => {
    expect(isLessonPrepCommand('lezione oggi')).toBe(true);
  });

  it('does not match "la lezione di ieri"', () => {
    expect(isLessonPrepCommand('la lezione di ieri')).toBe(false);
  });
});

// ─── Tests: isLessonPrepCommand — non-commands ────────────────

describe('isLessonPrepCommand — non-matching inputs', () => {
  it('does not match a random question', () => {
    expect(isLessonPrepCommand('Come funziona un LED?')).toBe(false);
  });

  it('does not match circuit question', () => {
    expect(isLessonPrepCommand('Perché il circuito non funziona?')).toBe(false);
  });

  it('does not match number only', () => {
    expect(isLessonPrepCommand('42')).toBe(false);
  });

  it('does not match greeting', () => {
    expect(isLessonPrepCommand('Ciao!')).toBe(false);
  });
});

// ─── Tests: extractCommonMistakes ─────────────────────────────

describe('extractCommonMistakes — basic functionality', () => {
  it('returns empty array when no sessions', () => {
    expect(extractCommonMistakes([])).toEqual([]);
  });

  it('returns empty array when sessions have no errors', () => {
    const sessions = [{ experimentId: 'v1-cap1', errors: [] }];
    expect(extractCommonMistakes(sessions)).toEqual([]);
  });

  it('counts errors by type', () => {
    const sessions = [
      { errors: [{ type: 'SHORT_CIRCUIT' }, { type: 'SHORT_CIRCUIT' }] },
    ];
    const result = extractCommonMistakes(sessions);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('SHORT_CIRCUIT (2x)');
  });

  it('sorts by frequency descending', () => {
    const sessions = [
      { errors: [{ type: 'B' }, { type: 'A' }, { type: 'A' }, { type: 'A' }] },
    ];
    const result = extractCommonMistakes(sessions);
    expect(result[0]).toContain('A');
    expect(result[1]).toContain('B');
  });

  it('limits to top 3 mistakes', () => {
    const sessions = [
      { errors: [
        { type: 'A' }, { type: 'A' },
        { type: 'B' }, { type: 'B' },
        { type: 'C' }, { type: 'C' },
        { type: 'D' },
      ] },
    ];
    const result = extractCommonMistakes(sessions);
    expect(result).toHaveLength(3);
  });

  it('uses message slice when no type', () => {
    const sessions = [
      { errors: [{ message: 'Pin configuration error in setup' }] },
    ];
    const result = extractCommonMistakes(sessions);
    expect(result[0]).toContain('Pin configuration error in setup');
  });

  it('uses unknown when no type or message', () => {
    const sessions = [{ errors: [{}] }];
    const result = extractCommonMistakes(sessions);
    expect(result[0]).toBe('unknown (1x)');
  });

  it('handles sessions with undefined errors', () => {
    const sessions = [{ experimentId: 'v1-cap1' }];
    expect(extractCommonMistakes(sessions)).toEqual([]);
  });

  it('aggregates errors across multiple sessions', () => {
    const sessions = [
      { errors: [{ type: 'LED_REVERSED' }] },
      { errors: [{ type: 'LED_REVERSED' }] },
      { errors: [{ type: 'LED_REVERSED' }] },
    ];
    const result = extractCommonMistakes(sessions);
    expect(result[0]).toBe('LED_REVERSED (3x)');
  });

  it('truncates message to 40 chars as key', () => {
    const longMsg = 'A'.repeat(50);
    const sessions = [{ errors: [{ message: longMsg }] }];
    const result = extractCommonMistakes(sessions);
    expect(result[0]).toContain('A'.repeat(40));
    expect(result[0]).not.toContain('A'.repeat(41));
  });
});

// ─── Tests: buildPastContext logic ────────────────────────────

describe('buildPastContext — session filtering', () => {
  it('returns null when sessions is null', () => {
    expect(buildPastContext('v1-cap1-blink', null)).toBeNull();
  });

  it('returns null when sessions is empty', () => {
    expect(buildPastContext('v1-cap1-blink', [])).toBeNull();
  });

  it('returns null when no related sessions found', () => {
    const sessions = [{ experimentId: 'v2-cap3-rgb' }];
    expect(buildPastContext('v1-cap1-blink', sessions)).toBeNull();
  });

  it('finds sessions matching exact experimentId', () => {
    const sessions = [{ experimentId: 'v1-cap1-blink', completed: true, errors: [], startTime: '2026-01-01' }];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result).not.toBeNull();
    expect(result.previousExperiments).toHaveLength(1);
  });

  it('finds sessions from same chapter', () => {
    const sessions = [
      { experimentId: 'v1-cap3-resistor', completed: true, errors: [], startTime: '2026-01-01' },
    ];
    const result = buildPastContext('v1-cap3-led', sessions);
    expect(result).not.toBeNull();
    expect(result.previousExperiments).toHaveLength(1);
  });

  it('limits to last 5 related sessions', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      experimentId: 'v1-cap1-blink',
      completed: false,
      errors: [],
      startTime: `2026-01-0${i + 1}`,
    }));
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.previousExperiments).toHaveLength(5);
  });

  it('counts completed sessions correctly', () => {
    const sessions = [
      { experimentId: 'v1-cap1-blink', completed: true, errors: [], startTime: '2026-01-01' },
      { experimentId: 'v1-cap1-blink', completed: false, errors: [], startTime: '2026-01-02' },
      { experimentId: 'v1-cap1-blink', completed: true, errors: [], startTime: '2026-01-03' },
    ];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.completedCount).toBe(2);
  });

  it('counts total errors across sessions', () => {
    const sessions = [
      { experimentId: 'v1-cap1-blink', errors: [{ type: 'A' }, { type: 'B' }], startTime: '2026-01-01' },
      { experimentId: 'v1-cap1-blink', errors: [{ type: 'C' }], startTime: '2026-01-02' },
    ];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.totalErrors).toBe(3);
  });

  it('sets lastSessionDate from most recent session', () => {
    const sessions = [
      { experimentId: 'v1-cap1-blink', completed: false, errors: [], startTime: '2026-01-01' },
      { experimentId: 'v1-cap1-blink', completed: false, errors: [], startTime: '2026-01-05' },
    ];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.lastSessionDate).toBe('2026-01-05');
  });

  it('maps previousExperiments with correct fields', () => {
    const sessions = [
      { experimentId: 'v1-cap1-blink', completed: true, errors: [{ type: 'X' }], duration: 10, startTime: '2026-01-01' },
    ];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.previousExperiments[0]).toEqual({
      id: 'v1-cap1-blink',
      completed: true,
      errors: 1,
      duration: 10,
      date: '2026-01-01',
    });
  });

  it('defaults completed to false when missing', () => {
    const sessions = [{ experimentId: 'v1-cap1-blink', errors: [], startTime: '2026-01-01' }];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.previousExperiments[0].completed).toBe(false);
  });

  it('defaults duration to 0 when missing', () => {
    const sessions = [{ experimentId: 'v1-cap1-blink', errors: [], startTime: '2026-01-01' }];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.previousExperiments[0].duration).toBe(0);
  });

  it('handles sessions with undefined errors gracefully', () => {
    const sessions = [{ experimentId: 'v1-cap1-blink', completed: false, startTime: '2026-01-01' }];
    const result = buildPastContext('v1-cap1-blink', sessions);
    expect(result.previousExperiments[0].errors).toBe(0);
    expect(result.totalErrors).toBe(0);
  });

  it('does not include sessions from different chapters', () => {
    const sessions = [
      { experimentId: 'v1-cap2-rgb', completed: true, errors: [], startTime: '2026-01-01' },
      { experimentId: 'v1-cap1-blink', completed: true, errors: [], startTime: '2026-01-02' },
    ];
    const result = buildPastContext('v1-cap1-led', sessions);
    // Should include v1-cap1-blink (same chapter 1) but NOT v1-cap2-rgb
    expect(result.previousExperiments.every(e => e.id !== 'v1-cap2-rgb')).toBe(true);
  });
});
