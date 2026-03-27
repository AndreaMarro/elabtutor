/**
 * UnlimWrapper — Wrapper che gestisce UNLIM Mode vs Classic Mode
 * Nasconde/mostra UI elements in base alla modalità.
 * Layer sopra il prodotto esistente — non sostituisce nulla.
 * © Andrea Marro — 27/03/2026
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import UnlimMascot from './UnlimMascot';
import UnlimOverlay, { useOverlayMessages } from './UnlimOverlay';
import UnlimInputBar from './UnlimInputBar';
import UnlimModeSwitch, { useUnlimMode } from './UnlimModeSwitch';
import { getLessonPath } from '../../data/lesson-paths';
import { sendChat } from '../../services/api';

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
      const retryTimer = setTimeout(() => {
        if (!mountedRef.current) return;
        trySubscribe();
      }, 800);
      return () => {
        mountedRef.current = false;
        clearTimeout(retryTimer);
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
    } else {
      setInputBarVisible(true);
      setMascotState('active');
    }
  }, [inputBarVisible]);

  // Quando l'utente invia un messaggio dalla barra input → Galileo API
  // P1-1 fix: ricalcola lessonPath dentro il callback (no stale closure)
  // P1-5 fix: gestisce isLoading per disabilitare input durante richiesta
  const handleSend = useCallback(async (text) => {
    setMascotState('speaking');
    setIsLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const path = currentExperimentId ? getLessonPath(currentExperimentId) : null;

    try {
      const result = await sendChat(text, [], {
        signal: controller.signal,
        experimentId: currentExperimentId || undefined,
        experimentContext: path
          ? `Esperimento: ${path.title} (${path.experiment_id}). Obiettivo: ${path.objective || ''}`
          : undefined,
      });

      if (controller.signal.aborted) return;

      if (result?.success && result.response) {
        showMessage(result.response, {
          position: 'top-center',
          icon: '🤖',
          type: 'info',
          duration: 12000,
        });
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
  }, [showMessage, currentExperimentId]);
  // Cleanup abort controller on unmount
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  // Mostra messaggio di benvenuto quando si cambia esperimento
  useEffect(() => {
    if (!isUnlim || !currentExperimentId) return;
    const path = getLessonPath(currentExperimentId);
    const preparePhase = path?.phases?.[0];
    if (preparePhase?.class_hook) {
      const timer = setTimeout(() => {
        showMessage(preparePhase.class_hook, {
          position: 'top-center',
          icon: '💡',
          type: 'hint',
          duration: 8000,
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentExperimentId, isUnlim, showMessage]);

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
  return (
    <div style={{ position: 'relative' }}>
      {/* Contenuto originale (ElabTutorV4) */}
      {children}

      {/* Overlay messaggi contestuali */}
      <UnlimOverlay messages={messages} onDismiss={dismissMessage} />

      {/* Switch UNLIM/Classic in alto a destra */}
      <div style={{
        position: 'fixed',
        top: '52px',
        right: '12px',
        zIndex: 1002,
      }}>
        <UnlimModeSwitch isUnlim={isUnlim} onToggle={toggleMode} />
      </div>

      {/* Mascotte nell'angolo */}
      <UnlimMascot
        state={mascotState}
        onClick={handleMascotClick}
      />

      {/* Barra input (visibile quando la mascotte è attiva) */}
      {inputBarVisible && (
        <UnlimInputBar
          onSend={handleSend}
          isLoading={isLoading}
          placeholder={lessonPath
            ? `Chiedi qualcosa su "${lessonPath.title}"...`
            : 'Chiedi qualcosa a UNLIM...'}
        />
      )}
    </div>
  );
}

// Re-export per uso esterno
export { useUnlimMode } from './UnlimModeSwitch';
