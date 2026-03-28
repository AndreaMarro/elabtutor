/**
 * UnlimMascot — Robot ELAB REALE nell'angolo del simulatore
 * Usa la mascotte ufficiale (logo-senza-sfondo.png) — pixel perfect.
 * Tap = apri/chiudi chat. Long-press (500ms) = mute/unmute voce.
 * 3 stati: idle (respira), active (glow lime), speaking (pulsazione + bounce)
 * Badge 🔇 quando mutato.
 * © Andrea Marro — 28/03/2026
 */

import React, { useRef, useCallback, useEffect } from 'react';
import './unlim-mascot.css';

const MASCOT_W = 64;
const MASCOT_H = 72;

export default function UnlimMascot({ state = 'idle', onClick, isMuted = false, onLongPress }) {
  const isActive = state === 'active' || state === 'speaking';
  const isSpeaking = state === 'speaking';

  // Long-press detection (500ms) for mute toggle — with visual feedback
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);
  const btnRef = useRef(null);

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    // Visual feedback: shrink progressively during hold
    if (btnRef.current) btnRef.current.classList.add('unlim-mascot-pressing');
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      if (btnRef.current) btnRef.current.classList.remove('unlim-mascot-pressing');
      onLongPress?.();
    }, 500);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    if (btnRef.current) btnRef.current.classList.remove('unlim-mascot-pressing');
    if (!didLongPress.current) {
      onClick?.();
    }
  }, [onClick]);

  const handlePointerLeave = useCallback(() => {
    clearTimeout(longPressTimer.current);
    if (btnRef.current) btnRef.current.classList.remove('unlim-mascot-pressing');
  }, []);

  // Cleanup timer on unmount (BUG-14 fix)
  useEffect(() => () => clearTimeout(longPressTimer.current), []);

  return (
      <button
        ref={btnRef}
        className="unlim-mascot-btn"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        aria-label={isMuted ? 'UNLIM — voce disattivata. Tieni premuto per attivare.' : 'UNLIM — clicca per parlare. Tieni premuto per disattivare voce.'}
        title={isMuted ? 'UNLIM (voce off — tieni premuto)' : 'Chiedi a UNLIM (tieni premuto = mute)'}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: `${MASCOT_W}px`,
          height: `${MASCOT_H}px`,
          borderRadius: 'var(--radius-lg, 14px)',
          border: isActive ? '2.5px solid #4A7A25' : '2px solid rgba(30, 77, 140, 0.15)',
          background: '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isActive
            ? '0 0 20px rgba(74, 122, 37, 0.5), 0 4px 14px rgba(0,0,0,0.15)'
            : 'var(--shadow-md, 0 4px 14px rgba(0,0,0,0.12))',
          zIndex: 1000,
          animation: isSpeaking
            ? 'unlim-speak-glow 1.5s ease-in-out infinite'
            : 'none',
          padding: '4px',
          overflow: 'visible',
          opacity: isMuted ? 0.7 : 1,
        }}
      >
        <img
          src="/assets/mascot/logo-senza-sfondo.png"
          alt="UNLIM robot"
          width={MASCOT_W - 10}
          height={MASCOT_H - 10}
          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '\uD83E\uDD16'; }}
          style={{
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            imageRendering: 'auto',
            filter: isMuted ? 'grayscale(0.5)' : 'none',
            animation: isSpeaking
              ? 'unlim-speak-bounce 0.8s ease-in-out infinite'
              : state === 'idle'
                ? 'unlim-breathe 3s ease-in-out infinite'
                : 'none',
          }}
        />
        {/* Badge mute — piccolo indicatore nell'angolo */}
        {isMuted && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.9)',
            color: '#fff',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            border: '2px solid #fff',
            lineHeight: 1,
          }}>
            🔇
          </span>
        )}
      </button>
  );
}
