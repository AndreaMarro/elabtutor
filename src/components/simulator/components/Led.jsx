/**
 * ELAB Simulator — LED Component (Tinkercad-Identical Style)
  * 5mm LED: small hemispherical dome at top, two long thin wire leads.
 * Pixel-perfect match with Tinkercad Circuits diagrams (ELAB volumes).
 * - Dome: flat-bottom D-shape, small, base at y=0, apex at y≈-12
  * - Leads: long thin lines from under the dome to pins (±3.75, 22.5)
 * - Colors: verified from Tinkercad screenshots (flat fills, no gradients)
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 22/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const LED_COLORS = {
  red:    { body: '#CC2222', tint: '#FF3333', dark: '#991111', vf: 1.8 },
  green:  { body: '#4CAF50', tint: '#81C784', dark: '#2E7D32', vf: 2.0 },
  blue:   { body: '#1565C0', tint: '#1976D2', dark: '#0D47A1', vf: 3.0 },
  yellow: { body: '#E6A800', tint: '#FFEE58', dark: '#C17A00', vf: 2.0 },
  white:  { body: '#BDBDBD', tint: '#F5F5F5', dark: '#757575', vf: 3.2 },
};

const Led = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, color = 'red', id }) => {
  const burned = state.burned || false;
  const brightness = burned ? 0 : (state.brightness || 0);
  const isOn = !burned && brightness > 0.01;
  const c = LED_COLORS[color] || LED_COLORS.red;
  const uid = `led-${id}`;
  // Glow intensity scales with brightness (0→1), clamped
  const glowOpacity = Math.min(brightness, 1);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="led" role="img"
       aria-label={`LED ${id}: ${color}${burned ? ', bruciato' : isOn ? ', acceso' : ''}`}>
      {/* S115: Hit area — 44px minimum on both dimensions for WCAG touch target */}
      <rect x="-22" y="-22" width="44" height="50" fill="transparent" pointerEvents="all" onClick={onInteract} />

       {/* Radial glow halo when LED is ON — dramatic Tinkercad-style bloom */}
       {isOn && (
         <>
           <circle cx="0" cy="-5" r="30" fill={c.tint} opacity={glowOpacity * 0.18} />
           <circle cx="0" cy="-5" r="22" fill={c.tint} opacity={glowOpacity * 0.30} />
           <circle cx="0" cy="-5" r="14" fill={c.tint} opacity={glowOpacity * 0.48} />
           <circle cx="0" cy="-5" r="8" fill="#FFFFFF" opacity={glowOpacity * 0.35} />
         </>
       )}

       {/* Wire leads — long, thin, slightly diverging (Tinkercad style) */}
       <line x1="-2.4" y1="0" x2="-3.75" y2="22.5"
         stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />
       <line x1="2.4" y1="0" x2="3.75" y2="22.5"
         stroke="#9E9E9E" strokeWidth="1.25" strokeLinecap="round" />

       {/* LED dome — D-shape flat bottom + curved arc top (Tinkercad style) */}
       <path
         d="M -5.8 0 L -5.8 -1.8 A 5.8 9.4 0 0 1 5.8 -1.8 L 5.8 0 Z"
         fill={isOn ? c.tint : c.body}
         stroke={c.dark} strokeWidth="0.5"
       />

       {/* Bright center dome highlight when ON — makes it look lit up */}
       {isOn && (
         <path
           d="M -3.5 -1.2 A 3.5 6.2 0 0 1 3.5 -1.2 L 3.5 -0.5 L -3.5 -0.5 Z"
           fill="#FFFFFF" opacity={glowOpacity * 0.55}
         />
       )}

       {/* Subtle left highlight (flat overlay, no gradients) */}
       <path
         d="M -5 0 L -5 -1.6 A 5 8.4 0 0 1 -1.4 -9.6 L -1.4 0 Z"
         fill="#FFFFFF" opacity={isOn ? 0.22 : 0.14}
       />

       {/* Small flat base line to show LED sitting on breadboard */}
       <line x1="-5.8" y1="0" x2="5.8" y2="0" stroke={c.dark} strokeWidth="0.5" />

      {/* Burned state overlay */}
      {burned && (
         <>
           <path d="M -5.8 0 L -5.8 -1.8 A 5.8 9.4 0 0 1 5.8 -1.8 L 5.8 0 Z"
             fill="#1A1A1A" opacity={0.88} />
           <line x1="-5" y1="-8" x2="5" y2="0" stroke="#FF3333" strokeWidth="1.8" strokeLinecap="round" />
           <line x1="5" y1="-8" x2="-5" y2="0" stroke="#FF3333" strokeWidth="1.8" strokeLinecap="round" />
          <text x="0" y="-16" textAnchor="middle" fontSize="4.5" fill="#FF3333"
            fontFamily="Oswald, sans-serif" fontWeight="700" letterSpacing="0.5">
            BRUCIATO!
          </text>
        </>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-12" y="-16" width="24" height="46" rx="3"
          fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="2" strokeDasharray="4 2" opacity="0.8">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Led.pins = [
  { id: 'anode',   label: 'A (+)',      x: -3.75, y: 22.5, type: 'digital' },
  { id: 'cathode', label: 'K (\u2212)', x:  3.75, y: 22.5, type: 'digital' },
];

Led.defaultState = { on: false, brightness: 0 };

registerComponent('led', {
  component: Led,
  pins: Led.pins,
  defaultState: Led.defaultState,
  category: 'output',
  label: 'LED',
  icon: '\u{1F4A1}',
  vfByColor: LED_COLORS,
  volumeAvailableFrom: 1,
});

export { LED_COLORS };
export default Led;
