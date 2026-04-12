/* Andrea Marro — 17/02/2026 */
/**
 * BuildModeGuide -- Interactive step-by-step build guide
 * Shows build steps for an experiment when buildMode is active.
 * Each step tells the child which component to place and where.
 *
 * PROGRESSIVE ASSEMBLY: the currentStep prop controls which components
 * are visible on the canvas via the parent (NewElabSimulator).
 * Step -1 = empty board (only base components: breadboard + battery/arduino)
 * Step 0 = first buildStep visible, etc.
 *
 * Props:
 *   experiment: { title, icon, buildSteps: [...] }
 *   currentStep: number (-1 = intro, 0..N = step index)
 *   onStepChange: (stepIndex: number) => void
 *   onClose: () => void
 */

import React, { useState, useEffect } from 'react';
import ovStyles from '../overlays.module.css';

// Simple step number used instead of emoji per component type
const STEP_ICONS = {};

// Size presets for resizable panel (Andrea Marro 12/04/2026)
// Rende il pannello Passo Passo piu leggibile e allargabile
const SIZE_PRESETS = {
  S: { width: 240, fontSize: 14, stepFontSize: 16 },
  M: { width: 360, fontSize: 15, stepFontSize: 18 },
  L: { width: 520, fontSize: 17, stepFontSize: 20 },
};
const SIZE_KEY = 'elab-buildguide-size-v1';

function loadSize() {
  try {
    const v = typeof window !== 'undefined' && window.localStorage?.getItem(SIZE_KEY);
    if (v === 'S' || v === 'M' || v === 'L') return v;
  } catch { /* silent */ }
  return 'M';
}

