/**
 * GalileoAdapter — Wraps ChatOverlay in FloatingWindow for the Lavagna shell.
 * Manages chat state via useGalileoChat hook + voice via voiceService.
 * ZERO modification to ChatOverlay or any UNLIM file.
 * (c) Andrea Marro — 01/04/2026
 */

import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import FloatingWindow from './FloatingWindow';
import ChatOverlay from '../tutor/ChatOverlay';
import useGalileoChat from './useGalileoChat';
const LessonPathPanel = lazy(() => import('../simulator/panels/LessonPathPanel'));
import { getLessonPath } from '../../data/lesson-paths';
import unlimMemory from '../../services/unlimMemory';
const ExperimentGuide = lazy(() => import('../simulator/panels/ExperimentGuide'));
// Voice service loaded on demand (saves ~1.5MB from initial bundle)
let _voice = null;
async function getVoice() {
  if (!_voice) _voice = await import('../../services/voiceService');
  return _voice;
}
import { sanitizeOutput } from '../../utils/contentFilter';
import logger from '../../utils/logger';
import css from './GalileoAdapter.module.css';

/** Embedded Percorso — 5 phases one at a time (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI). Principio Zero. */
function EmbeddedPercorso({ experiment, onAskUNLIM }) {
  const path = getLessonPath(experiment?.id);
  const [currentPhase, setCurrentPhase] = React.useState(0);
  const [sessionContext, setSessionContext] = React.useState(null);

  // Load session context from unlimMemory (adaptive)
  React.useEffect(() => {
    (async () => {
      try {
        const classId = localStorage.getItem('elab_class_key') || '_self';
        const progress = await unlimMemory.getProgress(classId);
        const lastLesson = await unlimMemory.getLastLesson(classId);
        const alreadyDone = progress.completedExperiments.includes(experiment?.id);
        setSessionContext({ progress, lastLesson, alreadyDone });
      } catch { setSessionContext(null); }
    })();
  }, [experiment?.id]);

  if (!path?.phases?.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#737373', fontFamily: "'Open Sans', sans-serif" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1E4D8C', marginBottom: 8 }}>Percorso non disponibile</p>
        <p style={{ fontSize: 15 }}>Questo esperimento non ha un percorso lezione dettagliato.</p>
        <button onClick={() => onAskUNLIM?.('Prepara una lezione per questo esperimento')} style={{ marginTop: 16, padding: '12px 20px', border: '2px solid #4A7A25', borderRadius: 12, background: 'rgba(74,122,37,0.08)', color: '#4A7A25', fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Chiedi a UNLIM di preparare la lezione
        </button>
      </div>
    );
  }

  const phases = path.phases;
  const phase = phases[currentPhase];
  const totalPages = phases.length;
  const isFirst = currentPhase === 0;
  const isLast = currentPhase === totalPages - 1;

  const PHASE_COLORS = {
    PREPARA: { bg: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '#93c5fd', accent: '#1E4D8C' },
    MOSTRA: { bg: 'linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)', border: '#fcd34d', accent: '#E8941C' },
    CHIEDI: { bg: 'linear-gradient(135deg, #fce7f3 0%, #fef2f2 100%)', border: '#f9a8d4', accent: '#E54B3D' },
    OSSERVA: { bg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '#86efac', accent: '#4A7A25' },
    CONCLUDI: { bg: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)', border: '#c4b5fd', accent: '#6d28d9' },
  };
  const colors = PHASE_COLORS[phase.name] || PHASE_COLORS.PREPARA;

  const PS = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' },
    content: { flex: 1, overflow: 'auto', padding: '8px 4px' },
    card: {
      background: colors.bg, borderRadius: 18, padding: '22px 18px',
      border: `1px solid ${colors.border}40`,
      boxShadow: `0 4px 20px ${colors.accent}10`,
    },
    phaseLabel: {
      fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 600,
      color: colors.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    phaseName: {
      fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700,
      color: colors.accent, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
    },
    phaseIcon: { fontSize: 28 },
    message: { fontSize: 17, lineHeight: 1.7, color: '#1A1A2E', fontFamily: "'Open Sans', sans-serif", marginBottom: 14 },
    tip: {
      background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 14px', marginBottom: 12,
      border: '1px dashed ' + colors.accent + '30', fontSize: 15, lineHeight: 1.6, color: '#555',
    },
    tipLabel: { fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 600, color: colors.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 },
    extra: { fontSize: 15, lineHeight: 1.6, color: '#444', marginTop: 10, fontStyle: 'italic' },
    nav: { display: 'flex', gap: 10, padding: '10px 0 4px', flexShrink: 0 },
    navBtn: (primary) => ({
      flex: 1, padding: '14px 16px', border: primary ? 'none' : `2px solid ${colors.accent}40`, borderRadius: 14,
      background: primary ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}cc 100%)` : `${colors.accent}08`,
      color: primary ? '#fff' : colors.accent,
      fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, cursor: 'pointer',
      letterSpacing: '1px', textTransform: 'uppercase',
      boxShadow: primary ? `0 4px 16px ${colors.accent}30` : 'none',
    }),
    progress: { display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0' },
    dot: (active) => ({
      width: active ? 28 : 10, height: 10, borderRadius: 5,
      background: active ? `linear-gradient(90deg, ${colors.accent}, ${colors.accent}99)` : '#d1d5db',
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  };

  // Get extra content for the current phase
  const extras = [];
  if (phase.provocative_question) extras.push({ label: 'Domanda per la classe', text: phase.provocative_question });
  if (phase.common_mistakes?.length) extras.push({ label: 'Errori comuni', text: phase.common_mistakes.join(' • ') });
  if (phase.observation_prompt) extras.push({ label: 'Cosa osservare', text: phase.observation_prompt });
  if (phase.analogies?.length) extras.push({ label: 'Analogia', text: phase.analogies.join(' ') });
  if (phase.summary_for_class) extras.push({ label: 'Riepilogo', text: phase.summary_for_class });
  if (phase.concepts_learned?.length) extras.push({ label: 'Concetti', text: phase.concepts_learned.join(', ') });
  if (phase.next_preview) extras.push({ label: 'Prossima volta', text: phase.next_preview });

  return (
    <div style={PS.container}>
      <div style={PS.content}>
        <div style={PS.card}>
          <div style={PS.phaseLabel}>
            <span>Fase {currentPhase + 1} di {totalPages}</span>
            <span style={{ flex: 1, height: 2, background: `${colors.accent}20`, borderRadius: 1 }} />
            <span>{phase.duration_minutes} min</span>
          </div>
          <div style={PS.phaseName}>
            <span style={PS.phaseIcon}>{phase.icon || '📋'}</span>
            <span>{phase.name}</span>
          </div>
          {/* Adaptive context banner — only on first phase */}
          {currentPhase === 0 && sessionContext && (
            <div style={{ ...PS.tip, background: sessionContext.alreadyDone ? 'rgba(74,122,37,0.08)' : 'rgba(30,77,140,0.05)', borderColor: sessionContext.alreadyDone ? '#4A7A2530' : '#1E4D8C20', marginBottom: 14 }}>
              <div style={{ ...PS.tipLabel, color: sessionContext.alreadyDone ? '#4A7A25' : '#1E4D8C' }}>
                {sessionContext.alreadyDone ? 'Ripasso' : 'Contesto classe'}
              </div>
              {sessionContext.alreadyDone
                ? 'Questo esperimento è già stato fatto in una sessione precedente. Puoi usare il Percorso per un ripasso veloce o saltare alle fasi che servono.'
                : sessionContext.progress?.completedExperiments?.length > 0
                  ? `La classe ha già completato ${sessionContext.progress.completedExperiments.length} esperimenti. ${sessionContext.lastLesson?.experimentId ? `Ultimo: ${sessionContext.lastLesson.experimentId}` : ''}`
                  : 'Prima sessione con questa classe. Il Percorso parte dall\'inizio.'
              }
            </div>
          )}
          <div style={PS.message}>{phase.teacher_message}</div>
          {phase.teacher_tip && (
            <div style={PS.tip}>
              <div style={PS.tipLabel}>Suggerimento</div>
              {phase.teacher_tip}
            </div>
          )}
          {extras.map((ex, i) => (
            <div key={i} style={PS.tip}>
              <div style={PS.tipLabel}>{ex.label}</div>
              {ex.text}
            </div>
          ))}
        </div>
      </div>
      <div style={PS.progress}>
        {phases.map((_, i) => <div key={i} style={PS.dot(i === currentPhase)} />)}
      </div>
      <div style={PS.nav}>
        {!isFirst && <button style={PS.navBtn(false)} onClick={() => setCurrentPhase(p => p - 1)}>Indietro</button>}
        <button
          style={{ ...PS.navBtn(false), flex: 'none', width: 48, padding: '14px 0', fontSize: 18, border: `2px solid ${colors.accent}30` }}
          onClick={() => onAskUNLIM?.(`Sono nella fase ${phase.name} dell'esperimento "${path.title}". ${phase.teacher_message} Dammi un consiglio o un'idea per questa fase.`)}
          title="Chiedi consiglio a UNLIM per questa fase"
          aria-label="Chiedi a UNLIM"
        >?</button>
        {!isLast && <button style={PS.navBtn(true)} onClick={() => setCurrentPhase(p => p + 1)}>Avanti</button>}
        {isLast && <button style={PS.navBtn(true)} onClick={() => onAskUNLIM?.('Riepilogo della lezione')}>Riepilogo</button>}
      </div>
    </div>
  );
}

/** Embedded step-by-step guide — ONE step at a time, Avanti/Indietro buttons. Principio Zero. */
function EmbeddedGuide({ experiment, onAskUNLIM }) {
  const steps = experiment?.steps || [];
  const desc = experiment?.desc || '';
  const observe = experiment?.observe || experiment?.note || '';
  const concept = experiment?.concept || '';
  const [currentStep, setCurrentStep] = React.useState(-1); // -1 = intro, 0..N-1 = steps, N = osserva, N+1 = concetto

  // Total "pages": intro + steps + observe (if any) + concept (if any)
  const hasObserve = !!observe;
  const hasConcept = !!concept;
  const totalPages = 1 + steps.length + (hasObserve ? 1 : 0) + (hasConcept ? 1 : 0);
  const pageIndex = currentStep + 1; // 0-based page (intro = 0)

  const GS = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 4px' },
    title: {
      fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: '#1E4D8C',
      marginBottom: 14, textAlign: 'center', lineHeight: 1.3,
    },
    desc: {
      fontSize: 17, lineHeight: 1.7, color: '#555', textAlign: 'center',
      fontFamily: "'Open Sans', sans-serif", maxWidth: 320, margin: '0 auto',
    },
    stepCard: {
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #f0fdf4 100%)',
      borderRadius: 18, padding: '24px 20px',
      border: '1px solid rgba(30, 77, 140, 0.12)',
      boxShadow: '0 4px 20px rgba(30, 77, 140, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
    },
    stepLabel: {
      fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 600,
      color: '#4A7A25', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    stepLabelBar: { flex: 1, height: 2, background: 'linear-gradient(90deg, #4A7A25 0%, transparent 100%)', borderRadius: 1, opacity: 0.3 },
    stepNum: {
      display: 'inline-flex', width: 48, height: 48, borderRadius: 14,
      background: 'linear-gradient(135deg, #1E4D8C 0%, #2a6bc4 100%)',
      color: '#fff', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700,
      marginRight: 16, flexShrink: 0,
      boxShadow: '0 3px 12px rgba(30, 77, 140, 0.25)',
    },
    stepText: {
      fontSize: 18, lineHeight: 1.65, color: '#1A1A2E', fontWeight: 500,
      fontFamily: "'Open Sans', sans-serif",
    },
    sectionCard: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
      borderRadius: 18, padding: '24px 20px',
      border: '1px solid rgba(74, 122, 37, 0.15)',
      boxShadow: '0 4px 20px rgba(74, 122, 37, 0.08)',
    },
    sectionTitle: {
      fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600,
      color: '#4A7A25', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    sectionText: { fontSize: 17, lineHeight: 1.7, color: '#333', fontFamily: "'Open Sans', sans-serif" },
    nav: { display: 'flex', gap: 10, padding: '10px 0 4px', flexShrink: 0 },
    navBtn: (primary) => ({
      flex: 1, padding: '14px 16px', border: primary ? 'none' : '2px solid rgba(30, 77, 140, 0.3)', borderRadius: 14,
      background: primary ? 'linear-gradient(135deg, #1E4D8C 0%, #2a6bc4 100%)' : 'rgba(30, 77, 140, 0.04)',
      color: primary ? '#fff' : '#1E4D8C',
      fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, cursor: 'pointer',
      letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 150ms',
      boxShadow: primary ? '0 4px 16px rgba(30, 77, 140, 0.25)' : 'none',
    }),
    progress: { display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0' },
    dot: (active) => ({
      width: active ? 24 : 8, height: 8, borderRadius: 4,
      background: active ? 'linear-gradient(90deg, #1E4D8C, #4A7A25)' : '#d1d5db',
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    askBtn: { width: '100%', padding: '10px 16px', border: '2px solid #4A7A25', borderRadius: 10, background: 'rgba(74,122,37,0.08)', color: '#4A7A25', fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', marginTop: 8 },
  };

  if (!steps.length && !desc && !observe) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#737373', fontSize: 16 }}>Questo esperimento non ha passi dettagliati.<br/><button style={GS.askBtn} onClick={() => onAskUNLIM?.('Aiutami con questo esperimento')}>Chiedi a UNLIM</button></div>;
  }

  // Determine what to show for current step
  let content;
  if (currentStep === -1) {
    // Intro page
    content = (
      <div style={GS.content}>
        <div style={GS.title}>{experiment.icon || '💡'} {experiment.title}</div>
        {desc && <div style={GS.desc}>{desc}</div>}
        {!desc && <div style={GS.desc}>Pronto a iniziare? Premi Avanti per il primo passo.</div>}
      </div>
    );
  } else if (currentStep < steps.length) {
    // Step page
    content = (
      <div style={GS.content}>
        <div style={GS.stepCard}>
          <div style={GS.stepLabel}>
            <span>Passo {currentStep + 1} di {steps.length}</span>
            <span style={GS.stepLabelBar} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={GS.stepNum}>{currentStep + 1}</span>
            <span style={GS.stepText}>{steps[currentStep]}</span>
          </div>
        </div>
      </div>
    );
  } else if (hasObserve && currentStep === steps.length) {
    content = (
      <div style={GS.content}>
        <div style={GS.sectionCard}>
          <div style={GS.sectionTitle}>Cosa osservare</div>
          <div style={GS.sectionText}>{observe}</div>
        </div>
      </div>
    );
  } else {
    content = (
      <div style={GS.content}>
        <div style={GS.sectionCard}>
          <div style={GS.sectionTitle}>Concetto chiave</div>
          <div style={GS.sectionText}>{concept}</div>
        </div>
        <button style={GS.askBtn} onClick={() => onAskUNLIM?.('Aiutami con questo esperimento')}>Chiedi a UNLIM</button>
      </div>
    );
  }

  const isFirst = currentStep === -1;
  const isLast = pageIndex >= totalPages - 1;

  return (
    <div style={GS.container}>
      {content}
      {/* Progress dots */}
      <div style={GS.progress}>
        {Array.from({ length: totalPages }, (_, i) => <div key={i} style={GS.dot(i === pageIndex)} />)}
      </div>
      {/* Navigation */}
      <div style={GS.nav}>
        {!isFirst && <button style={GS.navBtn(false)} onClick={() => setCurrentStep(s => s - 1)}>Indietro</button>}
        {!isLast && <button style={GS.navBtn(true)} onClick={() => setCurrentStep(s => s + 1)}>{isFirst ? 'Inizia' : 'Avanti'}</button>}
        {isLast && <button style={GS.navBtn(true)} onClick={() => setCurrentStep(-1)}>Ricomincia</button>}
      </div>
    </div>
  );
}

export default function GalileoAdapter({ visible, onClose, onSpeakingChange, activeTab: initialTab = 'chat' }) {
  const chat = useGalileoChat();
  const [activeTab, setActiveTab] = useState(initialTab); // 'chat' | 'percorso' | 'guida'
  const [currentExperiment, setCurrentExperiment] = useState(null);

  // Sync initial tab when prop changes (e.g. Percorso button in header)
  useEffect(() => { if (visible) setActiveTab(initialTab); }, [initialTab, visible]);

  // Get current experiment for Percorso tab — with polling fallback for race condition
  useEffect(() => {
    const tryLoad = () => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (!api) return false;
      const exp = api.getCurrentExperiment?.();
      if (exp) { setCurrentExperiment(exp); return true; }
      return false;
    };
    tryLoad();
    let retries = 0;
    const poll = setInterval(() => { if (tryLoad() || ++retries > 20) clearInterval(poll); }, 500);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    const onChange = () => { const e = api?.getCurrentExperiment?.(); if (e) setCurrentExperiment(e); };
    api?.on?.('experimentChange', onChange);
    return () => { clearInterval(poll); api?.off?.('experimentChange', onChange); };
  }, [visible]);

  // ── Voice state ──
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // ── FloatingWindow state ──
  const [maximized, setMaximized] = useState(false);
  const containerRef = useRef(null);

  // ── Emit speaking state to parent (drives MascotPresence animation) ──
  useEffect(() => {
    onSpeakingChange?.(voicePlaying || chat.isLoading);
    // Reset speaking state on unmount (e.g. when window is closed mid-response)
    return () => onSpeakingChange?.(false);
  }, [voicePlaying, chat.isLoading, onSpeakingChange]);

  // ── Auto-expand ChatOverlay (it defaults to minimized internally) ──
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      const btn = document.querySelector('[aria-label="Espandi chat Galileo"]');
      if (btn) btn.click();
    }, 150);
    return () => clearTimeout(timer);
  }, [visible]);

  // ── Voice: detect capabilities on mount (lazy load) ──
  useEffect(() => {
    getVoice().then(v => v.checkVoiceCapabilities()).then(caps => {
      setVoiceAvailable(caps.stt && caps.tts && caps.microphone);
    }).catch(() => setVoiceAvailable(false));
    return () => { getVoice().then(v => { v.cancelRecording(); v.stopPlayback(); }).catch(() => {}); };
  }, []);

  // ── Voice toggle ──
  const handleVoiceToggle = useCallback(async (enabled) => {
    if (enabled && !voiceAvailable) return;
    const v = await getVoice();
    if (enabled) v.unlockAudioPlayback();
    setVoiceEnabled(enabled);
    if (!enabled) {
      v.cancelRecording();
      v.stopPlayback();
      setVoiceRecording(false);
      setVoicePlaying(false);
    }
  }, [voiceAvailable]);

  // ── Voice record (press-to-talk) ──
  const handleVoiceRecord = useCallback(async () => {
    if (chat.isLoading) return;
    const v = await getVoice();
    v.unlockAudioPlayback();

    if (v.isRecording()) {
      setVoiceRecording(false);
      chat.setMessages(prev => [...prev, {
        id: Date.now(), role: 'user',
        content: 'Messaggio vocale in elaborazione...', isVoice: true,
      }]);

      try {
        const audioBlob = await v.stopRecording();
        if (!audioBlob || audioBlob.size < 100) return;

        const api = typeof window !== 'undefined' && window.__ELAB_API;
        let simulatorCtx = null;
        try { simulatorCtx = api?.getSimulatorContext?.(); } catch { /* silent */ }

        const result = await v.sendVoiceChat(audioBlob, {
          sessionId: localStorage.getItem('elab_tutor_session') || '',
          experimentId: api?.getActiveExperiment?.()?.id || '',
          circuitState: chat.circuitStateRef.current,
          simulatorContext: simulatorCtx,
        });

        if (result.success) {
          // Update user message with transcript
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = (() => { for (let i = last.length - 1; i >= 0; i--) { if (last[i].isVoice && last[i].content === 'Messaggio vocale in elaborazione...') return i; } return -1; })();
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
              await v.playTracked(result.audio, result.audioFormat || 'audio/mpeg');
            } catch (e) {
              logger.error('[Lavagna Voice] Playback failed:', e);
            }
            setVoicePlaying(false);
          }
        } else {
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = (() => { for (let i = last.length - 1; i >= 0; i--) { if (last[i].isVoice && last[i].content === 'Messaggio vocale in elaborazione...') return i; } return -1; })();
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
      const started = await v.startRecording();
      if (started) {
        setVoiceRecording(true);
        v.stopPlayback();
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
        const v = await getVoice();
        const audioData = await v.synthesizeSpeech(lastMsg.content);
        await v.playTracked(audioData, 'audio/mpeg');
      } catch (e) {
        logger.error('[Lavagna Voice] Auto-speak failed:', e);
      } finally {
        setVoicePlaying(false);
      }
    })();
  }, [chat.messages, voiceEnabled]);

  if (!visible) return null;

  const tabBarStyle = {
    display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb',
    background: '#f8fafc', flexShrink: 0,
  };
  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
    fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600,
    letterSpacing: '0.5px', textTransform: 'uppercase',
    background: active ? '#fff' : 'transparent',
    color: active ? '#1E4D8C' : '#737373',
    borderBottom: active ? '2px solid #1E4D8C' : '2px solid transparent',
    transition: 'all 150ms',
  });

  return (
    <FloatingWindow
      id="unlim-v3"
      title="UNLIM"
      defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, y: 56 }}
      defaultSize={{ w: 400, h: Math.min(580, typeof window !== 'undefined' ? window.innerHeight - 140 : 580) }}
      maximized={maximized}
      onMaximize={() => setMaximized(m => !m)}
      onClose={onClose}
      onMinimize={onClose}
      glass
      className={css.galileoWindow}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Tab bar */}
        <div style={tabBarStyle}>
          <button style={tabStyle(activeTab === 'chat')} onClick={() => setActiveTab('chat')}>Chat</button>
          <button style={tabStyle(activeTab === 'percorso')} onClick={() => setActiveTab('percorso')}>Percorso</button>
          <button style={tabStyle(activeTab === 'guida')} onClick={() => setActiveTab('guida')}>Passo Passo</button>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          {activeTab === 'chat' && (
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
          )}
          {activeTab === 'percorso' && (
            <div style={{ height: '100%', overflow: 'hidden', padding: '8px 12px', display: 'flex', flexDirection: 'column' }}>
              {currentExperiment ? (
                <EmbeddedPercorso
                  experiment={currentExperiment}
                  onAskUNLIM={(msg) => { setActiveTab('chat'); chat.setInput(msg); }}
                />
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: '#1E4D8C', fontFamily: 'Open Sans, sans-serif' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nessun esperimento caricato</p>
                  <p style={{ fontSize: 14, color: '#737373' }}>Scegli un esperimento per vedere il percorso.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'guida' && (
            <div style={{ height: '100%', overflow: 'auto', padding: 12 }}>
              {currentExperiment ? (
                <EmbeddedGuide experiment={currentExperiment} onAskUNLIM={(msg) => { setActiveTab('chat'); chat.setInput(msg); }} />
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: '#1E4D8C', fontFamily: 'Open Sans, sans-serif' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nessun esperimento caricato</p>
                  <p style={{ fontSize: 14, color: '#737373' }}>Scegli un esperimento per la guida passo passo.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FloatingWindow>
  );
}
