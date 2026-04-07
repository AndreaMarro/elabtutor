/**
 * Activation Tracker — Aha Moment & Retention Signals
 *
 * Tracks experiment completions with full metadata in localStorage.
 * Detects:
 *   - First experiment ever completed (aha moment)
 *   - Second unique experiment in the same ISO week (retention signal)
 *
 * Based on EdTech retention research: the weekly second experiment is the
 * strongest predictor of long-term platform retention in K12 B2B.
 *
 * No external dependencies. GDPR-safe (local only, no PII sent).
 * © Andrea Marro — ELAB Tutor — Tutti i diritti riservati
 */

const COMPLETED_KEY = 'elab_completed_experiments';
const MAX_ENTRIES = 500; // keep history bounded to avoid localStorage bloat

function _loadCompleted() {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
  } catch {
    return [];
  }
}

function _saveCompleted(entries) {
  try {
    const trimmed = entries.length > MAX_ENTRIES ? entries.slice(-MAX_ENTRIES) : entries;
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(trimmed));
  } catch { /* private browsing or storage full — silently ignore */ }
}

/**
 * Get all completed experiment entries for this device.
 * @returns {Array<{experimentId, volume, chapter, completedAt, isFirstEver}>}
 */
function getCompletedExperiments() {
  return _loadCompleted();
}

/**
 * Mark an experiment as completed. Idempotent — re-completing only updates timestamp.
 * @param {string} experimentId — e.g. 'v1-cap6-esp1'
 * @param {object} [meta] — optional { volume: number, chapter: number }
 * @returns {{ isFirstEver: boolean, isWeeklySecond: boolean, totalCompleted: number }}
 */
function markExperimentCompleted(experimentId, meta = {}) {
  const entries = _loadCompleted();

  const existingIdx = entries.findIndex(e => e.experimentId === experimentId);
  const isNewEntry = existingIdx === -1;
  const isFirstEver = isNewEntry && entries.length === 0;

  if (isNewEntry) {
    entries.push({
      experimentId,
      volume: meta.volume ?? null,
      chapter: meta.chapter ?? null,
      completedAt: Date.now(),
      isFirstEver,
    });
  } else {
    // Update timestamp only — preserve original isFirstEver flag
    entries[existingIdx] = {
      ...entries[existingIdx],
      completedAt: Date.now(),
    };
  }

  _saveCompleted(entries);

  const isWeeklySecond = isNewEntry ? _checkIsWeeklySecond(entries) : false;
  const totalCompleted = new Set(entries.map(e => e.experimentId)).size;

  return { isFirstEver, isWeeklySecond, totalCompleted };
}

/**
 * Returns true if the current entry makes exactly 2 unique experiments
 * completed within the current ISO week (Mon–Sun).
 * This is the key retention signal per EdTech research.
 */
function _checkIsWeeklySecond(entries) {
  const weekStart = _getISOWeekStart(new Date());
  const weekEnd = weekStart + 7 * 24 * 3600 * 1000;
  const thisWeek = entries.filter(e => e.completedAt >= weekStart && e.completedAt < weekEnd);
  const uniqueThisWeek = new Set(thisWeek.map(e => e.experimentId));
  return uniqueThisWeek.size === 2;
}

/**
 * Returns timestamp (ms) of Monday 00:00:00 of the week containing `date`.
 */
function _getISOWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Get a summary of activation status for this device.
 * Useful for teacher dashboard, debug, or nudge logic.
 * @returns {{ totalCompleted, ahaAchieved, weeklyRetentionAchieved, firstCompletedAt, firstExperimentId }}
 */
function getActivationStatus() {
  const entries = _loadCompleted();
  const uniqueIds = new Set(entries.map(e => e.experimentId));
  const totalCompleted = uniqueIds.size;
  const ahaAchieved = totalCompleted >= 1;
  const weeklyRetentionAchieved = _checkIsWeeklySecond(entries);
  const firstEntry = entries.find(e => e.isFirstEver) ?? entries[0] ?? null;

  return {
    totalCompleted,
    ahaAchieved,
    weeklyRetentionAchieved,
    firstCompletedAt: firstEntry?.completedAt ?? null,
    firstExperimentId: firstEntry?.experimentId ?? null,
  };
}

/**
 * Clear all activation tracking data for this device.
 * Use for testing or explicit user reset.
 */
function clearAll() {
  try { localStorage.removeItem(COMPLETED_KEY); } catch { /* ok */ }
}

export default {
  getCompletedExperiments,
  markExperimentCompleted,
  getActivationStatus,
  clearAll,
  // Exposed for testing
  _getISOWeekStart,
};
