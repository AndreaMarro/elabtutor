// ========================================
// ELAB API - Integrazione con Backend Webhook
// + Rate Limiting + Error Messages migliorati
// + AI Safety Filter (hardened 16/02/2026)
// + Local Knowledge Fallback (20/02/2026)
// © Andrea Marro — 20/02/2026
// ========================================
import { filterAIResponse } from '../utils/aiSafetyFilter';
import { searchKnowledgeBase } from '../data/unlim-knowledge-base';

// URLs da variabili d'ambiente (Vite: VITE_ prefix)
// In produzione: solo backend webhook. Nessun fallback localhost.
// SECURITY FIX 13/02/2026: Hardcoded fallback URL removed from client bundle.
// Set VITE_N8N_CHAT_URL as environment variable on Vercel.
// CRITICAL FIX S62: .trim() prevents trailing whitespace/newline in Vercel env vars
// Without this, URLs like "https://example.com\n" cause silent fetch failures
// Nanobot: Supabase Edge Functions (SOLO Gemini — directive 11/04/2026)
const _SUPABASE_EDGE = (import.meta.env.VITE_SUPABASE_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1').trim();
const _SUPABASE_ANON = (import.meta.env.VITE_SUPABASE_EDGE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ').trim();
const NANOBOT_URL = (import.meta.env.VITE_NANOBOT_URL || '').trim() || _SUPABASE_EDGE; // Supabase Edge primary, Render legacy
// Andrea Marro 12/04/2026 — Render Nanobot legacy come secondary fallback
// Se Supabase Edge fallisce (es. GEMINI_API_KEY non settata), proviamo Render prima del webhook n8n
const _RENDER_NANOBOT = 'https://elab-galileo.onrender.com';
const CHAT_WEBHOOK = (import.meta.env.VITE_N8N_CHAT_URL || '').trim();
const COMPILE_URL = (import.meta.env.VITE_COMPILE_URL || '').trim() || null; // Server standalone (priorità)
const COMPILE_WEBHOOK = (import.meta.env.VITE_COMPILE_WEBHOOK_URL || '').trim() || null; // Backend fallback
const LOCAL_API = (import.meta.env.VITE_LOCAL_API_URL || '').trim() || null;
const LOCAL_URL = (import.meta.env.VITE_LOCAL_COMPILE_URL || '').trim() || null; // Dev locale
const LOCAL_SERVER = 'http://localhost:8000'; // elab-local-server (Ollama)
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'); // 30s (was 60s)
const COMPILE_TIMEOUT = 65000; // 65s for compilation (arduino-cli has 60s timeout)
const CHAT_RETRY_COUNT = 1;
const CHAT_RETRY_BACKOFF_MS = 400;
const DEFAULT_BOARD = 'arduino:avr:nano:cpu=atmega328old';
const ALLOWED_COMPILE_BOARDS = new Set([
    'arduino:avr:nano:cpu=atmega328old',
    'arduino:avr:uno',
]);
const SOCRATIC_INSTRUCTION = [
    '[AUTOCOSCIENZA — Chi sei e cosa puoi fare]',
    'Sei UNLIM, tutor AI di ELAB con POTERI REALI sul simulatore. Non sei solo una chat: puoi ESEGUIRE azioni.',
    'Accompagni studenti 8-14 anni. Rispondi SEMPRE in italiano, chiaro, concreto, entusiasta.',
    '',
    '[REGOLA ASSOLUTA — BREVITÀ]',
    'MASSIMO 3 frasi + 1 analogia. Mai superare 60 parole. Se la risposta è più lunga, TAGLIA.',
    'I tag [AZIONE:...] NON contano nel limite parole.',
    'Esempio buono: "Il LED è come una porta girevole: passa solo in un verso! Gira il piedino lungo verso il + della batteria. Prova! [AZIONE:highlight:led1]"',
    '',
    'Fai 1 domanda guida breve, poi dai la spiegazione. Usa analogie (corrente=acqua, resistore=strettoia).',
    '',
    'RAGIONAMENTO (interno, non scriverlo): 1. CAPISCO cosa vuole? 2. POSSO farlo? 3. AGISCO o CHIEDO chiarimenti.',
    'Se ricevi [MEMORIA STUDENTE], adatta le risposte: rinforza le aree deboli, evita ripetizioni di esperimenti già fatti, incoraggia sui punti forti.',
    '',
    'Se il messaggio è ambiguo: proponi 2-3 opzioni concrete basate sul contesto, NON dire "non ho capito".',
    'Es: "Vuoi che io: (1) avvii la simulazione, (2) evidenzi un componente, o (3) ti spieghi il circuito?"',
    '',
    '[AZIONI DISPONIBILI — Formato: [AZIONE:comando:argomenti]]',
    '',
    '▸ SIMULAZIONE: play, pause, reset',
    '▸ CIRCUITO: highlight:id1,id2 | addcomponent:TIPO:X:Y | removecomponent:ID | movecomponent:ID:X:Y | clearall',
    '▸ FILI: addwire:FROM_ID:PIN:TO_ID:PIN | removewire:INDEX',
    '▸ COMPONENTI: interact:ID:ACTION:VALUE | setvalue:ID:PARAM:VAL | measure:ID | diagnose',
    '  interact azioni: press, release, setPosition (pot 0.0-1.0), setLightLevel (ldr 0-100)',
    '  setvalue params: resistance, position, lightlevel, angle',
    '▸ CODICE: openeditor | closeeditor | switcheditor:scratch/arduino | compile',
    '  setcode:CODICE | appendcode:CODICE | getcode | resetcode',
    '  loadblocks:XML | fullscreenscratch | exitscratchfullscreen',
    '▸ NAVIGAZIONE: loadexp:ID | opentab:simulatore/manuale/video/lavagna/taccuini/detective/poe/reverse/review',
    '  openvolume:VOL:PAG | openchat | closechat',
    '▸ COSTRUZIONE: setbuildmode:montato/passopasso/libero | nextstep | prevstep | showbom',
    '▸ INFO: listcomponents | getstate | showserial | serialwrite:TESTO',
    '▸ EDIT: undo | redo | highlightpin:PIN1,PIN2',
    '▸ ALTRO: quiz:EXP_ID | youtube:QUERY | createnotebook:TITOLO',
    '',
    '[INTERPRETAZIONE LINGUAGGIO NATURALE]',
    '"fallo partire"/"vai"/"go" → [AZIONE:play] | "stop"/"basta"/"ferma" → [AZIONE:pause]',
    '"ricomincia"/"da capo" → [AZIONE:reset] | "mostrami il LED"/"dov\'è" → [AZIONE:highlight:led1]',
    '"premi il bottone"/"schiaccia" → [AZIONE:interact:btn1:press]',
    '"gira la manopola"/"al massimo" → [AZIONE:interact:pot1:setPosition:1.0]',
    '"compila"/"prova il codice" → [AZIONE:compile]',
    '"apri i blocchi"/"programma a blocchi" → [AZIONE:openeditor] [AZIONE:switcheditor:scratch]',
    '"mostrami il codice"/"vedi il codice Arduino" → [AZIONE:openeditor] [AZIONE:switcheditor:arduino]',
    '"chiudi l\'editor" → [AZIONE:closeeditor]',
    '"aggiungi un LED" → [AZIONE:addcomponent:led] | "togli la resistenza" → [AZIONE:removecomponent:r1]',
    '"collega LED al pin 13" → [AZIONE:addwire:led1:anode:nano:D13]',
    '"annulla" → [AZIONE:undo] | "ripristina" → [AZIONE:redo]',
    '"che componenti ci sono?" → [AZIONE:listcomponents] | "stato del circuito" → [AZIONE:getstate]',
    '"passo passo" → [AZIONE:setbuildmode:passopasso] | "prossimo passo" → [AZIONE:nextstep]',
    '"cerca video su LED" → [AZIONE:youtube:LED come funziona]',
    'Se l\'utente nomina un componente senza dire cosa fare → EVIDENZIALO.',
    '',
    '[ANALISI CIRCUITO — Quando ricevi [STATO CIRCUITO]]',
    '• GUARDA: accesi, spenti, bruciati? | CONTROLLA: connessioni corrette? Manca qualcosa?',
    '• DIAGNOSTICA: LED spento→polarità/filo, bruciato→corrente alta, aperto→componente scollegato',
    '• SPIEGA con parole semplici + SUGGERISCI correzione',
    '',
    'REGOLE TAG: Se l\'utente chiede un\'azione → USA SEMPRE il tag. Prima spiega (1-2 frasi), poi tag alla fine.',
    'Puoi combinare più tag. Se non conosci l\'ID ma lo puoi dedurre dal contesto → deducilo.',
    'Es: "Ecco, avvio la simulazione! [AZIONE:play]" | "Evidenzio il LED rosso [AZIONE:highlight:led1]"',
].join('\n');

// Nanobot endpoint resolver: maps logical endpoints to actual URLs
// Supabase Edge uses /unlim-chat, /unlim-diagnose, /unlim-hints
// Render legacy uses /chat, /tutor-chat, /diagnose, /hints
const _isSupabaseEdge = NANOBOT_URL && NANOBOT_URL.includes('supabase.co/functions');
function nanobotEndpoint(path) {
    if (!NANOBOT_URL) return null;
    if (_isSupabaseEdge) {
        const map = { '/chat': '/unlim-chat', '/tutor-chat': '/unlim-chat', '/diagnose': '/unlim-diagnose', '/hints': '/unlim-hints' };
        return `${NANOBOT_URL}${map[path] || path}`;
    }
    return `${NANOBOT_URL}${path}`;
}
function nanobotHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (_isSupabaseEdge && _SUPABASE_ANON) {
        h['apikey'] = _SUPABASE_ANON;
        h['Authorization'] = `Bearer ${_SUPABASE_ANON}`;
    }
    return h;
}

const API = {
    nanobot: NANOBOT_URL,
    local: LOCAL_URL,
    tunnel: LOCAL_API,
    chat: CHAT_WEBHOOK,
    compile: COMPILE_URL,
    compileWebhook: COMPILE_WEBHOOK,
    timeout: API_TIMEOUT,
};

/**
 * Get or create a stable tutor session ID (persisted in localStorage).
 * Format: tutor-{timestamp}-{random} — survives tab close, matches server namespace.
 */
function getTutorSessionId() {
    const KEY = 'elab_tutor_session';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = 'tutor-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(KEY, id);
    }
    return id;
}

