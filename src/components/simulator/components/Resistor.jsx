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
  const uid = `res-${id}`;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="resistor" role="img"
       aria-label={`Resistore ${id}: ${formatValue(value)}`}>
      {/* S115: Hit area — 44px minimum height for WCAG touch target */}
      <rect x="-30" y="-22" width="60" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      <defs>
        {/* Cylindrical body gradient (top-lit) */}
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0E0A8" />
          <stop offset="25%" stopColor="#E8D49A" />
          <stop offset="50%" stopColor="#D9C58A" />
          <stop offset="75%" stopColor="#C8B47A" />
          <stop offset="100%" stopColor="#B8A06A" />
        </linearGradient>
        {/* Metallic end cap gradient */}
        <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8D8D8" />
          <stop offset="40%" stopColor="#B7B7B7" />
          <stop offset="100%" stopColor="#8A8A8A" />
        </linearGradient>
        {/* Wire lead gradient */}
        <linearGradient id={`${uid}-wire`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B0B0B0" />
          <stop offset="50%" stopColor="#9E9E9E" />
          <stop offset="100%" stopColor="#888888" />
        </linearGradient>
      </defs>

      {/* Wire leads — metallic gradient */}
      <line x1="-26.25" y1="0" x2="-14.2" y2="0"
        stroke={`url(#${uid}-wire)`} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="14.2" y1="0" x2="26.25" y2="0"
        stroke={`url(#${uid}-wire)`} strokeWidth="1.25" strokeLinecap="round" />

      {/* Body shadow for depth */}
      <rect x="-12.5" y="-4.8" width="26" height="11.2" rx="5.2"
        fill="#000000" opacity="0.06" transform="translate(0.4, 0.6)" />

      {/* End caps — metallic rings with gradient */}
      <ellipse cx="-13" cy="0" rx="1.55" ry="5.6" fill={`url(#${uid}-cap)`} stroke="#8A8A8A" strokeWidth="0.35" />
      <ellipse cx="13"  cy="0" rx="1.55" ry="5.6" fill={`url(#${uid}-cap)`} stroke="#8A8A8A" strokeWidth="0.35" />
      {/* Cap highlights */}
      <ellipse cx="-13.2" cy="-2" rx="0.8" ry="2.5" fill="#FFFFFF" opacity="0.12" />
      <ellipse cx="12.8" cy="-2" rx="0.8" ry="2.5" fill="#FFFFFF" opacity="0.12" />

      {/* Body — cylindrical gradient for 3D effect */}
      <rect x="-13" y="-5.6" width="26" height="11.2" rx="5.2"
        fill={`url(#${uid}-body)`} stroke="#9C874E" strokeWidth="0.4" />
      {/* Top specular highlight */}
      <rect x="-11" y="-5.2" width="22" height="3.8" rx="2.5"
        fill="#FFFFFF" opacity="0.14" />

      {/* Color bands — with subtle curvature shadow */}
      {[
        { bx: -9.1, w: 3.1, fill: bands[0] },
        { bx: -4.2, w: 3.1, fill: bands[1] },
        { bx:  0.8, w: 3.1, fill: bands[2] },
        { bx:  8.1, w: 2.7, fill: bands[3] },
      ].map(({ bx, w, fill }, i) => (
        <g key={i}>
          <rect x={bx} y="-5.45" width={w} height="10.9" rx="0.6"
            fill={fill} opacity={0.92} />
          {/* Band highlight (top) */}
          <rect x={bx + 0.3} y="-5.2" width={w - 0.6} height="2.5" rx="0.4"
            fill="#FFFFFF" opacity="0.08" />
        </g>
      ))}

      {/* Current flow indicator */}
      {hasFlow && (
        <circle cx="0" cy="0" r="1.2" fill="var(--color-accent, #4A7A25)" opacity={0.5}>
          <animate attributeName="cx" values="-13;13" dur="0.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-29" y="-10" width="58" height="20" rx="3"
          fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="2" strokeDasharray="4 2">
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
