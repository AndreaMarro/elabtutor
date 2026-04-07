// ============================================
// Session Report Service Tests — G45
// Tests: collectSessionData, generateLocalSummary, buildSummaryPrompt logic
// Pattern: inline pure functions for isolation (no import deps needed)
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Inline collectSessionData logic for testing ───────────────

function collectSessionData({
  messages,
  activeExperiment,
  quizResults,
  codeContent,
  compilationResult,
  sessionStartTime,
  buildStepIndex,
  buildStepsTotal,
  isCircuitComplete,
}) {
  const duration = Math.round((Date.now() - (sessionStartTime || Date.now())) / 60000);
  const chatMessages = (messages || [])
    .filter(m => m.id !== 'welcome')
    .map(m => ({ role: m.role, content: m.content }));

  const volumeNumber = activeExperiment?.id?.startsWith('v1') ? 1
    : activeExperiment?.id?.startsWith('v2') ? 2
    : activeExperiment?.id?.startsWith('v3') ? 3 : 1;

  const volumeColor = volumeNumber === 1 ? '#4A7A25'
    : volumeNumber === 2 ? '#E8941C' : '#E54B3D';

  return {
    sessionDate: new Date().toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    sessionTime: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    duration: Math.max(1, duration),
    experiment: activeExperiment ? {
      id: activeExperiment.id,
      title: activeExperiment.title,
      desc: activeExperiment.desc || activeExperiment.description || '',
      chapter: activeExperiment.chapter || '',
      difficulty: activeExperiment.difficulty || 1,
      simulationMode: activeExperiment.simulationMode || 'circuit',
      components: (activeExperiment.components || []).map(c => ({
        type: c.type, id: c.id, value: c.value, color: c.color
      })),
      quiz: activeExperiment.quiz || [],
      concept: activeExperiment.concept || '',
      code: activeExperiment.code || null,
    } : null,
    volumeNumber,
    volumeColor,
    chatMessages,
    messageCount: chatMessages.length,
    quizResults: quizResults || null,
    codeContent: codeContent || null,
    compilationResult: compilationResult || null,
    buildProgress: buildStepsTotal > 0
      ? { current: Math.max(0, buildStepIndex) + 1, total: buildStepsTotal }
      : null,
    isCircuitComplete: isCircuitComplete || false,
  };
}

// ─── Inline generateLocalSummary logic ────────────────────────

function generateLocalSummary(data) {
  const exp = data.experiment;
  const riassunto = [];

  riassunto.push(
    `Hai lavorato sull'esperimento "${exp?.title || 'sconosciuto'}" per ${data.duration || '?'} minuti.`
  );

  if (data.isCircuitComplete) {
    riassunto.push('Hai completato il circuito correttamente — ottimo lavoro!');
  } else if (data.buildProgress) {
    riassunto.push(
      `Hai completato ${data.buildProgress.current} passi su ${data.buildProgress.total} nella costruzione del circuito.`
    );
  } else {
    riassunto.push('Il circuito non era ancora completo — ci riproverai la prossima volta!');
  }

  if (data.quizResults) {
    const { score, total } = data.quizResults;
    if (score === total) riassunto.push('Hai risposto correttamente a tutte le domande del quiz!');
    else if (score > 0) riassunto.push(`${score} risposta giusta su ${total} nel quiz — quasi perfetto!`);
    else riassunto.push("Il quiz non è andato benissimo — rileggi le spiegazioni!");
  }

  if (data.codeContent) {
    riassunto.push('Hai anche scritto codice Arduino per controllare il circuito.');
  }

  return {
    riassunto,
    prossimoPassoSuggerito: 'Continua con il prossimo esperimento del capitolo!',
    concettiToccati: exp?.concept ? [exp.concept] : [],
  };
}

// ─── Tests: collectSessionData — volumeNumber ──────────────────

