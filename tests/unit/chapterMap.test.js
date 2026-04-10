/**
 * chapterMap.test.js — Test per chapter-map.js
 * Validazione struttura capitoli, navigazione, progressi, scratchXml mapping.
 */
import { describe, it, expect } from 'vitest';
import {
  getChapterMap,
  getChapters,
  getChapterGroups,
  getNextExperiment,
  getPrevExperiment,
  getExperimentPosition,
  getChapterProgress,
  getVolumeProgress,
  getScratchExperimentIds,
  getVolumeForExperiment,
} from '../../src/data/chapter-map';

describe('chapter-map — structure', () => {
  it('getChapterMap returns 3 volumes', () => {
    const map = getChapterMap();
    expect(map).toHaveLength(3);
    expect(map[0].key).toBe(1);
    expect(map[1].key).toBe(2);
    expect(map[2].key).toBe(3);
  });

  it('every volume has chapters with experiments', () => {
    const map = getChapterMap();
    for (const vol of map) {
      expect(vol.chapters.length).toBeGreaterThan(0);
      for (const chap of vol.chapters) {
        expect(chap.name).toBeTruthy();
        expect(chap.experiments.length).toBeGreaterThan(0);
        expect(chap.count).toBe(chap.experiments.length);
        expect(chap.experimentIds).toHaveLength(chap.count);
      }
    }
  });

  it('Vol1 has 38 total experiments across chapters', () => {
    const chapters = getChapters(1);
    const total = chapters.reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(38);
  });

  it('Vol2 has 27 total experiments across chapters', () => {
    const chapters = getChapters(2);
    const total = chapters.reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(27);
  });

  it('Vol3 has 27 total experiments across chapters', () => {
    const chapters = getChapters(3);
    const total = chapters.reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(27);
  });

  it('chapter numbers are extracted correctly', () => {
    const chapters = getChapters(1);
    expect(chapters[0].number).toBe(6); // Capitolo 6
    const chapters3 = getChapters(3);
    expect(chapters3[0].number).toBe(5); // Capitolo 5
  });

  it('getChapters returns empty for invalid volume', () => {
    expect(getChapters(0)).toEqual([]);
    expect(getChapters(99)).toEqual([]);
  });

  it('experiment IDs are unique across all chapters', () => {
    const map = getChapterMap();
    const allIds = new Set();
    for (const vol of map) {
      for (const chap of vol.chapters) {
        for (const id of chap.experimentIds) {
          expect(allIds.has(id)).toBe(false);
          allIds.add(id);
        }
      }
    }
    expect(allIds.size).toBe(92);
  });
});

describe('chapter-map — getChapterGroups', () => {
  it('groups experiments by chapter name', () => {
    const experiments = [
      { id: 'a', chapter: 'Cap 1' },
      { id: 'b', chapter: 'Cap 1' },
      { id: 'c', chapter: 'Cap 2' },
    ];
    const groups = getChapterGroups(experiments);
    expect(groups).toHaveLength(2);
    expect(groups[0][0]).toBe('Cap 1');
    expect(groups[0][1]).toHaveLength(2);
    expect(groups[1][0]).toBe('Cap 2');
    expect(groups[1][1]).toHaveLength(1);
  });

  it('handles missing chapter field', () => {
    const groups = getChapterGroups([{ id: 'x' }]);
    expect(groups[0][0]).toBe('Altro');
  });

  it('returns empty for empty input', () => {
    expect(getChapterGroups([])).toEqual([]);
  });
});

describe('chapter-map — navigation', () => {
  it('getNextExperiment returns next in same chapter', () => {
    const next = getNextExperiment('v1-cap6-esp1');
    expect(next).toBeTruthy();
    expect(next.experiment.id).toBe('v1-cap6-esp2');
    expect(next.isNewChapter).toBe(false);
  });

  it('getNextExperiment crosses chapter boundary', () => {
    // Last experiment of Cap 6 Vol1 is v1-cap6-esp3
    const next = getNextExperiment('v1-cap6-esp3');
    expect(next).toBeTruthy();
    expect(next.isNewChapter).toBe(true);
    expect(next.chapter).toContain('Capitolo 7');
  });

  it('getNextExperiment returns null at end of volume', () => {
    // Last experiment in Vol1 is v1-cap14-esp1
    const next = getNextExperiment('v1-cap14-esp1');
    expect(next).toBeNull();
  });

  it('getPrevExperiment returns previous in same chapter', () => {
    const prev = getPrevExperiment('v1-cap6-esp2');
    expect(prev).toBeTruthy();
    expect(prev.experiment.id).toBe('v1-cap6-esp1');
    expect(prev.isNewChapter).toBe(false);
  });

  it('getPrevExperiment crosses chapter boundary', () => {
    // First of Cap 7 Vol1 is v1-cap7-esp1
    const prev = getPrevExperiment('v1-cap7-esp1');
    expect(prev).toBeTruthy();
    expect(prev.isNewChapter).toBe(true);
    expect(prev.experiment.id).toBe('v1-cap6-esp3');
  });

  it('getPrevExperiment returns null at start of volume', () => {
    const prev = getPrevExperiment('v1-cap6-esp1');
    expect(prev).toBeNull();
  });

  it('navigation returns null for unknown ID', () => {
    expect(getNextExperiment('nonexistent')).toBeNull();
    expect(getPrevExperiment('nonexistent')).toBeNull();
  });
});

