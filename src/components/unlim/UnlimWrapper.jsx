/**
 * UnlimWrapper — Wrapper che gestisce UNLIM Mode vs Classic Mode
 * Nasconde/mostra UI elements in base alla modalità.
 * Layer sopra il prodotto esistente — non sostituisce nulla.
 * © Andrea Marro — 27/03/2026
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [inputBarVisible, setInputBarVisible] = useState(false);
  const [currentExperimentId, setCurrentExperimentId] = useState(null);

  // Auto-rileva l'esperimento corrente dall'evento del simulatore
  useEffect(() => {
    const api = window.__ELAB_API;
    function handleExpChange(data) {
      if (data?.experimentId) setCurrentExperimentId(data.experimentId);
    }
    if (api?.on) api.on('experimentChange', handleExpChange);
    return () => { if (api?.off) api.off('experimentChange', handleExpChange); };
  }, []);

  // Carica il percorso lezione per l'esperimento corrente
  const lessonPath = currentExperimentId ? getLessonPath(currentExperimentId) : null;

  // Quando l'utente clicca sulla mascotte
  const handleMascotClick = useCallback(() => {
    if (inputBarVisible) {
      setInputBarVisible(false);
      setMascotState('idle');
    } else {
      setInputBarVisible(true);
      setMascotState('active');
    }
  }, [inputBarVisible]);

  // Quando l'utente invia un messaggio dalla barra input → Galileo API
  const abortRef = useRef(null);
  const handleSend = useCallback(async (text) => {
    setMascotState('speaking');
    // Abort precedente richiesta se ancora in corso
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await sendChat(text, [], {
        signal: controller.signal,
        experimentId: currentExperimentId || undefined,
        experimentContext: lessonPath
          ? `Esperimento: ${lessonPath.title} (${lessonPath.experiment_id}). Obiettivo: ${lessonPath.objective || ''}`
          : undefined,
      });

      // Se abortato nel frattempo, non mostrare
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
      if (!controller.signal.aborted) setMascotState('active');
    }
  }, [showMessage, currentExperimentId, lessonPath]);
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