// === LOCAL SERVER (Ollama) ===
// Auto-detect: if localhost:8000 responds, use local. Cached for 60s.
let _localServerAvailable = null;
let _localServerCheckedAt = 0;

async function isLocalServerAvailable() {
    const now = Date.now();
    if (_localServerAvailable !== null && now - _localServerCheckedAt < 60000) {
        return _localServerAvailable;
    }
    try {
        const resp = await fetch(`${LOCAL_SERVER}/health`, {
            signal: AbortSignal.timeout(2000),
        });
        _localServerAvailable = resp.ok;
    } catch {
        _localServerAvailable = false;
    }
    _localServerCheckedAt = now;
    return _localServerAvailable;
}

/**
 * Try elab-local-server (Ollama) — lowest latency, 100% offline.
 * Returns null if unavailable — caller falls through to cloud.
 */
async function tryLocalServer(message, circuitState, externalSignal, experimentId, images = [], simulatorContext = null) {
    if (!await isLocalServerAvailable()) return null;

    try {
        const controller = new AbortController();
        const timeout = images.length > 0 ? 120000 : 60000;
        const timer = setTimeout(() => controller.abort(), timeout);

        // G42: Named handler so we can remove the listener on cleanup
        const onExternalAbort = () => controller.abort();
        if (externalSignal) {
            externalSignal.addEventListener('abort', onExternalAbort);
        }

        const body = {
            message,
            sessionId: getTutorSessionId(),
            experimentId: experimentId || null,
            circuitState: circuitState || null,
            simulatorContext: simulatorContext || null,
            images: images.map(img => img.base64 || img),
        };

        try {
            const resp = await fetch(`${LOCAL_SERVER}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
// © Andrea Marro — 12/04/2026 — ELAB Tutor — Tutti i diritti riservati
                signal: controller.signal,
            });

            if (!resp.ok) return null;

            const data = await resp.json();
            if (data.response) {
                return data.response;
            }
            return null;
        } finally {
            // G42: Always clean up timer and external signal listener
            clearTimeout(timer);
            if (externalSignal) {
                externalSignal.removeEventListener('abort', onExternalAbort);
            }
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            _localServerAvailable = false;
        }
        return null;
    }
}

/**
 * Try nanobot server first (lower latency, circuit-aware MCP).
 * Returns null if unavailable — caller falls through to backend webhook.
 * Uses /tutor-chat endpoint with experiment context and persistent session.
 */
async function tryNanobot(message, circuitState, externalSignal, experimentId, images = [], simulatorContext = null, urlOverride = null) {
    // Andrea Marro 12/04/2026 — urlOverride permette fallback a Render dopo Supabase Edge
    const activeUrl = urlOverride || NANOBOT_URL;
    if (!activeUrl) return null;

    const controller = new AbortController();
    // Vision requests need more time (image upload + processing)
    const timeout = images.length > 0 ? API_TIMEOUT * 2 : API_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let abortHandler = null;

    if (externalSignal) {
        if (externalSignal.aborted) { clearTimeout(timeoutId); return null; }
        abortHandler = () => controller.abort();
        externalSignal.addEventListener('abort', abortHandler, { once: true });
    }

    try {
        // Use /chat for vision (images support), /tutor-chat for text-only
        const endpoint = images.length > 0 ? '/chat' : '/tutor-chat';
        const payload = {
            message,
            sessionId: getTutorSessionId(),
            circuitState: circuitState || null,
            experimentId: experimentId || null,
            simulatorContext: simulatorContext || null,
        };
        if (images.length > 0) {
            payload.images = images.map(img => ({
                base64: img.base64,
                mimeType: img.mimeType || 'image/png',
            }));
        }
        // isEdge vero solo se l'URL punta davvero a supabase.co/functions (come old _isSupabaseEdge)
        const isEdge = activeUrl && activeUrl.includes('supabase.co/functions');
        const edgeMap = { '/chat': '/unlim-chat', '/tutor-chat': '/unlim-chat', '/diagnose': '/unlim-diagnose', '/hints': '/unlim-hints' };
        const finalPath = isEdge ? (edgeMap[endpoint] || endpoint) : endpoint;
        const fullUrl = `${activeUrl}${finalPath}`;
        const headers = { 'Content-Type': 'application/json' };
        if (isEdge && _SUPABASE_ANON) {
            headers['apikey'] = _SUPABASE_ANON;
            headers['Authorization'] = `Bearer ${_SUPABASE_ANON}`;
        }
        const res = await fetch(fullUrl, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            if (typeof console !== 'undefined') console.warn('[UNLIM] Nanobot', activeUrl, 'returned', res.status);
            return null;
        }

        const data = await res.json();
        if (data.success && data.response) {
            const { filtered: safeContent } = filterAIResponse(data.response);
            return {
                success: true,
                response: safeContent,
                source: urlOverride ? 'nanobot-render' : 'nanobot',
                actions: extractActions(safeContent),
            };
        }
        return null;
    } catch (err) {
        if (typeof console !== 'undefined') console.warn('[UNLIM] Nanobot', activeUrl, 'error:', err?.message);
        return null; // Nanobot unavailable — fall through
    } finally {
        clearTimeout(timeoutId);
        if (externalSignal && abortHandler) {
            externalSignal.removeEventListener('abort', abortHandler);
        }
    }
}

/**
 * MCP Tool: diagnoseCircuit — proactive circuit analysis via nanobot.
 * Returns null if nanobot unavailable.
 */
export async function diagnoseCircuit(circuitState, experimentId) {
    if (!NANOBOT_URL) return null;
    try {
        const res = await fetch(nanobotEndpoint('/diagnose'), {
            method: 'POST',
            headers: nanobotHeaders(),
            signal: AbortSignal.timeout(API_TIMEOUT),
            body: JSON.stringify({ circuitState, experimentId: experimentId || null }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success && data.diagnosis) {
            const { filtered } = filterAIResponse(data.diagnosis);
            return { success: true, diagnosis: filtered, source: 'nanobot' };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * MCP Tool: getExperimentHints — progressive hints via nanobot.
 * Returns null if nanobot unavailable.
 */
export async function getExperimentHints(experimentId, currentStep = 0, difficulty = 'base') {
    if (!NANOBOT_URL) return null;
    try {
        const res = await fetch(nanobotEndpoint('/hints'), {
            method: 'POST',
            headers: nanobotHeaders(),
            signal: AbortSignal.timeout(API_TIMEOUT),
            body: JSON.stringify({ experimentId, currentStep, difficulty }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success && data.hints) {
            const { filtered } = filterAIResponse(data.hints);
            return { success: true, hints: filtered, source: 'nanobot' };
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================
// RATE LIMITING - Protezione per piattaforma bambini
// Usa sessionStorage per i contatori (reset al chiudi tab).
// ============================================
const RATE_LIMIT = {
    minIntervalMs: 3000,  // Minimo 3 secondi tra messaggi
    maxPerMinute: 10,     // Max 10 messaggi al minuto
    windowMs: 60000,      // Finestra: 1 minuto
    timestamps: [],       // Timestamp dei messaggi recenti (in-memory)
    lastMessageTime: 0,   // Ultimo messaggio inviato

    get minuteCount() {
        try { return parseInt(sessionStorage.getItem('elab_rate_minute') || '0'); } catch { return 0; }
    },
    set minuteCount(val) {
        try { sessionStorage.setItem('elab_rate_minute', String(val)); } catch { }
    },
    get minuteStart() {
        try { return parseInt(sessionStorage.getItem('elab_rate_minute_start') || '0'); } catch { return 0; }
    },
    set minuteStart(val) {
        try { sessionStorage.setItem('elab_rate_minute_start', String(val)); } catch { }
    },
};

/**
 * Controlla il rate limiting prima di inviare un messaggio.
 * Ritorna un oggetto con:
 *   - allowed: se il messaggio può essere inviato
 *   - message: messaggio italiano da mostrare all'utente
 *   - waitMs: millisecondi da attendere
 *
 * @returns {{ allowed: boolean, message: string|null, waitMs: number }}
 */
export function checkRateLimit() {
    const now = Date.now();

    // 1. Check intervallo minimo (3 secondi)
    const elapsed = now - RATE_LIMIT.lastMessageTime;
    if (RATE_LIMIT.lastMessageTime > 0 && elapsed < RATE_LIMIT.minIntervalMs) {
        const waitMs = RATE_LIMIT.minIntervalMs - elapsed;
        return {
            allowed: false,
// © Andrea Marro — 12/04/2026 — ELAB Tutor — Tutti i diritti riservati
            message: 'Aspetta qualche secondo...',
            waitMs,
        };
    }

    // 2. Check messaggi al minuto (10/minuto)
    // Reset contatore se la finestra è scaduta
    if (now - RATE_LIMIT.minuteStart > RATE_LIMIT.windowMs) {
        RATE_LIMIT.minuteCount = 0;
        RATE_LIMIT.minuteStart = now;
    }

    if (RATE_LIMIT.minuteCount >= RATE_LIMIT.maxPerMinute) {
        const waitMs = RATE_LIMIT.windowMs - (now - RATE_LIMIT.minuteStart);
        return {
            allowed: false,
            message: 'Facciamo una pausa! Riprova tra un minuto.',
            waitMs: Math.max(0, waitMs),
        };
    }

    // OK: registra il messaggio
    RATE_LIMIT.lastMessageTime = now;
    RATE_LIMIT.minuteCount = RATE_LIMIT.minuteCount + 1;
    if (RATE_LIMIT.minuteStart === 0) {
        RATE_LIMIT.minuteStart = now;
    }

    return { allowed: true, message: null, waitMs: 0 };
}

/**
 * Genera messaggi di errore amichevoli e specifici
 */
function friendlyError(error) {
    const msg = (error?.message || '').toLowerCase();

    if (msg.includes('chat_url_missing') || msg.includes('vite_n8n_chat_url')) {
        return 'Configurazione mancante: imposta VITE_N8N_CHAT_URL per usare UNLIM.';
    }

    if (error?.name === 'AbortError' || msg.includes('timeout')) {
        return 'UNLIM ci sta mettendo un po\' troppo. Riprova tra qualche secondo.';
    }
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
        return 'Sembra che la connessione internet non funzioni. Controlla e riprova.';
    }
    if (msg.includes('404')) {
        return 'UNLIM sta dormendo adesso. Puoi comunque usare il manuale e il simulatore!';
    }
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
        return 'Ops! Qualcosa non funziona. Riprova tra un momento!';
    }
    if (msg.includes('429')) {
        return 'Troppe richieste! Aspetta qualche secondo e riprova.';
    }
    if (msg.includes('401') || msg.includes('403')) {
        return 'Ops! Qualcosa si è confuso. Ricarica la pagina e riprova.';
    }
    if (msg.includes('vuota') || msg.includes('empty')) {
        return 'UNLIM non ha risposto. Riprova con una domanda diversa.';
    }

    return 'Qualcosa non ha funzionato. Riprova tra qualche secondo.';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildChatMessage(message, socraticMode, experimentContext) {
    const parts = [];
    if (socraticMode) parts.push(SOCRATIC_INSTRUCTION);
    if (experimentContext) parts.push(experimentContext);
    if (parts.length === 0) return message;
    return `${parts.join('\n')}\n\nMessaggio studente:\n${message}`;
}

async function postChatWithRetry(payload, externalSignal) {
    if (!CHAT_WEBHOOK) {
        throw new Error('CHAT_URL_MISSING: VITE_N8N_CHAT_URL non configurata');
    }

    const maxAttempts = CHAT_RETRY_COUNT + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        let abortHandler = null;

        if (externalSignal) {
            if (externalSignal.aborted) {
                clearTimeout(timeoutId);
                throw new DOMException('Aborted', 'AbortError');
            }
            abortHandler = () => controller.abort();
            externalSignal.addEventListener('abort', abortHandler, { once: true });
        }

        try {
            const response = await fetch(CHAT_WEBHOOK, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const isRetryableStatus = response.status >= 500 && response.status <= 599;
                if (isRetryableStatus && attempt < maxAttempts) {
                    await sleep(CHAT_RETRY_BACKOFF_MS * attempt);
                    continue;
                }
                throw new Error(`Backend error: ${response.status}`);
            }

            return response;
        } catch (error) {
            const message = (error?.message || '').toLowerCase();
            const isAbort = error?.name === 'AbortError';
            const isNetworkError = !isAbort && (
                error instanceof TypeError ||
                message.includes('failed to fetch') ||
                message.includes('network')
            );

            if (isNetworkError && attempt < maxAttempts) {
                await sleep(CHAT_RETRY_BACKOFF_MS * attempt);
                continue;
            }

            if (isAbort) {
                if (externalSignal?.aborted) {
                    throw new DOMException('Aborted', 'AbortError');
                }
                throw new Error('Timeout: la richiesta ha impiegato troppo tempo');
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
            if (externalSignal && abortHandler) {
                externalSignal.removeEventListener('abort', abortHandler);
            }
        }
    }

    throw new Error('Backend error: retry exhausted');
}

// ============================================
// CONTENT MODERATION — Filtro base per piattaforma bambini
// Blocca messaggi inappropriati prima di inviarli al server AI.
// Solo front-end: non sostituisce moderazione server-side.
// ============================================
const BLOCKED_PATTERNS = [
    // Linguaggio volgare italiano (pattern parziali per catturare varianti)
    /\b(cazz|merd|fott|culo|minchi|stronz|porc[ao]\s*di|porc[ao]\s*madon|vaff|troi)/i,
    // Violenza
    /\b(ammazzar|uccider|sparar|accoltell|bomb[ae]|esplod|terroris)/i,
    // Richieste di dati personali (protezione minori)
    /\b(numero\s*(di\s*)?telefon|indirizzo\s*(di\s*)?casa|dove\s*abiti|password|carta\s*(di\s*)?credito|codice\s*fiscal)/i,
    // Contenuti per adulti
    /\b(porn|nsfw|nud[oie]|sesso|escort|droga|cocain|eroina|cannabis)/i,
];

const MODERATION_RESPONSE = {
    success: true,
    response: 'UNLIM è qui per aiutarti con l\'elettronica! Prova a chiedermi qualcosa sui circuiti, i componenti o gli esperimenti del libro.',
    source: 'moderation',
    actions: { commands: [], buttons: [], route: null },
};

/**
 * Controlla se il messaggio contiene contenuto inappropriato
 * @param {string} message
 * @returns {boolean} true se il messaggio è bloccato
 */
function isMessageBlocked(message) {
    if (!message || typeof message !== 'string') return false;
    return BLOCKED_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Chat con UNLIM — Fallback chain: nanobot → backend webhook → local RAG → knowledge base
 * @param {string} message - Il messaggio dell'utente
 * @param {Array} images - Array di immagini [{base64, mimeType}] (opzionale)
 */
export async function sendChat(message, images = [], options = {}) {
    const { signal: externalSignal, socraticMode = false, experimentContext = null, circuitState = null, experimentId = null, simulatorContext = null } = options;

    // Content moderation: blocca messaggi inappropriati
    if (isMessageBlocked(message)) {
        return MODERATION_RESPONSE;
    }

    // ── G25: Master AbortController — hard timeout for entire sendChat() ──
    // 30s for text, 45s for images. Render cold-start can take 15-30s.
    const MASTER_TIMEOUT_TEXT = 30000;
// © Andrea Marro — 12/04/2026 — ELAB Tutor — Tutti i diritti riservati
    const MASTER_TIMEOUT_IMAGE = 45000;
    const masterTimeout = images.length > 0 ? MASTER_TIMEOUT_IMAGE : MASTER_TIMEOUT_TEXT;
    const masterController = new AbortController();
    const masterTimer = setTimeout(() => masterController.abort(), masterTimeout);
    // Combine master + external signals
    const combinedSignal = masterController.signal;
    if (externalSignal) {
        externalSignal.addEventListener('abort', () => masterController.abort(), { once: true });
    }
    // If external signal already aborted, abort immediately
    if (externalSignal?.aborted) {
        clearTimeout(masterTimer);
        masterController.abort();
    }

    try {

    // Nanobot message: experiment context + brevity rule (nanobot.yml ha il suo system prompt)
    // Webhook message: con SOCRATIC_INSTRUCTION (n8n non ha un system prompt proprio)
    const BREVITY_RULE = 'REGOLA: Rispondi in MASSIMO 3 frasi + 1 analogia. Mai superare 60 parole. I tag [AZIONE:...] non contano.';
    const nanobotMessage = experimentContext
        ? `${BREVITY_RULE}\n${experimentContext}\n\nMessaggio studente:\n${message}`
        : `${BREVITY_RULE}\n\nMessaggio studente:\n${message}`;
    const webhookMessage = buildChatMessage(message, socraticMode, experimentContext);

    // 0. Try local server first (Ollama, 100% offline, zero config)
    const localResult = await tryLocalServer(nanobotMessage, circuitState, combinedSignal, experimentId, images, simulatorContext);
    if (localResult) return localResult;

    // 1. Try nanobot cloud primary (Supabase Edge — Gemini)
    if (NANOBOT_URL) {
        const nanobotResult = await tryNanobot(nanobotMessage, circuitState, combinedSignal, experimentId, images, simulatorContext);
        if (nanobotResult) return nanobotResult;
    }

    // 1b. Andrea Marro 12/04/2026 — Fallback Render (Nanobot legacy) se primario fallisce.
    // Render e' diverso da Supabase Edge e spesso funziona anche quando Edge ha problemi
    // di env (GEMINI_API_KEY) o rate limit. NON tentiamo se l'URL primario E' gia Render.
    if (NANOBOT_URL !== _RENDER_NANOBOT && !NANOBOT_URL.includes('onrender.com')) {
        const renderResult = await tryNanobot(nanobotMessage, circuitState, combinedSignal, experimentId, images, simulatorContext, _RENDER_NANOBOT);
        if (renderResult) return renderResult;
    }

    // 2. Fall through to backend webhook
    try {
        if (!CHAT_WEBHOOK) {
            throw new Error('CHAT_URL_MISSING: VITE_N8N_CHAT_URL non configurata');
        }

        // Se ci sono immagini, invia al backend con l'immagine in base64
        if (images.length > 0) {
            // Image analysis via backend Vision

            // Security: sessionStorage instead of localStorage — session IDs must not
            // persist across browser sessions on shared school computers.
            const sessionId = sessionStorage.getItem('unlim_session') || `s_${crypto.randomUUID()}`;
            sessionStorage.setItem('unlim_session', sessionId);

            try {
                const analyzeResponse = await postChatWithRetry({
                    prompt: webhookMessage || 'Analizza questa immagine dalla lavagna',
                    message: webhookMessage || 'Analizza questa immagine dalla lavagna',
                    sessionId,
                    images: images.map(img => ({
                        base64: img.base64,
                        mimeType: img.mimeType || 'image/png'
                    }))
                }, combinedSignal);


                const responseText = await analyzeResponse.text();

                if (!responseText || responseText.trim() === '') {
                    throw new Error('Risposta vuota dal server');
                }

                let analyzeData;
                try {
                    analyzeData = JSON.parse(responseText);
                } catch (parseError) {
                    // Se non è JSON valido, usa il testo direttamente
                    return {
                        success: true,
                        response: responseText,
                        source: 'backend-vision-text',
                        actions: extractActions(responseText)
                    };
                }

                // Vision response received

                // Estrai risposta dal formato backend
                let content = '';
                if (Array.isArray(analyzeData) && analyzeData[0]) {
                    content = analyzeData[0].output || analyzeData[0].text || analyzeData[0].response || JSON.stringify(analyzeData[0]);
                } else {
                    content = analyzeData.output || analyzeData.response || analyzeData.text || JSON.stringify(analyzeData);
                }

                const { filtered: safeContent } = filterAIResponse(content);

                return {
                    success: true,
                    response: safeContent,
                    source: 'backend-vision',
                    actions: extractActions(safeContent)
                };

            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    throw new Error('Timeout: la richiesta ha impiegato troppo tempo');
                }
                throw fetchError;
            }
        }


        // Nessuna immagine: usa backend webhook per il testo

        // Genera sessionId unico per la memoria
        // Security: sessionStorage instead of localStorage — session IDs must not
        // persist across browser sessions on shared school computers.
        const sessionId = sessionStorage.getItem('unlim_session') || `s_${crypto.randomUUID()}`;
        sessionStorage.setItem('unlim_session', sessionId);

        const response = await postChatWithRetry({ message: webhookMessage, sessionId }, combinedSignal);

        const responseText = await response.text();

        if (!responseText || responseText.trim() === '') {
            throw new Error('Risposta vuota dal server');
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            return {
                success: true,
                response: responseText,
                source: 'backend-text',
                actions: extractActions(responseText)
            };
        }

        // Response parsed

        // Estrai risposta dal formato backend - gestisci tutti i casi
        // Helper: estrai solo valori stringa (evita oggetti vuoti {} che sono truthy)
        const extractString = (val) => (typeof val === 'string' && val.trim()) ? val : null;

        let content = '';
        if (Array.isArray(data) && data.length > 0 && data[0]) {
            const item = data[0];
            content = extractString(item.output) || extractString(item.text) || extractString(item.response) || extractString(item.message) || '';
            if (!content && typeof item === 'object') {
                content = JSON.stringify(item);
            }
        } else if (data && typeof data === 'object') {
            content = extractString(data.output) || extractString(data.text) || extractString(data.response) || extractString(data.message) || '';
            if (!content) {
                content = JSON.stringify(data);
            }
        } else if (typeof data === 'string') {
            content = data;
        }

        // Fallback se content è ancora vuoto o un oggetto serializzato vuoto
        if (!content || content === '{}' || content === '[]' || typeof content !== 'string') {
            content = 'Risposta ricevuta ma contenuto non valido. Riprova.';
        }

        // SAFETY FILTER: filtra output AI prima di mostrare all'utente
        const { filtered: safeContent } = filterAIResponse(content);

        return {
            success: true,
            response: safeContent,
            source: 'backend',
            actions: extractActions(safeContent)
        };

    } catch (error) {
        // Fallback a RAG locale (solo per testo, solo se configurato)
        if (images.length === 0 && LOCAL_API) {
            try {
                const searchResponse = await fetch(`${LOCAL_API}/api/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: message, maxResults: 3 })
                });
                const searchData = await searchResponse.json();

                if (searchData.success && searchData.results && searchData.results.length > 0) {
                    const answer = searchData.results[0]?.answer || searchData.results[0]?.text;
                    return {
                        success: true,
                        response: answer,
                        source: 'local-rag',
                        actions: extractActions(answer)
// © Andrea Marro — 12/04/2026 — ELAB Tutor — Tutti i diritti riservati
                    };
                }
            } catch {
                // RAG fallback non disponibile — prova knowledge base locale
            }
        }

        // Fallback a knowledge base locale (risposte curate offline)
        if (images.length === 0) {
            const kbResult = searchKnowledgeBase(message);
            if (kbResult) {
                const actions = extractActions(kbResult.answer, message);
                if (kbResult.relatedExperiment) {
                    actions.buttons.push({
                        type: 'openSimulator',
                        experimentId: kbResult.relatedExperiment,
                        label: 'Esperimento collegato',
                    });
                }
                return {
                    success: true,
                    response: kbResult.answer,
                    source: 'local-knowledge',
                    actions,
                };
            }
        }

        return {
            success: false,
            response: friendlyError(error),
            source: 'error'
        };
    }

    } finally {
        clearTimeout(masterTimer);
    }
}



