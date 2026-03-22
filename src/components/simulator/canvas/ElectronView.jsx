/**
 * ElectronView.jsx — Animated particle system showing electron flow through wires.
 * Uses requestAnimationFrame for smooth 60fps animation.
 *
 * Props:
 *   - connections: experiment.connections array
 *   - wireCurrents: { index: { direction, magnitude } } from SimulatorCanvas
 *   - wirePaths: { index: svgPathString } computed paths from WireRenderer
 *   - enabled: boolean toggle
 *   - components: experiment components (for resistor detection)
 *
 * Particle behavior:
 *   - Speed ∝ current magnitude
 *   - Density ∝ current magnitude
 *   - Color: gold (<5mA) → orange (5-50mA) → red (>50mA)
 *   - Direction: conventional current (positive → negative)
 *   - Max 200 particles on screen
 */

import React, { useRef, useEffect, useCallback } from 'react';

const MAX_PARTICLES = 200;
const BASE_SPEED = 0.003; // path progress per frame at 1mA
const MIN_PARTICLES_PER_WIRE = 2;
const MAX_PARTICLES_PER_WIRE = 15;

// Color thresholds (mA)
const LOW_THRESHOLD = 5;
const HIGH_THRESHOLD = 50;

// Colors
const COLOR_LOW = '#FFD54F';     // Gold
const COLOR_MED = '#FF9800';     // Orange
const COLOR_HIGH = '#F44336';    // Red
const GLOW_COLOR = 'rgba(255, 213, 79, 0.4)';

function getParticleColor(magnitudeMA) {
  if (magnitudeMA > HIGH_THRESHOLD) return COLOR_HIGH;
  if (magnitudeMA > LOW_THRESHOLD) return COLOR_MED;
  return COLOR_LOW;
}

function getParticleCount(magnitudeMA) {
  if (magnitudeMA <= 0) return 0;
  // Scale: 2 particles at 1mA, up to 15 at 100mA+
  const count = Math.round(MIN_PARTICLES_PER_WIRE + (magnitudeMA / 100) * (MAX_PARTICLES_PER_WIRE - MIN_PARTICLES_PER_WIRE));
  return Math.min(MAX_PARTICLES_PER_WIRE, Math.max(MIN_PARTICLES_PER_WIRE, count));
}

function getSpeed(magnitudeMA) {
  // Speed proportional to current, clamped
  const factor = Math.max(0.3, Math.min(5, magnitudeMA / 10));
  return BASE_SPEED * factor;
}

/**
 * Parse SVG path string into a series of points for interpolation.
 * Simplified: samples the path at regular intervals using a hidden SVG path element.
 */
function samplePath(pathString, numSamples = 50) {
  if (!pathString) return [];

  try {
    // Create a temporary SVG path element to measure
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', pathString);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const totalLength = path.getTotalLength();
    if (totalLength <= 0) {
      document.body.removeChild(svg);
      return [];
    }

    const points = [];
    for (let i = 0; i <= numSamples; i++) {
      const pt = path.getPointAtLength((i / numSamples) * totalLength);
      points.push({ x: pt.x, y: pt.y });
    }

    document.body.removeChild(svg);
    return points;
  } catch {
    return [];
  }
}

/**
 * Interpolate position along sampled path points.
 * @param {Array} points - Sampled path points
 * @param {number} t - Progress along path [0, 1]
 * @returns {{ x: number, y: number }}
 */
function interpolatePoint(points, t) {
  if (!points.length) return { x: 0, y: 0 };
  const clamped = Math.max(0, Math.min(1, t));
  const index = clamped * (points.length - 1);
  const i = Math.floor(index);
  const frac = index - i;

  if (i >= points.length - 1) return points[points.length - 1];

  const a = points[i];
  const b = points[i + 1];
  return {
    x: a.x + (b.x - a.x) * frac,
    y: a.y + (b.y - a.y) * frac,
  };
}

export default function ElectronView({
  connections = [],
  wireCurrents = {},
  wirePaths = {},
  enabled = false,
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const sampledPathsRef = useRef({});

  // Sample paths when they change
  useEffect(() => {
    if (!enabled) return;
    const sampled = {};
    Object.entries(wirePaths).forEach(([index, pathStr]) => {
      if (pathStr) {
        sampled[index] = samplePath(pathStr, 60);
      }
    });
    sampledPathsRef.current = sampled;
  }, [wirePaths, enabled]);

  // Initialize particles when currents change
  useEffect(() => {
    if (!enabled) {
      particlesRef.current = [];
      return;
    }

    const particles = [];
    let totalCount = 0;

    Object.entries(wireCurrents).forEach(([wireIndex, current]) => {
      if (!current || current.magnitude <= 0.1) return;
      const points = sampledPathsRef.current[wireIndex];
      if (!points || points.length < 2) return;

      const count = getParticleCount(current.magnitude);
      if (totalCount + count > MAX_PARTICLES) return;

      for (let i = 0; i < count; i++) {
        particles.push({
          wireIndex: parseInt(wireIndex),
          progress: i / count, // evenly distributed along path
          speed: getSpeed(current.magnitude),
          direction: current.direction || 1,
          magnitude: current.magnitude,
          color: getParticleColor(current.magnitude),
          size: current.magnitude > HIGH_THRESHOLD ? 2.8 : current.magnitude > LOW_THRESHOLD ? 2.2 : 1.8,
        });
        totalCount++;
      }
    });

    particlesRef.current = particles;
  }, [wireCurrents, enabled]);

  // Animation loop
  const animate = useCallback(() => {
    const svg = canvasRef.current;
    if (!svg || !enabled) return;

    const particles = particlesRef.current;
    const sampled = sampledPathsRef.current;

    // Update particle positions
    for (const p of particles) {
      const points = sampled[p.wireIndex];
      if (!points || points.length < 2) continue;

      // Move along path
      p.progress += p.speed * p.direction;

      // Wrap around
      if (p.progress > 1) p.progress -= 1;
      if (p.progress < 0) p.progress += 1;
    }

    // Render to SVG
    // Clear existing particle elements
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw particles
    const ns = 'http://www.w3.org/2000/svg';
    for (const p of particles) {
      const points = sampled[p.wireIndex];
      if (!points || points.length < 2) continue;

      const pos = interpolatePoint(points, p.progress);

      // Glow circle (larger, semi-transparent)
      const glow = document.createElementNS(ns, 'circle');
      glow.setAttribute('cx', pos.x.toFixed(1));
      glow.setAttribute('cy', pos.y.toFixed(1));
      glow.setAttribute('r', (p.size * 2.5).toFixed(1));
      glow.setAttribute('fill', p.color);
      glow.setAttribute('opacity', '0.15');
      glow.setAttribute('filter', 'url(#electronGlow)');
      svg.appendChild(glow);

      // Core particle
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', pos.x.toFixed(1));
      circle.setAttribute('cy', pos.y.toFixed(1));
      circle.setAttribute('r', p.size.toFixed(1));
      circle.setAttribute('fill', p.color);
      circle.setAttribute('opacity', '0.85');
      svg.appendChild(circle);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [enabled]);

  // Start/stop animation loop
  useEffect(() => {
    if (enabled) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, animate]);

  if (!enabled) return null;

  return (
    <g className="electron-view-overlay" style={{ pointerEvents: 'none' }}>
      {/* SVG filter for glow effect */}
      <defs>
        <filter id="electronGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Particle container — updated via requestAnimationFrame */}
      <g ref={canvasRef} />
    </g>
  );
}
