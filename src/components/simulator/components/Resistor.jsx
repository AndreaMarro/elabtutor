/**
 * ELAB Simulator — Resistor Component (Tinkercad-Identical Style)
 * Axial resistor: light beige body with subtle highlight, flat color bands,
 * thin neutral wire leads. No value text (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const BAND_COLORS = {
  0: '#1A1A1A', 1: '#8B4513', 2: '#DD0000', 3: '#FF8C00', 4: '#FFD700',
  5: '#00AA00', 6: '#0044DD', 7: '#8B00FF', 8: '#808080', 9: '#F0F0F0',
};

const MULTIPLIER_COLORS = {
  1: '#1A1A1A', 10: '#8B4513', 100: '#DD0000', 1000: '#FF8C00',
  10000: '#FFD700', 100000: '#00AA00', 1000000: '#0044DD',
};

const TOLERANCE_COLORS = { 5: '#DAA520', 10: '#C0C0C0' };

function calculateBands(value) {
  if (value <= 0) return ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#DAA520'];
  const str = String(Math.round(value));
  const d1 = parseInt(str[0]) || 0;
  const d2 = parseInt(str[1]) || 0;
  const multiplier = Math.pow(10, Math.max(0, str.length - 2));
  return [
    BAND_COLORS[d1] || '#1A1A1A',
    BAND_COLORS[d2] || '#1A1A1A',
    MULTIPLIER_COLORS[multiplier] || '#1A1A1A',
    TOLERANCE_COLORS[5],
  ];
}

function formatValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M\u03A9`;
  if (value >= 1000)    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k\u03A9`;
  return `${value}\u03A9`;
}

const Resistor = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, value = 470, id }) => {
  const bands = calculateBands(value);
  const current = state.current || 0;
  const hasFlow = current > 0.0001;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="resistor" role="img"
       aria-label={`Resistore ${id}: ${formatValue(value)}`}>
      {/* S115: Hit area — 44px minimum height for WCAG touch target */}
      <rect x="-30" y="-22" width="60" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Wire leads — thin neutral gray (Tinkercad style) */}
      <line x1="-26.25" y1="0" x2="-14.2" y2="0"
        stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="14.2" y1="0" x2="26.25" y2="0"
        stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />

      {/* End caps — small metallic rings at body-wire junction */}
      <ellipse cx="-13" cy="0" rx="1.55" ry="5.6" fill="#B7B7B7" stroke="#8A8A8A" strokeWidth="0.35" />
      <ellipse cx="13"  cy="0" rx="1.55" ry="5.6" fill="#B7B7B7" stroke="#8A8A8A" strokeWidth="0.35" />

      {/* Body — light beige with subtle highlight (no gradients) */}
      <rect x="-13" y="-5.6" width="26" height="11.2" rx="5.2"
        fill="#D9C58A" stroke="#9C874E" strokeWidth="0.4" />
      <rect x="-12.4" y="-5.0" width="24.8" height="4.8" rx="3.2"
        fill="#FFFFFF" opacity="0.16" />
      <rect x="-12.6" y="0.2" width="25.2" height="5.1" rx="3.2"
        fill="#000000" opacity="0.05" />

      {/* Color bands — flat fills only */}
      {[
        { bx: -9.1, w: 3.1, fill: bands[0] },
        { bx: -4.2, w: 3.1, fill: bands[1] },
        { bx:  0.8, w: 3.1, fill: bands[2] },
        { bx:  8.1, w: 2.7, fill: bands[3] },
      ].map(({ bx, w, fill }, i) => (
        <rect key={i} x={bx} y="-5.45" width={w} height="10.9" rx="0.6"
          fill={fill} opacity={0.92} />
      ))}

      {/* Current flow indicator */}
      {hasFlow && (
        <circle cx="0" cy="0" r="1.2" fill="var(--color-accent, #7CB342)" opacity={0.5}>
          <animate attributeName="cx" values="-13;13" dur="0.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-29" y="-10" width="58" height="20" rx="3"
          fill="none" stroke="var(--color-accent, #7CB342)" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Resistor.pins = [
  { id: 'pin1', label: 'Pin 1', x: -26.25, y: 0, type: 'digital' },
  { id: 'pin2', label: 'Pin 2', x:  26.25, y: 0, type: 'digital' },
];

Resistor.defaultState = { current: 0, voltage: 0 };

registerComponent('resistor', {
  component: Resistor,
  pins: Resistor.pins,
  defaultState: Resistor.defaultState,
  category: 'passive',
  label: 'Resistore',
  icon: '\u{2393}',
  volumeAvailableFrom: 1,
});

export { calculateBands, formatValue };
export default Resistor;
