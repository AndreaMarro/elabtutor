/**
 * ELAB Simulator — Potentiometer Component (Tinkercad-Identical Style)
 * Blue rotary potentiometer: dark housing, bright blue face, dense ticks,
 * rotating pointer and metallic pivot. No labels/text (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Potentiometer = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, value = 10000, id }) => {
  const position = state.position || 0.5;
  const angle = -135 + position * 270;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="potentiometer" role="img"
       aria-label={`Potenziometro ${id}: ${Math.round(position * 100)}%`}
      style={{ cursor: 'pointer' }}
    >
      {/* Transparent click area */}
      <circle cx="0" cy="5" r="22" fill="transparent" />

      {/* Wire leads — thin neutral gray (Tinkercad style) */}
      <line x1="-7.5" y1="15.2" x2="-7.5" y2="22.5"
        stroke="#9E9E9E" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="15.2" x2="0" y2="22.5"
        stroke="#9E9E9E" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7.5" y1="15.2" x2="7.5" y2="22.5"
        stroke="#9E9E9E" strokeWidth="1.4" strokeLinecap="round" />

      {/* Housing body */}
      <circle cx="0" cy="0" r="15.6" fill="#2B3A46" stroke="#141C22" strokeWidth="0.8" />
      {/* Outer rim */}
      <circle cx="0" cy="0" r="14.6" fill="none" stroke="#0F151B" strokeWidth="1.6" opacity="0.55" />

      {/* Blue dial face — bright, flat */}
      <circle cx="0" cy="0" r="11.6" fill="#6EA4CE" stroke="#2E6D9C" strokeWidth="0.6" />
      {/* Subtle top highlight (flat overlay, no gradients) */}
      <path
        d="M -10.2 -2.5 A 11 11 0 0 1 10.2 -2.5 L 10.2 -5.4 A 11 11 0 0 0 -10.2 -5.4 Z"
        fill="#FFFFFF" opacity="0.14"
      />

      {/* Dense tick marks (Tinkercad dial look) */}
      {Array.from({ length: 41 }, (_, i) => {
        const a = (-135 + i * (270 / 40)) * Math.PI / 180;
        const isMain = i % 10 === 0;
        const r1 = isMain ? 12.1 : 12.6;
        const r2 = 14.6;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
            stroke={isMain ? '#B8C6D2' : '#7B8C9A'}
            strokeWidth={isMain ? 1.0 : 0.55}
            strokeLinecap="round"
            opacity={isMain ? 0.95 : 0.9}
          />
        );
      })}

      {/* Knob indicator — rotates with position (no center specular) */}
      <g transform={`rotate(${angle})`}>
        {/* Position indicator line */}
        <line x1="0" y1="0" x2="0" y2="-9"
          stroke="#1F2A33" strokeWidth="2.0" strokeLinecap="round" />
        {/* Center metallic pivot — flat circle */}
        <circle cx="0" cy="0" r="3.1" fill="#BDBDBD" stroke="#7E7E7E" strokeWidth="0.35" />
        <circle cx="-0.7" cy="-0.7" r="1.1" fill="#FFFFFF" opacity="0.35" />
      </g>

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-18" y="-22" width="36" height="54" rx="4"
          fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Potentiometer.pins = [
  { id: 'vcc',    label: 'VCC',    x: -7.5, y: 22.5, type: 'power'  },
  { id: 'signal', label: 'Signal', x:   0,  y: 22.5, type: 'analog' },
  { id: 'gnd',    label: 'GND',    x:  7.5, y: 22.5, type: 'power'  },
];

Potentiometer.defaultState = { position: 0.5, resistance: 5000 };

registerComponent('potentiometer', {
  component: Potentiometer,
  pins: Potentiometer.pins,
  defaultState: Potentiometer.defaultState,
  category: 'input',
  label: 'Potenziometro',
  icon: '\u{1F39B}\uFE0F',
  volumeAvailableFrom: 1,
});

export default Potentiometer;
