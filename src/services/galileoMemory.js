/**
 * GALILEO ONNIPOTENTE — Persistent Memory Service
 * (c) Andrea Marro — 28/02/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Two-tier memory: localStorage (immediate) + optional backend.
 * Tracks student learning profile across sessions:
 * - Experiments completed and attempts
 * - Quiz results per experiment
 * - Common mistakes (category + detail)
 * - Session summaries (last 10)
 *
 * Exposed globally as window.__galileoMemory for use by buildTutorContext().
 */

const MEMORY_KEY = 'elab_galileo_memory';
const MAX_HISTORY_SESSIONS = 10;
const MAX_MISTAKES = 50;

/**
 * Get the full student profile from localStorage
 * @returns {Object} The student memory profile
 */
function getProfile() {
    try {
        return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    } catch {
        return {};
    }
}

/**
 * Update the student profile (merge with existing)
 * @param {Object} updates - Fields to merge
 */
function updateProfile(updates) {
    const current = getProfile();
    const merged = { ...current, ...updates, lastUpdated: Date.now() };
    try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(merged));
    } catch { /* localStorage full — silent */ }
}

/**
 * Track experiment completion
 * @param {string} experimentId - e.g., 'v1-cap6-esp1'
 * @param {string} result - 'success' | 'partial' | 'skipped'
 */
function trackExperimentCompletion(experimentId, result = 'success') {
    const profile = getProfile();
    if (!profile.experiments) profile.experiments = {};
    const prev = profile.experiments[experimentId] || {};
    profile.experiments[experimentId] = {
        completed: true,
        attempts: (prev.attempts || 0) + 1,
        lastResult: result,
        timestamp: Date.now(),
    };
    updateProfile(profile);
}

/**
 * Track quiz result for an experiment
 * @param {string} experimentId
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total questions
 */
function trackQuizResult(experimentId, correct, total) {
    const profile = getProfile();
    if (!profile.quizzes) profile.quizzes = {};
    profile.quizzes[experimentId] = {
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
        timestamp: Date.now(),
    };
    updateProfile(profile);
}

/**
 * Track a mistake the student made
 * @param {string} category - e.g., 'polarita', 'cortocircuito', 'resistenza-mancante'
 * @param {string} detail - Brief description
 */
function trackMistake(category, detail) {
    const profile = getProfile();
    if (!profile.mistakes) profile.mistakes = [];
    profile.mistakes.push({
        category,
        detail,
        timestamp: Date.now(),
    });
    // Keep last N mistakes
    if (profile.mistakes.length > MAX_MISTAKES) {
        profile.mistakes = profile.mistakes.slice(-MAX_MISTAKES);
    }
    updateProfile(profile);
}

/**
 * Save a summary of the current session (called on session end / tab close)
 * @param {string} summary - Brief description of the session
 */
function saveSessionSummary(summary) {
    const profile = getProfile();
    if (!profile.sessionSummaries) profile.sessionSummaries = [];
    profile.sessionSummaries.push({
        summary,
        timestamp: Date.now(),
    });
    // Keep last N sessions
    if (profile.sessionSummaries.length > MAX_HISTORY_SESSIONS) {
        profile.sessionSummaries = profile.sessionSummaries.slice(-MAX_HISTORY_SESSIONS);
    }
    updateProfile(profile);
}

/**
 * Build a compressed context string for the AI
 * Used by buildTutorContext() in ElabTutorV4.jsx
 * @returns {string} Memory context block or empty string
 */
function buildMemoryContext() {
    const p = getProfile();
    // Don't output anything if there's no meaningful data
    if (!p.experiments && !p.mistakes && !p.quizzes && !p.sessionSummaries) return '';

    const parts = ['[MEMORIA STUDENTE]'];

    // Experiments completed
    if (p.experiments) {
        const completed = Object.keys(p.experiments).filter(k => p.experiments[k].completed);
        parts.push(`Esperimenti completati: ${completed.length}/69`);
        // Show last 3 completed
        const recent = completed.slice(-3);
        if (recent.length > 0) parts.push(`Ultimi: ${recent.join(', ')}`);
    }

    // Quiz performance aggregate
    if (p.quizzes) {
        const quizEntries = Object.entries(p.quizzes);
        if (quizEntries.length > 0) {
            const totalCorrect = quizEntries.reduce((s, [, q]) => s + (q.correct || 0), 0);
            const totalQuestions = quizEntries.reduce((s, [, q]) => s + (q.total || 0), 0);
            if (totalQuestions > 0) {
                parts.push(`Quiz: ${totalCorrect}/${totalQuestions} (${Math.round((totalCorrect / totalQuestions) * 100)}%)`);
            }
            // Find weak areas (quiz < 50%)
            const weak = quizEntries
                .filter(([, q]) => q.total > 0 && q.percentage < 50)
                .map(([id]) => id);
            if (weak.length > 0) parts.push(`Quiz deboli: ${weak.slice(0, 3).join(', ')}`);
        }
    }

    // Common mistakes (top 3 categories)
    if (p.mistakes?.length > 0) {
        const categories = {};
        p.mistakes.forEach(m => {
            categories[m.category] = (categories[m.category] || 0) + 1;
        });
        const top3 = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        parts.push(`Errori frequenti: ${top3.map(([k, v]) => `${k}(x${v})`).join(', ')}`);
    }

    // Last session summary
    if (p.sessionSummaries?.length > 0) {
        const last = p.sessionSummaries[p.sessionSummaries.length - 1];
        parts.push(`Sessione precedente: ${last.summary}`);
    }

    // Backend-enriched data (from /memory/sync merge — FASE 5)
    if (p._backendLevel) parts.push(`Livello backend: ${p._backendLevel}`);
    if (p._backendWeaknesses?.length) parts.push(`Debolezze: ${p._backendWeaknesses.join(', ')}`);
    if (p._backendStrengths?.length) parts.push(`Punti forti: ${p._backendStrengths.join(', ')}`);

    return parts.join('\n');
}

