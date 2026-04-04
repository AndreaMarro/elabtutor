/**
 * Nanobot V2 — Circuit Diagnosis Edge Function
 * POST /diagnose — Proactive circuit error analysis
 * Always uses Gemini Flash (needs reasoning but not Pro-level)
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { callGemini, callBrainFallback } from '../_shared/gemini.ts';
import { DIAGNOSE_PROMPT } from '../_shared/system-prompt.ts';
import type { DiagnoseRequest, DiagnoseResponse } from '../_shared/types.ts';
import { getCorsHeaders, getSecurityHeaders, checkRateLimitPersistent, sanitizeCircuitState, validateExperimentId, checkBodySize } from '../_shared/guards.ts';
import { checkConsent } from '../_shared/memory.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405, headers: getSecurityHeaders(req),
    });
  }

  const bodyCheck = checkBodySize(req);
  if (bodyCheck) return bodyCheck;

  try {
    const body: DiagnoseRequest = await req.json();
    const { circuitState, experimentId, sessionId } = body;

    // Consent check (if sessionId provided)
    if (sessionId) {
      const consentMode = Deno.env.get('CONSENT_MODE') || 'soft';
      if (consentMode !== 'off') {
        const consent = await checkConsent(sessionId);
        if (consent === 'revoked') {
          return new Response(JSON.stringify({ success: false, error: 'Consenso revocato.' }), {
            status: 403, headers: getSecurityHeaders(req),
          });
        }
      }
    }

    if (!circuitState) {
      return new Response(JSON.stringify({ success: false, error: 'No circuit state' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Rate limit by a session-like identifier (use experimentId or IP hash)
    const sessionKey = `diagnose:${experimentId || 'anon'}`;
    const allowed = await checkRateLimitPersistent(sessionKey);
    if (!allowed) {
      return new Response(JSON.stringify({ success: false, error: 'Troppe richieste. Aspetta qualche secondo.' }), {
        status: 429, headers: getSecurityHeaders(req),
      });
    }

    // Deep sanitize circuit state
    const safeState = sanitizeCircuitState(circuitState) as Record<string, unknown>;
    const safeExpId = validateExperimentId(experimentId);

    const circuitDescription = (safeState as { text?: string }).text
      || JSON.stringify(safeState).slice(0, 2000);

    const message = safeExpId
      ? `Esperimento: ${safeExpId}\n\nStato circuito:\n${circuitDescription}`
      : `Stato circuito:\n${circuitDescription}`;

    let result = null;
    let source = 'flash';

    // Try Flash first, then Flash-Lite fallback, then Brain
    try {
      result = await callGemini({
        model: 'gemini-3-flash-preview',
        systemPrompt: DIAGNOSE_PROMPT,
        message,
        maxOutputTokens: 200,
        temperature: 0.3,
      });
    } catch (e1) {
      console.warn(JSON.stringify({
        level: 'warn', event: 'diagnose_flash_failed',
        error: e1 instanceof Error ? e1.message : 'unknown',
      }));
      // Fallback to Flash-Lite
      try {
        result = await callGemini({
          model: 'gemini-3.1-flash-lite-preview',
          systemPrompt: DIAGNOSE_PROMPT,
          message,
          maxOutputTokens: 200,
          temperature: 0.3,
        });
        source = 'flash-lite';
      } catch {
        // Gemini completely failed — try Brain
        result = await callBrainFallback(message, DIAGNOSE_PROMPT);
        source = 'brain';
      }
    }

    if (!result?.text) {
      return new Response(JSON.stringify({
        success: false, error: 'Diagnosi temporaneamente non disponibile.',
      } satisfies DiagnoseResponse), {
        status: 503, headers: getSecurityHeaders(req),
      });
    }

    const response: DiagnoseResponse = {
      success: true,
      diagnosis: result.text,
      source,
    };

    return new Response(JSON.stringify(response), {
      status: 200, headers: getSecurityHeaders(req),
    });

  } catch (err) {
    console.error(JSON.stringify({
      level: 'error', event: 'diagnose_error',
      error: err instanceof Error ? err.message : 'unknown',
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false,
      error: 'Diagnosi non disponibile.',
    } satisfies DiagnoseResponse), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
