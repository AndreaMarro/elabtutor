/**
 * ELAB Simulator — Breadboard Full (830 tie-points)
 * Tinkercad-identical style: white board, simple dark holes,
 * solid-color power rail lines, clean IC channel.
 * Internal connectivity: rows a-e connected horizontally per row,
 *   rows f-j connected horizontally per row, gap = no connection
 * Pin positions & exported APIs UNCHANGED — solver-safe.
 * © Andrea Marro — 12/02/2026, Tinkercad redesign 21/02/2026
 */

import React, { useMemo } from 'react';
import { registerComponent } from './registry';

// Layout constants — based on real 830-point breadboard (vertical orientation) (UNCHANGED)
const ROWS = 63;
const COLS_PER_SIDE = 5;
const HOLE_SPACING = 7;
const HOLE_R = 1.4;
const HOLE_INNER_R = 0.8;
const BOARD_PADDING = 8;
const GAP = 10;
const BUS_OFFSET = 6;
const BUS_COL_W = 7;
const BUS_PAD_LEFT = 2;
const MAIN_OFFSET_X = 14;

// Derived dimensions (UNCHANGED)
const MAIN_SECTION_W = COLS_PER_SIDE * HOLE_SPACING;
const BOARD_WIDTH = BOARD_PADDING * 2 + MAIN_OFFSET_X + MAIN_SECTION_W * 2 + GAP;
const BOARD_HEIGHT = BOARD_PADDING * 2 + BUS_OFFSET * 2 + ROWS * HOLE_SPACING;

// X positions (UNCHANGED)
const BUS_PLUS_X = BOARD_PADDING + BUS_PAD_LEFT;
const BUS_MINUS_X = BOARD_PADDING + BUS_PAD_LEFT + BUS_COL_W;
const SECTION_LEFT_X = BOARD_PADDING + MAIN_OFFSET_X;
const GAP_X = SECTION_LEFT_X + MAIN_SECTION_W;
const SECTION_RIGHT_X = GAP_X + GAP;

// Tinkercad-matched colors — light board, light rim + dark core holes, red + black rails
const BOARD_BG = '#F2F2F2';
const BOARD_EDGE = '#D2D2D2';
const HOLE_RIM = '#BDBDBD';
const HOLE_CORE = '#2F2F2F';
const BUS_RED = '#D32F2F';
const BUS_NEG = '#424242';
const LABEL_COLOR = '#4A4A4A';
const CHANNEL_BG = '#DADADA';
const CHANNEL_NOTCH = '#CFCFCF';

// Column labels
const LEFT_LABELS = ['a', 'b', 'c', 'd', 'e'];
const RIGHT_LABELS = ['f', 'g', 'h', 'i', 'j'];

