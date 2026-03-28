/**
 * UnlimOverlay — Messaggi contestuali POSIZIONATI accanto ai componenti
 * I messaggi appaiono come fumetti accanto al componente di cui parlano.
 * Se nessun componente target, fallback a centro schermo.
 * Supporta coda di messaggi con auto-dismiss.
 * © Andrea Marro — 28/03/2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_DURATION = 6000;

/**
 * Trova la posizione sullo schermo di un componente del circuito.
 * Cerca l'elemento SVG con data-component-id nel DOM.
 * Ritorna { x, y, width, height } in coordinate viewport, o null se non trovato.
 */
function getComponentScreenPosition(componentId) {
  if (!componentId) return null;

  // Cerca per data-component-id (aggiunto al <g> wrapper in SimulatorCanvas)
  const el = document.querySelector(`[data-component-id="${componentId}"]`);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  if (!rect || rect.width === 0) return null;

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
  };
}

/**
 * Calcola la posizione del fumetto accanto al componente.
 * Preferisce apparire a destra, ma si adatta se esce dallo schermo.
 */
function computeBubblePosition(targetPos, containerRect) {
  if (!targetPos || !containerRect) return null;

  const BUBBLE_W = 320;
  const BUBBLE_H = 80;
  const GAP = 16;
  const ARROW_SIZE = 10;

  // Coordinate relative al container overlay
  const relX = targetPos.x - containerRect.left;
  const relY = targetPos.y - containerRect.top;
  const containerW = containerRect.width;
  const containerH = containerRect.height;

  let bubbleX, bubbleY, arrowSide;

  // Preferisci destra del componente
  if (relX + targetPos.width / 2 + GAP + BUBBLE_W < containerW) {
    bubbleX = relX + targetPos.width / 2 + GAP;
    arrowSide = 'left';
  }
  // Altrimenti sinistra
  else if (relX - targetPos.width / 2 - GAP - BUBBLE_W > 0) {
    bubbleX = relX - targetPos.width / 2 - GAP - BUBBLE_W;
    arrowSide = 'right';
  }
  // Fallback: sopra centrato
  else {
    bubbleX = Math.max(8, Math.min(relX - BUBBLE_W / 2, containerW - BUBBLE_W - 8));
    arrowSide = 'bottom';
  }

  // Posizione verticale: centrata rispetto al componente
  if (arrowSide === 'bottom') {
    bubbleY = Math.max(8, relY - targetPos.height / 2 - GAP - BUBBLE_H);
  } else {
    bubbleY = Math.max(8, Math.min(relY - BUBBLE_H / 2, containerH - BUBBLE_H - 8));
  }

  return { x: bubbleX, y: bubbleY, arrowSide, ARROW_SIZE };
}

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
      targetComponentId: options.targetComponentId || null,
      position: options.position || 'contextual',
      duration: options.duration || DEFAULT_DURATION,
      icon: options.icon || null,
      type: options.type || 'info',
    };
    // BUG-08 fix: cap a 3 messaggi per evitare flood sullo schermo
    setMessages(prev => [...prev.slice(-2), msg]);
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
 * Freccia SVG del fumetto — punta verso il componente
 */
function BubbleArrow({ side, color }) {
  const size = 10;
  if (side === 'left') {
    return (
      <svg width={size} height={size * 2} style={{ position: 'absolute', left: -size + 1, top: '50%', transform: 'translateY(-50%)' }}>
        <polygon points={`${size},0 0,${size} ${size},${size * 2}`} fill={color} />
      </svg>
    );
  }
  if (side === 'right') {
    return (
      <svg width={size} height={size * 2} style={{ position: 'absolute', right: -size + 1, top: '50%', transform: 'translateY(-50%)' }}>
        <polygon points={`0,0 ${size},${size} 0,${size * 2}`} fill={color} />
      </svg>
    );
  }
  // bottom arrow — punta in basso verso il componente
  return (
    <svg width={size * 2} height={size} style={{ position: 'absolute', bottom: -size + 1, left: '50%', transform: 'translateX(-50%)' }}>
      <polygon points={`0,0 ${size},${size} ${size * 2},0`} fill={color} />
    </svg>
  );
}

