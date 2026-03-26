// ============================================
// ELAB Tutor - TTS Controls
// Voice controls for Galileo AI responses
// © Andrea Marro — 24/03/2026
// ============================================

import React, { useState } from 'react';
import { useTTS } from '../../hooks/useTTS';

/**
 * Componente per i controlli TTS di Galileo
 * Include play/pause/stop e selezione voce
 */
function TTSControls({ 
  text, 
  className = '', 
  size = 'default',
  showVoiceSelector = false,
  disabled = false 
}) {
  const {
    isSupported,
    isSpeaking,
    isPaused,
    isLoading,
    availableVoices,
    selectedVoice,
    speak,
    stop,
    togglePause,
    changeVoice,
  } = useTTS();

  const [showVoices, setShowVoices] = useState(false);

  // Se TTS non supportato, non mostrare nulla
  if (!isSupported) {
    return null;
  }

  const handlePlay = () => {
    if (isSpeaking) {
      if (isPaused) {
        togglePause();
      } else {
        stop();
      }
    } else {
      speak(text);
    }
  };

  const handlePause = () => {
    togglePause();
  };

  const handleStop = () => {
    stop();
  };

  // Stili base
  const controlSize = size === 'small' ? 32 : 40;
  const iconSize = size === 'small' ? 14 : 16;
  
  const buttonStyle = {
    width: `${controlSize}px`,
    height: `${controlSize}px`,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms ease',
    fontSize: `${iconSize}px`,
    opacity: disabled ? 0.5 : 1,
    minHeight: '44px', // iPad touch target
    minWidth: '44px',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: isSpeaking && !isPaused 
      ? 'var(--color-error)' 
      : 'var(--color-primary)',
    color: 'white',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
  };

  const italianVoices = availableVoices.filter(voice => 
    voice.lang.startsWith('it') || 
    voice.name.toLowerCase().includes('italian')
  );

  return (
    <div className={className} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      position: 'relative'
    }}>
      {/* Bottone principale: Play/Stop */}
      <button
        onClick={handlePlay}
        disabled={disabled || isLoading}
        style={primaryButtonStyle}
        title={
          isLoading ? "Caricamento..." :
          isSpeaking && !isPaused ? "Ferma lettura" : 
          isPaused ? "Riprendi lettura" : 
          "Leggi ad alta voce"
        }
        aria-label={
          isLoading ? "Caricamento audio" :
          isSpeaking && !isPaused ? "Ferma lettura" : 
          isPaused ? "Riprendi lettura" : 
          "Leggi ad alta voce"
        }
      >
        {isLoading ? (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : isSpeaking && !isPaused ? (
          '⏹'
        ) : isPaused ? (
          '▶️'
        ) : (
          '🔊'
        )}
      </button>

      {/* Bottoni secondari (quando sta parlando) */}
      {isSpeaking && (
        <>
          <button
            onClick={handlePause}
            disabled={disabled}
            style={secondaryButtonStyle}
            title={isPaused ? "Riprendi" : "Pausa"}
            aria-label={isPaused ? "Riprendi lettura" : "Metti in pausa"}
          >
            {isPaused ? '▶️' : '⏸'}
          </button>
          
          <button
            onClick={handleStop}
            disabled={disabled}
            style={secondaryButtonStyle}
            title="Ferma"
            aria-label="Ferma lettura"
          >
            ⏹
          </button>
        </>
      )}

      {/* Selezione voce (se richiesta) */}
      {showVoiceSelector && italianVoices.length > 1 && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowVoices(!showVoices)}
            disabled={disabled}
            style={secondaryButtonStyle}
            title="Cambia voce"
            aria-label="Seleziona voce"
          >
            🎭
          </button>
          
          {showVoices && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '8px',
              minWidth: '200px',
              zIndex: 1000,
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                Scegli voce:
              </div>
              {italianVoices.map((voice, index) => (
                <button
                  key={index}
                  onClick={() => {
                    changeVoice(voice);
                    setShowVoices(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: selectedVoice?.name === voice.name 
                      ? 'var(--color-primary-light)' 
                      : 'transparent',
                    borderRadius: '4px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '2px',
                    minHeight: '44px',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>
                    {voice.name.replace(/Microsoft|Google|Apple/, '').trim()}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-text-secondary)' 
                  }}>
                    {voice.localService ? '📱 Locale' : '☁️ Online'} • {voice.lang}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keyframes per loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default React.memo(TTSControls);