/**
 * Reset all memory (for testing/debugging)
 */
function resetMemory() {
    localStorage.removeItem(MEMORY_KEY);
}

// ─── Backend Sync (Galileo Onnipotente — FASE 5) ──────────────────────────
// Two-way sync: localStorage ↔ nanobot /memory endpoints
// localStorage is source of truth for immediate UX; backend is durable storage

// CRITICAL FIX S62: .trim() prevents trailing whitespace/newline in Vercel env vars
const NANOBOT_URL = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_NANOBOT_URL) || '').trim() || null;
let _syncDirty = false; // tracks if localStorage changed since last sync
let _syncTimer = null;
const SYNC_INTERVAL = 60_000; // 60 seconds

/**
 * Get the session ID (same as api.js uses for tutor chat)
 * @returns {string} Tutor session ID
// © Andrea Marro — 11/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */
function _getSessionId() {
    const KEY = 'elab_tutor_session';
    try {
        return localStorage.getItem(KEY) || '';
    } catch { return ''; }
}

/**
 * Push localStorage profile to backend /memory/sync
 * Fire-and-forget — never blocks UI
 */
async function syncWithBackend() {
    if (!NANOBOT_URL) return;
    const sessionId = _getSessionId();
    if (!sessionId) return;

    const profile = getProfile();
    // Only sync if there's meaningful data
    if (!profile.lastUpdated) return;

    try {
        const res = await fetch(`${NANOBOT_URL}/memory/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, profile }),
        });
        if (res.ok) {
            _syncDirty = false;
        }
    } catch {
        // Silent — backend may be down (Render free tier)
    }
}

/**
 * Pull backend profile and merge with localStorage (backend wins for errors/patterns)
 * Called once on page load to restore cross-session memory
 */
async function loadFromBackend() {
    if (!NANOBOT_URL) return;
    const sessionId = _getSessionId();
    if (!sessionId) return;

    try {
        const res = await fetch(`${NANOBOT_URL}/memory/${encodeURIComponent(sessionId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.profile) return;

        const backend = data.profile;
        const local = getProfile();

        // Merge strategy: backend has richer error analysis, local has latest UX state
        const merged = { ...local };

        // Backend wins: experiments_completed (superset)
        if (backend.experiments_completed?.length) {
            if (!merged.experiments) merged.experiments = {};
            for (const expId of backend.experiments_completed) {
                if (!merged.experiments[expId]) {
                    merged.experiments[expId] = { completed: true, attempts: 1, timestamp: Date.now() };
                }
            }
        }

        // Backend wins: quiz totals (cumulative)
        if (backend.quiz_results?.total > 0) {
            if (!merged.quizzes) merged.quizzes = {};
            const localQuizTotal = Object.values(merged.quizzes || {}).reduce((s, q) => s + (q.total || 0), 0);
            // Only apply if backend has MORE data than local
            if (backend.quiz_results.total > localQuizTotal) {
                merged._backendQuiz = backend.quiz_results;
            }
        }

        // Backend wins: level (more accurate with error history)
        if (backend.level && backend.level !== 'principiante') {
            merged._backendLevel = backend.level;
        }

        // Backend wins: weaknesses + strengths
        if (backend.weaknesses?.length) merged._backendWeaknesses = backend.weaknesses;
        if (backend.strengths?.length) merged._backendStrengths = backend.strengths;

        updateProfile(merged);
    } catch {
        // Silent — backend may be unavailable
    }
}

/**
 * Initialize auto-sync: periodic push + beforeunload
 * Call once when the tutor loads
 */
function initSync() {
    // Load from backend on startup (async, non-blocking)
    loadFromBackend();

    // Periodic sync every 60s (only if dirty)
    if (!_syncTimer) {
        _syncTimer = setInterval(() => {
            if (_syncDirty) syncWithBackend();
        }, SYNC_INTERVAL);
    }

    // Sync on tab close
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            if (_syncDirty) {
                // Use sendBeacon for reliability on tab close
                const sessionId = _getSessionId();
                if (sessionId && NANOBOT_URL) {
                    const profile = getProfile();
                    try {
                        navigator.sendBeacon(
                            `${NANOBOT_URL}/memory/sync`,
                            new Blob([JSON.stringify({ sessionId, profile })], { type: 'application/json' })
                        );
                    } catch { /* last resort — silent */ }
                }
            }
        });
    }
}

// Mark dirty on any profile update (patch original updateProfile)
const _origUpdateProfile = updateProfile;
function updateProfileWithSync(updates) {
    _origUpdateProfile(updates);
    _syncDirty = true;
}

// Public API
export const galileoMemory = {
    getProfile,
    updateProfile: updateProfileWithSync,
    trackExperimentCompletion,
    trackQuizResult,
    trackMistake,
    saveSessionSummary,
    buildMemoryContext,
    resetMemory,
    // FASE 5: Backend sync
    syncWithBackend,
    loadFromBackend,
    initSync,
};

// Expose globally for buildTutorContext() access (avoids circular imports)
if (typeof window !== 'undefined') {
    window.__galileoMemory = galileoMemory;
}

export default galileoMemory;
