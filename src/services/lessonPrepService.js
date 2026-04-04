/**
 * Lesson Preparation Service — UNLIM Guida Invisibile
 * Prepara lezioni basate su esperimenti dei volumi + contesto passato.
 * Il docente chiede "prepara la lezione" e UNLIM genera tutto.
 * Principio Zero: solo il docente interagisce con UNLIM.
 * (c) Andrea Marro — 02/04/2026
 */

import { getLessonPath } from '../data/lesson-paths';
import { getSavedSessions } from '../hooks/useSessionTracker';
import { sendChat } from './api';

/**
 * Build context from past sessions for a given experiment.
 * Tells UNLIM what happened before so it can adapt.
 */
function buildPastContext(experimentId) {
  const sessions = getSavedSessions();
  if (!sessions || sessions.length === 0) return null;

  // Find sessions for this experiment + chapter
  const chapter = experimentId?.match(/v\d+-cap(\d+)/)?.[1];
  const relatedSessions = sessions.filter(s =>
    s.experimentId === experimentId ||
    (chapter && s.experimentId?.includes(`cap${chapter}`))
  ).slice(-5); // Last 5 relevant sessions

  if (relatedSessions.length === 0) return null;

  const context = {
    previousExperiments: relatedSessions.map(s => ({
      id: s.experimentId,
      completed: s.completed || false,
      errors: s.errors?.length || 0,
      duration: s.duration || 0,
      date: s.startTime,
    })),
    completedCount: relatedSessions.filter(s => s.completed).length,
    totalErrors: relatedSessions.reduce((sum, s) => sum + (s.errors?.length || 0), 0),
    commonMistakes: extractCommonMistakes(relatedSessions),
    lastSessionDate: relatedSessions[relatedSessions.length - 1]?.startTime,
  };

  return context;
}

function extractCommonMistakes(sessions) {
  const mistakes = {};
  for (const s of sessions) {
    for (const err of (s.errors || [])) {
      const key = err.type || err.message?.slice(0, 40) || 'unknown';
      mistakes[key] = (mistakes[key] || 0) + 1;
    }
  }
  return Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v}x)`);
}

/**
 * Prepare a lesson plan for the given experiment.
 * Returns structured lesson data that UNLIM can present to the teacher.
 *
 * @param {string} experimentId - e.g. "v1-cap6-esp1"
 * @param {object} options - { circuitState, useAI }
 * @returns {object} Lesson plan with phases, context, suggestions
 */
export async function prepareLesson(experimentId, options = {}) {
  const { circuitState = null, useAI = true } = options;

  // 1. Load lesson path (local data — always available)
  const lessonPath = getLessonPath(experimentId);

  // 2. Build context from past sessions
  const pastContext = buildPastContext(experimentId);

  // 3. Build the lesson plan (offline-first)
  const plan = {
    experimentId,
    lessonPath,
    pastContext,
    phases: lessonPath?.phases || [],
    prepared: true,
    timestamp: new Date().toISOString(),
  };

  // 4. If AI is available, ask UNLIM to personalize
  if (useAI && lessonPath) {
    try {
      const prompt = buildPrepPrompt(lessonPath, pastContext);
      const aiResult = await sendChat(prompt, [], {
        experimentId,
        circuitState,
        skipActions: true, // Don't execute actions during prep
      });

      if (aiResult?.response) {
        plan.aiSuggestions = aiResult.response;
        plan.aiPersonalized = true;
      }
    } catch {
      // AI unavailable — plan works without it
      plan.aiPersonalized = false;
    }
  }

  return plan;
}

/**
 * Build a prompt that asks UNLIM to personalize the lesson.
 */
function buildPrepPrompt(lessonPath, pastContext) {
  let prompt = `Prepara la lezione "${lessonPath.title}" (${lessonPath.experiment_id}).`;
  prompt += `\nObiettivo: ${lessonPath.objective}`;
  prompt += `\nDurata: ${lessonPath.duration_minutes} minuti`;
  prompt += `\nDifficolta: ${lessonPath.difficulty}/3`;

  if (lessonPath.vocabulary?.allowed) {
    prompt += `\nVocabolario consentito: ${lessonPath.vocabulary.allowed.join(', ')}`;
  }

  if (pastContext) {
    prompt += `\n\nCONTESTO SESSIONI PASSATE:`;
    prompt += `\n- Esperimenti completati: ${pastContext.completedCount}/${pastContext.previousExperiments.length}`;
    prompt += `\n- Errori totali: ${pastContext.totalErrors}`;
    if (pastContext.commonMistakes.length > 0) {
      prompt += `\n- Errori frequenti: ${pastContext.commonMistakes.join(', ')}`;
    }
    if (pastContext.lastSessionDate) {
      const days = Math.round((Date.now() - new Date(pastContext.lastSessionDate)) / 86400000);
      prompt += `\n- Ultima sessione: ${days} giorni fa`;
      if (days > 7) {
        prompt += ` (potrebbe servire un ripasso!)`;
      }
    }
  }

  prompt += `\n\nRispondi con:`;
  prompt += `\n1. GANCIO: una frase per catturare l'attenzione della classe (max 20 parole)`;
  prompt += `\n2. ADATTAMENTO: se ci sono errori passati, come affrontarli`;
  prompt += `\n3. DOMANDA CHIAVE: la domanda provocatoria per la fase CHIEDI`;
  prompt += `\n4. PROSSIMO PASSO: cosa fare dopo questa lezione`;

  return prompt;
}

/**
 * Get a lesson summary for the teacher before starting.
 * Quick, no AI call — just local data.
 */
export function getLessonSummary(experimentId) {
  const lessonPath = getLessonPath(experimentId);
  if (!lessonPath) return null;

  const pastContext = buildPastContext(experimentId);

  return {
    title: lessonPath.title,
    chapter: lessonPath.chapter_title,
    objective: lessonPath.objective,
    duration: lessonPath.duration_minutes,
    difficulty: lessonPath.difficulty,
    components: lessonPath.components_needed,
    phases: lessonPath.phases?.map(p => ({
      name: p.name,
      duration: p.duration_minutes,
      message: p.teacher_message,
    })),
    vocabulary: lessonPath.vocabulary,
    nextExperiment: lessonPath.next_experiment,
    pastContext,
    isFirstTime: !pastContext || pastContext.completedCount === 0,
    needsReview: pastContext?.lastSessionDate &&
      (Date.now() - new Date(pastContext.lastSessionDate)) > 7 * 86400000,
  };
}

/**
 * Check if a message is a lesson preparation command.
 */
export function isLessonPrepCommand(text) {
  if (!text) return false;
  const l = text.toLowerCase().trim();
  return [
    /^(prepara|pianifica|organizza)\s+(la\s+)?lezione/,
    /^(prepara|inizia)\s+(l'?esperimento|il\s+lab)/,
    /^(cosa|come)\s+(faccio|facciamo)\s+oggi/,
    /^(sugger|consiglia).*(lezione|esperimento)/,
    /^lezione\s+(di\s+)?oggi/,
    /^preparami la lezione/,
  ].some(p => p.test(l));
}
