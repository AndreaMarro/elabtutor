/**
 * UnlimInputBar — Barra input unificata (testo + mic + invio)
 * Sostituisce la chat in UNLIM Mode.
 * Design minimale: una sola riga, sempre visibile in basso.
 * © Andrea Marro — 27/03/2026
 */

import React, { useState, useRef, useEffect } from 'react';

/**
 * Barra input UNLIM — testo + microfono + invio
 * @param {function} onSend - callback(text) quando l'utente invia
 * @param {function} onMicClick - callback per attivare il microfono
 * @param {boolean} isListening - se il mic è attivo
 * @param {boolean} isLoading - se UNLIM sta pensando
 * @param {string} placeholder - testo placeholder
 */
export default function UnlimInputBar({
  onSend,
  onMicClick,
  isListening = false,
  isLoading = false,
  placeholder = 'Chiedi qualcosa a UNLIM...',
}) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  // M1 fix: auto-focus input al mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'var(--color-bg, #FFFFFF)',
        borderTop: '1px solid var(--color-border, #E5E5EA)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        zIndex: 1001,
      }}
    >
      {/* Mic button */}
      {onMicClick && (
        <button
          type="button"
          onClick={onMicClick}
          aria-label={isListening ? 'Ferma registrazione' : 'Parla con UNLIM'}
          title={isListening ? 'Ferma' : 'Parla'}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? 'var(--color-danger, #DC2626)'
              : 'var(--color-bg-tertiary, #ECECF1)',
            color: isListening ? '#fff' : 'var(--color-text-secondary, #6B6B80)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {isListening ? '⏹' : '🎤'}
        </button>
      )}

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? 'Sto ascoltando...' : placeholder}
        disabled={isLoading}
        autoComplete="off"
        style={{
          flex: 1,
          height: '44px',
          padding: '0 16px',
          border: '2px solid var(--color-border, #E5E5EA)',
          borderRadius: 'var(--radius-full, 9999px)',
          fontSize: 'var(--font-size-xl, 24px)',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text, #1A1A2E)',
          background: 'var(--color-bg-secondary, #F7F7F8)',
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--color-primary, #1E4D8C)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--color-border, #E5E5EA)'; }}
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        aria-label="Invia messaggio"
        title="Invia"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: text.trim() && !isLoading
            ? 'var(--color-primary, #1E4D8C)'
            : 'var(--color-bg-tertiary, #ECECF1)',
          color: text.trim() && !isLoading
            ? '#fff'
            : 'var(--color-text-tertiary, #6B6B78)',
          cursor: text.trim() && !isLoading ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        {isLoading ? '⏳' : '➤'}
      </button>
    </form>
  );
}
