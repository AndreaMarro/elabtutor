/**
 * UnlimWrapper — Wrapper che gestisce UNLIM Mode vs Classic Mode
 * Nasconde/mostra UI elements in base alla modalità.
 * Layer sopra il prodotto esistente — non sostituisce nulla.
 * © Andrea Marro — 27/03/2026
 */

import React, { useState, useCallback, useEffect, useRef, useMemo, Component } from 'react';
import logger from '../../utils/logger';
import UnlimMascot from './UnlimMascot';
import UnlimOverlay, { useOverlayMessages } from './UnlimOverlay';
import UnlimInputBar from './UnlimInputBar';
import UnlimModeSwitch, { useUnlimMode } from './UnlimModeSwitch';
import { getLessonPath } from '../../data/lesson-paths';
import { sendChat, checkRateLimit } from '../../services/api';
import { useTTS } from '../../hooks/useTTS';
import { useSTT } from '../../hooks/useSTT';
import { useSessionTracker } from '../../hooks/useSessionTracker';
import { getWelcomeMessage, getNextLessonSuggestion, buildClassContext } from '../../services/classProfile';
import { openReportWindow, isReportCommand } from './UnlimReport';

/**
 * Error Boundary — cattura crash in overlay/TTS/mascotte senza uccidere il simulatore.
 * Mostra il children originale (simulatore) anche se UNLIM crasha.
 */
class UnlimErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    logger.error('[UNLIM] Error boundary caught:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * UnlimWrapper — avvolge il contenuto del tutor e aggiunge il layer UNLIM.
 * Auto-rileva l'esperimento corrente ascoltando l'evento 'experimentChange'
 * emesso da __ELAB_API — nessuna prop necessaria da ElabTutorV4.
 *
 * @param {React.ReactNode} children - il contenuto originale (ElabTutorV4 interno)
 */
export default function UnlimWrapper({ children }) {
  const { isUnlim, toggleMode } = useUnlimMode();
  const { messages, showMessage, dismissMessage } = useOverlayMessages();
  const [mascotState, setMascotState] = useState('idle'); // idle, active, speaking
  const [isLoading, setIsLoading] = useState(false);
  const [inputBarVisible, setInputBarVisible] = useState(false);
  const [currentExperimentId, setCurrentExperimentId] = useState(null);

  // Session tracker — registra messaggi, azioni, errori per ogni esperimento
  const sessionTracker = useSessionTracker();

  // TTS — voce per leggere i messaggi ad alta voce
  const tts = useTTS();
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem('elab-tts-muted') === 'true'; } catch { return false; }
  });
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem('elab-tts-muted', String(next)); } catch {}
      if (next) tts.stop(); // ferma voce se si muta
      return next;
    });
  }, [tts]);

  // Speak helper — legge il testo se non è mutato
  const speakIfEnabled = useCallback((text) => {
    if (!isMuted && tts.isSupported && text) {
      tts.speak(text);
    }
  }, [isMuted, tts]);

  // STT — riconoscimento vocale per input voce
  const [sttInputText, setSttInputText] = useState('');
  const stt = useSTT({
    lang: 'it-IT',
    onResult: useCallback((text) => {
      // Testo finale riconosciuto → invia direttamente a Galileo
      setSttInputText('');
      if (text) handleSendRef.current?.(text);
    }, []),
    onInterim: useCallback((text) => {
      setSttInputText(text);
    }, []),
  });
  // Ref per handleSend (evita dipendenza circolare con useSTT)
  const handleSendRef = useRef(null);

  // Auto-rileva l'esperimento corrente dall'evento del simulatore
  // P1-2 fix: retry se __ELAB_API non è pronto al mount
  // C1 fix: mountedRef previene memory leak se unmount durante retry
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    function trySubscribe() {
      if (!mountedRef.current) return false;
      const api = window.__ELAB_API;
      if (!api?.on) return false;
      api.on('experimentChange', handleExpChange);
      return true;
    }
    function handleExpChange(data) {
      if (!mountedRef.current) return;
      if (data?.experimentId) setCurrentExperimentId(data.experimentId);
    }
    if (!trySubscribe()) {
      // Retry con backoff: 500ms, 1500ms, 3000ms (LIM lente possono impiegare fino a 5s)
      const delays = [500, 1500, 3000];
      const timers = [];
      let subscribed = false;
      delays.forEach((delay) => {
        timers.push(setTimeout(() => {
          if (!mountedRef.current || subscribed) return;
          subscribed = trySubscribe();
        }, delay));
      });
      return () => {
        mountedRef.current = false;
        timers.forEach(clearTimeout);
        const api = window.__ELAB_API;
        if (api?.off) api.off('experimentChange', handleExpChange);
      };
    }
    return () => {
      mountedRef.current = false;
      const api = window.__ELAB_API;
      if (api?.off) api.off('experimentChange', handleExpChange);
    };
  }, []);

  // Ascolta eventi 'unlim-contextual-message' da ElabTutorV4
  // Quando un'azione highlight viene eseguita, il messaggio appare accanto al componente
  useEffect(() => {
    function handleContextualMessage(e) {
      if (!mountedRef.current || !isUnlim) return;
      const { text, targetComponentId, type, icon, duration } = e.detail || {};
      if (!text) return;
      showMessage(text, {
        position: targetComponentId ? 'contextual' : 'center',
        targetComponentId: targetComponentId || null,
        icon: icon || '🤖',
        type: type || 'info',
        duration: duration || 6000,
      });
      speakIfEnabled(text);
    }
    window.addEventListener('unlim-contextual-message', handleContextualMessage);
    return () => window.removeEventListener('unlim-contextual-message', handleContextualMessage);
  }, [isUnlim, showMessage, speakIfEnabled]);

  // Carica il percorso lezione per l'esperimento corrente
  const lessonPath = currentExperimentId ? getLessonPath(currentExperimentId) : null;

  // P0-1 fix: abort richiesta in corso quando si chiude la barra input
  const abortRef = useRef(null);
  const handleMascotClick = useCallback(() => {
    if (inputBarVisible) {
      setInputBarVisible(false);
      setMascotState('idle');
      if (abortRef.current) abortRef.current.abort();
      setIsLoading(false);
      // BUG-20 fix: stop STT and clear interim text when closing input bar
      if (stt.isListening) stt.stopListening();
      setSttInputText('');
    } else {
      setInputBarVisible(true);
      setMascotState('active');
    }
  }, [inputBarVisible, stt]);

  // Quando l'utente invia un messaggio dalla barra input → Galileo API
  // P1-1 fix: ricalcola lessonPath dentro il callback (no stale closure)
  // P1-5 fix: gestisce isLoading per disabilitare input durante richiesta
  const handleSend = useCallback(async (text) => {
    // Intercetta comando "crea il report" — eseguilo localmente senza AI
    if (isReportCommand(text)) {
      const opened = openReportWindow(currentExperimentId);
      if (opened === 'downloaded') {
        showMessage('Report scaricato! Aprilo dalla cartella Download.', {
          position: 'top-center', icon: '\uD83D\uDCC4', type: 'success', duration: 8000,
        });
        speakIfEnabled('Report scaricato! Aprilo dalla cartella Download.');
        sessionTracker.recordAction('report_downloaded', currentExperimentId || 'last');
      } else if (opened) {
        showMessage('Report generato! Usa Stampa per salvarlo come PDF.', {
          position: 'top-center', icon: '\uD83D\uDCC4', type: 'success', duration: 6000,
        });
        speakIfEnabled('Report generato! Usa il pulsante Stampa per salvarlo come PDF.');
        sessionTracker.recordAction('report_generated', currentExperimentId || 'last');
      } else {
        showMessage('Non ci sono ancora dati per il report. Fai prima una lezione!', {
          position: 'top-center', icon: '\u26A0\uFE0F', type: 'info', duration: 5000,
        });
        speakIfEnabled('Non ci sono ancora dati per il report. Fai prima una lezione!');
      }
      return;
    }

    // Rate limit check — prevent spam from children tapping rapidly
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      showMessage(rateCheck.message || 'Aspetta qualche secondo...', {
        position: 'top-center', icon: '⏳', type: 'info', duration: 3000,
      });
      return;
    }
    setMascotState('speaking');
    setIsLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Record user message in session
    sessionTracker.recordMessage('user', text);

    const path = currentExperimentId ? getLessonPath(currentExperimentId) : null;

    // Inject class context into experiment context for AI
    const classCtx = buildClassContext();
    const expCtx = path
      ? `Esperimento: ${path.title} (${path.experiment_id}). Obiettivo: ${path.objective || ''}`
      : undefined;
    const fullContext = [expCtx, classCtx].filter(Boolean).join('\n') || undefined;

    try {
      const result = await sendChat(text, [], {
        signal: controller.signal,
        experimentId: currentExperimentId || undefined,
        experimentContext: fullContext,
      });

      if (controller.signal.aborted) return;

      if (result?.success && result.response) {
        // Estrai target componentId da action tags nella risposta
        const highlightMatch = result.response.match(/\[azione:highlight:([^\]]+)\]/i);
        const targetComponentId = highlightMatch
          ? highlightMatch[1].split(',')[0].trim()
          : null;

        // Rimuovi i tag azione dal testo visualizzato
        const cleanText = result.response
          .replace(/\[azione:[^\]]+\]/gi, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        // Tronca a 40 parole per overlay LIM — testo completo va alla voce TTS
        const MAX_OVERLAY_WORDS = 40;
        const words = cleanText.split(/\s+/);
        const displayText = words.length > MAX_OVERLAY_WORDS
          ? words.slice(0, MAX_OVERLAY_WORDS).join(' ') + '…'
          : cleanText;

        showMessage(displayText, {
          position: targetComponentId ? 'contextual' : 'top-center',
          targetComponentId,
          icon: '🤖',
          type: 'info',
          duration: 12000,
        });
        speakIfEnabled(cleanText);
        // Record assistant response in session
        sessionTracker.recordMessage('assistant', cleanText);
        if (targetComponentId) {
          sessionTracker.recordAction('highlight', targetComponentId);
        }
      } else {
        showMessage('Non sono riuscito a rispondere. Riprova tra poco!', {
          position: 'top-center',
          icon: '⚠️',
          type: 'info',
          duration: 4000,
        });
      }
    } catch (err) {
      if (err?.name === 'AbortError' || controller.signal.aborted) return;
      showMessage('Errore di connessione. Controlla la rete e riprova.', {
        position: 'top-center',
        icon: '⚠️',
        type: 'info',
        duration: 4000,
      });
    } finally {
      if (!controller.signal.aborted) {
        setMascotState('active');
        setIsLoading(false);
      }
    }
  }, [showMessage, currentExperimentId, speakIfEnabled, sessionTracker]);
  // Aggiorna ref per handleSend (usato da STT onResult senza dipendenza circolare)
  handleSendRef.current = handleSend;
  // Cleanup abort controller on unmount
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  // Mostra messaggio di benvenuto contestuale (basato sulla storia classe)
  // Se c'è un esperimento caricato → class_hook del lesson path
  // Se non c'è esperimento → welcome message contestuale + suggerimento
  const welcomeShownRef = useRef(false);
  useEffect(() => {
    if (!isUnlim) return;

    if (currentExperimentId) {
      // Esperimento caricato → mostra class_hook come prima
      const path = getLessonPath(currentExperimentId);
      const preparePhase = path?.phases?.[0];
      if (preparePhase?.class_hook) {
        const timer = setTimeout(() => {
          showMessage(preparePhase.class_hook, {
            position: 'contextual',
            targetComponentId: null,
            icon: '💡',
            type: 'hint',
            duration: 8000,
          });
          speakIfEnabled(preparePhase.class_hook);
          sessionTracker.recordAction('welcome_shown', preparePhase.class_hook);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else if (!welcomeShownRef.current) {
      // Nessun esperimento → messaggio di benvenuto contestuale
      welcomeShownRef.current = true;
      const welcome = getWelcomeMessage();
      let innerTimer, loadTimer;
      const WELCOME_DURATION = 10000;
      const timer = setTimeout(() => {
        showMessage(welcome.text, {
          position: 'top-center',
          icon: welcome.type === 'first_time' ? '👋' : '🎉',
          type: 'hint',
          duration: WELCOME_DURATION,
        });
        speakIfEnabled(welcome.text);

        // Suggerimento DOPO che il welcome scompare (no sovrapposizione)
        const suggestion = getNextLessonSuggestion();
        if (suggestion) {
          innerTimer = setTimeout(() => {
            showMessage(suggestion.message, {
              position: 'top-center',
              icon: '📚',
              type: 'hint',
              duration: 12000,
            });
            speakIfEnabled(suggestion.message);
          }, WELCOME_DURATION + 1000);

          // Principio Zero: auto-load primo esperimento per nuovi utenti
          // Per i ritorni il docente decide — ha già visto il flusso
          if (welcome.type === 'first_time') {
            loadTimer = setTimeout(() => {
              if (window.__ELAB_API?.loadExperiment) {
                window.__ELAB_API.loadExperiment(suggestion.experimentId);
              }
            }, WELCOME_DURATION + 3000);
          }
        }
      }, 1000);
      return () => { clearTimeout(timer); clearTimeout(innerTimer); clearTimeout(loadTimer); };
    }
  }, [currentExperimentId, isUnlim, showMessage, speakIfEnabled, sessionTracker]);

  // In Classic Mode: renderizza solo i children + switch
  if (!isUnlim) {
    return (
      <div style={{ position: 'relative' }}>
        {children}
        <div style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 1002,
        }}>
          <UnlimModeSwitch isUnlim={isUnlim} onToggle={toggleMode} />
        </div>
      </div>
    );
  }

  // UNLIM Mode: children + mascotte + overlay + input bar + switch
  // ErrorBoundary wrappa SOLO il layer UNLIM — se crasha, il simulatore resta vivo
  return (
    <div style={{ position: 'relative' }}>
      {/* Contenuto originale (ElabTutorV4) — FUORI dal boundary */}
      {children}

      <UnlimErrorBoundary fallback={null}>
        {/* Overlay messaggi contestuali — click chiude messaggio E ferma voce */}
        <UnlimOverlay messages={messages} onDismiss={(id) => { dismissMessage(id); tts.stop(); }} />

        {/* Mascotte nell'angolo — tap=chat, long-press=mute */}
        <UnlimMascot
          state={mascotState}
          onClick={handleMascotClick}
          isMuted={isMuted}
          onLongPress={tts.isSupported ? toggleMute : undefined}
        />

        {/* Barra input (visibile quando la mascotte è attiva) */}
        {inputBarVisible && (
          <UnlimInputBar
            onSend={handleSend}
            onReport={() => handleSend('crea il report')}
            onMicClick={stt.isSupported ? () => {
              if (stt.isListening) { stt.stopListening(); return; }
              tts.stop();
              setTimeout(() => stt.startListening(), 150);
            } : undefined}
            isListening={stt.isListening}
            isLoading={isLoading}
            placeholder={stt.isListening
              ? (sttInputText || 'Sto ascoltando...')
              : lessonPath
                ? `Chiedi qualcosa su "${lessonPath.title}"...`
                : 'Chiedi qualcosa a UNLIM...'}
          />
        )}
      </UnlimErrorBoundary>
    </div>
  );
}

// Re-export per uso esterno
export { useUnlimMode } from './UnlimModeSwitch';
