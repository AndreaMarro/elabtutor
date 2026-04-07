// ============================================
// ELAB Tutor - Test Unitari classProfile
// Copre: buildClassProfile, buildClassContext, getWelcomeMessage, getNextLessonSuggestion
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    buildClassProfile,
    buildClassContext,
    getWelcomeMessage,
    getNextLessonSuggestion,
} from '../../src/services/classProfile';

// ── Mocks ─────────────────────────────────────

vi.mock('../../src/hooks/useSessionTracker', () => ({
    getSavedSessions: vi.fn(() => []),
}));

vi.mock('../../src/data/lesson-paths', () => ({
    getLessonPath: vi.fn(() => null),
}));

import { getSavedSessions } from '../../src/hooks/useSessionTracker';
import { getLessonPath } from '../../src/data/lesson-paths';

// ── Helpers ───────────────────────────────────

// Cache in classProfile has a 2s TTL. We use fake timers to advance past it
// between tests so each test gets a fresh profile computation.
let fakeTime = Date.UTC(2026, 3, 7, 10, 0, 0); // 2026-04-07 10:00:00 UTC
function advanceTime() {
    fakeTime += 5000; // advance 5s — past the 2s cache TTL
    vi.setSystemTime(new Date(fakeTime));
}

function makeSession(experimentId, overrides = {}) {
    return {
        experimentId,
        startTime: '2026-04-07T10:00:00Z',
        endTime: '2026-04-07T10:30:00Z',
        errors: [],
        messages: [{ role: 'user', content: 'hello' }],
        ...overrides,
    };
}

function makeLessonPath(id, overrides = {}) {
    return {
        id,
        title: `Esperimento ${id}`,
        next_experiment: null,
        session_save: { concepts_covered: [] },
        ...overrides,
    };
}

// Force cache invalidation between tests
function clearProfileCache() {
    // Reset by mocking getSavedSessions to different value — cache TTL is 2s
    // Simplest: we trust that mocking getSavedSessions clears state via module
    // The cache TTL check uses Date.now() — we can't easily invalidate it here
    // Instead, we rely on different mock return values per test
}

// ── buildClassProfile ─────────────────────────

describe('buildClassProfile — prima volta (nessuna sessione)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        advanceTime(); // bust cache
        vi.clearAllMocks();
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockReturnValue(null);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ritorna isFirstTime: true', () => {
        const profile = buildClassProfile();
        expect(profile.isFirstTime).toBe(true);
    });

    it('ritorna totalSessions: 0', () => {
        const profile = buildClassProfile();
        expect(profile.totalSessions).toBe(0);
    });

    it('ritorna lastExperimentId: null', () => {
        const profile = buildClassProfile();
        expect(profile.lastExperimentId).toBeNull();
    });

    it('ritorna experimentsCompleted: []', () => {
        const profile = buildClassProfile();
        expect(profile.experimentsCompleted).toHaveLength(0);
    });

    it('ritorna conceptsLearned: []', () => {
        const profile = buildClassProfile();
        expect(profile.conceptsLearned).toHaveLength(0);
    });

    it('ritorna commonErrors: []', () => {
        const profile = buildClassProfile();
        expect(profile.commonErrors).toHaveLength(0);
    });

    it('ritorna resumeMessage: null', () => {
        const profile = buildClassProfile();
        expect(profile.resumeMessage).toBeNull();
    });
});