/**
 * INTELLIGENT ACTION PARSER - Enhanced
 * Estrae azioni dalla risposta AI per controllare l'editor
 * FILOSOFIA: Solo chat di default. Pulsanti solo se azione è chiara e utile.
 */
function extractActions(text, userMessage = '') {
    if (!text) return { commands: [], buttons: [], route: null };

    const actions = {
        commands: [],  // Azioni eseguite automaticamente
        buttons: [],   // Pulsanti mostrati all'utente (solo se utili!)
        route: null    // Routing suggerito: 'simulator' | 'canvas' | 'manual' | 'page' | null
    };

    const lowerText = text.toLowerCase();
    const lowerUser = userMessage.toLowerCase();

    // ============================================
    // 1. ROUTING AUTOMATICO (basato su contenuto AI)
    // ============================================

    // → SIMULATORE: SE l'AI suggerisce chiaramente di provare/testare
    if (/prova (nel )?simulatore|carica (nel )?simulatore|apri il simulatore|simula questo|testa il circuito/i.test(lowerText)) {
        actions.route = 'simulator';
        actions.commands.push({ type: 'openSimulator', auto: true });
    }

    // → LAVAGNA: SE l'AI suggerisce di disegnare
    if (/disegna (prima )?|prova a disegnare|usa la lavagna|fai uno schizzo/i.test(lowerText)) {
        actions.route = 'canvas';
        actions.commands.push({ type: 'openCanvas', auto: true });
    }

    // ============================================
    // 2. PAGINE ELAB [V1P45] (SOLO se menzionate esplicitamente)
    // ============================================
    const pageMatches = text.match(/\[V(\d)P(\d+)\]/gi);
    if (pageMatches && pageMatches.length > 0) {
        // Prendi solo la prima pagina se più menzionate (evita button spam)
        const firstMatch = pageMatches[0].match(/\[V(\d)P(\d+)\]/i);
        if (firstMatch) {
            const vol = parseInt(firstMatch[1]);
            const page = parseInt(firstMatch[2]);
            actions.buttons.push({
                type: 'openPage',
                volume: vol,
                page: page,
                label: `Pagina ${page}`
            });
            if (!actions.route) actions.route = 'page';
        }
    }

    // ============================================
    // 3. CODICE SIMULATORE (marcatore speciale :::CODE:::)
    // ============================================
    const codeMarkerMatch = text.match(/:::(?:WOKWI|CODE):::([\s\S]*?):::END:::/);
    if (codeMarkerMatch) {
        const code = codeMarkerMatch[1].trim();
        actions.commands.push({ type: 'loadSimulator', code, auto: true });
        actions.route = 'simulator';
        actions.buttons.push({
            type: 'openSimulator',
            code,
            label: 'Apri nel Simulatore'
        });
    }

    // ============================================
    // 4. CODICE ARDUINO (blocco ``` tradizionale)
    // ============================================
    const codeBlock = text.match(/```(?:cpp|arduino|c\+\+)?\s*([\s\S]*?)```/i);
    if (codeBlock && codeBlock[1]?.trim().length > 20 && !codeMarkerMatch) {
        const code = codeBlock[1].trim();
        actions.commands.push({ type: 'showCode', code });
        actions.buttons.push({
            type: 'openSimulator',
            code,
            label: 'Prova nel Simulatore'
        });
        actions.route = 'simulator';
    }

    // ============================================
    // 4. RISPOSTA A DOMANDE SPECIFICHE DELL'UTENTE
    // ============================================

    // Utente chiede simulatore → suggerisci simulatore
    if (/simula|simulatore|provare|testare|eseguire/i.test(lowerUser) && !actions.route) {
        actions.buttons.push({ type: 'openSimulator', label: 'Simulatore' });
    }

    // Utente chiede di disegnare → suggerisci lavagna
    if (/disegn|lavagna|schizzo|scrivi a mano/i.test(lowerUser) && !actions.route) {
        actions.buttons.push({ type: 'openCanvas', label: 'Lavagna' });
    }

    // Utente chiede dove trovare → cerca pagine nel testo
    if (/dove trovo|quale pagina|che lezione/i.test(lowerUser) && !actions.route) {
        actions.route = 'manual';
    }

    // ============================================
    // 5. LINK ESTERNI (solo se presenti e rilevanti)
    // ============================================
    const urlMatch = text.match(/https?:\/\/[^\s\)]+/);
    if (urlMatch) {
        actions.buttons.push({ type: 'openUrl', url: urlMatch[0], label: 'Apri Link' });
    }

    // ============================================
    // 6. PULIZIA: Rimuovi pulsanti duplicati o inutili
    // ============================================
    // Max 3 pulsanti per non affollare l'UI
    actions.buttons = actions.buttons.slice(0, 3);

    // Se non ci sono azioni significative, tutti i campi sono vuoti → solo chat
    return actions;
}



