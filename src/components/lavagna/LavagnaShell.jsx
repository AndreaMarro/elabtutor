/**
 * LavagnaShell — Main shell for the ELAB Lavagna (digital whiteboard)
 * Assembles: AppHeader + simulator + FloatingToolbar + GalileoAdapter + RetractablePanel
 * Strangler Fig: wraps existing components without modifying them.
 * (c) Andrea Marro — 01/04/2026
 */

import React, { lazy, Suspense, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppHeader from './AppHeader';
import FloatingToolbar from './FloatingToolbar';
import RetractablePanel from './RetractablePanel';
import GalileoAdapter from './GalileoAdapter';
import VideoFloat from './VideoFloat';
import ExperimentPicker from './ExperimentPicker';
import { deriveState, computePanelActions, STATES } from './LavagnaStateManager';
import css from './LavagnaShell.module.css';

const NewElabSimulator = lazy(() => import('../simulator/NewElabSimulator'));
const TeacherDashboard = lazy(() => import('../teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../student/StudentDashboard'));

// Component quick-add buttons for left panel (uses __ELAB_API) — SVG icons, Feather-style
const QUICK_COMPONENTS = [
  { type: 'led', label: 'LED', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2a5 5 0 00-5 5c0 2 1.5 3.5 2.5 4.5.5.5.5 1 .5 1.5v2a2 2 0 004 0v-2c0-.5 0-1 .5-1.5C13.5 10.5 15 9 15 7a5 5 0 00-5-5z" stroke="#4A7A25" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 17h4" stroke="#4A7A25" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { type: 'resistor', label: 'Resistore', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10h3l1.5-4 2 8 2-8 2 8L14 6l1.5 4H19" stroke="#1E4D8C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )},
  { type: 'push-button', label: 'Pulsante', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="12" height="8" rx="2" stroke="#1E4D8C" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="#E8941C" strokeWidth="1.5" />
    </svg>
  )},
  { type: 'buzzer-piezo', label: 'Buzzer', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="#1E4D8C" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2" fill="#1E4D8C" />
      <path d="M10 4v-2M10 18v-2" stroke="#1E4D8C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { type: 'potentiometer', label: 'Potenziometro', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="#1E4D8C" strokeWidth="1.5" />
      <path d="M10 4l0 6" stroke="#E8941C" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 14h4M12 14h4" stroke="#1E4D8C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { type: 'battery9v', label: 'Batteria 9V', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="12" height="10" rx="1.5" stroke="#1E4D8C" strokeWidth="1.5" />
      <path d="M8 5V3h4v2" stroke="#1E4D8C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10h4M10 8v4" stroke="#E54B3D" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
  { type: 'capacitor', label: 'Condensatore', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10h6M12 10h6" stroke="#1E4D8C" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 5v10M12 5v10" stroke="#1E4D8C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )},
  { type: 'motor-dc', label: 'Motore DC', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="#1E4D8C" strokeWidth="1.5" />
      <text x="10" y="13" textAnchor="middle" fontSize="8" fontFamily="Oswald" fontWeight="600" fill="#1E4D8C">M</text>
      <path d="M4 10H2M18 10h-2" stroke="#1E4D8C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )},
];

function QuickComponentPanel() {
  const handleAdd = useCallback((type) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.addComponent) {
      api.addComponent(type, { x: 200 + Math.random() * 100, y: 150 + Math.random() * 80 });
    }
  }, []);

  return (
    <div className={css.quickComponents}>
      <div className={css.panelTitle}>Componenti</div>
      <div className={css.componentGrid}>
        {QUICK_COMPONENTS.map(c => (
          <button
            key={c.type}
            className={css.componentBtn}
            onClick={() => handleAdd(c.type)}
            aria-label={'Aggiungi ' + c.label}
          >
            {c.icon}
            <span className={css.componentLabel}>{c.label}</span>
          </button>
        ))}
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
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lavagnaState, setLavagnaState] = useState(STATES.CLEAN);
  const [hasExperiment, setHasExperiment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const manualOverridesRef = useRef({});
  const apiReadyRef = useRef(false);

  // Poll for __ELAB_API availability (simulator may mount async)
  useEffect(() => {
    const check = setInterval(() => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api && !apiReadyRef.current) {
        apiReadyRef.current = true;

        // Listen for experiment changes
        api.on?.('experimentChange', (data) => {
          if (data?.title) setExperimentName(data.title);
          if (data?.totalSteps != null) setTotalSteps(data.totalSteps);
          if (data?.currentStep != null) setCurrentStep(data.currentStep);
        });

        // Listen for state changes (play/pause)
        api.on?.('stateChange', (data) => {
          if (data?.running != null) setIsPlaying(data.running);
        });
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  // ── State machine: auto-manage panels ──
  useEffect(() => {
    const newState = deriveState({ hasExperiment, isPlaying, isEditing });
    if (newState !== lavagnaState) {
      setLavagnaState(newState);
      const panels = computePanelActions(newState,
        { leftPanel: leftPanelOpen, bottomPanel: bottomPanelOpen, galileo: galileoOpen, toolbar: true },
        manualOverridesRef.current
      );
      setLeftPanelOpen(panels.leftPanel);
      setBottomPanelOpen(panels.bottomPanel);
      setGalileoOpen(panels.galileo);
    }
  }, [hasExperiment, isPlaying, isEditing, lavagnaState, leftPanelOpen, bottomPanelOpen, galileoOpen]);

  // Track manual overrides when user explicitly toggles a panel
  const toggleLeftPanel = useCallback(() => {
    manualOverridesRef.current.leftPanel = true;
    setLeftPanelOpen(p => !p);
  }, []);
  const toggleBottomPanel = useCallback(() => {
    manualOverridesRef.current.bottomPanel = true;
    setBottomPanelOpen(p => !p);
  }, []);

  // ── Toolbar actions via __ELAB_API ──
  const handleToolChange = useCallback((tool) => {
    setActiveTool(tool);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api) return;

    switch (tool) {
      case 'delete': {
        // Delete selected components
        const selected = api.getSelected?.();
        if (selected?.length) {
          selected.forEach(id => api.removeComponent?.(id));
        }
        setActiveTool('select');
        break;
      }
      case 'undo': api.undo?.(); setActiveTool('select'); break;
      case 'redo': api.redo?.(); setActiveTool('select'); break;
      default: break;
    }
  }, []);

  // ── Header actions ──
  const handlePlay = useCallback(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api) return;
    if (isPlaying) {
      api.pause?.();
    } else {
      api.play?.();
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
    // Reset manual overrides when loading new experiment
    manualOverridesRef.current = {};
  }, []);

  // ── Galileo toggle (also from header) ──
  const toggleGalileo = useCallback(() => {
    setGalileoOpen(prev => !prev);
  }, []);

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
        onPlay={handlePlay}
        isPlaying={isPlaying}
        onMenuOpen={handleMenuOpen}
        onPickerOpen={handlePickerOpen}
        onGalileoToggle={toggleGalileo}
        galileoOpen={galileoOpen}
        onVideoToggle={toggleVideo}
        videoOpen={videoOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showClasseTab={isDocente}
        showProgressiTab={isStudente}
      />

      <div className={css.body}>
        {/* === LAVAGNA VIEW (simulatore + pannelli) === */}
        <div className={css.lavagnaView} style={{ display: activeTab === 'lavagna' ? 'contents' : 'none' }}>
          {/* Left panel — quick component palette */}
          <RetractablePanel
            id="lavagna-left"
            direction="left"
            open={leftPanelOpen}
            onToggle={toggleLeftPanel}
            defaultSize={180}
            minSize={140}
            maxSize={280}
          >
            <QuickComponentPanel />
          </RetractablePanel>

          {/* Center — simulator canvas + floating toolbar */}
          <main className={css.canvas}>
            <Suspense fallback={
              <div className={css.loading}>
                <span>Caricamento simulatore...</span>
              </div>
            }>
              <NewElabSimulator />
            </Suspense>

            <FloatingToolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
              abovePanel={bottomPanelOpen}
            />
          </main>

          {/* Right — Galileo AI in FloatingWindow */}
          <GalileoAdapter
            visible={galileoOpen}
            onClose={() => setGalileoOpen(false)}
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
        >
          <div className={css.bottomPlaceholder}>
            <span>Il pannello codice e integrato nel simulatore</span>
          </div>
        </RetractablePanel>
      )}

      {/* Experiment Picker Modal */}
      <ExperimentPicker
        open={pickerOpen}
        onClose={handlePickerClose}
        onSelect={handleExperimentSelect}
      />
    </div>
  );
}