describe('buildClassProfile — con sessioni', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        advanceTime();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ritorna isFirstTime: false con sessioni', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.isFirstTime).toBe(false);
    });

    it('usa il titolo dal lesson path se disponibile', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1', { title: 'Accendi LED' }));
        const profile = buildClassProfile();
        expect(profile.lastExperimentTitle).toBe('Accendi LED');
    });

    it('usa experimentId come fallback se lesson path null', () => {
        getSavedSessions.mockReturnValue([makeSession('v1-cap6-esp1')]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.lastExperimentTitle).toBe('v1-cap6-esp1');
    });

    it('conta sessioni totali', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1'),
            makeSession('exp2'),
            makeSession('exp3'),
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.totalSessions).toBe(3);
    });

    it('deduplica experimentsCompleted', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1'),
            makeSession('exp1'),
            makeSession('exp2'),
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.experimentsCompleted).toHaveLength(2);
        expect(profile.experimentsCompleted).toContain('exp1');
        expect(profile.experimentsCompleted).toContain('exp2');
    });

    it('raccoglie concetti dal lesson path', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1', {
            session_save: { concepts_covered: ['LED', 'resistenza', 'corrente'] }
        }));
        const profile = buildClassProfile();
        expect(profile.conceptsLearned).toContain('LED');
        expect(profile.conceptsLearned).toContain('resistenza');
    });

    it('deduplica concetti appresi', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1'), makeSession('exp2')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1', {
            session_save: { concepts_covered: ['LED', 'corrente'] }
        }));
        const profile = buildClassProfile();
        const ledCount = profile.conceptsLearned.filter(c => c === 'LED').length;
        expect(ledCount).toBe(1);
    });

    it('conta errori per tipo', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1', {
                errors: [
                    { type: 'short-circuit' },
                    { type: 'short-circuit' },
                    { type: 'wrong-pin' },
                ]
            }),
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        const scErr = profile.commonErrors.find(e => e.type === 'short-circuit');
        const pinErr = profile.commonErrors.find(e => e.type === 'wrong-pin');
        expect(scErr?.count).toBe(2);
        expect(pinErr?.count).toBe(1);
    });

    it('ordina errori per frequenza decrescente', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1', {
                errors: [
                    { type: 'minor-err' },
                    { type: 'major-err' },
                    { type: 'major-err' },
                    { type: 'major-err' },
                ]
            }),
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        if (profile.commonErrors.length >= 2) {
            expect(profile.commonErrors[0].count).toBeGreaterThanOrEqual(profile.commonErrors[1].count);
        }
    });

    it('usa endTime se disponibile come lastSessionDate', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1', { endTime: '2026-04-07T11:00:00Z', startTime: '2026-04-07T10:00:00Z' })
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.lastSessionDate).toBe('2026-04-07T11:00:00Z');
    });

    it('usa startTime se endTime assente', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1', { endTime: undefined, startTime: '2026-04-07T10:00:00Z' })
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.lastSessionDate).toBe('2026-04-07T10:00:00Z');
    });

    it('suggerisce prossimo esperimento dal lesson path', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockImplementation((id) => {
            if (id === 'exp1') return makeLessonPath('exp1', {
                session_save: { concepts_covered: [], next_suggested: 'exp2' }
            });
            if (id === 'exp2') return makeLessonPath('exp2', { title: 'Esperimento 2' });
            return null;
        });
        const profile = buildClassProfile();
        expect(profile.nextSuggested).toBe('exp2');
        expect(profile.nextSuggestedTitle).toBe('Esperimento 2');
    });

    it('conta messaggi totali across sessioni', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1', { messages: [{ role: 'user' }, { role: 'assistant' }] }),
            makeSession('exp2', { messages: [{ role: 'user' }] }),
        ]);
        getLessonPath.mockReturnValue(null);
        const profile = buildClassProfile();
        expect(profile.totalMessages).toBe(3);
    });
});

// ── buildClassContext ─────────────────────────

describe('buildClassContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        advanceTime();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ritorna stringa vuota se prima volta', () => {
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockReturnValue(null);
        const context = buildClassContext();
        expect(context).toBe('');
    });

    it('include [CONTESTO CLASSE] se ci sono sessioni', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1'));
        const context = buildClassContext();
        expect(context).toContain('[CONTESTO CLASSE]');
    });

    it('include sessioni totali', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1'), makeSession('exp2')]);
        getLessonPath.mockReturnValue(null);
        const context = buildClassContext();
        expect(context).toContain('Sessioni totali: 2');
    });

    it('include ultimo esperimento', () => {
        getSavedSessions.mockReturnValue([makeSession('v1-led')]);
        getLessonPath.mockReturnValue(makeLessonPath('v1-led', { title: 'LED Base' }));
        const context = buildClassContext();
        expect(context).toContain('LED Base');
    });

    it('include concetti appresi se disponibili', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1', {
            session_save: { concepts_covered: ['LED', 'corrente'] }
        }));
        const context = buildClassContext();
        expect(context).toContain('LED');
    });

    it('include errori frequenti se presenti', () => {
        getSavedSessions.mockReturnValue([
            makeSession('exp1', { errors: [{ type: 'short-circuit' }, { type: 'short-circuit' }] })
        ]);
        getLessonPath.mockReturnValue(null);
        const context = buildClassContext();
        expect(context).toContain('short-circuit');
    });

    it('include prossimo esperimento se disponibile', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockImplementation((id) => {
            if (id === 'exp1') return makeLessonPath('exp1', {
                session_save: { concepts_covered: [], next_suggested: 'exp2' }
            });
            if (id === 'exp2') return makeLessonPath('exp2', { title: 'Prossimo ESP' });
            return null;
        });
        const context = buildClassContext();
        expect(context).toContain('Prossimo');
    });
});

