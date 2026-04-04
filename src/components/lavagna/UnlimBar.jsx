/**
 * UnlimBar — Barra input UNLIM sempre visibile in basso al centro
 * Come la barra di ChatGPT: sempre presente, il docente puo chiedere qualsiasi cosa.
 * La mascotte ELAB è integrata a sinistra dell'input (inline mode di MascotPresence).
 * (c) Andrea Marro — 02/04/2026
 */
import React, { useState, useCallback, useRef } from 'react';
import MascotPresence from './MascotPresence';
import css from './UnlimBar.module.css';

export default function UnlimBar({ onSend, onMicClick, onExpandChat, mascotSrc, speaking = false }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    onSend?.(msg);
    setText('');
  }, [text, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className={css.bar}>
      {/* Mascotte ELAB integrata — inline mode */}
      <MascotPresence
        mode="inline"
        speaking={speaking}
        onClick={onExpandChat}
        mascotSrc={mascotSrc}
      />

      {/* Input */}
      <form className={css.form} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className={css.input}
          placeholder="Chiedi a UNLIM..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Chiedi a UNLIM"
        />
      </form>

      {/* Mic button */}
      <button className={css.iconBtn} onClick={onMicClick} aria-label="Attiva voce" title="Parla con UNLIM">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 10c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 16v2M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Send button */}
      <button
        className={`${css.iconBtn} ${css.sendBtn}`}
        onClick={handleSubmit}
        disabled={!text.trim()}
        aria-label="Invia messaggio"
        title="Invia"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 10l14-7-7 14V10H3z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