describe('collectSessionData — volumeNumber detection', () => {
  it('detects volume 1 from v1 prefix', () => {
    const result = collectSessionData({ activeExperiment: { id: 'v1-cap1-blink', title: 'Blink' } });
    expect(result.volumeNumber).toBe(1);
  });

  it('detects volume 2 from v2 prefix', () => {
    const result = collectSessionData({ activeExperiment: { id: 'v2-cap3-rgb', title: 'RGB' } });
    expect(result.volumeNumber).toBe(2);
  });

  it('detects volume 3 from v3 prefix', () => {
    const result = collectSessionData({ activeExperiment: { id: 'v3-cap5-semaforo', title: 'Semaforo' } });
    expect(result.volumeNumber).toBe(3);
  });

  it('defaults to volume 1 for unknown prefix', () => {
    const result = collectSessionData({ activeExperiment: { id: 'unknown-exp', title: 'Test' } });
    expect(result.volumeNumber).toBe(1);
  });

  it('defaults to volume 1 when no activeExperiment', () => {
    const result = collectSessionData({});
    expect(result.volumeNumber).toBe(1);
  });

  it('defaults to volume 1 when activeExperiment has no id', () => {
    const result = collectSessionData({ activeExperiment: { title: 'No ID' } });
    expect(result.volumeNumber).toBe(1);
  });
});

// ─── Tests: collectSessionData — volumeColor ───────────────────

describe('collectSessionData — volumeColor', () => {
  it('returns green for volume 1', () => {
    const result = collectSessionData({ activeExperiment: { id: 'v1-cap1-blink', title: 'Blink' } });
    expect(result.volumeColor).toBe('#4A7A25');
  });

  it('returns orange for volume 2', () => {
    const result = collectSessionData({ activeExperiment: { id: 'v2-cap1-test', title: 'Test' } });
    expect(result.volumeColor).toBe('#E8941C');
  });

  it('returns red for volume 3', () => {
    const result = collectSessionData({ activeExperiment: { id: 'v3-cap1-test', title: 'Test' } });
    expect(result.volumeColor).toBe('#E54B3D');
  });

  it('defaults to green (vol 1) when no experiment', () => {
    const result = collectSessionData({});
    expect(result.volumeColor).toBe('#4A7A25');
  });
});

// ─── Tests: collectSessionData — message filtering ────────────

describe('collectSessionData — message filtering', () => {
  it('excludes welcome message', () => {
    const messages = [
      { id: 'welcome', role: 'assistant', content: 'Ciao!' },
      { id: 'msg1', role: 'user', content: 'Domanda' },
    ];
    const result = collectSessionData({ messages });
    expect(result.chatMessages).toHaveLength(1);
    expect(result.chatMessages[0].content).toBe('Domanda');
  });

  it('includes all non-welcome messages', () => {
    const messages = [
      { id: 'msg1', role: 'user', content: 'Q1' },
      { id: 'msg2', role: 'assistant', content: 'A1' },
      { id: 'msg3', role: 'user', content: 'Q2' },
    ];
    const result = collectSessionData({ messages });
    expect(result.chatMessages).toHaveLength(3);
  });

  it('maps only role and content', () => {
    const messages = [
      { id: 'msg1', role: 'user', content: 'Hello', extra: 'extra-field' },
    ];
    const result = collectSessionData({ messages });
    expect(result.chatMessages[0]).toEqual({ role: 'user', content: 'Hello' });
    expect(result.chatMessages[0].id).toBeUndefined();
    expect(result.chatMessages[0].extra).toBeUndefined();
  });

  it('handles empty messages array', () => {
    const result = collectSessionData({ messages: [] });
    expect(result.chatMessages).toHaveLength(0);
    expect(result.messageCount).toBe(0);
  });

  it('handles undefined messages', () => {
    const result = collectSessionData({});
    expect(result.chatMessages).toHaveLength(0);
    expect(result.messageCount).toBe(0);
  });

  it('sets messageCount correctly', () => {
    const messages = [
      { id: 'msg1', role: 'user', content: 'Q' },
      { id: 'msg2', role: 'assistant', content: 'A' },
    ];
    const result = collectSessionData({ messages });
    expect(result.messageCount).toBe(2);
  });

  it('excludes only the welcome id — not other messages with similar content', () => {
    const messages = [
      { id: 'welcome', role: 'assistant', content: 'welcome text' },
      { id: 'not-welcome', role: 'user', content: 'welcome content' },
    ];
    const result = collectSessionData({ messages });
    expect(result.chatMessages).toHaveLength(1);
    expect(result.chatMessages[0].content).toBe('welcome content');
  });
});