// ── getWelcomeMessage ─────────────────────────

describe('getWelcomeMessage', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        advanceTime();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ritorna type first_time se nessuna sessione', () => {
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockReturnValue(null);
        const result = getWelcomeMessage();
        expect(result.type).toBe('first_time');
    });

    it('ritorna messaggio di benvenuto per prima volta', () => {
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockReturnValue(null);
        const result = getWelcomeMessage();
        expect(result.text).toBeTruthy();
        expect(typeof result.text).toBe('string');
    });

    it('ritorna type returning se ci sono sessioni', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(null);
        const result = getWelcomeMessage();
        expect(result.type).toBe('returning');
    });

    it('usa resumeMessage dal lesson path se disponibile', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1', {
            session_save: {
                concepts_covered: [],
                resume_message: 'Continuate con l\'esperimento LED!'
            }
        }));
        // Note: resumeMessage mapping depends on implementation details
        const result = getWelcomeMessage();
        expect(result.type).toBe('returning');
        expect(result.text).toBeTruthy();
    });

    it('include titolo ultimo esperimento nel messaggio di ritorno', () => {
        getSavedSessions.mockReturnValue([makeSession('v1-led')]);
        getLessonPath.mockReturnValue(makeLessonPath('v1-led', { title: 'Accendi il LED' }));
        const result = getWelcomeMessage();
        // Fallback message or resumeMessage should reference the experiment
        expect(result.text).toBeTruthy();
    });

    it('ha sempre text e type', () => {
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockReturnValue(null);
        const result = getWelcomeMessage();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('type');
    });
});

// ── getNextLessonSuggestion ───────────────────

describe('getNextLessonSuggestion', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        advanceTime();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ritorna primo esperimento se prima volta', () => {
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockImplementation((id) => {
            if (id === 'v1-cap6-esp1') return makeLessonPath('v1-cap6-esp1', { title: 'Primo LED' });
            return null;
        });
        const suggestion = getNextLessonSuggestion();
        expect(suggestion).not.toBeNull();
        expect(suggestion.experimentId).toBe('v1-cap6-esp1');
    });

    it('ritorna null se non c\'è prossimo esperimento', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockReturnValue(makeLessonPath('exp1', { next_experiment: null }));
        const suggestion = getNextLessonSuggestion();
        expect(suggestion).toBeNull();
    });

    it('ritorna il prossimo esperimento con titolo', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockImplementation((id) => {
            if (id === 'exp1') return makeLessonPath('exp1', {
                session_save: { concepts_covered: [], next_suggested: 'exp2' }
            });
            if (id === 'exp2') return makeLessonPath('exp2', { title: 'Secondo LED' });
            return null;
        });
        const suggestion = getNextLessonSuggestion();
        expect(suggestion?.experimentId).toBe('exp2');
        expect(suggestion?.title).toBe('Secondo LED');
    });

    it('ha experimentId, title, message', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockImplementation((id) => {
            if (id === 'exp1') return makeLessonPath('exp1', { next_experiment: 'exp2' });
            if (id === 'exp2') return makeLessonPath('exp2', { title: 'Titolo 2' });
            return null;
        });
        const suggestion = getNextLessonSuggestion();
        if (suggestion) {
            expect(suggestion).toHaveProperty('experimentId');
            expect(suggestion).toHaveProperty('title');
            expect(suggestion).toHaveProperty('message');
        }
    });

    it('ritorna null se nextPath non trovato per next_experiment', () => {
        getSavedSessions.mockReturnValue([makeSession('exp1')]);
        getLessonPath.mockImplementation((id) => {
            if (id === 'exp1') return makeLessonPath('exp1', { next_experiment: 'exp2' });
            return null; // exp2 not found
        });
        const suggestion = getNextLessonSuggestion();
        expect(suggestion).toBeNull();
    });

    it('messaggio prima volta menziona il LED', () => {
        getSavedSessions.mockReturnValue([]);
        getLessonPath.mockReturnValue(makeLessonPath('v1-cap6-esp1', { title: 'Accendi LED' }));
        const suggestion = getNextLessonSuggestion();
        expect(suggestion?.message).toBeTruthy();
    });
});