describe('chapter-map — position', () => {
  it('getExperimentPosition returns correct position for first experiment', () => {
    const pos = getExperimentPosition('v1-cap6-esp1');
    expect(pos).toBeTruthy();
    expect(pos.volumeKey).toBe(1);
    expect(pos.chapterNumber).toBe(6);
    expect(pos.posInChapter).toBe(1);
    expect(pos.totalInChapter).toBe(3);
    expect(pos.posInVolume).toBe(1);
    expect(pos.totalInVolume).toBe(38);
  });

  it('getExperimentPosition returns correct position mid-volume', () => {
    // v1-cap7-esp1 is the 4th experiment in Vol1 (after 3 in Cap6)
    const pos = getExperimentPosition('v1-cap7-esp1');
    expect(pos).toBeTruthy();
    expect(pos.chapterNumber).toBe(7);
    expect(pos.posInChapter).toBe(1);
    expect(pos.posInVolume).toBe(4);
  });

  it('getExperimentPosition returns null for unknown ID', () => {
    expect(getExperimentPosition('nonexistent')).toBeNull();
  });

  it('getVolumeForExperiment returns correct volume', () => {
    expect(getVolumeForExperiment('v1-cap6-esp1')).toBe(1);
    expect(getVolumeForExperiment('v2-cap3-esp1')).toBe(2);
    expect(getVolumeForExperiment('v3-cap5-esp1')).toBe(3);
    expect(getVolumeForExperiment('nonexistent')).toBeNull();
  });
});

describe('chapter-map — progress', () => {
  it('getChapterProgress calculates correctly', () => {
    // Use the exact chapter name from the data
    const chapters = getChapters(1);
    const cap6Name = chapters[0].name; // "Capitolo 6 - Cos'è il diodo LED?"
    const progress = getChapterProgress(
      cap6Name,
      1,
      ['v1-cap6-esp1', 'v1-cap6-esp2']
    );
    expect(progress.completed).toBe(2);
    expect(progress.total).toBe(3);
    expect(progress.percent).toBe(67);
  });

  it('getChapterProgress returns zero for unknown chapter', () => {
    const progress = getChapterProgress('Nonexistent', 1, []);
    expect(progress).toEqual({ completed: 0, total: 0, percent: 0 });
  });

  it('getVolumeProgress calculates correctly', () => {
    const progress = getVolumeProgress(1, ['v1-cap6-esp1']);
    expect(progress.completed).toBe(1);
    expect(progress.total).toBe(38);
    expect(progress.percent).toBe(3); // 1/38 ≈ 2.6 → round to 3
  });

  it('getVolumeProgress returns zero for invalid volume', () => {
    expect(getVolumeProgress(99, [])).toEqual({ completed: 0, total: 0, percent: 0 });
  });
});

describe('chapter-map — scratch', () => {
  it('getScratchExperimentIds returns only Vol3 experiments', () => {
    const ids = getScratchExperimentIds();
    expect(ids.length).toBeGreaterThan(0);
    // All scratch experiments should be Vol3
    for (const id of ids) {
      expect(id.startsWith('v3-')).toBe(true);
    }
  });

  it('hasScratch is true for chapters with scratchXml experiments', () => {
    const chapters = getChapters(3);
    // At least one chapter in Vol3 should have scratch
    const withScratch = chapters.filter(c => c.hasScratch);
    expect(withScratch.length).toBeGreaterThan(0);
  });

  it('Vol1 and Vol2 chapters have no scratch', () => {
    for (const vol of [1, 2]) {
      const chapters = getChapters(vol);
      for (const chap of chapters) {
        expect(chap.hasScratch).toBe(false);
      }
    }
  });
});
