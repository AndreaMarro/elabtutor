/**
 * UnlimMascot — Mascotte ELAB nell'angolo del simulatore
 * Stato: idle (statico) / active (glow pulsante) / speaking (animato)
 * Immagine statica + CSS glow quando attiva.
 * © Andrea Marro — 27/03/2026
 */

import React from 'react';

const MASCOT_SIZE = 64;

/**
 * Mascotte UNLIM — vive nell'angolo in basso a destra.
 * Clicca per aprire la barra input.
 */
export default function UnlimMascot({ state = 'idle', onClick }) {
  const isActive = state === 'active' || state === 'speaking';

  return (
    <>
      {/* CSS glow animation — outside button for valid HTML */}
      <style>{`
        @keyframes unlim-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 179, 66, 0.5), 0 4px 12px rgba(0,0,0,0.15); }
          50% { box-shadow: 0 0 30px rgba(124, 179, 66, 0.8), 0 4px 16px rgba(0,0,0,0.2); }
        }
      `}</style>
      <button
        onClick={onClick}
        aria-label="UNLIM — clicca per parlare"
        title="Chiedi a UNLIM"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: `${MASCOT_SIZE}px`,
          height: `${MASCOT_SIZE}px`,
          borderRadius: '50%',
          border: 'none',
          background: isActive
            ? 'linear-gradient(135deg, #7CB342, #558B2F)'
            : 'linear-gradient(135deg, #1E4D8C, #163A6B)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isActive
            ? '0 0 20px rgba(124, 179, 66, 0.5), 0 4px 12px rgba(0,0,0,0.15)'
            : '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          animation: state === 'speaking' ? 'unlim-pulse 1.5s ease-in-out infinite' : 'none',
          padding: 0,
        }}
      >
        {/* Placeholder: lettera U stilizzata. Sostituire con SVG/immagine mascotte ELAB */}
        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: 'var(--font-heading, Oswald, sans-serif)',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          U
        </span>
      </button>
    </>
  );
}