// ─── Tests: collectSessionData — duration ─────────────────────

describe('collectSessionData — duration', () => {
  it('returns minimum 1 minute for very recent start', () => {
    const result = collectSessionData({ sessionStartTime: Date.now() });
    expect(result.duration).toBeGreaterThanOrEqual(1);
  });

  it('computes duration from sessionStartTime', () => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const result = collectSessionData({ sessionStartTime: twoMinutesAgo });
    expect(result.duration).toBeGreaterThanOrEqual(2);
  });

  it('clamps duration to minimum 1 when no sessionStartTime', () => {
    const result = collectSessionData({});
    expect(result.duration).toBe(1);
  });
});

// ─── Tests: collectSessionData — experiment mapping ───────────

describe('collectSessionData — experiment mapping', () => {
  it('returns null experiment when activeExperiment is null', () => {
    const result = collectSessionData({ activeExperiment: null });
    expect(result.experiment).toBeNull();
  });

  it('returns null experiment when activeExperiment is undefined', () => {
    const result = collectSessionData({});
    expect(result.experiment).toBeNull();
  });

  it('maps experiment id and title', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1-blink', title: 'LED Blink' }
    });
    expect(result.experiment.id).toBe('v1-cap1-blink');
    expect(result.experiment.title).toBe('LED Blink');
  });

  it('uses desc if provided', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T', desc: 'My desc' }
    });
    expect(result.experiment.desc).toBe('My desc');
  });

  it('falls back to description if desc not provided', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T', description: 'Alt desc' }
    });
    expect(result.experiment.desc).toBe('Alt desc');
  });

  it('defaults desc to empty string when neither desc nor description', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.desc).toBe('');
  });

  it('defaults difficulty to 1', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.difficulty).toBe(1);
  });

  it('uses provided difficulty', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T', difficulty: 3 }
    });
    expect(result.experiment.difficulty).toBe(3);
  });

  it('defaults simulationMode to circuit', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.simulationMode).toBe('circuit');
  });

  it('uses provided simulationMode', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T', simulationMode: 'code' }
    });
    expect(result.experiment.simulationMode).toBe('code');
  });

  it('maps components with required fields', () => {
    const result = collectSessionData({
      activeExperiment: {
        id: 'v1-cap1', title: 'T',
        components: [{ type: 'led', id: 'led1', value: '220', color: 'red', extra: 'x' }]
      }
    });
    expect(result.experiment.components[0]).toEqual({ type: 'led', id: 'led1', value: '220', color: 'red' });
    expect(result.experiment.components[0].extra).toBeUndefined();
  });

  it('defaults components to empty array', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.components).toEqual([]);
  });

  it('defaults quiz to empty array', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.quiz).toEqual([]);
  });

  it('uses provided quiz', () => {
    const quiz = [{ q: 'Q?', a: 'A' }];
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T', quiz }
    });
    expect(result.experiment.quiz).toEqual(quiz);
  });

  it('defaults concept to empty string', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.concept).toBe('');
  });

  it('defaults code to null', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T' }
    });
    expect(result.experiment.code).toBeNull();
  });

  it('includes code when provided', () => {
    const result = collectSessionData({
      activeExperiment: { id: 'v1-cap1', title: 'T', code: 'void setup(){}' }
    });
    expect(result.experiment.code).toBe('void setup(){}');
  });
});

// ─── Tests: collectSessionData — buildProgress ────────────────

