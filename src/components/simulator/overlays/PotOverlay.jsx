/* Andrea Marro — 12/02/2026 */
/**
 * PotOverlay — Circular rotation knob for potentiometer interaction
 * Extracted from NewElabSimulator.jsx
 *
 * Props:
 *   value: number (0-1)
 *   onValueChange: (value: number) => void
 *   onClose: () => void
 */

import React, { useRef, useCallback } from 'react';
import ovStyles from '../overlays.module.css';

const NAVY = '#1E4D8C';
const LIME = '#4A7A25';

const PotOverlay = React.memo(function PotOverlay({ value, onValueChange, onClose }) {
  const knobRef = useRef(null);
  const draggingRef = useRef(false);

  const angle = value * 270 - 135; // maps 0..1 to -135..+135 degrees

  const handlePointerDown = useCallback((e) => {
    draggingRef.current = true;
    e.target.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!draggingRef.current || !knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // 0 = top
    if (deg < 0) deg += 360;
    // clamp to 45..315 (270-degree sweep)
    let normalized;
    if (deg < 45) normalized = 0;
    else if (deg > 315) normalized = 1;
    else normalized = (deg - 45) / 270;
    onValueChange(Math.max(0, Math.min(1, normalized)));
  }, [onValueChange]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div className={ovStyles.backdrop} onClick={onClose}>
      <div className={ovStyles.card} onClick={(e) => e.stopPropagation()}>
        <div className={ovStyles.overlayHeader}>
          <span className={ovStyles.label}>Potenziometro</span>
          <button onClick={onClose} className={ovStyles.closeBtn} aria-label="Chiudi pannello potenziometro">x</button>
        </div>

        {/* Knob SVG */}
        <div
          ref={knobRef}
          className={ovStyles.knobContainer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Track arc */}
            <circle cx="90" cy="90" r="72" fill="none" stroke="#D4C9B0" strokeWidth="8"
              strokeDasharray="339 120" strokeDashoffset="-60" strokeLinecap="round" />
            {/* Filled arc */}
            <circle cx="90" cy="90" r="72" fill="none" stroke={LIME} strokeWidth="8"
              strokeDasharray={`${value * 339} ${459 - value * 339}`}
              strokeDashoffset="-60" strokeLinecap="round" />
            {/* Knob body */}
            <circle cx="90" cy="90" r="42" fill="#fff" stroke="#D4C9B0" strokeWidth="2" />
            {/* Indicator line */}
            <line
              x1="90" y1="90"
              x2={90 + 33 * Math.cos((angle - 90) * Math.PI / 180)}
              y2={90 + 33 * Math.sin((angle - 90) * Math.PI / 180)}
              stroke={NAVY} strokeWidth="4" strokeLinecap="round"
            />
          </svg>
        </div>

        <div className={ovStyles.valueRow}>
          <input
            type="range"
            min="0"
            max="1000"
            value={Math.round(value * 1000)}
            onChange={(e) => onValueChange(parseInt(e.target.value) / 1000)}
            style={{ flex: 1, accentColor: LIME }}
          />
          <span className={ovStyles.valueText}>
            {Math.round(value * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
});

export default PotOverlay;
