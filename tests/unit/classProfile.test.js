/**
 * classProfile — Unit Tests
 * Verifica buildClassProfile, buildClassContext, getWelcomeMessage, getNextLessonSuggestion
 * (c) ELAB Worker Run 11 — 2026-04-07
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock getSavedSessions
vi.mock('../../src/hooks/useSessionTracker', () => ({
  getSavedSessions: vi.fn(),
}));

// Mock getLessonPath
vi.mock('../../src/data/lesson-paths', () => ({
  getLessonPath: vi.fn(),
}));

import { getSavedSessions } from '../../src/hooks/useSessionTracker';
import { getLessonPath } from '../../src/data/lesson-paths';

import {
  buildClassProfile,
  buildClassContext,
  getWelcomeMessage,
  getNextLessonSuggestion,
} from '../../src/services/classProfile';

// Each test uses a monotonically increasing timestamp to bust the 2s cache
let _t = new Date('2026-04-07T10:00:00Z').getTime();
function nextTime() {
  _t += 10000; // advance 10s — always busts 2s cache
  return _t;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(nextTime());
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── buildClassProfile — empty sessions ──────────────────────────────────────
describe('buildClassProfile — no sessions', () => {
  beforeEach(() => {
    getSavedSessions.mockReturnValue([]);
    getLessonPath.mockReturnValue(null);
    vi.setSystemTime(nextTime());
  });

  test('returns isFirstTime: true', () => {
    expect(buildClassProfile().isFirstTime).toBe(true);
  });

  test('returns totalSessions: 0', () => {
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().totalSessions).toBe(0);
  });

  test('returns empty experimentsCompleted', () => {
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().experimentsCompleted).toEqual([]);
  });

  test('returns empty conceptsLearned', () => {
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().conceptsLearned).toEqual([]);
  });

  test('returns lastExperimentId: null', () => {
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().lastExperimentId).toBeNull();
  });

  test('returns totalMessages: 0', () => {
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().totalMessages).toBe(0);
  });
});

// ─── buildClassProfile — with sessions ────────────────────────────────────────
describe('buildClassProfile — with sessions', () => {
  const mockSessions = [
    {
      experimentId: 'v1-cap6-esp1',
      startTime: '2026-04-01T10:00:00Z',
      endTime: '2026-04-01T10:30:00Z',
      messages: [{ role: 'user' }, { role: 'ai' }],
      errors: [{ type: 'syntax' }, { type: 'syntax' }],
    },
    {
      experimentId: 'v1-cap6-esp2',
      startTime: '2026-04-02T10:00:00Z',
      endTime: '2026-04-02T10:30:00Z',
      messages: [{ role: 'user' }],
      errors: [{ type: 'runtime' }],
    },
  ];

  function setupMocks() {
    getSavedSessions.mockReturnValue(mockSessions);
    getLessonPath.mockImplementation(id => {
      if (id === 'v1-cap6-esp1') {
        return {
          title: 'LED Blink',
          session_save: {
            concepts_covered: ['resistenza', 'LED'],
            next_suggested: 'v1-cap6-esp2',
            resume_message: 'Riprendiamo da dove eravamo!',
          },
        };
      }
      if (id === 'v1-cap6-esp2') return { title: 'Bottone', session_save: { next_suggested: 'v1-cap6-esp3' } };
      return null;
    });
  }

  test('returns isFirstTime: false', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().isFirstTime).toBe(false);
  });

  test('totalSessions equals session count', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().totalSessions).toBe(2);
  });

  test('lastExperimentId is the last session experimentId', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().lastExperimentId).toBe('v1-cap6-esp2');
  });

  test('totalMessages sums all session messages', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    expect(buildClassProfile().totalMessages).toBe(3);
  });

  test('experimentsCompleted contains all experiment ids', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    const p = buildClassProfile();
    expect(p.experimentsCompleted).toContain('v1-cap6-esp1');
    expect(p.experimentsCompleted).toContain('v1-cap6-esp2');
    expect(p.experimentsCompleted).toHaveLength(2);
  });

  test('commonErrors sorted by count, syntax=2 is first', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    const errors = buildClassProfile().commonErrors;
    expect(errors[0].type).toBe('syntax');
    expect(errors[0].count).toBe(2);
  });

  test('nextSuggested from last session lesson path', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    // lastSession is v1-cap6-esp2 whose mock returns next_suggested: 'v1-cap6-esp3'
    expect(buildClassProfile().nextSuggested).toBe('v1-cap6-esp3');
  });

  test('conceptsLearned from session path', () => {
    setupMocks();
    vi.setSystemTime(nextTime());
    const p = buildClassProfile();
    expect(p.conceptsLearned).toContain('resistenza');
    expect(p.conceptsLearned).toContain('LED');
  });
});

// ─── buildClassContext ────────────────────────────────────────────────────────
describe('buildClassContext', () => {
  test('returns empty string for first-time class', () => {
    getSavedSessions.mockReturnValue([]);
    getLessonPath.mockReturnValue(null);
    vi.setSystemTime(nextTime());
    expect(buildClassContext()).toBe('');
  });

  test('returns context with [CONTESTO CLASSE] header', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({ title: 'LED Blink', session_save: {} });
    vi.setSystemTime(nextTime());
    expect(buildClassContext()).toContain('[CONTESTO CLASSE]');
  });

  test('context includes experiment title', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({ title: 'LED Blink', session_save: {} });
    vi.setSystemTime(nextTime());
    expect(buildClassContext()).toContain('LED Blink');
  });

  test('context includes session count', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
      { experimentId: 'v1-cap6-esp2', startTime: '2026-04-02T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({ title: 'Test', session_save: {} });
    vi.setSystemTime(nextTime());
    expect(buildClassContext()).toContain('Sessioni totali: 2');
  });
});

// ─── getWelcomeMessage ───────────────────────────────────────────────────────
describe('getWelcomeMessage', () => {
  test('returns first_time type when no sessions', () => {
    getSavedSessions.mockReturnValue([]);
    getLessonPath.mockReturnValue(null);
    vi.setSystemTime(nextTime());
    expect(getWelcomeMessage().type).toBe('first_time');
  });

  test('first_time message contains greeting text', () => {
    getSavedSessions.mockReturnValue([]);
    getLessonPath.mockReturnValue(null);
    vi.setSystemTime(nextTime());
    const msg = getWelcomeMessage();
    expect(msg.text.length).toBeGreaterThan(0);
  });

  test('returns returning type when sessions exist and resume_message present', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({
      title: 'LED Blink',
      session_save: { resume_message: 'Bentornati al LED!', next_suggested: null },
    });
    vi.setSystemTime(nextTime());
    expect(getWelcomeMessage().type).toBe('returning');
  });

  test('uses resume_message when available', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({
      title: 'LED Blink',
      session_save: { resume_message: 'Custom resume!', next_suggested: null },
    });
    vi.setSystemTime(nextTime());
    expect(getWelcomeMessage().text).toBe('Custom resume!');
  });

  test('fallback message contains Bentornati when no resume_message', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({ title: 'LED Test', session_save: {} });
    vi.setSystemTime(nextTime());
    expect(getWelcomeMessage().text).toContain('Bentornati');
  });
});

// ─── getNextLessonSuggestion ──────────────────────────────────────────────────
describe('getNextLessonSuggestion', () => {
  test('returns first experiment for first-time class', () => {
    getSavedSessions.mockReturnValue([]);
    getLessonPath.mockReturnValue({ title: 'Accendi LED', session_save: {} });
    vi.setSystemTime(nextTime());
    const s = getNextLessonSuggestion();
    expect(s).not.toBeNull();
    expect(s.experimentId).toBe('v1-cap6-esp1');
  });

  test('first-time suggestion has message text', () => {
    getSavedSessions.mockReturnValue([]);
    getLessonPath.mockReturnValue({ title: 'LED', session_save: {} });
    vi.setSystemTime(nextTime());
    expect(getNextLessonSuggestion().message.length).toBeGreaterThan(0);
  });

  test('returns null when no next_suggested in profile', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockReturnValue({ title: 'LED', session_save: {} });
    vi.setSystemTime(nextTime());
    expect(getNextLessonSuggestion()).toBeNull();
  });

  test('returns correct title for returning class with next_suggested', () => {
    getSavedSessions.mockReturnValue([
      { experimentId: 'v1-cap6-esp1', startTime: '2026-04-01T10:00:00Z', messages: [], errors: [] },
    ]);
    getLessonPath.mockImplementation(id => {
      if (id === 'v1-cap6-esp1')
        return { title: 'LED', session_save: { next_suggested: 'v1-cap6-esp2' } };
      if (id === 'v1-cap6-esp2')
        return { title: 'Bottone', session_save: {} };
      return null;
    });
    vi.setSystemTime(nextTime());
    const s = getNextLessonSuggestion();
    expect(s).not.toBeNull();
    expect(s.title).toBe('Bottone');
    expect(s.experimentId).toBe('v1-cap6-esp2');
  });
});