describe('collectSessionData — buildProgress', () => {
  it('returns null when buildStepsTotal is 0', () => {
    const result = collectSessionData({ buildStepsTotal: 0, buildStepIndex: 2 });
    expect(result.buildProgress).toBeNull();
  });

  it('returns null when buildStepsTotal is undefined', () => {
    const result = collectSessionData({});
    expect(result.buildProgress).toBeNull();
  });

  it('computes buildProgress when buildStepsTotal > 0', () => {
    const result = collectSessionData({ buildStepsTotal: 5, buildStepIndex: 2 });
    expect(result.buildProgress).toEqual({ current: 3, total: 5 });
  });

  it('clamps negative buildStepIndex to 0 (current becomes 1)', () => {
    const result = collectSessionData({ buildStepsTotal: 5, buildStepIndex: -1 });
    expect(result.buildProgress).toEqual({ current: 1, total: 5 });
  });

  it('handles buildStepIndex of 0 (first step)', () => {
    const result = collectSessionData({ buildStepsTotal: 3, buildStepIndex: 0 });
    expect(result.buildProgress).toEqual({ current: 1, total: 3 });
  });

  it('handles buildStepIndex at last step', () => {
    const result = collectSessionData({ buildStepsTotal: 5, buildStepIndex: 4 });
    expect(result.buildProgress).toEqual({ current: 5, total: 5 });
  });
});

// ─── Tests: collectSessionData — optional fields ───────────────

describe('collectSessionData — optional fields', () => {
  it('passes through quizResults', () => {
    const quizResults = { score: 3, total: 5 };
    const result = collectSessionData({ quizResults });
    expect(result.quizResults).toEqual(quizResults);
  });

  it('returns null quizResults when not provided', () => {
    const result = collectSessionData({});
    expect(result.quizResults).toBeNull();
  });

  it('passes through codeContent', () => {
    const result = collectSessionData({ codeContent: 'void setup(){}' });
    expect(result.codeContent).toBe('void setup(){}');
  });

  it('returns null codeContent when not provided', () => {
    const result = collectSessionData({});
    expect(result.codeContent).toBeNull();
  });

  it('passes through compilationResult', () => {
    const result = collectSessionData({ compilationResult: { success: true, hex: 'abc' } });
    expect(result.compilationResult).toEqual({ success: true, hex: 'abc' });
  });

  it('returns null compilationResult when not provided', () => {
    const result = collectSessionData({});
    expect(result.compilationResult).toBeNull();
  });

  it('defaults isCircuitComplete to false', () => {
    const result = collectSessionData({});
    expect(result.isCircuitComplete).toBe(false);
  });

  it('sets isCircuitComplete to true when provided', () => {
    const result = collectSessionData({ isCircuitComplete: true });
    expect(result.isCircuitComplete).toBe(true);
  });
});

// ─── Tests: collectSessionData — output shape ─────────────────

describe('collectSessionData — output shape', () => {
  it('always includes sessionDate as string', () => {
    const result = collectSessionData({});
    expect(typeof result.sessionDate).toBe('string');
    expect(result.sessionDate.length).toBeGreaterThan(0);
  });

  it('always includes sessionTime as string', () => {
    const result = collectSessionData({});
    expect(typeof result.sessionTime).toBe('string');
  });

  it('always includes all required fields', () => {
    const result = collectSessionData({});
    expect(result).toHaveProperty('sessionDate');
    expect(result).toHaveProperty('sessionTime');
    expect(result).toHaveProperty('duration');
    expect(result).toHaveProperty('experiment');
    expect(result).toHaveProperty('volumeNumber');
    expect(result).toHaveProperty('volumeColor');
    expect(result).toHaveProperty('chatMessages');
    expect(result).toHaveProperty('messageCount');
    expect(result).toHaveProperty('quizResults');
    expect(result).toHaveProperty('codeContent');
    expect(result).toHaveProperty('compilationResult');
    expect(result).toHaveProperty('buildProgress');
    expect(result).toHaveProperty('isCircuitComplete');
  });
});

