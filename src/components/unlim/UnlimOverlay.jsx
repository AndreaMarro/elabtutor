/**
 * UnlimOverlay — Messaggi contestuali che appaiono e sfumano
 * I messaggi appaiono DENTRO il simulatore, non in una chat separata.
 * Supporta coda di messaggi con auto-dismiss.
 * © Andrea Marro — 27/03/2026
 */

import React, { useState, useEffect, useCallback } from 'react';

const DEFAULT_DURATION = 6000; // ms prima che il messaggio sfumi

/**
 * Hook per gestire la coda messaggi overlay
 */
export function useOverlayMessages() {
  const [messages, setMessages] = useState([]);

  const showMessage = useCallback((text, options = {}) => {
    const id = Date.now() + Math.random();
    const msg = {
      id,
      text,
      position: options.position || 'top-center', // top-center, bottom-left, center
      duration: options.duration || DEFAULT_DURATION,
      icon: options.icon || null,
      type: options.type || 'info', // info, success, hint, question
    };
    setMessages(prev => [...prev, msg]);
    return id;
  }, []);

  const dismissMessage = useCallback((id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, showMessage, dismissMessage, clearAll };
}

/**
 * Singolo messaggio overlay con fade in/out
 */
function OverlayMessage({ message, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Fade in
    const showTimer = setTimeout(() => setVisible(true), 50);

    // Auto-dismiss with proper cleanup for inner timeout
    let innerDismiss;
    const fadeTimer = setTimeout(() => {
      setFading(true);
      innerDismiss = setTimeout(() => onDismiss(message.id), 400);
    }, message.duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(innerDismiss);
    };
  }, [message.id, message.duration, onDismiss]);

  const positionStyles = {
    'top-center': { top: '80px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: '100px', left: '24px' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  };

  const typeColors = {
    info: { bg: 'rgba(30, 77, 140, 0.95)', border: '#1E4D8C' },
    success: { bg: 'rgba(22, 163, 74, 0.95)', border: '#16A34A' },
    hint: { bg: 'rgba(124, 179, 66, 0.95)', border: '#7CB342' },
    question: { bg: 'rgba(234, 88, 12, 0.95)', border: '#EA580C' },
  };

  const colors = typeColors[message.type] || typeColors.info;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => {
        setFading(true);
        setTimeout(() => onDismiss(message.id), 300);
      }}
      style={{
        position: 'absolute',
        ...positionStyles[message.position],
        maxWidth: '420px',
        padding: '16px 24px',
        borderRadius: 'var(--radius-lg, 14px)',
        background: colors.bg,
        color: '#FFFFFF',
        fontSize: 'var(--font-size-lg, 18px)',
        fontFamily: 'var(--font-sans)',
        lineHeight: 'var(--line-height-normal, 1.5)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 999,
        opacity: visible && !fading ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      {message.icon && (
        <span style={{ fontSize: '24px', flexShrink: 0 }}>{message.icon}</span>
      )}
      <span>{message.text}</span>
    </div>
  );
}

/**
 * Container overlay — renderizza tutti i messaggi attivi
 */
export default function UnlimOverlay({ messages, onDismiss }) {
  if (!messages || messages.length === 0) return null;

  return (
    <div
      aria-label="Messaggi UNLIM"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 998,
      }}
    >
      {messages.map(msg => (
        <OverlayMessage
          key={msg.id}
          message={msg}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
