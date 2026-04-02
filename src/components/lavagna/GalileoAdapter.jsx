/**
 * GalileoAdapter — Wraps ChatOverlay in FloatingWindow for the Lavagna shell.
 * Manages chat state via useGalileoChat hook + voice via voiceService.
 * ZERO modification to ChatOverlay or any UNLIM file.
 * (c) Andrea Marro — 01/04/2026
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import FloatingWindow from './FloatingWindow';
import ChatOverlay from '../tutor/ChatOverlay';
import useGalileoChat from './useGalileoChat';
import {
  checkVoiceCapabilities, startRecording, stopRecording, isRecording as isVoiceRecording,
  cancelRecording, sendVoiceChat, synthesizeSpeech, playTracked, stopPlayback,
  unlockAudioPlayback,
} from '../../services/voiceService';
import { sanitizeOutput } from '../../utils/contentFilter';
import logger from '../../utils/logger';
import css from './GalileoAdapter.module.css';

export default function GalileoAdapter({ visible, onClose }) {
  const chat = useGalileoChat();

  // ── Voice state ──
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // ── FloatingWindow state ──
  const [maximized, setMaximized] = useState(false);
  const containerRef = useRef(null);

  // ── Auto-expand ChatOverlay (it defaults to minimized internally) ──
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      const btn = document.querySelector('[aria-label="Espandi chat Galileo"]');
      if (btn) btn.click();
    }, 150);
    return () => clearTimeout(timer);
  }, [visible]);

  // ── Voice: detect capabilities on mount ──
  useEffect(() => {
    checkVoiceCapabilities().then(caps => {
      setVoiceAvailable(caps.stt && caps.tts && caps.microphone);
    }).catch(() => setVoiceAvailable(false));
    return () => { cancelRecording(); stopPlayback(); };
  }, []);

  // ── Voice toggle ──
  const handleVoiceToggle = useCallback((enabled) => {
    if (enabled && !voiceAvailable) return;
    if (enabled) unlockAudioPlayback();
    setVoiceEnabled(enabled);
    if (!enabled) {
      cancelRecording();
      stopPlayback();
      setVoiceRecording(false);
      setVoicePlaying(false);
    }
  }, [voiceAvailable]);

  // ── Voice record (press-to-talk) ──
  const handleVoiceRecord = useCallback(async () => {
    if (chat.isLoading) return;
    unlockAudioPlayback();

    if (isVoiceRecording()) {
      setVoiceRecording(false);
      chat.setMessages(prev => [...prev, {
        id: Date.now(), role: 'user',
        content: 'Messaggio vocale in elaborazione...', isVoice: true,
      }]);

      try {
        const audioBlob = await stopRecording();
        if (!audioBlob || audioBlob.size < 100) return;

        const api = typeof window !== 'undefined' && window.__ELAB_API;
        let simulatorCtx = null;
        try { simulatorCtx = api?.getSimulatorContext?.(); } catch { /* silent */ }

        const result = await sendVoiceChat(audioBlob, {
          sessionId: localStorage.getItem('elab_tutor_session') || '',
          experimentId: api?.getActiveExperiment?.()?.id || '',
          circuitState: chat.circuitStateRef.current,
          simulatorContext: simulatorCtx,
        });

        if (result.success) {
          // Update user message with transcript
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = last.findLastIndex(m => m.isVoice && m.content === 'Messaggio vocale in elaborazione...');
            if (voiceIdx >= 0) {
              last[voiceIdx] = { ...last[voiceIdx], content: result.userText || '(audio)' };
            }
            return last;
          });

          if (result.response) {
            const cleaned = sanitizeOutput(String(result.response))
              .replace(/\[azione:[^\]]+\]/gi, '')
              .replace(/\[AZIONE:[^\]]+\]/g, '')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            chat.setMessages(prev => [...prev, {
              id: Date.now() + 1, role: 'assistant',
              content: cleaned, isVoice: true,
            }]);
          }

          // Play audio response
          if (result.audio && voiceEnabled) {
            setVoicePlaying(true);
            try {
              await playTracked(result.audio, result.audioFormat || 'audio/mpeg');
            } catch (e) {
              logger.error('[Lavagna Voice] Playback failed:', e);
            }
            setVoicePlaying(false);
          }
        } else {
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = last.findLastIndex(m => m.isVoice && m.content === 'Messaggio vocale in elaborazione...');
            if (voiceIdx >= 0) {
              last[voiceIdx] = { ...last[voiceIdx], content: 'Non sono riuscito a capire. Riprova!' };
            }
            return last;
          });
        }
      } catch (err) {
        logger.error('[Lavagna Voice] Error:', err);
        chat.setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: 'C\'e stato un problema con la voce. Prova a scrivere!',
        }]);
      }
    } else {
      const started = await startRecording();
      if (started) {
        setVoiceRecording(true);
        stopPlayback();
      } else {
        chat.setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: 'Per usare la voce, permetti l\'accesso al microfono nelle impostazioni del browser.',
        }]);
      }
    }
  }, [chat.isLoading, voiceEnabled]);

  // ── Auto-speak latest AI response when voice mode is on ──
  const lastSpokenRef = useRef(null);
  useEffect(() => {
    if (!voiceEnabled || chat.messages.length === 0) return;
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    if (lastMsg.id === lastSpokenRef.current) return;
    if (lastMsg.isVoice) return;
    lastSpokenRef.current = lastMsg.id;

    (async () => {
      try {
        setVoicePlaying(true);
        const audioData = await synthesizeSpeech(lastMsg.content);
        await playTracked(audioData, 'audio/mpeg');
      } catch (e) {
        logger.error('[Lavagna Voice] Auto-speak failed:', e);
      } finally {
        setVoicePlaying(false);
      }
    })();
  }, [chat.messages, voiceEnabled]);

  if (!visible) return null;

  return (
    <FloatingWindow
      id="galileo"
      title="UNLIM"
      defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 380 : 800, y: 56 }}
      defaultSize={{ w: 360, h: typeof window !== 'undefined' ? window.innerHeight - 64 : 700 }}
      maximized={maximized}
      onMaximize={() => setMaximized(m => !m)}
      onClose={onClose}
      onMinimize={onClose}
      glass
      className={css.galileoWindow}
    >
      <ChatOverlay
        messages={chat.messages}
        input={chat.input}
        onInputChange={chat.setInput}
        onSend={chat.handleSend}
        isLoading={chat.isLoading}
        onRetry={chat.handleRetry}
        quickActions={chat.quickActions}
        visible={true}
        onClose={onClose}
        expanded={maximized}
        onToggleExpanded={() => setMaximized(m => !m)}
        socraticMode={true}
        onToggleSocraticMode={null}
        onScreenshot={chat.handleScreenshot}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={voiceAvailable ? handleVoiceToggle : undefined}
        voiceRecording={voiceRecording}
        onVoiceRecord={handleVoiceRecord}
        voicePlaying={voicePlaying}
      />
    </FloatingWindow>
  );
}
