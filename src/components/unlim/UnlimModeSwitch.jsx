/**
 * UnlimModeSwitch — Bottone switch UNLIM/Classic Mode
 * Persiste la scelta in localStorage.
 * Bottone visibile in entrambe le modalità.
 * © Andrea Marro — 27/03/2026
 */

import React from 'react';

const STORAGE_KEY = 'elab-unlim-mode';

/**
 * Hook per leggere/scrivere la modalità UNLIM
 */
export function useUnlimMode() {
  const [isUnlim, setIsUnlim] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Default: UNLIM attivo (come da design doc)
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const toggleMode = React.useCallback(() => {
    setIsUnlim(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const setMode = React.useCallback((value) => {
    setIsUnlim(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  }, []);

  return { isUnlim, toggleMode, setMode };
}

/**
 * Bottone switch visuale UNLIM / Classic
 */
export default function UnlimModeSwitch({ isUnlim, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isUnlim ? 'Passa a modalità Classic' : 'Passa a modalità UNLIM'}
      title={isUnlim ? 'Modalità UNLIM attiva — clicca per Classic' : 'Modalità Classic — clicca per UNLIM'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        border: '2px solid',
        borderColor: isUnlim ? 'var(--color-accent, #4A7A25)' : 'var(--color-border, #E5E5EA)',
        borderRadius: 'var(--radius-full, 9999px)',
        background: isUnlim
          ? 'var(--color-accent-light, #E8F5E9)'
          : 'var(--color-bg, #FFFFFF)',
        color: isUnlim
          ? 'var(--color-accent-hover, #4A7A25)'
          : 'var(--color-text-secondary, #6B6B80)',
        cursor: 'pointer',
        fontSize: 'var(--font-size-sm, 16px)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--font-weight-semibold, 600)',
        transition: 'all 0.2s ease',
        minHeight: '56px',
        minWidth: '56px',
      }}
    >
      <span style={{
        display: 'inline-block',
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: isUnlim ? 'var(--color-accent, #4A7A25)' : '#ccc',
        position: 'relative',
        transition: 'background 0.2s ease',
      }}>
        <span style={{
          position: 'absolute',
          top: '2px',
          left: isUnlim ? '18px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </span>
      <span>{isUnlim ? 'UNLIM' : 'Classic'}</span>
    </button>
  );
}
