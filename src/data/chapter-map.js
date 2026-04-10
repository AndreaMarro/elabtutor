/**
 * ELAB Chapter Map — Mappa strutturata volumi → capitoli → esperimenti
 *
 * Fornisce navigazione sequenziale tra esperimenti e capitoli,
 * calcolo progressi, e metadata per l'UI (ExperimentPicker, LessonPathPanel).
 *
 * Principio Zero: il docente vede subito dove si trova e dove andare.
 * © Andrea Marro — 10/04/2026
 */

import EXPERIMENTS_VOL1 from './experiments-vol1';
import EXPERIMENTS_VOL2 from './experiments-vol2';
import EXPERIMENTS_VOL3 from './experiments-vol3';
import { hasLessonPath } from './lesson-paths/index';

// ─── Volume definitions ────────────────────────────────────
const VOLUME_DEFS = [
  { key: 1, data: EXPERIMENTS_VOL1, color: '#4A7A25', label: 'Volume 1', sub: 'Le Basi' },
  { key: 2, data: EXPERIMENTS_VOL2, color: '#E8941C', label: 'Volume 2', sub: 'Approfondiamo' },
  { key: 3, data: EXPERIMENTS_VOL3, color: '#E54B3D', label: 'Volume 3', sub: 'Arduino' },
];

// ─── Build chapter map (computed once at import time) ──────
function buildChapterMap() {
  const volumes = [];
  const experimentIndex = new Map(); // id → { volIdx, chapIdx, expIdx }
  const allExperimentsOrdered = [];

  for (let vi = 0; vi < VOLUME_DEFS.length; vi++) {
    const vdef = VOLUME_DEFS[vi];
    const experiments = vdef.data.experiments || [];
    const chaptersOrdered = [];
    const seenChapters = new Map(); // chapter name → index in chaptersOrdered

    for (let ei = 0; ei < experiments.length; ei++) {
      const exp = experiments[ei];
      const chapterName = exp.chapter || 'Altro';

      if (!seenChapters.has(chapterName)) {
        seenChapters.set(chapterName, chaptersOrdered.length);
        chaptersOrdered.push({
          name: chapterName,
          number: extractChapterNumber(chapterName),
          experiments: [],
        });
      }

      const chapIdx = seenChapters.get(chapterName);
      const expIdx = chaptersOrdered[chapIdx].experiments.length;

      chaptersOrdered[chapIdx].experiments.push(exp);
      experimentIndex.set(exp.id, { volIdx: vi, chapIdx, expIdx });
      allExperimentsOrdered.push(exp);
    }

    // Add metadata to each chapter
    for (const chap of chaptersOrdered) {
      chap.count = chap.experiments.length;
      chap.hasScratch = chap.experiments.some(e => !!e.scratchXml);
      chap.hasLessonPath = chap.experiments.some(e => hasLessonPath(e.id));
      chap.experimentIds = chap.experiments.map(e => e.id);
    }

    volumes.push({
      key: vdef.key,
      label: vdef.label,
      sub: vdef.sub,
      color: vdef.color,
      chapters: chaptersOrdered,
      totalExperiments: experiments.length,
    });
  }

  return { volumes, experimentIndex, allExperimentsOrdered };
}