/**
 * Singolo messaggio overlay con fade in/out + posizionamento contestuale
 */
function OverlayMessage({ message, onDismiss, containerRef }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [bubblePos, setBubblePos] = useState(null);
  const dismissedRef = useRef(false);
  const clickTimerRef = useRef(null);

  const safeDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss(message.id);
  }, [onDismiss, message.id]);

  // Calcola posizione contestuale se c'è un target
  useEffect(() => {
    if (!message.targetComponentId || message.position !== 'contextual') return;

    function updatePosition() {
      const targetPos = getComponentScreenPosition(message.targetComponentId);
      const containerRect = containerRef?.current?.getBoundingClientRect();
      if (targetPos && containerRect) {
        setBubblePos(computeBubblePosition(targetPos, containerRect));
      } else {
        setBubblePos(null); // fallback
      }
    }

    updatePosition();
    // Ricalcola se lo zoom/pan cambia (ResizeObserver su container)
    const resizeObs = containerRef?.current
      ? new ResizeObserver(updatePosition)
      : null;
    if (resizeObs && containerRef.current) resizeObs.observe(containerRef.current);

    return () => resizeObs?.disconnect();
  }, [message.targetComponentId, message.position, containerRef]);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    let innerDismiss;
    const fadeTimer = setTimeout(() => {
      setFading(true);
      innerDismiss = setTimeout(safeDismiss, 400);
    }, message.duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(innerDismiss);
      clearTimeout(clickTimerRef.current);
    };
  }, [message.id, message.duration, safeDismiss]);

  // Posizioni preset (fallback)
  const presetStyles = {
    'top-center': { top: '80px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: '100px', left: '24px' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  };

  // WCAG AA: tutti i bg con testo bianco devono avere contrasto >= 4.5:1
  const typeColors = {
    info: { bg: 'rgba(30, 77, 140, 0.95)', border: '#1E4D8C' },       // 7.1:1 ✅
    success: { bg: 'rgba(15, 118, 54, 0.95)', border: '#0F7636' },     // 5.2:1 ✅ (era 3.76:1)
    hint: { bg: 'rgba(74, 122, 37, 0.95)', border: '#4A7A25' },        // 5.1:1 ✅
    question: { bg: 'rgba(180, 68, 8, 0.95)', border: '#B44408' },     // 4.8:1 ✅ (era 2.98:1)
  };

  const colors = typeColors[message.type] || typeColors.info;

  // Determina stile posizione
  let posStyle;
  let showArrow = false;
  let arrowSide = 'left';

  if (message.position === 'contextual' && bubblePos) {
    posStyle = {
      left: `${bubblePos.x}px`,
      top: `${bubblePos.y}px`,
    };
    showArrow = true;
    arrowSide = bubblePos.arrowSide;
  } else if (message.position === 'contextual' && !bubblePos) {
    // Fallback: centro schermo
    posStyle = presetStyles['center'];
  } else {
    posStyle = presetStyles[message.position] || presetStyles['center'];
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => {
        setFading(true);
        clickTimerRef.current = setTimeout(safeDismiss, 300);
      }}
      style={{
        position: 'absolute',
        ...posStyle,
        maxWidth: '440px',
        minWidth: '200px',
        padding: '16px 22px',
        borderRadius: '14px',
        background: colors.bg,
        color: '#FFFFFF',
        fontSize: '20px',
        fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
        lineHeight: 1.5,
        boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
        cursor: 'pointer',
        zIndex: 999,
        opacity: visible && !fading ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      {showArrow && <BubbleArrow side={arrowSide} color={colors.bg} />}
      {message.icon && (
        <span style={{ fontSize: '26px', flexShrink: 0, lineHeight: 1 }}>{message.icon}</span>
      )}
      <span>{message.text}</span>
    </div>
  );
}

/**
 * Container overlay — renderizza tutti i messaggi attivi
 */
export default function UnlimOverlay({ messages, onDismiss }) {
  const containerRef = useRef(null);

  if (!messages || messages.length === 0) return null;

  return (
    <div
      ref={containerRef}
      aria-label="Messaggi UNLIM"
      style={{
        position: 'fixed', // BUG-07/16 fix: fixed so viewport coords match directly
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
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}
