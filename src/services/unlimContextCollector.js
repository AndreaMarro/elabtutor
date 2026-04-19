/**
 * UNLIM Context Collector — Raccoglie TUTTO il contesto del simulatore per UNLIM
 * (c) Andrea Marro — 14/04/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Prima di ogni sendChat, raccoglie:
 *   a. circuitState (componenti, connessioni, stato)
 *   b. Codice Arduino attuale nell'editor (se Vol3)
 *   c. Errori compilazione se presenti
 *   d. Step corrente nel Passo Passo (N di M)
 *   e. Tempo trascorso sull'esperimento
 *   f. Esperimenti completati dallo studente (da unlimMemory)
 */

import logger from '../utils/logger';

const MEMORY_KEY = 'elab_unlim_memory';
const SESSIONS_KEY = 'elab_unlim_sessions';

/**
 * Get the __ELAB_API safely
 * @returns {Object|null}
 */
function getAPI() {
  return (typeof window !== 'undefined' && window.__ELAB_API) || null;
}

/**
 * (a) Collect full circuit state: components, connections, simulation status
 * @returns {Object|null}
 */
export function collectCircuitState() {
  const api = getAPI();
  if (!api) return null;

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx) return ctx;
  } catch { /* silent */ }

  // Fallback: build from individual calls
  try {
    const state = api.unlim?.getCircuitState?.();
    if (state) return state;
  } catch { /* silent */ }

  return null;
}

/**
 * (b) Collect Arduino code from editor (relevant for Vol3 experiments)
 * @returns {string|null}
 */
export function collectEditorCode() {
  const api = getAPI();
  if (!api) return null;

  try {
    return api.getEditorCode?.() || null;
  } catch { /* silent */ }
  return null;
}

/**
 * (c) Collect compilation errors if present
 * @returns {Object|null} { success, errors, warnings, size }
 */
export function collectCompilationErrors() {
  const api = getAPI();
  if (!api) return null;

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx?.lastCompilation) return ctx.lastCompilation;
  } catch { /* silent */ }

  return null;
}

/**
 * (d) Collect Passo Passo step: current step N of M
 * @returns {Object|null} { current, total, phase }
 */
export function collectBuildStep() {
  const api = getAPI();
  if (!api) return null;

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx?.buildStep) return ctx.buildStep;
  } catch { /* silent */ }

  // Fallback: use individual API methods
  try {
    const index = api.getBuildStepIndex?.();
    if (index !== undefined && index >= 0) {
      return { current: index + 1, total: null, phase: 'unknown' };
    }
  } catch { /* silent */ }

  return null;
}

/**
 * (e) Collect elapsed time on current experiment
 * @returns {number|null} elapsed time in seconds, or null
 */
export function collectElapsedTime() {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    if (sessions.length === 0) return null;

    const lastSession = sessions[sessions.length - 1];
    if (lastSession?.startTime && !lastSession.endTime) {
      // Active session
      return Math.round((Date.now() - new Date(lastSession.startTime).getTime()) / 1000);
    }
  } catch { /* silent */ }
  return null;
}

/**
 * (f) Collect completed experiments from unlimMemory
 * @returns {Object|null} { total, list: [{id, attempts, lastResult}] }
 */
export function collectCompletedExperiments() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { total: 0, list: [] };

    const profile = JSON.parse(raw);
    const experiments = profile.experiments || {};
    const completed = Object.entries(experiments)
      .filter(([, v]) => v.completed)
      .map(([id, v]) => ({
        id,
        attempts: v.attempts || 1,
        lastResult: v.lastResult || 'unknown',
      }));

    return { total: completed.length, list: completed };
  } catch { /* silent */ }
  return { total: 0, list: [] };
}

/**
 * Collect ALL simulator context in one call.
 * Returns a unified object for sendChat's simulatorContext parameter.
 * @returns {Object} Full context snapshot
 */
export function collectFullContext() {
  const api = getAPI();
  const context = {};

  // (a) Circuit state
  const circuitState = collectCircuitState();
  if (circuitState) {
    context.circuit = circuitState;
  }

  // (b) Editor code (only for Vol3 / AVR experiments)
  const editorCode = collectEditorCode();
  if (editorCode) {
    // Truncate to 2000 chars to avoid huge payloads
    context.editorCode = editorCode.length > 2000
      ? editorCode.slice(0, 2000) + '\n// ... (troncato)'
      : editorCode;
  }

  // (c) Compilation errors
  const compilation = collectCompilationErrors();
  if (compilation) {
    context.compilation = compilation;
  }

  // (d) Build step (Passo Passo)
  const buildStep = collectBuildStep();
  if (buildStep) {
    context.buildStep = buildStep;
  }

  // (e) Elapsed time
  const elapsed = collectElapsedTime();
  if (elapsed !== null) {
    context.elapsedSeconds = elapsed;
  }

  // (f) Completed experiments
  const completed = collectCompletedExperiments();
  if (completed && completed.total > 0) {
    context.completedExperiments = completed;
  }

  // Extra: circuit description (human-readable, for AI context)
  try {
    const desc = api?.getCircuitDescription?.();
    if (desc && desc !== 'Nessun circuito caricato.') {
      context.circuitDescription = desc;
    }
  } catch { /* silent */ }

// © Andrea Marro — 19/04/2026 — ELAB Tutor — Tutti i diritti riservati
  // Extra: editor mode + visibility
  try {
    if (api) {
      const editorMode = api.getEditorMode?.();
      const editorVisible = api.isEditorVisible?.();
      if (editorMode) context.editorMode = editorMode;
      if (editorVisible !== undefined) context.editorVisible = editorVisible;
    }
  } catch { /* silent */ }

  // Extra: build mode
  try {
    const buildMode = api?.getBuildMode?.();
    if (buildMode) context.buildMode = buildMode;
  } catch { /* silent */ }

  logger.debug('[unlimContextCollector] Full context collected:', Object.keys(context));
  return context;
}