function darkenColor(hex, factor) {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return hex;
  const r = Math.round(parseInt(m[1], 16) * factor);
  const g = Math.round(parseInt(m[2], 16) * factor);
  const b = Math.round(parseInt(m[3], 16) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const Hole = React.memo(({ cx, cy, active, onClick }) => {
  const isActive = !!active;
  const activeColor = typeof active === 'string' ? active : '#6AAF35';
  const innerColor = isActive ? darkenColor(activeColor, 0.45) : HOLE_CORE;
  const outerColor = isActive ? activeColor : HOLE_RIM;

  return (
    <g
      onClick={onClick || undefined}
      style={onClick ? { cursor: 'crosshair' } : undefined}
    >
      {isActive && (
        <circle cx={cx} cy={cy} r={HOLE_R + 1.5} fill={activeColor} opacity={0.3} />
      )}
      <circle cx={cx} cy={cy} r={HOLE_R} fill={outerColor} />
      <circle cx={cx} cy={cy} r={HOLE_INNER_R} fill={innerColor} />
      {!isActive && (
        <circle cx={cx - 0.35} cy={cy - 0.35} r={HOLE_INNER_R * 0.65} fill="#FFFFFF" opacity={0.18} />
      )}
      {/* Clickable hit area for iPad (slightly overlapping to remove deadzones) */}
      {onClick && (
        <circle cx={cx} cy={cy} r={HOLE_SPACING * 0.65} fill="transparent" />
      )}
    </g>
  );
});

/**
 * Vertical bus column — Tinkercad style: solid colored line + holes
 */
const BusColumn = React.memo(({ cx, color, label, activeHoles = {}, onHoleClick }) => {
  const yStart = BOARD_PADDING + BUS_OFFSET;
  const holes = [];
  for (let row = 0; row < ROWS; row++) {
    const cy = yStart + row * HOLE_SPACING;
    const holeId = `bus-${label}-${row + 1}`;
    holes.push(
      <Hole key={holeId} cx={cx} cy={cy} active={activeHoles[holeId]}
        onClick={onHoleClick ? (e) => { e.stopPropagation(); onHoleClick(holeId); } : undefined} />
    );
  }

  return (
    <g>
      {/* Solid colored line running full height */}
      <line
        x1={cx} y1={yStart}
        x2={cx} y2={yStart + (ROWS - 1) * HOLE_SPACING}
        stroke={color} strokeWidth={1.25} opacity={0.85}
      />
      {holes}
    </g>
  );
});

/**
 * Main hole section (5 columns x 63 rows)
 */
const HoleSection = React.memo(({ xStart, colLabels, activeHoles = {}, onHoleClick }) => {
  const elements = [];
  const yStart = BOARD_PADDING + BUS_OFFSET;

  for (let col = 0; col < COLS_PER_SIDE; col++) {
    const cx = xStart + col * HOLE_SPACING;
    const colLabel = colLabels[col];

    elements.push(
      <text key={`lbl-t-${colLabel}`} x={cx} y={yStart - 4}
        textAnchor="middle" fontSize="3.5" fill={LABEL_COLOR}
        fontFamily="Arial, Helvetica, sans-serif">
        {colLabel}
      </text>
    );

    elements.push(
      <text key={`lbl-b-${colLabel}`} x={cx}
        y={yStart + (ROWS - 1) * HOLE_SPACING + 6}
        textAnchor="middle" fontSize="3.5" fill={LABEL_COLOR}
        fontFamily="Arial, Helvetica, sans-serif">
        {colLabel}
      </text>
    );

    for (let row = 0; row < ROWS; row++) {
      const cy = yStart + row * HOLE_SPACING;
      const holeId = `${colLabel}${row + 1}`;
      elements.push(
        <Hole key={holeId} cx={cx} cy={cy} active={activeHoles[holeId]}
          onClick={onHoleClick ? (e) => { e.stopPropagation(); onHoleClick(holeId); } : undefined} />
      );
    }
  }

  return <g>{elements}</g>;
});

const BreadboardFull = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, onHoleClick, id }) => {
  const activeHoles = state.activeHoles || {};

  const rowLabels = useMemo(() => {
    const labels = [];
    const yStart = BOARD_PADDING + BUS_OFFSET;
    for (let row = 0; row < ROWS; row++) {
      const num = row + 1;
      if (num === 1 || num === 63 || num % 5 === 0) {
        const cy = yStart + row * HOLE_SPACING;
        labels.push(
          <text key={`rn-l-${num}`} x={SECTION_LEFT_X - 4} y={cy + 1.5}
            textAnchor="end" fontSize="3.2" fill={LABEL_COLOR}
            fontFamily="Arial, Helvetica, sans-serif">
            {num}
          </text>
        );
        labels.push(
          <text key={`rn-r-${num}`} x={SECTION_RIGHT_X + (COLS_PER_SIDE - 1) * HOLE_SPACING + 5}
            y={cy + 1.5}
            textAnchor="start" fontSize="3.2" fill={LABEL_COLOR}
            fontFamily="Arial, Helvetica, sans-serif">
            {num}
          </text>
        );
      }
    }
    return labels;
  }, []);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="breadboard-full" role="img"
       aria-label={`Breadboard Full ${id}`}>
      {/* Board shadow */}
      <rect x="1.5" y="2" width={BOARD_WIDTH} height={BOARD_HEIGHT} rx="3" fill="#00000012" />

      {/* Board body — clean white */}
      <rect x="0" y="0" width={BOARD_WIDTH} height={BOARD_HEIGHT} rx="3"
        fill={BOARD_BG} stroke={BOARD_EDGE} strokeWidth="0.6" />

      {/* Subtle inner highlight */}
      <rect x="0.7" y="0.7" width={BOARD_WIDTH - 1.4} height={BOARD_HEIGHT - 1.4} rx="2.4"
        fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55" />

      {/* === LEFT BUS COLUMNS (+/-) === */}
      <text x={BUS_PLUS_X} y={BOARD_PADDING + BUS_OFFSET - 6}
        textAnchor="middle" fontSize="5" fill={BUS_RED} fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif">+</text>
      <text x={BUS_MINUS_X} y={BOARD_PADDING + BUS_OFFSET - 6}
        textAnchor="middle" fontSize="5" fill={BUS_NEG} fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif">{'\u2212'}</text>

      <BusColumn cx={BUS_PLUS_X} color={BUS_RED} label="plus"
        activeHoles={activeHoles} onHoleClick={onHoleClick} />
      <BusColumn cx={BUS_MINUS_X} color={BUS_NEG} label="minus"
        activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* Row number labels */}
      {rowLabels}

      {/* === LEFT SECTION (a-e) === */}
      <HoleSection xStart={SECTION_LEFT_X} colLabels={LEFT_LABELS}
        activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* === CENTRAL IC CHANNEL === */}
      <rect x={GAP_X + 1} y={BOARD_PADDING + BUS_OFFSET - 2}
        width={GAP - 2}
        height={(ROWS - 1) * HOLE_SPACING + 4}
        rx="1" fill={CHANNEL_BG} />
      {[0, 15, 30, 45, 60].filter(r => r < ROWS).map(row => {
        const cy = BOARD_PADDING + BUS_OFFSET + row * HOLE_SPACING;
        return (
          <circle key={`notch-${row}`} cx={GAP_X + GAP / 2} cy={cy} r="2"
            fill={CHANNEL_NOTCH} />
        );
      })}

      {/* === RIGHT SECTION (f-j) === */}
      <HoleSection xStart={SECTION_RIGHT_X} colLabels={RIGHT_LABELS}
        activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* Highlight for AI tutoring */}
      {highlighted && (
        <rect x="-3" y="-3" width={BOARD_WIDTH + 6} height={BOARD_HEIGHT + 6} rx="6"
          fill="none" stroke="var(--color-accent, #4A7A25)" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

// Pin definitions (UNCHANGED)
const _generatedPins = (() => {
  const pins = [];
  const yStart = BOARD_PADDING + BUS_OFFSET;

  pins.push(
    { id: 'bus-plus', label: '+ Bus', x: BUS_PLUS_X, y: yStart, type: 'power' },
    { id: 'bus-minus', label: '\u2212 Bus', x: BUS_MINUS_X, y: yStart, type: 'power' },
  );

  for (let col = 0; col < COLS_PER_SIDE; col++) {
    const colLabel = LEFT_LABELS[col];
    const cx = SECTION_LEFT_X + col * HOLE_SPACING;
    for (let row = 0; row < ROWS; row++) {
      const cy = yStart + row * HOLE_SPACING;
      pins.push({ id: `${colLabel}${row + 1}`, label: `${colLabel}${row + 1}`, x: cx, y: cy, type: 'hole' });
    }
  }

  for (let col = 0; col < COLS_PER_SIDE; col++) {
    const colLabel = RIGHT_LABELS[col];
    const cx = SECTION_RIGHT_X + col * HOLE_SPACING;
    for (let row = 0; row < ROWS; row++) {
      const cy = yStart + row * HOLE_SPACING;
      pins.push({ id: `${colLabel}${row + 1}`, label: `${colLabel}${row + 1}`, x: cx, y: cy, type: 'hole' });
    }
  }

  for (let row = 0; row < ROWS; row++) {
    const cy = yStart + row * HOLE_SPACING;
    pins.push({ id: `bus-plus-${row + 1}`, label: `bus-plus-${row + 1}`, x: BUS_PLUS_X, y: cy, type: 'power' });
    pins.push({ id: `bus-minus-${row + 1}`, label: `bus-minus-${row + 1}`, x: BUS_MINUS_X, y: cy, type: 'power' });
  }

  return pins;
})();

BreadboardFull.pins = _generatedPins;
BreadboardFull.defaultState = { activeHoles: {} };

BreadboardFull.boardDimensions = {
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  rows: ROWS,
  colsPerSide: COLS_PER_SIDE,
  holeSpacing: HOLE_SPACING,
  padX: BOARD_PADDING,
  padY: BOARD_PADDING,
  sectionLeftX: SECTION_LEFT_X,
  sectionRightX: SECTION_RIGHT_X,
  gapX: GAP_X,
  gapW: GAP,
  busPlusX: BUS_PLUS_X,
  busMinusX: BUS_MINUS_X,
  busOffset: BUS_OFFSET,
};

BreadboardFull.getHolePosition = function (holeId) {
  if (!holeId) return null;
  const yStart = BOARD_PADDING + BUS_OFFSET;

  const busMatch = holeId.match(/^bus-(plus|minus)-(\d+)$/);
  if (busMatch) {
    const isPlus = busMatch[1] === 'plus';
    const row = parseInt(busMatch[2]) - 1;
    if (row < 0 || row >= ROWS) return null;
    return {
      x: isPlus ? BUS_PLUS_X : BUS_MINUS_X,
      y: yStart + row * HOLE_SPACING,
    };
  }

  const match = holeId.match(/^([a-j])(\d+)$/);
  if (!match) return null;

  const colChar = match[1].toLowerCase();
  const row = parseInt(match[2]) - 1;
  if (row < 0 || row >= ROWS) return null;

  const leftIdx = LEFT_LABELS.indexOf(colChar);
  const rightIdx = RIGHT_LABELS.indexOf(colChar);

  if (leftIdx >= 0) {
    return { x: SECTION_LEFT_X + leftIdx * HOLE_SPACING, y: yStart + row * HOLE_SPACING };
  }
  if (rightIdx >= 0) {
    return { x: SECTION_RIGHT_X + rightIdx * HOLE_SPACING, y: yStart + row * HOLE_SPACING };
  }
  return null;
};

BreadboardFull.getInternalConnections = function () {
  const nets = [];

  for (let row = 1; row <= ROWS; row++) {
    nets.push({
      id: `net-left-${row}`,
      holes: LEFT_LABELS.map(c => `${c}${row}`)
    });
  }

  for (let row = 1; row <= ROWS; row++) {
    nets.push({
      id: `net-right-${row}`,
      holes: RIGHT_LABELS.map(c => `${c}${row}`)
    });
  }

  nets.push({
    id: 'net-bus-plus',
    holes: Array.from({ length: ROWS }, (_, i) => `bus-plus-${i + 1}`)
  });
  nets.push({
    id: 'net-bus-minus',
    holes: Array.from({ length: ROWS }, (_, i) => `bus-minus-${i + 1}`)
  });

  return nets;
};

registerComponent('breadboard-full', {
  component: BreadboardFull,
  pins: BreadboardFull.pins,
  defaultState: BreadboardFull.defaultState,
  category: 'passive',
  label: 'Breadboard (Full)',
  icon: '\u{1F4CB}',
  boardDimensions: BreadboardFull.boardDimensions,
  getInternalConnections: BreadboardFull.getInternalConnections,
  getHolePosition: BreadboardFull.getHolePosition,
  volumeAvailableFrom: 1,
});

export const boardDimensions = {
  ROWS, COLS_PER_SIDE, HOLE_SPACING, HOLE_RADIUS: HOLE_R,
  BOARD_PADDING, GAP, BUS_OFFSET, BOARD_WIDTH, BOARD_HEIGHT,
};

export function getHolePosition(holeId) {
  return BreadboardFull.getHolePosition(holeId);
}

export function getInternalConnections() {
  return BreadboardFull.getInternalConnections();
}

export default BreadboardFull;
