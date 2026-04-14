/**
 * ELAB Wake Word — "Ehi UNLIM" detector via browser SpeechRecognition
 *
 * Ascolta continuamente in background. Quando rileva la frase "ehi unlim"
 * (o varianti come "hey unlim", "ei unlim"), chiama il callback onWake.
 * Dopo il wake, passa in modalità "command" per 5 secondi e inoltra
 * il testo catturato come comando a UNLIM.
 *
 * Costo: ZERO (usa l'API browser gratuita)
 * Supporto: Chrome, Edge (webkitSpeechRecognition)
 * NON supportato: Firefox, Safari
 *
 * © Andrea Marro — 14/04/2026
 */

import logger from '../utils/logger';

const WAKE_PHRASES = [
  'ehi unlim', 'hey unlim', 'ei unlim', 'ehi un lim',
  'hey un lim', 'ei un lim', 'e unlim', 'ehi anelim',
  'hey anelim', 'ehi online', 'hey online',
];

const COMMAND_WINDOW_MS = 5000;

let recognition = null;
let isListening = false;
let commandMode = false;
let commandTimeout = null;
let onWakeCallback = null;
let onCommandCallback = null;

/**
 * Check if wake word detection is supported
 * @returns {boolean}
 */
export function isWakeWordSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Start listening for "Ehi UNLIM"
 * @param {Object} options
 * @param {function} options.onWake — called when wake word detected (no args)
 * @param {function} options.onCommand — called with command text after wake (string)
 * @param {string} [options.lang='it-IT'] — recognition language
 * @returns {boolean} true if started
 */
export function startWakeWordListener({ onWake, onCommand, lang = 'it-IT' } = {}) {
  if (!isWakeWordSupported()) {
    logger.warn('[WakeWord] SpeechRecognition not supported');
    return false;
  }

  if (isListening) {
    logger.debug('[WakeWord] Already listening');
    return true;
  }

  onWakeCallback = onWake;
  onCommandCallback = onCommand;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];

      // Check all alternatives for wake word
      for (let j = 0; j < result.length; j++) {
        const transcript = result[j].transcript.toLowerCase().trim();

        if (!commandMode) {
          // Listening mode — check for wake word
          const isWake = WAKE_PHRASES.some(phrase => transcript.includes(phrase));
          if (isWake) {
            logger.info('[WakeWord] Wake detected:', transcript);
            commandMode = true;
            onWakeCallback?.();

            // Extract command after wake word (if any)
            let afterWake = transcript;
            for (const phrase of WAKE_PHRASES) {
              const idx = afterWake.indexOf(phrase);
              if (idx >= 0) {
                afterWake = afterWake.substring(idx + phrase.length).trim();
                break;
              }
            }
            if (afterWake.length > 2 && result.isFinal) {
              onCommandCallback?.(afterWake);
              commandMode = false;
              clearTimeout(commandTimeout);
            } else {
              // Wait for command in next 5s
              clearTimeout(commandTimeout);
              commandTimeout = setTimeout(() => {
                commandMode = false;
                logger.debug('[WakeWord] Command window expired');
              }, COMMAND_WINDOW_MS);
            }
            return;
          }
        } else {
          // Command mode — forward speech as command
          if (result.isFinal && transcript.length > 2) {
            logger.info('[WakeWord] Command:', transcript);
            onCommandCallback?.(transcript);
            commandMode = false;
            clearTimeout(commandTimeout);
            return;
          }
        }
      }
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    logger.warn('[WakeWord] Error:', event.error);
    // Auto-restart on non-fatal errors
    if (event.error === 'network' || event.error === 'audio-capture') {
      setTimeout(() => {
        if (isListening) {
          try { recognition.start(); } catch { /* already started */ }
        }
      }, 1000);
    }
  };

  recognition.onend = () => {
    // Auto-restart — continuous listening
    if (isListening) {
      try { recognition.start(); } catch { /* already started */ }
    }
  };

  try {
    recognition.start();
    isListening = true;
    logger.info('[WakeWord] Listening for "Ehi UNLIM"...');
    return true;
  } catch (err) {
    logger.error('[WakeWord] Start failed:', err.message);
    return false;
  }
}

/**
 * Stop listening
 */
export function stopWakeWordListener() {
  isListening = false;
  commandMode = false;
  clearTimeout(commandTimeout);
  if (recognition) {
    try { recognition.stop(); } catch { /* */ }
    recognition = null;
  }
  logger.info('[WakeWord] Stopped');
}

/**
 * Check if currently listening
 * @returns {boolean}
 */
export function isWakeWordListening() {
  return isListening;
}