function extractChapterNumber(chapterName) {
  const m = chapterName.match(/Capitolo\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

// Build once
const { volumes: CHAPTER_MAP, experimentIndex: EXP_INDEX, allExperimentsOrdered: ALL_ORDERED } = buildChapterMap();

// ─── Public API ────────────────────────────────────────────

/**
 * Get the full chapter map (3 volumes, each with ordered chapters)
 * @returns {Array<{key, label, sub, color, chapters, totalExperiments}>}
 */
export function getChapterMap() {
  return CHAPTER_MAP;
}

/**
 * Get chapters for a specific volume (1-based)
 * @param {number} volumeNumber - 1, 2 or 3
 * @returns {Array<{name, number, experiments, count, hasScratch, hasLessonPath, experimentIds}>}
 */
export function getChapters(volumeNumber) {
  const vol = CHAPTER_MAP[volumeNumber - 1];
  return vol ? vol.chapters : [];
}

/**
 * Get chapter groups for a list of experiments (for search/filter results)
 * Replaces the inline getChapterGroups() in ExperimentPicker
 * @param {Array} experiments - filtered experiment list
 * @returns {Array<[string, Array]>} - [[chapterName, experiments], ...]
 */
export function getChapterGroups(experiments) {
  const groups = {};
  for (const exp of experiments) {
    const ch = exp.chapter || 'Altro';
    if (!groups[ch]) groups[ch] = [];
    groups[ch].push(exp);
  }
  return Object.entries(groups);
}

/**
 * Get next experiment in sequence (across chapters, within same volume)
 * @param {string} currentId - current experiment ID
 * @returns {{experiment, chapter, isNewChapter}|null}
 */
export function getNextExperiment(currentId) {
  const loc = EXP_INDEX.get(currentId);
  if (!loc) return null;

  const vol = CHAPTER_MAP[loc.volIdx];
  const chap = vol.chapters[loc.chapIdx];

  // Next in same chapter
  if (loc.expIdx + 1 < chap.experiments.length) {
    return {
      experiment: chap.experiments[loc.expIdx + 1],
      chapter: chap.name,
      isNewChapter: false,
    };
  }

  // First of next chapter
  if (loc.chapIdx + 1 < vol.chapters.length) {
    const nextChap = vol.chapters[loc.chapIdx + 1];
    return {
      experiment: nextChap.experiments[0],
      chapter: nextChap.name,
      isNewChapter: true,
    };
  }

  return null; // End of volume
}

/**
 * Get previous experiment in sequence
 * @param {string} currentId
 * @returns {{experiment, chapter, isNewChapter}|null}
 */
export function getPrevExperiment(currentId) {
  const loc = EXP_INDEX.get(currentId);
  if (!loc) return null;

  const vol = CHAPTER_MAP[loc.volIdx];
  const chap = vol.chapters[loc.chapIdx];

  // Previous in same chapter
  if (loc.expIdx > 0) {
    return {
      experiment: chap.experiments[loc.expIdx - 1],
      chapter: chap.name,
      isNewChapter: false,
    };
  }

  // Last of previous chapter
  if (loc.chapIdx > 0) {
    const prevChap = vol.chapters[loc.chapIdx - 1];
    return {
      experiment: prevChap.experiments[prevChap.experiments.length - 1],
      chapter: prevChap.name,
      isNewChapter: true,
    };
  }

  return null; // Start of volume
}

/**
 * Get experiment position info (for "Esperimento 3 di 9" display)
 * @param {string} experimentId
 * @returns {{volumeKey, volumeLabel, chapterName, chapterNumber, posInChapter, totalInChapter, posInVolume, totalInVolume}|null}
 */
export function getExperimentPosition(experimentId) {
  const loc = EXP_INDEX.get(experimentId);
  if (!loc) return null;

  const vol = CHAPTER_MAP[loc.volIdx];
  const chap = vol.chapters[loc.chapIdx];

// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
  // Calculate position in volume
  let posInVolume = 0;
  for (let ci = 0; ci < loc.chapIdx; ci++) {
    posInVolume += vol.chapters[ci].count;
  }
  posInVolume += loc.expIdx + 1;

  return {
    volumeKey: vol.key,
    volumeLabel: vol.label,
    volumeColor: vol.color,
    chapterName: chap.name,
    chapterNumber: chap.number,
    posInChapter: loc.expIdx + 1,
    totalInChapter: chap.count,
    posInVolume,
    totalInVolume: vol.totalExperiments,
  };
}

/**
 * Calculate chapter progress
 * @param {string} chapterName
 * @param {number} volumeNumber
 * @param {string[]} completedIds
 * @returns {{completed, total, percent}}
 */
export function getChapterProgress(chapterName, volumeNumber, completedIds = []) {
  const chapters = getChapters(volumeNumber);
  const chap = chapters.find(c => c.name === chapterName);
  if (!chap) return { completed: 0, total: 0, percent: 0 };

  const completed = chap.experimentIds.filter(id => completedIds.includes(id)).length;
  return {
    completed,
    total: chap.count,
    percent: chap.count > 0 ? Math.round((completed / chap.count) * 100) : 0,
  };
}

/**
 * Calculate volume progress
 * @param {number} volumeNumber
 * @param {string[]} completedIds
 * @returns {{completed, total, percent}}
 */
export function getVolumeProgress(volumeNumber, completedIds = []) {
  const vol = CHAPTER_MAP[volumeNumber - 1];
  if (!vol) return { completed: 0, total: 0, percent: 0 };

  let completed = 0;
  for (const chap of vol.chapters) {
    completed += chap.experimentIds.filter(id => completedIds.includes(id)).length;
  }

  return {
    completed,
    total: vol.totalExperiments,
    percent: vol.totalExperiments > 0 ? Math.round((completed / vol.totalExperiments) * 100) : 0,
  };
}

/**
 * Get all experiment IDs that have scratchXml defined
 * @returns {string[]}
 */
export function getScratchExperimentIds() {
  return ALL_ORDERED.filter(e => !!e.scratchXml).map(e => e.id);
}

/**
 * Find which volume an experiment belongs to
 * @param {string} experimentId
 * @returns {number|null} - 1, 2, or 3
 */
export function getVolumeForExperiment(experimentId) {
  const loc = EXP_INDEX.get(experimentId);
  return loc ? CHAPTER_MAP[loc.volIdx].key : null;
}

export default {
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
};
