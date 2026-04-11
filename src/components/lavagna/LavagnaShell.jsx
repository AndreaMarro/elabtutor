/**
 * LavagnaShell — Main shell for the ELAB Lavagna (digital whiteboard)
 * Assembles: AppHeader + simulator + FloatingToolbar + GalileoAdapter + RetractablePanel
 * Strangler Fig: wraps existing components without modifying them.
 * (c) Andrea Marro — 01/04/2026
 */

import React, { lazy, Suspense, useState, useCallback, useEffect, useRef, useMemo, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppHeader from './AppHeader';
import FloatingToolbar from './FloatingToolbar';
import RetractablePanel from './RetractablePanel';
import GalileoAdapter from './GalileoAdapter';
import VideoFloat from './VideoFloat';
import ExperimentPicker from './ExperimentPicker';
import { deriveState, computePanelActions, STATES } from './LavagnaStateManager';
import MascotPresence from './MascotPresence';
import ErrorToast from './ErrorToast';
import { soundTick, soundPlay, soundPause } from './lavagnaSounds';
import { buildClassProfile, getNextLessonSuggestion } from '../../services/classProfile';
import { HandWaveIcon, PartyIcon, FlaskIcon } from '../common/ElabIcons';
import css from './LavagnaShell.module.css';

const NewElabSimulator = lazy(() => import('../simulator/NewElabSimulator'));
const TeacherDashboard = lazy(() => import('../teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../student/StudentDashboard'));
const VolumeViewer = lazy(() => import('./VolumeViewer'));
const PercorsoPanel = lazy(() => import('./PercorsoPanel'));
const DrawingOverlay = lazy(() => import('../simulator/canvas/DrawingOverlay'));

// Component quick-add buttons for left panel (uses __ELAB_API)
// Realistic component icons — recognizable by a 10-year-old
// SVG gradients use scoped IDs to avoid global DOM namespace collisions
function buildQuickComponents(prefix, volumeNumber = 3) {
  // All components with volume availability — filtered by current volume
  const ALL_COMPONENTS = [
    // ── Volume 1: Le Basi ──
    { type: 'led', label: 'LED', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}ledDome`} cx="40%" cy="35%"><stop offset="0%" stopColor="#a4e65e" /><stop offset="60%" stopColor="#4A7A25" /><stop offset="100%" stopColor="#2d5a10" /></radialGradient></defs>
        <ellipse cx="14" cy="10" rx="6" ry="8" fill={`url(#${prefix}ledDome)`} />
        <ellipse cx="14" cy="10" rx="6" ry="8" fill="none" stroke="#3a6a1a" strokeWidth="0.5" />
        <ellipse cx="11.5" cy="7" rx="2" ry="3" fill="rgba(255,255,255,0.4)" />
        <rect x="8" y="17" width="12" height="2" rx="0.5" fill="#bbb" stroke="#999" strokeWidth="0.5" />
        <path d="M10 19v5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M18 19v7" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <text x="19.5" y="27" fontSize="5" fill="#999" fontFamily="sans-serif">+</text>
      </svg>
    )},
    { type: 'resistor', label: 'Resistore', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M2 14h6M20 14h6" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <defs><linearGradient id={`${prefix}resBody`} x1="8" y1="9" x2="8" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#e8d5b0" /><stop offset="50%" stopColor="#d4b896" /><stop offset="100%" stopColor="#c4a87a" /></linearGradient></defs>
        <rect x="8" y="9" width="12" height="10" rx="2" fill={`url(#${prefix}resBody)`} stroke="#a08a60" strokeWidth="0.5" />
        <rect x="10" y="9" width="1.5" height="10" rx="0.3" fill="#8B4513" />
        <rect x="13" y="9" width="1.5" height="10" rx="0.3" fill="#222" />
        <rect x="16" y="9" width="1.5" height="10" rx="0.3" fill="#E54B3D" />
        <rect x="18.5" y="9" width="1" height="10" rx="0.3" fill="#C5A33E" />
      </svg>
    )},
    { type: 'push-button', label: 'Pulsante', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="6" y="10" width="16" height="10" rx="2" fill="#333" stroke="#222" strokeWidth="0.5" />
        <defs><radialGradient id={`${prefix}btnCap`} cx="45%" cy="40%"><stop offset="0%" stopColor="#E8941C" /><stop offset="100%" stopColor="#c07010" /></radialGradient></defs>
        <circle cx="14" cy="12" r="4" fill={`url(#${prefix}btnCap)`} />
        <circle cx="13" cy="11" r="1.2" fill="rgba(255,255,255,0.3)" />
        <path d="M8 20v4M12 20v4M16 20v4M20 20v4" stroke="#999" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    { type: 'battery9v', label: 'Batteria 9V', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="16" height="18" rx="2" fill="#1E4D8C" stroke="#153d6e" strokeWidth="0.5" />
        <text x="14" y="17" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">9V</text>
        <rect x="9" y="3" width="3" height="4" rx="1" fill="#666" />
        <rect x="16" y="4" width="3" height="3" rx="1" fill="#666" />
        <text x="10.5" y="3" textAnchor="middle" fontSize="5" fill="#E54B3D" fontFamily="sans-serif">+</text>
        <text x="17.5" y="3.5" textAnchor="middle" fontSize="6" fill="#333" fontFamily="sans-serif">-</text>
      </svg>
    )},
    { type: 'potentiometer', label: 'Potenziometro', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="7" width="20" height="14" rx="2" fill="#2980b9" stroke="#1a6fa0" strokeWidth="0.5" />
        <defs><radialGradient id={`${prefix}potKnob`} cx="45%" cy="38%"><stop offset="0%" stopColor="#f0f0f0" /><stop offset="60%" stopColor="#ccc" /><stop offset="100%" stopColor="#888" /></radialGradient></defs>
        <circle cx="14" cy="14" r="6" fill={`url(#${prefix}potKnob)`} stroke="#777" strokeWidth="0.5" />
        <circle cx="13" cy="12" r="1.5" fill="rgba(255,255,255,0.5)" />
        <path d="M14 8v4" stroke="#444" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 21v3M14 21v3M20 21v3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'buzzer-piezo', label: 'Buzzer', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="13" r="8" fill="#222" stroke="#111" strokeWidth="0.5" />
        <circle cx="14" cy="13" r="6" fill="#333" />
        <circle cx="14" cy="13" r="1.5" fill="#111" />
        <text x="14" y="6" textAnchor="middle" fontSize="5" fill="#E54B3D" fontWeight="bold" fontFamily="sans-serif">+</text>
        <path d="M10 21v3M18 21v3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'photo-resistor', label: 'LDR', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}ldrBody`} cx="50%" cy="40%"><stop offset="0%" stopColor="#d4a574" /><stop offset="100%" stopColor="#8B6914" /></radialGradient></defs>
        <circle cx="14" cy="12" r="7" fill={`url(#${prefix}ldrBody)`} stroke="#7a5a10" strokeWidth="0.5" />
        <path d="M14 5.5c1.5 0 2.5 1.2 2.5 2.8s-1 2.8-2.5 2.8-2.5-1.2-2.5-2.8S12.5 5.5 14 5.5z" fill="#a07830" stroke="#7a5a10" strokeWidth="0.3" />
        <path d="M10 19v5M18 19v5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M3 6l3 3M3 3l2 2" stroke="#E8941C" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    { type: 'reed-switch', label: 'Reed Switch', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="18" height="8" rx="4" fill="none" stroke="#999" strokeWidth="1" />
        <path d="M8 14h4M16 14h4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12.5" cy="14" r="1" fill="#666" />
        <circle cx="15.5" cy="14" r="1" fill="#666" />
        <path d="M2 14h3M23 14h3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    // ── Volume 2: Approfondiamo ──
    { type: 'capacitor', label: 'Condensatore', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 2v7M14 19v7" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <defs><linearGradient id={`${prefix}capBody`} x1="7" y1="9" x2="21" y2="9" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2a6496" /><stop offset="40%" stopColor="#3498db" /><stop offset="100%" stopColor="#2472a4" /></linearGradient></defs>
        <rect x="7" y="9" width="14" height="10" rx="2" fill={`url(#${prefix}capBody)`} stroke="#1a5276" strokeWidth="0.5" />
        <rect x="7" y="9" width="3" height="10" rx="1" fill="#1a3a5c" opacity="0.5" />
        <text x="18" y="8" fontSize="6" fill="#E54B3D" fontFamily="sans-serif">+</text>
      </svg>
    )},
    { type: 'motor-dc', label: 'Motore DC', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><linearGradient id={`${prefix}motorBody`} x1="5" y1="7" x2="23" y2="7" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#bbb" /><stop offset="50%" stopColor="#ddd" /><stop offset="100%" stopColor="#aaa" /></linearGradient></defs>
        <rect x="5" y="7" width="18" height="14" rx="3" fill={`url(#${prefix}motorBody)`} stroke="#888" strokeWidth="0.5" />
        <rect x="23" y="12" width="4" height="4" rx="1" fill="#888" />
        <text x="14" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#555" fontFamily="sans-serif">M</text>
        <path d="M8 21v3M18 21v3" stroke="#E54B3D" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'diode', label: 'Diodo', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M2 14h8M18 14h8" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10 8l8 6-8 6V8z" fill="#333" stroke="#222" strokeWidth="0.5" />
        <path d="M18 8v12" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'mosfet-n', label: 'MOSFET N', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="7" y="5" width="14" height="18" rx="2" fill="#333" stroke="#222" strokeWidth="0.5" />
        <text x="14" y="16" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">N</text>
        <path d="M4 10h3M4 18h3M21 14h3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <text x="3" y="9" fontSize="5" fill="#666" fontFamily="sans-serif">G</text>
        <text x="3" y="22" fontSize="5" fill="#666" fontFamily="sans-serif">S</text>
        <text x="24" y="13" fontSize="5" fill="#666" fontFamily="sans-serif">D</text>
      </svg>
    )},
    { type: 'phototransistor', label: 'Fototransistore', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}ptBody`} cx="50%" cy="40%"><stop offset="0%" stopColor="#e0e8ef" /><stop offset="100%" stopColor="#8899aa" /></radialGradient></defs>
        <circle cx="14" cy="13" r="7" fill={`url(#${prefix}ptBody)`} stroke="#667788" strokeWidth="0.5" />
        <circle cx="14" cy="13" r="3" fill="#334455" />
        <path d="M10 20v4M18 20v4" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M3 6l3 3M3 3l2 2" stroke="#E8941C" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    // ── Volume 3: Arduino ──
    { type: 'nano-r4', label: 'Arduino Nano', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><linearGradient id={`${prefix}nanoBoard`} x1="4" y1="4" x2="4" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#008080" /><stop offset="100%" stopColor="#005555" /></linearGradient></defs>
        <rect x="4" y="4" width="20" height="20" rx="2" fill={`url(#${prefix}nanoBoard)`} stroke="#004040" strokeWidth="0.5" />
        <rect x="10" y="2" width="8" height="4" rx="1" fill="#888" stroke="#666" strokeWidth="0.5" />
        <rect x="8" y="10" width="12" height="6" rx="1" fill="#222" />
        <text x="14" y="15" textAnchor="middle" fontSize="5" fill="#0f0" fontFamily="monospace">NANO</text>
        {Array.from({length: 7}, (_, i) => <circle key={`l${i}`} cx={6} cy={6 + i * 2.5} r="0.8" fill="#C5A33E" />)}
        {Array.from({length: 7}, (_, i) => <circle key={`r${i}`} cx={22} cy={6 + i * 2.5} r="0.8" fill="#C5A33E" />)}
      </svg>
    )},
    { type: 'servo', label: 'Servo', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><linearGradient id={`${prefix}servoBody`} x1="3" y1="8" x2="3" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4488cc" /><stop offset="100%" stopColor="#2266aa" /></linearGradient></defs>
        <rect x="3" y="8" width="22" height="14" rx="2" fill={`url(#${prefix}servoBody)`} stroke="#1a5276" strokeWidth="0.5" />
        <circle cx="20" cy="15" r="3.5" fill="#ddd" stroke="#999" strokeWidth="0.5" />
        <path d="M20 15l-2 -5h4z" fill="#fff" stroke="#999" strokeWidth="0.5" />
        <path d="M6 8v-3M10 8v-3M14 8v-3" stroke="#E54B3D" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    { type: 'lcd16x2', label: 'LCD 16x2', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="2" y="6" width="24" height="16" rx="2" fill="#2d8b2d" stroke="#1a6b1a" strokeWidth="0.5" />
        <rect x="4" y="8" width="20" height="12" rx="1" fill="#90EE90" stroke="#60c060" strokeWidth="0.5" />
        <text x="14" y="14" textAnchor="middle" fontSize="4" fill="#333" fontFamily="monospace">Hello!</text>
        <text x="14" y="18" textAnchor="middle" fontSize="4" fill="#333" fontFamily="monospace">ELAB</text>
      </svg>
    )},
    { type: 'rgb-led', label: 'LED RGB', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}rgbDome`} cx="40%" cy="35%"><stop offset="0%" stopColor="#fff" /><stop offset="30%" stopColor="#eef" /><stop offset="100%" stopColor="#aab" /></radialGradient></defs>
        <ellipse cx="14" cy="10" rx="6" ry="8" fill={`url(#${prefix}rgbDome)`} />
        <ellipse cx="14" cy="10" rx="6" ry="8" fill="none" stroke="#889" strokeWidth="0.5" />
        <circle cx="11" cy="9" r="2" fill="#E54B3D" opacity="0.5" />
        <circle cx="17" cy="9" r="2" fill="#2563EB" opacity="0.5" />
        <circle cx="14" cy="12" r="2" fill="#16A34A" opacity="0.5" />
        <rect x="8" y="17" width="12" height="2" rx="0.5" fill="#bbb" stroke="#999" strokeWidth="0.5" />
        <path d="M9 19v5M12 19v5M16 19v5M19 19v5" stroke="#999" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    )},
  ];

  return ALL_COMPONENTS.filter(c => c.vol <= volumeNumber);
}

