/**
 * ELAB Simulator — MOSFET N-Channel Component (Tinkercad-Identical Style, ENRICHED)
 * TO-220 package style: heatsink tab at top, 3 bent leads at bottom,
 * marking dot, proper proportions matching real component.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const MosfetN = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const isOn = state.on || false;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="mosfet-n" role="img"
       aria-label={`MOSFET N-Channel ${id}${isOn ? ', conduce' : ''}`}>
      {/* Expanded click area covering body + gate lead for easy interaction */}
      <rect x="-24" y="-26" width="50" height="52" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* === TO-220 Package === */}

      {/* Heatsink tab (metal tab at top) */}
      <rect x="-10" y="-18" width="20" height="6" rx="1"
        fill="#C4CCD3" stroke="#7C8893" strokeWidth="0.5" />
      {/* Tab highlight */}
      <rect x="-9" y="-17.5" width="18" height="2.2" rx="0.8"
        fill="#FFFFFF" opacity="0.20" />
      {/* Mounting hole */}
      <circle cx="0" cy="-15" r="1.8" fill="#7C8893" stroke="#5A636B" strokeWidth="0.4" />
      <circle cx="0" cy="-15" r="0.9" fill="#3A3E42" />

      {/* Main body — dark epoxy */}
      <rect x="-10" y="-12" width="20" height="22" rx="1.5"
        fill="#1A1A1E" stroke="#0A0A0E" strokeWidth="0.6" />

      {/* Body top highlight */}
      <rect x="-9" y="-11" width="18" height="8" rx="1.2"
        fill="#FFFFFF" opacity="0.06" />

      {/* Body bottom shadow */}
      <rect x="-9" y="2" width="18" height="7.2" rx="1.2"
        fill="#000000" opacity="0.08" />

      {/* Marking text */}
      <text x="0" y="-2" textAnchor="middle" fontSize="4" fill="#D0D4DA"
        fontFamily="Fira Code, monospace" fontWeight="600" letterSpacing="0.3">
        NMOS
      </text>

      {/* Pin labels (tiny, like real component) */}
      <text x="-6" y="7" textAnchor="middle" fontSize="2.2" fill="#737373"
        fontFamily="Fira Code, monospace">G</text>
      <text x="0" y="7" textAnchor="middle" fontSize="2.2" fill="#737373"
        fontFamily="Fira Code, monospace">D</text>
      <text x="6" y="7" textAnchor="middle" fontSize="2.2" fill="#737373"
        fontFamily="Fira Code, monospace">S</text>

      {/* Marking dot (orientation indicator) */}
      <circle cx="-6" cy="-7" r="1" fill="#AAAAAA" opacity="0.4" />

      {/* Three leads extending from bottom */}
      {/* Three leads extending from bottom (Gate, Drain, Source) */}
      {/* Gate (left) */}
      <line x1="-7.5" y1="10" x2="-7.5" y2="15"
        stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />

      {/* Drain (center) */}
      <line x1="0" y1="10" x2="0" y2="15"
        stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />

      {/* Source (right) */}
      <line x1="7.5" y1="10" x2="7.5" y2="15"
        stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />

      {/* Active state glow — vivid green ON indicator */}
      {isOn && (
        <>
          {/* Bright green border glow */}
          <rect x="-12" y="-14" width="24" height="26" rx="2.5"
            fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="1.8" opacity="0.7">
            <animate attributeName="opacity" values="0.5;0.85;0.5" dur="1.2s" repeatCount="indefinite" />
          </rect>
          {/* Inner body glow */}
          <rect x="-10" y="-12" width="20" height="22" rx="1.5"
            fill="var(--color-accent, #4A7A25)" opacity="0.22">
            <animate attributeName="opacity" values="0.14;0.28;0.14" dur="1.2s" repeatCount="indefinite" />
          </rect>
          {/* Small green "power" indicator dot */}
          <circle cx="6" cy="-7" r="1.5" fill="var(--color-accent, #4A7A25)" opacity="0.9">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-25" y="-24" width="50" height="50" rx="5"
          fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

MosfetN.pins = [
  { id: 'gate', label: 'Gate (G)', x: -7.5, y: 15, type: 'digital' },
  { id: 'drain', label: 'Drain (D)', x: 0, y: 15, type: 'digital' },
  { id: 'source', label: 'Source (S)', x: 7.5, y: 15, type: 'digital' },
];

MosfetN.defaultState = { on: false, vgs: 0, ids: 0 };

registerComponent('mosfet-n', {
  component: MosfetN,
  pins: MosfetN.pins,
  defaultState: MosfetN.defaultState,
  category: 'active',
  label: 'MOSFET N-Channel',
  icon: '\u{1F50C}',
  volumeAvailableFrom: 2,
});

export default MosfetN;
