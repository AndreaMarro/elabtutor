/**
 * Nanobot V2 — AI Model Router
 * Routes messages to the optimal Gemini model based on complexity.
 * 70% Flash-Lite | 25% Flash | 5% Pro
 * (c) Andrea Marro — 02/04/2026
 */

import type { GeminiModel, CircuitState } from './types.ts';

// Keywords that indicate medium complexity (→ Flash)
const FLASH_KEYWORDS = /spiega|come funziona|differenza|confronta|progetta|perch[eé]|ragion|principio|legge|formula|calcola|analogia|esempio/i;

// Keywords that indicate high complexity (→ Pro)
const PRO_KEYWORDS = /analizza|debug|perch[eé] non|errore complesso|non capisco perch|dove sbaglio|trova il problema|circuito non funziona/i;

/**
 * Route a message to the optimal Gemini model.
 * @param message - User message text
 * @param hasImages - Whether the request includes images (vision)
 * @param circuitState - Current circuit state (errors indicate complexity)
 */
export function routeModel(
  message: string,
  hasImages: boolean = false,
  circuitState?: CircuitState | null,
): GeminiModel {
  const hasErrors = (circuitState?.errors?.length ?? 0) > 0;

  // PRO (5%): vision + circuit errors, or explicit complex analysis
  if (hasImages && hasErrors) return 'gemini-3.1-pro-preview';
  if (PRO_KEYWORDS.test(message)) return 'gemini-3.1-pro-preview';

  // FLASH (25%): vision without errors, explanations, reasoning
  if (hasImages) return 'gemini-3-flash-preview';
  if (FLASH_KEYWORDS.test(message)) return 'gemini-3-flash-preview';

  // FLASH-LITE (70%): everything else (greetings, quiz, hints, simple Q&A)
  return 'gemini-3.1-flash-lite-preview';
}

/**
 * Get the display name for a model (used in response.source)
 */
export function modelDisplayName(model: GeminiModel): string {
  switch (model) {
    case 'gemini-3.1-flash-lite-preview': return 'flash-lite';
    case 'gemini-3-flash-preview': return 'flash';
    case 'gemini-3.1-pro-preview': return 'pro';
  }
}