function QuickComponentPanel({ volumeNumber = 3 }) {
  const svgPrefix = useId().replace(/:/g, '') + '_';
  const components = useMemo(() => buildQuickComponents(svgPrefix, volumeNumber), [svgPrefix, volumeNumber]);

  const handleAdd = useCallback((type) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.addComponent) {
      api.addComponent(type, { x: 200 + Math.random() * 100, y: 150 + Math.random() * 80 });
      soundTick();
    }
  }, []);

  return (
    <div className={css.quickComponents}>
      <div className={css.panelTitle}>Componenti</div>
      <div className={css.componentGrid}>
        {components.map(c => (
          <button
            key={c.type}
            className={css.componentBtn}
            onClick={() => handleAdd(c.type)}
            aria-label={'Aggiungi ' + c.label}
          >
            <span style={{ flexShrink: 0, width: 28, height: 28 }}>{c.icon}</span>
            <span className={css.componentLabel}>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * BentornatiOverlay — Principio Zero welcome screen.
 * When the teacher opens ELAB, UNLIM proposes the next experiment
 * based on past sessions. No choices needed. 30 seconds to teaching.
 */
function BentornatiOverlay({ visible, onStart, onPickExperiment }) {
  const dataRef = useRef(null);
  if (!dataRef.current) {
    dataRef.current = {
      profile: buildClassProfile(),
      suggestion: getNextLessonSuggestion(),
    };
  }
  const { profile, suggestion } = dataRef.current;

  // First-time users: auto-load first experiment after 2s
  useEffect(() => {
    if (!visible || !profile.isFirstTime || !suggestion) return;
    const timer = setTimeout(() => onStart(suggestion), 2000);
    return () => clearTimeout(timer);
  }, [visible, profile.isFirstTime, suggestion, onStart]);

  if (!visible) return null;

  // First-time flow
  if (profile.isFirstTime) {
    return (
      <div className={css.bentornatiOverlay}>
        <div className={css.bentornatiCard}>
          <div className={css.bentornatiIconWrap}>
            <HandWaveIcon size={32} />
          </div>
          <h2 className={css.bentornatiTitle}>Benvenuti!</h2>
          <p className={css.bentornatiMessage}>
            Pronti per il primo esperimento?
          </p>
          <p className={css.bentornatiNext}>
            <strong>{suggestion?.title || 'Accendi il tuo primo LED'}</strong>
          </p>
          <button className={css.bentornatiBtn} onClick={() => onStart(suggestion)}>
            <FlaskIcon size={22} /> Inizia
          </button>
        </div>
      </div>
    );
  }

  // Returning with a suggested next experiment
  if (suggestion) {
    return (
      <div className={css.bentornatiOverlay}>
        <div className={css.bentornatiCard}>
          <div className={css.bentornatiIconWrap}>
            <PartyIcon size={32} />
          </div>
          <h2 className={css.bentornatiTitle}>Bentornati!</h2>
          <p className={css.bentornatiMessage}>
            L'ultima volta: <em>&ldquo;{profile.lastExperimentTitle}&rdquo;</em>
          </p>
          <p className={css.bentornatiNext}>
            Oggi: <strong>{suggestion.title}</strong>
          </p>
          <button className={css.bentornatiBtn} onClick={() => onStart(suggestion)}>
            <FlaskIcon size={22} /> Inizia
          </button>
          <button className={css.bentornatiAlt} onClick={onPickExperiment}>
            Scegli un altro esperimento
          </button>
        </div>
      </div>
    );
  }

  // Returning but no suggestion (end of curriculum or no next_suggested)
  return (
    <div className={css.bentornatiOverlay}>
      <div className={css.bentornatiCard}>
        <div className={css.bentornatiIconWrap}>
          <PartyIcon size={32} />
        </div>
        <h2 className={css.bentornatiTitle}>Bentornati!</h2>
        <p className={css.bentornatiMessage}>
          Pronti a continuare? Scegliete l'esperimento di oggi!
        </p>
        <button className={css.bentornatiBtn} onClick={onPickExperiment}>
          Scegli esperimento
        </button>
      </div>
    </div>
  );
}

export default function LavagnaShell() {
  const { user, isDocente, isStudente } = useAuth();
  const [activeTab, setActiveTab] = useState('lavagna'); // 'lavagna' | 'classe' | 'progressi'
  const [activeTool, setActiveTool] = useState('select');
  const [galileoOpen, setGalileoOpen] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoMinimized, setVideoMinimized] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [experimentName, setExperimentName] = useState('Scegli un esperimento...');
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lavagnaState, setLavagnaState] = useState(STATES.CLEAN);
  const [hasExperiment, setHasExperiment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lessonSteps, setLessonSteps] = useState([]);
  const [unlimSpeaking, setUnlimSpeaking] = useState(false);
  const [leftPanelSize, setLeftPanelSize] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-left-panel') || '180', 10) || 180; } catch { return 180; }
  });
  const [bottomPanelSize, setBottomPanelSize] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-bottom-panel') || '200', 10) || 200; } catch { return 200; }
  });
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-volume') || '1', 10) || 1; } catch { return 1; }
  });
  const [currentVolumePage, setCurrentVolumePage] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-page') || '1', 10) || 1; } catch { return 1; }
  });
  const [percorsoOpen, setPercorsoOpen] = useState(false);
  const [unlimTab, setUnlimTab] = useState('chat'); // 'chat' | 'percorso'
  const [buildMode, setBuildMode] = useState(() => {
    try {
      const v = localStorage.getItem('elab-lavagna-buildmode');
      return ['complete', 'guided', 'sandbox'].includes(v) ? v : 'complete';
    } catch { return 'complete'; }
  }); // complete | guided | sandbox
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [bentornatiVisible, setBentornatiVisible] = useState(true);

  // Persist layout sizes and volume navigation to localStorage
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-left-panel', String(leftPanelSize)); } catch {}
  }, [leftPanelSize]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-bottom-panel', String(bottomPanelSize)); } catch {}
  }, [bottomPanelSize]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-buildmode', buildMode); } catch {}
  }, [buildMode]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-volume', String(currentVolume)); } catch {}
  }, [currentVolume]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-page', String(currentVolumePage)); } catch {}
  }, [currentVolumePage]);

  // Principio Zero: Bentornati flow replaces the old auto-open picker.
  // The BentornatiOverlay handles first-time vs returning users.
  // Fallback: if bentornati is dismissed without loading, open picker.
  useEffect(() => {
    if (!hasExperiment && !bentornatiVisible && !pickerOpen) {
      const timer = setTimeout(() => setPickerOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, [hasExperiment, bentornatiVisible, pickerOpen]);
  const manualOverridesRef = useRef({});
  const apiReadyRef = useRef(false);

  // Poll for __ELAB_API availability (simulator may mount async)
  useEffect(() => {
    const check = setInterval(() => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api && !apiReadyRef.current) {
        apiReadyRef.current = true;
        clearInterval(check); // Stop polling once API is found

        // Listen for experiment changes
        api.on?.('experimentChange', (data) => {
          // Save entire experiment for child panels (PercorsoPanel, etc.)
          // Use microtask delay to ensure getCurrentExperiment is updated
          setTimeout(() => {
            const fullExp = api.getCurrentExperiment?.();
            if (fullExp?.id) setCurrentExperiment(fullExp);
          }, 100);
          if (data?.title) {
            setExperimentName(data.title);
            setHasExperiment(true);
            setPickerOpen(false);
            // PDR: trigger canvas auto-fit after experiment load
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
          }
          if (data?.totalSteps != null) setTotalSteps(data.totalSteps);
          if (data?.currentStep != null) setCurrentStep(data.currentStep);
          if (data?.steps) setLessonSteps(data.steps);
          // Track build mode for hiding component bar in Libero
          const mode = api.getBuildMode?.();
          if (mode) setBuildMode(mode);
        });

        // Listen for state changes (play/pause)
        api.on?.('stateChange', (data) => {
          if (data?.running != null) setIsPlaying(data.running);
        });
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  // Track current panel values in refs (avoids putting them in useEffect deps)
  const panelStateRef = useRef({ leftPanel: false, bottomPanel: false, galileo: true });
  useEffect(() => {
    panelStateRef.current = { leftPanel: leftPanelOpen, bottomPanel: bottomPanelOpen, galileo: galileoOpen };
  });

  // ── State machine: auto-manage panels ──
  useEffect(() => {
    const newState = deriveState({ hasExperiment, isPlaying, isEditing });
    if (newState !== lavagnaState) {
      setLavagnaState(newState);
      const panels = computePanelActions(newState,
        { ...panelStateRef.current, toolbar: true },
        manualOverridesRef.current
      );
      setLeftPanelOpen(panels.leftPanel);
      setBottomPanelOpen(panels.bottomPanel);
      setGalileoOpen(panels.galileo);
    }
  }, [hasExperiment, isPlaying, isEditing, lavagnaState]);

  // Track manual overrides when user explicitly toggles a panel
  const toggleLeftPanel = useCallback(() => {
    manualOverridesRef.current.leftPanel = true;
    setLeftPanelOpen(p => !p);
  }, []);
  const toggleBottomPanel = useCallback(() => {
    manualOverridesRef.current.bottomPanel = true;
    setBottomPanelOpen(p => !p);
  }, []);

  // Build mode change — sets simulator mode via API + auto-opens UNLIM tab
  const handleBuildModeChange = useCallback((mode) => {
    setBuildMode(mode);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.setBuildMode) api.setBuildMode(mode);
    // Auto-open UNLIM with matching tab
    if (mode === 'guided') {
      // "Passo Passo" mode → open UNLIM Passo Passo tab
      setGalileoOpen(true);
      setUnlimTab('guida');
      manualOverridesRef.current.galileo = true;
    } else if (mode === 'sandbox') {
      // "Percorso" mode (was Libero) → open UNLIM Percorso tab
      setGalileoOpen(true);
      setUnlimTab('percorso');
      manualOverridesRef.current.galileo = true;
    }
  }, []);

  // Helper: sync drawing state with simulator via __ELAB_API
  const syncDrawing = useCallback((enabled) => {
    setDrawingEnabled(enabled);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.toggleDrawing) api.toggleDrawing(enabled);
  }, []);

  // ── Toolbar actions via __ELAB_API ──
  const handleToolChange = useCallback((tool) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;

    switch (tool) {
      case 'pen': {
        const next = !drawingEnabled;
        setDrawingEnabled(next);
        setActiveTool(next ? 'pen' : 'select');
        const penApi = typeof window !== 'undefined' && window.__ELAB_API;
        if (penApi?.toggleDrawing) penApi.toggleDrawing(next);
        return;
      }
      case 'delete': {
        if (api) {
          const selected = api.getSelected?.();
          if (selected?.length) {
            selected.forEach(id => api.removeComponent?.(id));
          }
        }
        setActiveTool('select');
        syncDrawing(false);
        break;
      }
      case 'undo': api?.undo?.(); setActiveTool('select'); syncDrawing(false); break;
      case 'redo': api?.redo?.(); setActiveTool('select'); syncDrawing(false); break;
      case 'select':
        setActiveTool('select');
        syncDrawing(false);
        api?.setToolMode?.('select');
        break;
      case 'wire':
        setActiveTool('wire');
        syncDrawing(false);
        api?.setToolMode?.('wire');
        break;
      default:
        setActiveTool(tool);
        syncDrawing(false);
        break;
    }
  }, [syncDrawing, drawingEnabled]);

  // Sync drawing state from simulator back to LavagnaShell (when user clicks ESCI/ESC inside DrawingOverlay)
  useEffect(() => {
    if (!drawingEnabled) return;
    const check = setInterval(() => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api?.isDrawingEnabled && !api.isDrawingEnabled()) {
        setDrawingEnabled(false);
        setActiveTool('select');
        clearInterval(check);
      }
    }, 300);
    return () => clearInterval(check);
  }, [drawingEnabled]);

  // ── Header actions ──
  const handlePlay = useCallback(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api) return;
    if (isPlaying) {
      api.pause?.();
      soundPause();
    } else {
      api.play?.();
      soundPlay();
    }
  }, [isPlaying]);

  const handleMenuOpen = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#tutor';
    }
  }, []);

  const handlePickerOpen = useCallback(() => setPickerOpen(true), []);
  const handlePickerClose = useCallback(() => setPickerOpen(false), []);

  const handleExperimentSelect = useCallback((exp) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.loadExperiment) {
      api.loadExperiment(exp.id);
    }
    setExperimentName(exp.title || exp.id);
    setHasExperiment(true);
    setBentornatiVisible(false);
    // Detect volume from experiment ID prefix (v1-*, v2-*, v3-*)
    const volMatch = (exp.id || '').match(/^v(\d)/);
    if (volMatch) setCurrentVolume(Number(volMatch[1]));
    // Reset manual overrides when loading new experiment
    manualOverridesRef.current = {};
  }, []);

  // Bentornati: teacher clicks "Inizia" → load suggested experiment + open UNLIM
  // Handles race condition: if __ELAB_API is not ready yet, retries with polling
  const handleBentornatiStart = useCallback((suggestion) => {
    if (!suggestion?.experimentId) {
      setBentornatiVisible(false);
      return;
    }
    // Update UI immediately — no waiting
    setExperimentName(suggestion.title || suggestion.experimentId);
    setHasExperiment(true);
    setBentornatiVisible(false);
    setPickerOpen(false);
    const volMatch = (suggestion.experimentId || '').match(/^v(\d)/);
    if (volMatch) setCurrentVolume(Number(volMatch[1]));
    setGalileoOpen(true);
    manualOverridesRef.current = {};

    // Load experiment via API — with retry if API not ready yet
    const tryLoad = () => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api?.loadExperiment) {
        api.loadExperiment(suggestion.experimentId);
        return true;
      }
      return false;
    };
    if (!tryLoad()) {
      // API not ready — poll every 300ms, up to 10 attempts (3s)
      let attempts = 0;
      const poll = setInterval(() => {
        if (tryLoad() || ++attempts >= 10) clearInterval(poll);
      }, 300);
    }
  }, []);

  // Bentornati: teacher clicks "Scegli altro" → dismiss overlay, open picker
  const handleBentornatiPickExperiment = useCallback(() => {
    setBentornatiVisible(false);
    setPickerOpen(true);
  }, []);

  // ── Galileo toggle (also from header) ──
  const toggleGalileo = useCallback(() => {
    manualOverridesRef.current.galileo = true;
    setGalileoOpen(prev => !prev);
  }, []);

  // ── Volume viewer toggle ──
  const toggleVolume = useCallback(() => {
    setVolumeOpen(prev => !prev);
  }, []);

  const handleVolumePage = useCallback((page, vol) => {
    setCurrentVolumePage(page);
    // Inject volume context into __ELAB_API for UNLIM to read
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api) {
      api._volumeContext = { volumeNumber: vol, page };
    }
  }, []);

  // Clear volume context when viewer closes
  useEffect(() => {
    if (!volumeOpen) {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api) api._volumeContext = null;
    }
  }, [volumeOpen]);

  // ── Video toggle ──
  const toggleVideo = useCallback(() => {
    if (videoOpen && !videoMinimized) {
      setVideoOpen(false);
      setVideoMinimized(false);
    } else {
      setVideoOpen(true);
      setVideoMinimized(false);
    }
  }, [videoOpen, videoMinimized]);

  return (
    <div className={css.shell}>
      <AppHeader
        experimentName={experimentName}
        totalSteps={totalSteps}
        currentStep={currentStep}
        onPickerOpen={handlePickerOpen}
        onGalileoToggle={toggleGalileo}
        galileoOpen={galileoOpen}
        onVideoToggle={toggleVideo}
        videoOpen={videoOpen}
        onVolumeToggle={toggleVolume}
        volumeOpen={volumeOpen}
        onPercorsoToggle={() => {
          // Open UNLIM with Percorso tab instead of separate panel
          if (galileoOpen && unlimTab === 'percorso') {
            // Already showing percorso — switch back to chat
            setUnlimTab('chat');
          } else {
            setGalileoOpen(true);
            setUnlimTab('percorso');
            manualOverridesRef.current.galileo = true;
          }
        }}
        percorsoOpen={galileoOpen && unlimTab === 'percorso'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showClasseTab={isDocente}
        showProgressiTab={isStudente}
      />

      <div className={css.body}>
        {/* === LAVAGNA VIEW (simulatore + pannelli) === */}
        <div className={css.lavagnaView} style={{ display: activeTab === 'lavagna' ? 'contents' : 'none' }}>
          {/* Left panel — quick component palette (hidden in Libero/sandbox: solo canvas pulito) */}
          {hasExperiment && buildMode !== 'sandbox' && (
            <RetractablePanel
              id="lavagna-left"
              direction="left"
              open={leftPanelOpen}
              onToggle={toggleLeftPanel}
              defaultSize={180}
              minSize={140}
              maxSize={280}
              onSizeChange={setLeftPanelSize}
              className={css.hideOnPortrait}
            >
              <QuickComponentPanel volumeNumber={currentVolume} />
            </RetractablePanel>
          )}

          {/* Center — simulator canvas + floating toolbar */}
          <main className={css.canvas} style={{
            ...(leftPanelOpen ? { marginLeft: leftPanelSize } : {}),
            ...(bottomPanelOpen ? { marginBottom: bottomPanelSize } : {}),
          }}>
            <Suspense fallback={
              <div className={css.loading}>
                <span>Caricamento simulatore...</span>
              </div>
            }>
              <NewElabSimulator hideLessonPath />
            </Suspense>

            <FloatingToolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
              abovePanel={bottomPanelOpen}
              leftPanelOpen={leftPanelOpen}
            />
          </main>

          {/* Right — Galileo AI in FloatingWindow */}
          <GalileoAdapter
            visible={galileoOpen}
            onClose={() => { manualOverridesRef.current.galileo = true; setGalileoOpen(false); }}
            onSpeakingChange={setUnlimSpeaking}
            activeTab={unlimTab}
          />
        </div>

        {/* === DASHBOARD VIEW (docente o studente) === */}
        {activeTab === 'classe' && isDocente && (
          <div className={css.dashboardView}>
            <Suspense fallback={<div className={css.loading}><span>Caricamento dashboard...</span></div>}>
              <TeacherDashboard />
            </Suspense>
          </div>
        )}
        {activeTab === 'progressi' && isStudente && (
          <div className={css.dashboardView}>
            <Suspense fallback={<div className={css.loading}><span>Caricamento progressi...</span></div>}>
              <StudentDashboard />
            </Suspense>
          </div>
        )}

        {/* Volume PDF Viewer */}
        <Suspense fallback={null}>
          <VolumeViewer
            visible={volumeOpen}
            volumeNumber={currentVolume}
            onClose={() => setVolumeOpen(false)}
            onPageChange={handleVolumePage}
            onVolumeChange={setCurrentVolume}
            initialPage={1}
          />
        </Suspense>

        {/* Video — YouTube + Videocorsi in FloatingWindow */}
        <VideoFloat
          visible={videoOpen}
          minimized={videoMinimized}
          onClose={() => { setVideoOpen(false); setVideoMinimized(false); }}
          onMinimize={() => setVideoMinimized(true)}
          onRestore={() => setVideoMinimized(false)}
        />
      </div>

      {/* Bottom panel — placeholder for code/serial (simulator handles its own) */}
      {bottomPanelOpen && (
        <RetractablePanel
          id="lavagna-bottom"
          direction="bottom"
          open={bottomPanelOpen}
          onToggle={toggleBottomPanel}
          defaultSize={200}
          minSize={100}
          maxSize={400}
          onSizeChange={setBottomPanelSize}
        >
          <div className={css.bottomPlaceholder}>
            <span>Il pannello codice e integrato nel simulatore</span>
          </div>
        </RetractablePanel>
      )}

      {/* Drawing overlay controlled via NewElabSimulator's own DrawingOverlay + __ELAB_API.toggleDrawing */}

      {/* Error-to-UNLIM bridge — toast when circuit/compilation errors occur */}
      <ErrorToast
        onAskUnlim={(msg) => {
          setGalileoOpen(true);
          const api = typeof window !== 'undefined' && window.__ELAB_API;
          if (api?.galileo?.sendMessage) api.galileo.sendMessage(msg);
        }}
      />

      {/* Percorso lezione — integrato dentro UNLIM (GalileoAdapter tab Percorso) */}

      {/* Mascotte ELAB — draggable, click apre UNLIM */}
      <MascotPresence
        speaking={unlimSpeaking}
        onClick={() => { manualOverridesRef.current.galileo = true; setGalileoOpen(true); }}
        mascotSrc="/assets/mascot/logo-senza-sfondo.png"
      />

      {/* Bentornati Overlay — Principio Zero: auto-propose next experiment */}
      <BentornatiOverlay
        visible={bentornatiVisible && !hasExperiment}
        onStart={handleBentornatiStart}
        onPickExperiment={handleBentornatiPickExperiment}
      />

      {/* Experiment Picker Modal */}
      <ExperimentPicker
        open={pickerOpen}
        onClose={handlePickerClose}
        onSelect={handleExperimentSelect}
        onAskUnlim={(msg) => {
          setGalileoOpen(true);
          const api = typeof window !== 'undefined' && window.__ELAB_API;
          if (api?.galileo?.sendMessage) api.galileo.sendMessage(msg);
        }}
      />
    </div>
  );
}
