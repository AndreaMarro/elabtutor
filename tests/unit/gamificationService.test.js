/**
 * Tests for gamificationService.js
 * Points, streaks, badges, orchestration.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import gamification from '../../src/services/gamificationService.js';

describe('gamificationService', () => {
  let localData;

  beforeEach(() => {
    localData = {};
    localStorage.getItem.mockImplementation((k) => localData[k] ?? null);
    localStorage.setItem.mockImplementation((k, v) => { localData[k] = v; });
    localStorage.removeItem.mockImplementation((k) => { delete localData[k]; });
    vi.clearAllMocks();
    localData = {};
    // Re-setup mocks after clearAllMocks
    localStorage.getItem.mockImplementation((k) => localData[k] ?? null);
    localStorage.setItem.mockImplementation((k, v) => { localData[k] = v; });
  });

  describe('POINT_VALUES', () => {
    it('has experimentCompleted value', () => {
      expect(gamification.POINT_VALUES.experimentCompleted).toBe(10);
    });

    it('has quizCorrect value', () => {
      expect(gamification.POINT_VALUES.quizCorrect).toBe(5);
    });

    it('has streakDay value', () => {
      expect(gamification.POINT_VALUES.streakDay).toBe(3);
    });

    it('has firstExperiment value', () => {
      expect(gamification.POINT_VALUES.firstExperiment).toBe(20);
    });

    it('has gameWon value', () => {
      expect(gamification.POINT_VALUES.gameWon).toBe(8);
    });
  });

  describe('getPoints / getTotalPoints', () => {
    it('returns 0 total when no data', () => {
      expect(gamification.getTotalPoints()).toBe(0);
    });

    it('returns stored points total', () => {
      localData['elab_gamification_points'] = JSON.stringify({ total: 42, history: [] });
      expect(gamification.getTotalPoints()).toBe(42);
    });

    it('returns empty history by default', () => {
      expect(gamification.getPoints().history).toEqual([]);
    });

    it('handles invalid JSON gracefully', () => {
      localData['elab_gamification_points'] = 'invalid{{json';
      expect(gamification.getTotalPoints()).toBe(0);
    });
  });

  describe('addPoints', () => {
    it('adds points and returns new total', () => {
      const total = gamification.addPoints(10, 'test');
      expect(total).toBe(10);
    });

    it('accumulates multiple additions', () => {
      gamification.addPoints(10, 'first');
      const total = gamification.addPoints(5, 'second');
      expect(total).toBe(15);
    });

    it('adds history entry with reason', () => {
      gamification.addPoints(10, 'Esperimento abc');
      const { history } = gamification.getPoints();
      expect(history[history.length - 1].reason).toBe('Esperimento abc');
      expect(history[history.length - 1].amount).toBe(10);
    });

    it('history entries have timestamp', () => {
      const before = Date.now();
      gamification.addPoints(5, 'quiz');
      const after = Date.now();
      const entry = gamification.getPoints().history.at(-1);
      expect(entry.ts).toBeGreaterThanOrEqual(before);
      expect(entry.ts).toBeLessThanOrEqual(after);
    });

    it('caps history at 200 entries', () => {
      // Pre-populate with 200 entries
      const data = { total: 0, history: Array.from({ length: 200 }, (_, i) => ({ amount: 1, reason: `r${i}`, ts: i })) };
      localData['elab_gamification_points'] = JSON.stringify(data);
      gamification.addPoints(1, 'overflow');
      const { history } = gamification.getPoints();
      expect(history.length).toBe(200);
    });
  });

  describe('getStreak / updateStreak', () => {
    it('returns 0 streak when no data', () => {
      const streak = gamification.getStreak();
      expect(streak.current).toBe(0);
      expect(streak.best).toBe(0);
    });

    it('starts streak at 1 on first update', () => {
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1);
    });

    it('does not increment streak when called twice same day', () => {
      gamification.updateStreak();
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1);
    });

    it('sets lastDate to today', () => {
      const today = new Date().toISOString().slice(0, 10);
      const streak = gamification.updateStreak();
      expect(streak.lastDate).toBe(today);
    });

    it('increments streak for consecutive day', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      localData['elab_gamification_streak'] = JSON.stringify({
        current: 3,
        lastDate: yesterday,
        best: 3,
      });
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(4);
    });

    it('resets streak when day was skipped', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      localData['elab_gamification_streak'] = JSON.stringify({
        current: 5,
        lastDate: twoDaysAgo,
        best: 5,
      });
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1);
    });

    it('updates best when streak exceeds it', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      localData['elab_gamification_streak'] = JSON.stringify({
        current: 9,
        lastDate: yesterday,
        best: 9,
      });
      const streak = gamification.updateStreak();
      expect(streak.best).toBe(10);
    });

    it('handles invalid JSON gracefully', () => {
      localData['elab_gamification_streak'] = 'bad{{json';
      const streak = gamification.updateStreak();
      expect(streak.current).toBe(1);
    });
  });

  describe('BADGE_DEFS', () => {
    it('has 8 badge definitions', () => {
      expect(gamification.BADGE_DEFS).toHaveLength(8);
    });

    it('each badge has id, name, desc, icon, check', () => {
      for (const badge of gamification.BADGE_DEFS) {
        expect(badge.id).toBeTruthy();
        expect(badge.name).toBeTruthy();
        expect(badge.desc).toBeTruthy();
        expect(badge.icon).toBeTruthy();
        expect(typeof badge.check).toBe('function');
      }
    });
  });

  describe('checkAndUnlockBadges', () => {
    it('returns empty array when no badges unlocked', () => {
      const result = gamification.checkAndUnlockBadges({ experiments: 0, streak: 0, quizzes: 0 });
      expect(result).toEqual([]);
    });

    it('unlocks first-experiment badge', () => {
      const result = gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      expect(result.some(b => b.id === 'first-experiment')).toBe(true);
    });

    it('unlocks exp-5 badge', () => {
      const result = gamification.checkAndUnlockBadges({ experiments: 5, streak: 0, quizzes: 0 });
      expect(result.some(b => b.id === 'exp-5')).toBe(true);
    });

    it('unlocks streak-3 badge', () => {
      const result = gamification.checkAndUnlockBadges({ experiments: 0, streak: 3, quizzes: 0 });
      expect(result.some(b => b.id === 'streak-3')).toBe(true);
    });

    it('does not unlock same badge twice', () => {
      localData['elab_gamification_badges'] = JSON.stringify(['first-experiment']);
      const result = gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      expect(result.every(b => b.id !== 'first-experiment')).toBe(true);
    });

    it('saves new badges to localStorage', () => {
      gamification.checkAndUnlockBadges({ experiments: 1, streak: 0, quizzes: 0 });
      const stored = JSON.parse(localData['elab_gamification_badges'] || '[]');
      expect(stored).toContain('first-experiment');
    });
  });

  describe('getAllBadges', () => {
    it('returns all 8 badges', () => {
      expect(gamification.getAllBadges()).toHaveLength(8);
    });

    it('marks unlocked badges correctly', () => {
      localData['elab_gamification_badges'] = JSON.stringify(['first-experiment']);
      const all = gamification.getAllBadges();
      const first = all.find(b => b.id === 'first-experiment');
      expect(first.unlocked).toBe(true);
    });

    it('marks locked badges as not unlocked', () => {
      localData['elab_gamification_badges'] = JSON.stringify([]);
      const all = gamification.getAllBadges();
      expect(all.every(b => !b.unlocked)).toBe(true);
    });
  });

  describe('onQuizCorrect / onQuizWrong', () => {
    it('onQuizCorrect adds quizCorrect points', () => {
      const total = gamification.onQuizCorrect('exp-1');
      expect(total).toBe(gamification.POINT_VALUES.quizCorrect);
    });

    it('onQuizWrong does not throw', () => {
      expect(() => gamification.onQuizWrong()).not.toThrow();
    });
  });

  describe('onGameWon', () => {
    it('adds gameWon points', () => {
      const total = gamification.onGameWon('game-1');
      expect(total).toBe(gamification.POINT_VALUES.gameWon);
    });
  });

  describe('teardown', () => {
    it('does not throw', () => {
      expect(() => gamification.teardown()).not.toThrow();
    });

    it('can be called multiple times safely', () => {
      gamification.teardown();
      expect(() => gamification.teardown()).not.toThrow();
    });
  });
});