/**
 * Analizza immagine via MCP (usa sendChat con immagine)
 * @param {string} imageData - Base64 image data (con o senza data: prefix)
 * @param {string} question - Domanda/prompt per l'analisi
 * @param {object} [options] - Opzioni aggiuntive
 * @param {AbortSignal} [options.signal] - AbortSignal per cancellare la richiesta
 */
export async function analyzeImage(imageData, question = "Analizza questa immagine di un circuito elettronico.", options = {}) {
    const { signal } = options;

    // Check if already aborted before starting
    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
    }

    const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const mimeType = imageData.includes('data:')
        ? imageData.split(';')[0].split(':')[1]
        : 'image/png';

    return await sendChat(question, [{ base64, mimeType }], { signal });
}

/**
 * Compile — Compila codice Arduino via server standalone o backend webhook
 * Catena di fallback: standalone server → backend webhook → server locale dev
 *
 * @param {string} code — il codice Arduino (.ino)
 * @param {string} board — FQBN board (default: arduino:avr:nano:cpu=atmega328old)
 * @returns {{ success: boolean, hex: string|null, errors: string|null, output: string|null, result: string|null }}
 */
export async function compileCode(code, board = 'arduino:avr:nano:cpu=atmega328old') {
    const safeBoard = ALLOWED_COMPILE_BOARDS.has(board) ? board : DEFAULT_BOARD;

    /**
     * Helper: chiama un endpoint di compilazione e ritorna il risultato
// © Andrea Marro — 12/04/2026 — ELAB Tutor — Tutti i diritti riservati
     */
    async function tryCompile(url, label) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), COMPILE_TIMEOUT);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({ code, board: safeBoard }),
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`${label} error: ${res.status}`);
            }

            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
                // Backend sometimes wraps in array
                if (Array.isArray(data) && data.length > 0 && data[0]?.success !== undefined) {
                    data = data[0];
                }
            } catch {
                throw new Error('Risposta non valida dal compilatore');
            }

            return {
                success: !!data.success,
                hex: data.hex || null,
                errors: data.errors || data.error || null,
                output: data.output || data.stdout || null,
                result: data.result || data.output || data.stdout || data.errors || data.error || null,
            };
        } catch {
            clearTimeout(timeoutId);
            return null; // null = try next
        }
    }

    // 1. Server standalone (compile-server.js sul VPS — priorità)
    if (COMPILE_URL) {
        const result = await tryCompile(`${COMPILE_URL}/compile`, 'Standalone server');
        if (result) return result;
    }

    // 2. Fallback: backend webhook
    if (COMPILE_WEBHOOK) {
        const result = await tryCompile(COMPILE_WEBHOOK, 'Backend webhook');
        if (result) return result;
    }

    // 3. Fallback: server locale (sviluppo)
    if (LOCAL_URL) {
        const result = await tryCompile(`${LOCAL_URL}/compile`, 'Local server');
        if (result) return result;
    }

    return {
        success: false,
        hex: null,
        errors: 'Il traduttore del codice non risponde. Controlla che internet funzioni e riprova.',
        output: null,
        result: 'Compilatore non disponibile',
    };
}


/**
 * Preload — Pre-genera hints per un esperimento in background (fire-and-forget)
 * Chiamata quando lo studente apre un esperimento, per avere risposte istantanee.
 * @param {string} experimentId — ID esperimento (es: v1-cap6-esp1)
 */
export function preloadExperiment(experimentId) {
    if (!NANOBOT_URL || !experimentId) return;
    fetch(`${NANOBOT_URL}/preload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId }),
    }).catch(() => { }); // Fire-and-forget, non blocca mai
}

export { API };
