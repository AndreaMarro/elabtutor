/**
 * sessionReportService — Tests for session data collection and local summary
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ success: false })),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn() },
}));

vi.mock('../../src/components/simulator/utils/exportPng', () => ({
  captureCanvasBase64: vi.fn(() => Promise.resolve('data:image/png;base64,AAAA')),
}));

import { collectSessionData } from '../../src/services/sessionReportService';

describe('sessionReportService', () => {
  describe('collectSessionData', () => {
    const baseInput = {
      messages: [],
      activeExperiment: { id: 'v1-cap6-esp1', title: 'Primo LED' },
      quizResults: null,
      codeContent: null,
      compilationResult: null,
      sessionStartTime: Date.now() - 30 * 60000,
      buildStepIndex: -1,
      buildStepsTotal: 0,
      isCircuitComplete: false,
    };

    it('returns session date in Italian format', () => {
      const data = collectSessionData(baseInput);
      expect(data.sessionDate).toBeTruthy();
      expect(typeof data.sessionDate).toBe('string');
    });

    it('computes duration in minutes', () => {
      const data = collectSessionData(baseInput);
      expect(data.duration).toBeGreaterThanOrEqual(1);
      expect(data.duration).toBeLessThanOrEqual(35);
    });

    it('sets minimum duration to 1', () => {
      const data = collectSessionData({ ...baseInput, sessionStartTime: Date.now() });
      expect(data.duration).toBeGreaterThanOrEqual(1);
    });

    it('detects volume 1 from experiment ID', () => {
      const data = collectSessionData(baseInput);
      expect(data.volumeNumber).toBe(1);
      expect(data.volumeColor).toBe('#4A7A25');
    });

    it('detects volume 2 from experiment ID', () => {
      const data = collectSessionData({
        ...baseInput,
        activeExperiment: { id: 'v2-cap7-esp1', title: 'Condensatore' },
      });
      expect(data.volumeNumber).toBe(2);
      expect(data.volumeColor).toBe('#E8941C');
    });

    it('detects volume 3 from experiment ID', () => {
      const data = collectSessionData({
        ...baseInput,
        activeExperiment: { id: 'v3-cap6-semaforo', title: 'Semaforo' },
      });
      expect(data.volumeNumber).toBe(3);
      expect(data.volumeColor).toBe('#E54B3D');
    });

    it('filters welcome message from chat', () => {
      const data = collectSessionData({
        ...baseInput,
        messages: [
          { id: 'welcome', role: 'assistant', content: 'Benvenuto!' },
          { id: 'msg-1', role: 'user', content: 'Come funziona?' },
          { id: 'msg-2', role: 'assistant', content: 'Ecco come...' },
        ],
      });
      expect(data.chatMessages.length).toBe(2);
      expect(data.messageCount).toBe(2);
    });

    it('includes quiz results when present', () => {
      const data = collectSessionData({
        ...baseInput,
        quizResults: { score: 3, total: 5 },
      });
      expect(data.quizResults.score).toBe(3);
      expect(data.quizResults.total).toBe(5);
    });

    it('includes build progress', () => {
      const data = collectSessionData({
        ...baseInput,
        buildStepIndex: 2,
        buildStepsTotal: 5,
      });
      expect(data.buildProgress.current).toBe(3);
      expect(data.buildProgress.total).toBe(5);
    });

    it('returns null buildProgress when no steps', () => {
      const data = collectSessionData(baseInput);
      expect(data.buildProgress).toBeNull();
    });

    it('includes experiment components as simplified objects', () => {
      const data = collectSessionData({
        ...baseInput,
        activeExperiment: {
          id: 'v1-cap6-esp1',
          title: 'LED',
          components: [
            { type: 'led', id: 'led-1', value: null, color: 'red', extraProp: 'ignored' },
          ],
        },
      });
      expect(data.experiment.components[0]).toEqual({
        type: 'led', id: 'led-1', value: null, color: 'red',
      });
    });

    it('handles null activeExperiment', () => {
      const data = collectSessionData({ ...baseInput, activeExperiment: null });
      expect(data.experiment).toBeNull();
      expect(data.volumeNumber).toBe(1);
    });

    it('handles empty messages array', () => {
      const data = collectSessionData({ ...baseInput, messages: [] });
      expect(data.chatMessages).toEqual([]);
      expect(data.messageCount).toBe(0);
    });

    it('handles null messages', () => {
      const data = collectSessionData({ ...baseInput, messages: null });
      expect(data.chatMessages).toEqual([]);
      expect(data.messageCount).toBe(0);
    });
  });
});
