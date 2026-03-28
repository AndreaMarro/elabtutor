// ============================================
// UNLIM Voice Service — Real-time Voice Pipeline
// STT + TTS routed through nanobot backend
// Audio capture → nanobot /voice-chat → audio playback
// © Andrea Marro — 13/03/2026
// ============================================

import logger from '../utils/logger';

const NANOBOT_URL = (import.meta.env.VITE_NANOBOT_URL || '').trim() || null;

// Audio recording state
let mediaRecorder = null;
let audioChunks = [];
let recordingStream = null;

/**
 * Check if voice features are available on this device + backend.
 * @returns {Promise<{stt: boolean, tts: boolean, microphone: boolean}>}
 */
export async function checkVoiceCapabilities() {
    const result = { stt: false, tts: false, microphone: false, error: null };

    // Check microphone API availability (actual permission requested on first record)
    // Note: enumerateDevices() often returns empty before getUserMedia() is called,
    // so we just check the API exists — real permission check happens at startRecording()
    try {
        result.microphone = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    } catch {
        result.microphone = false;
    }

    // Check nanobot voice endpoints
    if (NANOBOT_URL) {
        try {
            const resp = await fetch(`${NANOBOT_URL}/voice-status`, {
                signal: AbortSignal.timeout(5000),
            });
            if (resp.ok) {
                const data = await resp.json();
                result.stt = data.stt;
                result.tts = data.tts;
            }
        } catch (e) {
            result.error = 'Nanobot non raggiungibile';
        }
    } else {
        result.error = 'Nanobot URL non configurato';
    }

    return result;
}

/**
 * Unlock audio playback on browsers with strict autoplay policies.
 * Must be called directly from a user gesture (click/tap) handler.
 * Creates a silent AudioContext + tiny silent play to unlock the session.
 */
let audioUnlocked = false;
export function unlockAudioPlayback() {
    if (audioUnlocked) return;
    try {
        // Resume/create AudioContext (works on most browsers)
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);

        // Also unlock HTMLAudioElement path
        const silent = new Audio('data:audio/mp3;base64,SUQzBAAAAAA=');
        silent.volume = 0;
        silent.play().catch(() => {});

        audioUnlocked = true;
        logger.debug('[Voice] Audio playback unlocked');
    } catch { /* silent */ }
}

/**
 * Request microphone permission and start recording.
 * @returns {Promise<boolean>} true if recording started
 */
export async function startRecording() {
    try {
        // Request microphone — iPad Safari needs { audio: true }
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000,
            }
        });
        recordingStream = stream;
        audioChunks = [];

        // Use webm/opus for Chrome, mp4 for Safari/iPad
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/mp4')
                ? 'audio/mp4'
                : 'audio/webm';

        mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: 64000,
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        // Collect data every 250ms for responsiveness
        mediaRecorder.start(250);
        logger.debug(`[Voice] Recording started (${mimeType})`);
        return true;
    } catch (err) {
        logger.error('[Voice] Microphone access denied:', err);
        return false;
    }
}

/**
 * Stop recording and return the audio blob.
 * @returns {Promise<Blob|null>} audio blob or null if not recording
 */
export function stopRecording() {
    return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            resolve(null);
            return;
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
            audioChunks = [];

            // Release microphone
            if (recordingStream) {
                recordingStream.getTracks().forEach(t => t.stop());
                recordingStream = null;
            }

            logger.debug(`[Voice] Recording stopped: ${(blob.size / 1024).toFixed(1)}KB`);
            resolve(blob);
        };

        mediaRecorder.stop();
    });
}

/**
 * Check if currently recording.
 * @returns {boolean}
 */
export function isRecording() {
    return mediaRecorder && mediaRecorder.state === 'recording';
}

/**
 * Cancel active recording without returning audio.
 */
export function cancelRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
    }
    audioChunks = [];
    if (recordingStream) {
        recordingStream.getTracks().forEach(t => t.stop());
        recordingStream = null;
    }
}

/**
 * Send audio to nanobot /voice-chat for complete round-trip.
 * Returns: { userText, response, audio (base64), timing }
 * @param {Blob} audioBlob - recorded audio
 * @param {Object} options - sessionId, experimentId, circuitState, simulatorContext
 * @param {AbortSignal} signal - abort signal
 * @returns {Promise<Object>}
 */
export async function sendVoiceChat(audioBlob, options = {}, signal = null) {
    if (!NANOBOT_URL) {
        throw new Error('Nanobot URL non configurato');
    }

    const formData = new FormData();
    // Determine extension from MIME type
    const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
    formData.append('audio', audioBlob, `recording.${ext}`);
    formData.append('sessionId', options.sessionId || '');
    formData.append('experimentId', options.experimentId || '');

    if (options.circuitState) {
        formData.append('circuitState', JSON.stringify(options.circuitState));
// © Andrea Marro — 29/03/2026 — ELAB Tutor — Tutti i diritti riservati
    }
    if (options.simulatorContext) {
        formData.append('simulatorContext', JSON.stringify(options.simulatorContext));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s max

    if (signal) {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
        const resp = await fetch(`${NANOBOT_URL}/voice-chat`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || `Voice chat error: ${resp.status}`);
        }

        return await resp.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Send text to nanobot /tts for speech synthesis only.
 * @param {string} text - text to synthesize
 * @returns {Promise<ArrayBuffer>} audio data (MP3)
 */
export async function synthesizeSpeech(text) {
    if (!NANOBOT_URL) throw new Error('Nanobot URL non configurato');

    const formData = new FormData();
    formData.append('text', text);

    const resp = await fetch(`${NANOBOT_URL}/tts`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `TTS error: ${resp.status}`);
    }

    return await resp.arrayBuffer();
}

/**
 * Play audio from base64 string or ArrayBuffer.
 * Returns a promise that resolves when playback completes.
 * @param {string|ArrayBuffer} audio - base64 MP3 string or ArrayBuffer
 * @param {string} format - MIME type (default: audio/mpeg)
 * @returns {Promise<HTMLAudioElement>}
 */
export function playAudio(audio, format = 'audio/mpeg') {
    return new Promise((resolve, reject) => {
        try {
            let blob;
            if (typeof audio === 'string') {
                // base64 string
                const bytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
                blob = new Blob([bytes], { type: format });
            } else {
                // ArrayBuffer
                blob = new Blob([audio], { type: format });
            }

            const url = URL.createObjectURL(blob);
            const player = new Audio(url);

            // Track for stop functionality
            currentPlayer = player;

            player.onended = () => {
                URL.revokeObjectURL(url);
                if (currentPlayer === player) currentPlayer = null;
                resolve(player);
            };
            player.onerror = (e) => {
                URL.revokeObjectURL(url);
                if (currentPlayer === player) currentPlayer = null;
                reject(new Error('Audio playback failed'));
            };

            player.play().catch(reject);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Stop any currently playing audio.
 */
let currentPlayer = null;
export function stopPlayback() {
    if (currentPlayer) {
        currentPlayer.pause();
        currentPlayer = null;
    }
}

/**
 * Play audio and track the player for stop functionality.
 * @param {string|ArrayBuffer} audio
 * @param {string} format
 * @returns {Promise<void>}
 */
export async function playTracked(audio, format = 'audio/mpeg') {
    stopPlayback();
    await playAudio(audio, format);
}
