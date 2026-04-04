/**
 * ELAB Simulator — PushButton Component (Tinkercad-Identical Style)
 * Tactile switch 6x6mm: compact dark housing, light cap with subtle highlight.
 * Dimensions matched to Tinkercad — body ~2 breadboard holes wide.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026, dim fix 28/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const PushButton = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const isPressed = state.pressed || false;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="push-button" role="img"
       aria-label={`Pulsante ${id}${isPressed ? ', premuto' : ''}`}
      onPointerDown={(e) => { e.stopPropagation(); onInteract && onInteract(id, 'press'); }}
      onPointerUp={(e) => { e.stopPropagation(); onInteract && onInteract(id, 'release'); }}
      onPointerLeave={(e) => { if (isPressed) { e.stopPropagation(); onInteract && onInteract(id, 'release'); } }}
      style={{ cursor: 'pointer', touchAction: 'none' }}
    >
      {/* S115: Hit area — 44px minimum for WCAG touch target */}
      <rect x="-22" y="-22" width="44" height="44" fill="transparent" pointerEvents="all" />

      {/* Pin legs — metallic silver, extending from body to pin positions */}
      {/* Top-left */}
      <line x1="-7.5" y1="-7.5" x2="-7" y2="-7.5"
        stroke="#9E9E9E" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="-7.5" cy="-7.5" r="1.15" fill="#7A7A7A" />
      {/* Top-right */}
      <line x1="7.5" y1="-7.5" x2="7" y2="-7.5"
        stroke="#9E9E9E" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.5" cy="-7.5" r="1.15" fill="#7A7A7A" />
      {/* Bottom-left */}
      <line x1="-7.5" y1="7.5" x2="-7" y2="7.5"
        stroke="#9E9E9E" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="-7.5" cy="7.5" r="1.15" fill="#7A7A7A" />
      {/* Bottom-right */}
      <line x1="7.5" y1="7.5" x2="7" y2="7.5"
        stroke="#9E9E9E" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.5" cy="7.5" r="1.15" fill="#7A7A7A" />

      {/* Housing shadow for depth */}
      <rect x="-6.2" y="-6" width="13" height="13" rx="1.8"
        fill="#000000" opacity="0.1" />

      {/* Base housing — compact 6mm tactile switch */}
      <rect x="-6.5" y="-6.5" width="13" height="13" rx="1.8"
        fill="#2B2B2B" stroke="#0E0E0E" strokeWidth="0.7" />
      {/* Top edge highlight */}
      <rect x="-5.8" y="-6.3" width="11.6" height="1.5" rx="0.8"
        fill="#FFFFFF" opacity="0.06" />
      {/* Inner edge */}
      <rect x="-6" y="-6" width="12" height="12" rx="1.4"
        fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.06" />

      {/* Cap — round button with gradient, depresses 1.2px when pressed */}
      <g transform={isPressed ? 'translate(0, 1.2)' : ''}>
        {/* Cap shadow */}
        {!isPressed && (
          <circle cx="0.3" cy="0.4" r="4" fill="#000000" opacity="0.12" />
        )}
        {/* Cap face — metallic gradient circle */}
        <circle cx="0" cy="0" r="4"
          fill={isPressed ? '#9A9A9A' : '#CFCFCF'}
          stroke="#666" strokeWidth="0.5" />
        {/* Cap gradient overlay for 3D dome */}
        <circle cx="0" cy="0" r="3.8"
          fill="none" stroke={isPressed ? '#888' : '#E8E8E8'} strokeWidth="0.8" opacity="0.3" />
        {/* Specular highlight — moves when pressed */}
        <ellipse cx={isPressed ? -0.5 : -1} cy={isPressed ? -0.8 : -1.4} rx="1.8" ry="1.3"
          fill="white" opacity={isPressed ? 0.08 : 0.22} />
        {/* Center cross mark */}
        <line x1="-1.5" y1="0" x2="1.5" y2="0"
          stroke={isPressed ? '#555' : '#666'} strokeWidth="0.4" opacity="0.35" />
        <line x1="0" y1="-1.5" x2="0" y2="1.5"
          stroke={isPressed ? '#555' : '#666'} strokeWidth="0.4" opacity="0.35" />
      </g>

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-12" y="-12" width="24" height="24" rx="3"
          fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

PushButton.pins = [
  { id: 'pin1', label: 'Pin 1', x: -7.5, y: -7.5, type: 'digital' },
  { id: 'pin2', label: 'Pin 2', x:  7.5, y: -7.5, type: 'digital' },
  { id: 'pin3', label: 'Pin 3', x: -7.5, y:  7.5, type: 'digital' },
  { id: 'pin4', label: 'Pin 4', x:  7.5, y:  7.5, type: 'digital' },
];

PushButton.defaultState = { pressed: false };

registerComponent('push-button', {
  component: PushButton,
  pins: PushButton.pins,
  defaultState: PushButton.defaultState,
  category: 'input',
  label: 'Pulsante',
  icon: '\u{1F518}',
  volumeAvailableFrom: 1,
});

export default PushButton;
