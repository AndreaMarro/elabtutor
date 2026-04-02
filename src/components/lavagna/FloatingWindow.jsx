import React, { useRef, useCallback, useEffect, useState } from 'react';
import css from './FloatingWindow.module.css';

let zCounter = 100;

const STORAGE_PREFIX = 'elab-fw-';

function loadPosition(id, fallback) {
  if (!id) return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function savePosition(id, pos) {
  if (!id) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(pos));
  } catch { /* ignore */ }
}

export default function FloatingWindow({
  title,
  children,
  id,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { w: 360, h: 400 },
  maximized = false,
  glass = false,
  onMinimize,
  onMaximize,
  onClose,
  onFocus,
  style,
  className,
}) {
  const winRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);

  const saved = loadPosition(id, { ...defaultPosition, ...defaultSize });
  const [pos, setPos] = useState({ x: saved.x ?? defaultPosition.x, y: saved.y ?? defaultPosition.y });
  const [size, setSize] = useState({ w: saved.w ?? defaultSize.w, h: saved.h ?? defaultSize.h });
  const [zIndex, setZIndex] = useState(() => ++zCounter);

  const bringToFront = useCallback(() => {
    setZIndex(++zCounter);
    onFocus?.();
  }, [onFocus]);

  // Persist position/size
  useEffect(() => {
    if (!maximized) {
      savePosition(id, { x: pos.x, y: pos.y, w: size.w, h: size.h });
    }
  }, [id, pos, size, maximized]);

  // --- DRAG ---
  const handleDragStart = useCallback((e) => {
    if (maximized) return;
    e.preventDefault();
    bringToFront();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragState.current = { startX: clientX - pos.x, startY: clientY - pos.y };

    const handleMove = (ev) => {
      if (!dragState.current) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? 0;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, cx - dragState.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - 48, cy - dragState.current.startY)),
      });
    };
    const handleUp = () => {
      dragState.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [pos, maximized, bringToFront]);

  // --- RESIZE ---
  const handleResizeStart = useCallback((dir, e) => {
    if (maximized) return;
    e.preventDefault();
    e.stopPropagation();
    bringToFront();
    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    resizeState.current = { dir, startX: clientX, startY: clientY, startW: size.w, startH: size.h };

    const handleMove = (ev) => {
      if (!resizeState.current) return;
      const cx = ev.clientX ?? 0;
      const cy = ev.clientY ?? 0;
      const dx = cx - resizeState.current.startX;
      const dy = cy - resizeState.current.startY;
      setSize((prev) => ({
        w: resizeState.current.dir !== 'bottom'
          ? Math.max(280, Math.min(window.innerWidth * 0.8, resizeState.current.startW + dx))
          : prev.w,
        h: resizeState.current.dir !== 'right'
          ? Math.max(200, Math.min(window.innerHeight * 0.8, resizeState.current.startH + dy))
          : prev.h,
      }));
    };
    const handleUp = () => {
      resizeState.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [size, maximized, bringToFront]);

  const classNames = [
    css.window,
    maximized && css.maximized,
    glass && css.glass,
    className,
  ].filter(Boolean).join(' ');

  const windowStyle = maximized
    ? { zIndex, ...style }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex, ...style };

  return (
    <div
      ref={winRef}
      className={classNames}
      style={windowStyle}
      role="dialog"
      aria-label={title}
      onPointerDown={bringToFront}
    >
      {/* Title bar — drag handle */}
      <div className={css.titleBar} onPointerDown={handleDragStart}>
        <span className={css.titleText}>{title}</span>
        {onMinimize && (
          <button
            className={css.btn}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            aria-label="Minimizza"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {onMaximize && (
          <button
            className={css.btn}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            aria-label="Espandi"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
        {onClose && (
          <button
            className={`${css.btn} ${css.btnClose}`}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Chiudi"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className={css.body}>
        {children}
      </div>

      {/* Resize handles (hidden when maximized) */}
      {!maximized && (
        <>
          <div className={`${css.resizeHandle} ${css.resizeRight}`} onPointerDown={(e) => handleResizeStart('right', e)} />
          <div className={`${css.resizeHandle} ${css.resizeBottom}`} onPointerDown={(e) => handleResizeStart('bottom', e)} />
          <div className={`${css.resizeHandle} ${css.resizeCorner}`} onPointerDown={(e) => handleResizeStart('corner', e)} />
        </>
      )}
    </div>
  );
}