const BuildModeGuide = React.memo(function BuildModeGuide({
  experiment,
  currentStep = -1,
  onStepChange,
  onClose,
}) {
  const [expanded, setExpanded] = useState(true);
  const [size, setSize] = useState(loadSize);

  // Persist size choice
  useEffect(() => {
    try { window.localStorage.setItem(SIZE_KEY, size); } catch { /* silent */ }
  }, [size]);

  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.M;
  const cycleSize = () => setSize(prev => (prev === 'S' ? 'M' : prev === 'M' ? 'L' : 'S'));

  if (!experiment) return null;
  const buildSteps = experiment.buildSteps || [];
  if (buildSteps.length === 0) return null;

  // Collapsed: small floating button
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={ovStyles.collapsedBtn}
        title="Mostra guida montaggio"
      >
        {'\u2261'}
      </button>
    );
  }

  const isIntro = currentStep < 0;
  const isLast = currentStep >= buildSteps.length - 1;
  const step = isIntro ? null : buildSteps[currentStep];
  const stepIcon = step
    ? (STEP_ICONS[step.componentType] || '\u2022')
    : null;

  // Navigation handlers — delegate to parent
  const handlePrev = () => {
    if (onStepChange) onStepChange(Math.max(-1, currentStep - 1));
  };
  const handleNext = () => {
    if (onStepChange) onStepChange(Math.min(buildSteps.length - 1, currentStep + 1));
  };

  // Progress: intro = 0%, step 0 = 1/N, ..., last step = 100%
  const progressPct = isIntro ? 0 : ((currentStep + 1) / buildSteps.length) * 100;

  return (
    <div
      className={ovStyles.guideRoot}
      style={{ width: preset.width, maxWidth: '92vw', fontSize: preset.fontSize }}
    >
      {/* Andrea Marro 12/04/2026: pannello Passo Passo allargabile (S/M/L) per leggibilita */}
      {/* Header */}
      <div className={ovStyles.guideHeader} style={{ background: 'linear-gradient(135deg, rgba(124,179,66,0.15), rgba(30,77,140,0.05))' }}>
        <span className={ovStyles.guideIcon}>{'\u2261'}</span>
        <span className={ovStyles.guideTitle}>Montalo Tu!</span>
        <button
          onClick={cycleSize}
          className={ovStyles.guideCloseBtn}
          title={`Dimensione pannello: ${size} (clic per cambiare)`}
          aria-label={`Cambia dimensione pannello, attuale ${size}`}
          style={{ fontWeight: 700, minWidth: 24 }}
        >
          {size}
        </button>
        <button onClick={() => setExpanded(false)} className={ovStyles.guideCloseBtn} aria-label="Minimizza">{'\u2212'}</button>
        <button onClick={onClose} className={ovStyles.guideCloseBtn} aria-label="Chiudi">{'\u2715'}</button>
      </div>

      {/* Progress bar */}
      <div style={progressBarContainer}>
        <div style={{ ...progressBarFill, width: `${progressPct}%` }} />
      </div>

      {/* Step counter */}
      <div style={stepCounterStyle}>
        {isIntro
          ? 'Pronti a montare!'
          : `Passo ${currentStep + 1} di ${buildSteps.length}`
        }
      </div>

      {/* Current step content — key forces re-mount for fade-in animation */}
      {/* Andrea Marro 12/04/2026: fontSize dinamico da size preset per leggibilita */}
      <div key={currentStep} style={{ ...stepContentStyle, fontSize: preset.stepFontSize }} className={ovStyles.buildStepFadeIn}>
        {isIntro ? (
          /* Intro screen: empty board */
          <div style={introStyle}>
            <span style={{ fontSize: preset.stepFontSize + 4, display: 'block', textAlign: 'center', marginBottom: 6, fontWeight: 700, color: 'var(--color-primary)' }}>{'\u25B6'}</span>
            <p style={{ margin: 0, fontSize: preset.stepFontSize, lineHeight: 1.5, color: 'var(--color-text-gray-700)', textAlign: 'center', fontWeight: 500 }}>
              Davanti a te c'è il banco vuoto con la breadboard e la batteria.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: preset.stepFontSize, lineHeight: 1.4, color: 'var(--color-text-gray-400)', textAlign: 'center' }}>
              Premi <strong>Avanti</strong> per iniziare a montare il circuito pezzo per pezzo!
            </p>
          </div>
        ) : (
          /* Regular step */
          <>
            <div style={stepIconRow}>
              <span style={{ fontSize: preset.stepFontSize + 4 }}>{stepIcon}</span>
              <span style={{ ...stepTextStyle, fontSize: preset.stepFontSize }}>{step.text}</span>
            </div>
            {step.hint && (
              <div style={{ ...hintStyle, fontSize: Math.max(14, preset.stepFontSize - 2) }}>
                {step.hint}
              </div>
            )}
            {/* Breadboard pin hint: show pin locations if available */}
            {step.pinHint && (
              <div style={{ ...pinHintStyle, fontSize: Math.max(13, preset.stepFontSize - 3) }}>
                {step.pinHint}
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div style={navStyle}>
        <button
          onClick={handlePrev}
          disabled={isIntro}
          style={{
            ...navBtnStyle,
            opacity: isIntro ? 0.4 : 1,
            cursor: isIntro ? 'default' : 'pointer',
          }}
        >
          {'\u2190'} Indietro
        </button>
        <button
          onClick={isLast ? onClose : handleNext}
          style={{
            ...navBtnStyle,
            background: isLast ? 'var(--color-success)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            fontWeight: 700,
          }}
        >
          {isLast ? '\u2714 Finito!' : 'Avanti \u2192'}
        </button>
      </div>
    </div>
  );
});

// --- Styles ---

const progressBarContainer = {
  height: 4,
  background: 'var(--color-sim-border)',
  width: '100%',
};

const progressBarFill = {
  height: '100%',
  background: 'var(--color-accent)',
  borderRadius: '0 2px 2px 0',
  transition: 'width var(--transition-slow)',
};

const stepCounterStyle = {
  padding: '6px 10px 2px',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--color-primary)',
  fontFamily: 'var(--font-display)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const stepContentStyle = {
  padding: '6px 10px 8px',
};

const introStyle = {
  padding: '8px 4px',
};

const stepIconRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  marginBottom: 6,
};

const stepTextStyle = {
  fontSize: 14,
  lineHeight: 1.45,
  color: 'var(--color-text-gray-700)',
  fontWeight: 500,
};

const hintStyle = {
  fontSize: 14,
  color: 'var(--color-text-gray-400)',
  fontStyle: 'italic',
  lineHeight: 1.4,
  padding: '4px 8px',
  background: 'var(--color-warning-light, #FFF9C4)',
  borderRadius: 6,
  marginTop: 4,
};

const pinHintStyle = {
  fontSize: 14,
  color: 'var(--color-primary)',
  lineHeight: 1.4,
  padding: '4px 8px',
  background: 'var(--color-primary-subtle)',
  borderRadius: 6,
  marginTop: 4,
  fontFamily: 'var(--font-mono)',
};

const navStyle = {
  display: 'flex',
  gap: 6,
  padding: '6px 10px 10px',
  borderTop: '1px solid var(--color-divider-subtle)',
};

const navBtnStyle = {
  flex: 1,
  padding: '8px 0',
  border: '1px solid var(--color-sim-scrollbar)',
  borderRadius: 6,
  background: 'var(--color-bg)',
  color: 'var(--color-text-gray-500)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  cursor: 'pointer',
  textAlign: 'center',
  minHeight: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  transition: 'var(--transition-fast)',
};

export default BuildModeGuide;