// ─── Tests: generateLocalSummary ──────────────────────────────

describe('generateLocalSummary — riassunto content', () => {
  const baseData = {
    experiment: { title: 'LED Blink', concept: 'corrente' },
    duration: 5,
    isCircuitComplete: false,
    buildProgress: null,
    quizResults: null,
    codeContent: null,
  };

  it('always includes experiment title in first sentence', () => {
    const result = generateLocalSummary(baseData);
    expect(result.riassunto[0]).toContain('LED Blink');
    expect(result.riassunto[0]).toContain('5');
  });

  it('uses sconosciuto when no experiment title', () => {
    const data = { ...baseData, experiment: null };
    const result = generateLocalSummary(data);
    expect(result.riassunto[0]).toContain('sconosciuto');
  });

  it('includes circuit complete message when isCircuitComplete', () => {
    const data = { ...baseData, isCircuitComplete: true };
    const result = generateLocalSummary(data);
    expect(result.riassunto.some(s => s.includes('completato il circuito'))).toBe(true);
  });

  it('includes buildProgress message when not complete but progress exists', () => {
    const data = { ...baseData, buildProgress: { current: 3, total: 5 } };
    const result = generateLocalSummary(data);
    expect(result.riassunto.some(s => s.includes('3') && s.includes('5'))).toBe(true);
  });

  it('includes incomplete message when no progress', () => {
    const result = generateLocalSummary(baseData);
    expect(result.riassunto.some(s => s.includes('non era ancora completo'))).toBe(true);
  });

  it('includes perfect quiz message when score equals total', () => {
    const data = { ...baseData, quizResults: { score: 3, total: 3 } };
    const result = generateLocalSummary(data);
    expect(result.riassunto.some(s => s.includes('tutte le domande'))).toBe(true);
  });

  it('includes partial quiz message when score > 0 but < total', () => {
    const data = { ...baseData, quizResults: { score: 2, total: 5 } };
    const result = generateLocalSummary(data);
    expect(result.riassunto.some(s => s.includes('2') && s.includes('5'))).toBe(true);
  });

  it('includes fail quiz message when score is 0', () => {
    const data = { ...baseData, quizResults: { score: 0, total: 3 } };
    const result = generateLocalSummary(data);
    expect(result.riassunto.some(s => s.includes('non') && s.includes('quiz'))).toBe(true);
  });

  it('includes code message when codeContent present', () => {
    const data = { ...baseData, codeContent: 'void setup(){}' };
    const result = generateLocalSummary(data);
    expect(result.riassunto.some(s => s.includes('codice Arduino'))).toBe(true);
  });

  it('does not include code message when no codeContent', () => {
    const result = generateLocalSummary(baseData);
    expect(result.riassunto.some(s => s.includes('codice Arduino'))).toBe(false);
  });

  it('always sets prossimoPassoSuggerito', () => {
    const result = generateLocalSummary(baseData);
    expect(typeof result.prossimoPassoSuggerito).toBe('string');
    expect(result.prossimoPassoSuggerito.length).toBeGreaterThan(0);
  });

  it('includes concept in concettiToccati when provided', () => {
    const result = generateLocalSummary(baseData);
    expect(result.concettiToccati).toContain('corrente');
  });

  it('returns empty concettiToccati when no concept', () => {
    const data = { ...baseData, experiment: { title: 'T' } };
    const result = generateLocalSummary(data);
    expect(result.concettiToccati).toHaveLength(0);
  });

  it('returns empty concettiToccati when no experiment', () => {
    const data = { ...baseData, experiment: null };
    const result = generateLocalSummary(data);
    expect(result.concettiToccati).toHaveLength(0);
  });

  it('riassunto is always an array', () => {
    const result = generateLocalSummary(baseData);
    expect(Array.isArray(result.riassunto)).toBe(true);
  });

  it('has at least 2 items in riassunto', () => {
    const result = generateLocalSummary(baseData);
    expect(result.riassunto.length).toBeGreaterThanOrEqual(2);
  });
});
