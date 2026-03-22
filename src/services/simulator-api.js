/**
 * ELAB Simulator — Public API for MCP/AI integration
 * (c) Andrea Marro — 28/02/2026 — ELAB Tutor — Tutti i diritti riservati
 * Provides a global window.__ELAB_API object for external systems to interact
 * with the simulator programmatically.
 *
 * Includes UNLIM AI bridge (highlight, serialWrite, callbacks),
 * pub/sub event system, and full simulation control.
 *
 * Usage from MCP/external:
 *   window.__ELAB_API.loadExperiment('v1-cap6-primo-circuito')
 *   window.__ELAB_API.getExperimentList()
 *   window.__ELAB_API.captureScreenshot()
 *   window.__ELAB_API.askUNLIM('Spiega questo circuito')
 *   window.__ELAB_API.unlim.highlightComponent(['led1', 'r1'])
 *   window.__ELAB_API.on('stateChange', console.log)
 *
 * © Andrea Marro — 12/02/2026
 */

import { findExperimentById, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../data/experiments-index';
import { sendChat, analyzeImage, compileCode } from './api';
import { captureWhiteboardScreenshot } from '../utils/whiteboardScreenshot';

/**
 * Internal reference to the simulator instance (set by NewElabSimulator)
 */
let _simulatorRef = null;

/**
 * Register the simulator instance for API access
 * Called by NewElabSimulator on mount
 */
export function registerSimulatorInstance(instance) {
  _simulatorRef = instance;
  // FIX P0-8: Guard against duplicate registration (React StrictMode double-mount)
  if (typeof window !== 'undefined' && !window.__ELAB_API) {
    window.__ELAB_API = createPublicAPI();
  } else if (typeof window !== 'undefined') {
    // Update internal ref without re-creating the API object
  }
}

/**
 * Unregister on unmount
 */
export function unregisterSimulatorInstance() {
  _simulatorRef = null;
  if (typeof window !== 'undefined') {
    delete window.__ELAB_API;
    delete window.__ELAB_EVENTS;
  }
}

/**
 * Create the public API object
 */
function createPublicAPI() {
  const totalExperiments = [EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3]
    .reduce((total, volume) => total + (volume?.experiments?.length || 0), 0);

  return {
    // ─── Info ───
    version: '1.0.0',
    name: 'ELAB Simulator API',

    // ─── Experiment Management ───

    /**
     * Get list of all experiments grouped by volume
     * @returns {Promise<Object>} { vol1: [...], vol2: [...], vol3: [...] }
     */
    getExperimentList() {
      const format = (vol) => vol.experiments.map(e => ({
        id: e.id,
        title: e.title,
        chapter: e.chapter,
        difficulty: e.difficulty,
        mode: e.simulationMode,
        hasCode: !!e.code,
        concept: e.concept,
      }));
      return {
        vol1: format(EXPERIMENTS_VOL1),
        vol2: format(EXPERIMENTS_VOL2),
        vol3: format(EXPERIMENTS_VOL3),
      };
    },

    /**
     * Get full experiment data by ID
     * @param {string} experimentId - e.g. 'v1-cap6-primo-circuito'
     * @returns {Object|null} Full experiment object
     */
    getExperiment(experimentId) {
      return findExperimentById(experimentId) || null;
    },

    /**
     * Load an experiment into the simulator
     * @param {string} experimentId
     * @returns {boolean} success
     */
    loadExperiment(experimentId) {
      if (!_simulatorRef?.selectExperiment) return false;
      const exp = findExperimentById(experimentId);
      if (!exp) return false;
      _simulatorRef.selectExperiment(exp);
      return true;
    },

    /**
     * Get current experiment info
     * @returns {Object|null}
     */
    getCurrentExperiment() {
      return _simulatorRef?.getCurrentExperiment?.() || null;
    },

    // ─── Simulation Control ───

    /**
     * Start simulation
     */
    play() {
      _simulatorRef?.play?.();
    },

    /**
     * Pause simulation
     */
    pause() {
      _simulatorRef?.pause?.();
    },

    /**
     * Reset simulation
     */
    reset() {
      _simulatorRef?.reset?.();
    },

    /**
     * Get current component states
     * @returns {Object} componentId -> state
     */
    getComponentStates() {
      return _simulatorRef?.getComponentStates?.() || {};
    },

    /**
     * Interact with a component (press button, set pot value, etc.)
     * @param {string} componentId
     * @param {string} action - 'press', 'release', 'toggle', 'setPosition', 'setLightLevel'
     * @param {*} value - optional value for setPosition/setLightLevel
     */
    interact(componentId, action, value) {
      _simulatorRef?.interact?.(componentId, action, value);
    },

    /**
     * Add a custom wire to the layout
     * @param {string} fromPin - format "componentId:pinId"
     * @param {string} toPin - format "componentId:pinId"
     */
    addWire(fromPin, toPin) {
      _simulatorRef?.addWire?.(fromPin, toPin);
    },

    /**
     * Remove a wire by its numerical index
     * @param {number} index
     */
    removeWire(index) {
      _simulatorRef?.removeWire?.(index);
    },

    /**
     * Add a custom component to the specific coordinates
     * @param {string} type 
     * @param {Object} position - {x, y}
     * @returns {string|null} The generated component ID
     */
    addComponent(type, position) {
      return _simulatorRef?.addComponent?.(type, position) || null;
    },

    /**
     * Remove a component by ID
     * @param {string} id
     */
    removeComponent(id) {
      _simulatorRef?.removeComponent?.(id);
    },

    // ─── UNLIM ONNIPOTENTE: Extended breadboard manipulation ───

    /**
     * Move a component to new coordinates
     * @param {string} componentId
// © Andrea Marro — 22/03/2026 — ELAB Tutor — Tutti i diritti riservati
     * @param {number} x - horizontal position
     * @param {number} y - vertical position
     */
    moveComponent(componentId, x, y) {
      _simulatorRef?.moveComponent?.(componentId, x, y);
    },

    /**
     * Clear all custom components, connections, and layout
     * Saves an undo snapshot before clearing
     */
    clearAll() {
      _simulatorRef?.clearAll?.();
    },

    /**
     * Get positions of all components in current experiment
     * @returns {Object} componentId -> { x, y, type }
     */
    getComponentPositions() {
      return _simulatorRef?.getComponentPositions?.() || {};
    },

    /**
     * Get full layout info (components, connections, layout)
     * @returns {Object} { components, connections, layout }
     */
    getLayout() {
      return _simulatorRef?.getLayout?.() || {};
    },

    // ─── Screenshot & AI ───

    /**
     * Capture a screenshot of the current canvas
     * @returns {Promise<string|null>} base64 PNG data URL or null
     */
    async captureScreenshot() {
      const whiteboardShot = captureWhiteboardScreenshot();
      if (whiteboardShot.dataUrl) return whiteboardShot.dataUrl;

      const svgEl = document.querySelector('.elab-simulator-canvas svg');
      if (!svgEl) return null;

      try {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        canvas.width = Math.min(img.width || 800, 1200);
        canvas.height = Math.min(img.height || 600, 900);
        ctx.fillStyle = '#FAFAF7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        return dataUrl;
      } catch {
        return null;
      }
    },

    /**
     * Ask UNLIM AI about the current experiment
     * @param {string} customPrompt - Optional custom prompt (overrides unlimPrompt)
     * @returns {Promise<Object>} { success, response, source }
     */
    async askUNLIM(customPrompt = null) {
      const exp = _simulatorRef?.getCurrentExperiment?.();
      const prompt = customPrompt || exp?.unlimPrompt ||
        `Spiega l'esperimento "${exp?.title || 'corrente'}" in modo semplice per bambini.`;

      // Try to capture screenshot
      const screenshot = await this.captureScreenshot();
      const images = screenshot
        ? [{ base64: screenshot.split(',')[1], mimeType: 'image/png' }]
        : [];

      return await sendChat(prompt, images);
    },

    /**
     * Send an image to UNLIM for analysis
     * @param {string} imageDataUrl - data:image/png;base64,...
     * @param {string} question
     * @returns {Promise<Object>}
     */
    async analyzeImage(imageDataUrl, question) {
      return await analyzeImage(imageDataUrl, question);
    },

    // ─── Compilation ───

    /**
     * Compile Arduino code
     * @param {string} code - Arduino .ino code
     * @param {string} board - FQBN (default: arduino:avr:nano)
     * @returns {Promise<Object>} { success, hex, errors, output }
     */
    async compile(code, board = 'arduino:avr:nano:cpu=atmega328old') {
      return await compileCode(code, board);
    },

    /**
     * Get current editor code
     * @returns {string|null}
     */
    getEditorCode() {
      return _simulatorRef?.getEditorCode?.() || null;
    },

    /**
     * Set editor code
     * @param {string} code
     */
    setEditorCode(code) {
      _simulatorRef?.setEditorCode?.(code);
    },

    // ─── S76: Editor Control (Scratch Universale) ───

    /**
     * Show the code editor panel
     */
    showEditor() {
      _simulatorRef?.showEditor?.();
    },

    /**
     * Hide the code editor panel
     */
    hideEditor() {
      _simulatorRef?.hideEditor?.();
    },

    /**
     * Switch editor mode
     * @param {string} mode - 'arduino' or 'scratch'
     */
    setEditorMode(mode) {
      _simulatorRef?.setEditorMode?.(mode);
    },

    /**
     * Get current editor mode
     * @returns {string} 'arduino' or 'scratch'
     */
    getEditorMode() {
      return _simulatorRef?.getEditorMode?.() || 'arduino';
    },

    /**
     * Check if editor is visible
     * @returns {boolean}
     */
    isEditorVisible() {
      return _simulatorRef?.isEditorVisible?.() || false;
    },

    /**
     * Load a Blockly workspace XML and switch to Scratch mode
     * @param {string} xml - Blockly workspace XML
     */
    loadScratchWorkspace(xml) {
      _simulatorRef?.loadScratchWorkspace?.(xml);
    },

    // ─── S115: UNLIM Onnipotente v2 — Extended Control ───

    /** Undo last action */
    undo() { _simulatorRef?.undo?.(); },

    /** Redo last undone action */
    redo() { _simulatorRef?.redo?.(); },

    /** @returns {boolean} Whether undo is available */
    canUndo() { return _simulatorRef?.canUndo?.() || false; },

    /** @returns {boolean} Whether redo is available */
    canRedo() { return _simulatorRef?.canRedo?.() || false; },

    /**
     * Highlight specific pins on the canvas
     * @param {string|string[]} pinRefs - e.g. "r1:pin1" or ["r1:pin1", "led1:anode"]
     */
    highlightPin(pinRefs) {
      const refs = Array.isArray(pinRefs) ? pinRefs : [pinRefs];
      _simulatorRef?.highlightPin?.(refs);
    },
// © Andrea Marro — 22/03/2026 — ELAB Tutor — Tutti i diritti riservati

    /**
     * Write text to the serial monitor (AVR experiments)
     * @param {string} text
     */
    serialWrite(text) { _simulatorRef?.serialWrite?.(text); },

    /**
     * Switch build mode
     * @param {string} mode - 'complete' | 'guided' | 'sandbox'
     */
    setBuildMode(mode) { _simulatorRef?.setBuildMode?.(mode); },

    /** @returns {string|false} Current build mode */
    getBuildMode() { return _simulatorRef?.getBuildMode?.() || false; },

    /** Advance to next build step (Passo Passo) */
    nextStep() { _simulatorRef?.nextStep?.(); },

    /** Go back to previous build step (Passo Passo) */
    prevStep() { _simulatorRef?.prevStep?.(); },

    /** @returns {number} Current build step index */
    getBuildStepIndex() { return _simulatorRef?.getBuildStepIndex?.() ?? -1; },

    /** Show the Bill of Materials panel */
    showBom() { _simulatorRef?.showBom?.(); },

    /** Hide the Bill of Materials panel */
    hideBom() { _simulatorRef?.hideBom?.(); },

    /** Show the serial monitor (opens editor + switches to monitor tab) */
    showSerialMonitor() { _simulatorRef?.showSerialMonitor?.(); },

    /** @returns {boolean} Whether simulation is running */
    isSimulating() { return _simulatorRef?.isSimulating?.() || false; },

    /** @returns {string} 'running' or 'stopped' */
    getSimulationStatus() { return _simulatorRef?.getSimulationStatus?.() || 'stopped'; },

    // ─── S115: Code Control — UNLIM writes/reads Arduino code ───

    /**
     * Append code to the existing editor content
     * @param {string} code - Code to append
     */
    appendEditorCode(code) { _simulatorRef?.appendEditorCode?.(code); },

    /**
     * Reset editor code to experiment's original code
     */
    resetEditorCode() { _simulatorRef?.resetEditorCode?.(); },

    /**
     * Get the experiment's original code (before user edits)
     * @returns {string}
     */
    getExperimentOriginalCode() { return _simulatorRef?.getExperimentOriginalCode?.() || ''; },

    // ─── S104: Unified Simulator Context for UNLIM ───

    /**
     * Get full simulator context as a compact JSON payload.
     * Includes experiment, build mode, editor mode, components, wires,
     * simulation state, and last compilation result.
     * @returns {Object} Comprehensive simulator snapshot for UNLIM
     */
    getSimulatorContext() {
      const circuitState = _simulatorRef?.getCircuitState?.() || {};
      const compilationSnapshot = _simulatorRef?.getCompilationSnapshot?.() || {};
      const exp = circuitState.experiment || {};

      // Build step phase detection (hardware vs code)
      const buildStepIndex = circuitState.buildStepIndex ?? -1;
      const buildStepTotal = circuitState.buildStepTotal ?? 0;
      let buildPhase = 'none';
      if (buildStepIndex >= 0 && buildStepTotal > 0) {
        // If build step index exceeds hardware steps count, we're in code phase
        buildPhase = 'hardware'; // default — could be refined with scratchSteps info
      }

      // Compact component list
      const components = (circuitState.components || []).map(c => ({
        type: c.type,
        id: c.id,
        placed: true,
        ...(c.state?.on !== undefined ? { on: c.state.on } : {}),
        ...(c.state?.brightness > 0 ? { brightness: c.state.brightness } : {}),
        ...(c.state?.value !== undefined ? { value: c.state.value } : {}),
      }));

      // Compact wire list
      const wires = (circuitState.connections || []).map(c => ({
        from: c.from,
        to: c.to,
      }));

      // Compilation result
      let lastCompilation = null;
      if (compilationSnapshot.status && compilationSnapshot.status !== 'idle') {
        lastCompilation = {
          success: compilationSnapshot.status === 'success',
          ...(compilationSnapshot.size ? {
            size: `${compilationSnapshot.size.bytes}/${compilationSnapshot.size.total} bytes (${compilationSnapshot.size.percent}%)`
          } : {}),
          errors: compilationSnapshot.errors ? [compilationSnapshot.errors] : [],
          warnings: compilationSnapshot.warnings ? [compilationSnapshot.warnings] : [],
        };
      }

      return {
        experiment: {
          id: exp.id || null,
          name: exp.title || null,
          volume: exp.volume || null,
          chapter: exp.chapter || null,
          simulationMode: circuitState.status === 'avr' ? 'avr' : (exp.id?.startsWith('v3') ? 'avr' : 'circuit'),
        },
        buildMode: circuitState.buildMode || 'mounted',
        buildStep: buildStepTotal > 0 ? {
          current: buildStepIndex + 1,
          total: buildStepTotal,
          phase: buildPhase,
        } : null,
        editorMode: _simulatorRef?.getEditorMode?.() || 'arduino',
        editorVisible: _simulatorRef?.isEditorVisible?.() || false,
        components,
        wires,
        simulation: {
          state: circuitState.isSimulating ? 'running' : 'stopped',
        },
        lastCompilation,
      };
    },

    // ─── UNLIM AI Bridge ───
    /* Andrea Marro — 12/02/2026 */
    unlim: {
      /**
       * Highlight one or more components on the canvas
       * @param {string|string[]} componentIds - e.g. "led1" or ["r1", "led1"]
       */
      highlightComponent(componentIds) {
        const ids = Array.isArray(componentIds) ? componentIds : [componentIds];
        _simulatorRef?.setHighlightedComponents?.(ids);
      },

      /**
       * Highlight one or more pins
       * @param {string|string[]} pinRefs - e.g. "bat1:positive" or ["r1:pin1", "led1:anode"]
       */
      highlightPin(pinRefs) {
        const refs = Array.isArray(pinRefs) ? pinRefs : [pinRefs];
        _simulatorRef?.setHighlightedPins?.(refs);
      },

      /**
       * Clear all highlights (components and pins)
       */
      clearHighlights() {
        _simulatorRef?.setHighlightedComponents?.([]);
        _simulatorRef?.setHighlightedPins?.([]);
      },

      /**
       * Write text to the serial monitor (for AVR experiments)
       * @param {string} text
       */
      serialWrite(text) {
        _simulatorRef?.serialWrite?.(text);
      },

      /**
       * Get full circuit state
       * @returns {Object}
       */
      getCircuitState() {
        // Use the new structured API if available
        return _simulatorRef?.getCircuitState?.() || _simulatorRef?.getComponentStates?.() || {};
      },

      version: '1.0.0',
      info: {
        name: 'ELAB Simulator — UNLIM Bridge',
        author: 'Andrea Marro',
        modes: ['circuit', 'avr'],
        totalExperiments,
      },
    },

    // ─── Events (pub/sub) ───

    /**
     * Listen for simulator events
     * @param {string} event - 'experimentChange', 'stateChange', 'serialOutput', 'componentInteract', 'circuitChange'
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    on(event, callback) {
      if (!window.__ELAB_EVENTS) window.__ELAB_EVENTS = {};
// © Andrea Marro — 22/03/2026 — ELAB Tutor — Tutti i diritti riservati
      if (!window.__ELAB_EVENTS[event]) window.__ELAB_EVENTS[event] = [];
      window.__ELAB_EVENTS[event].push(callback);
      return () => {
        window.__ELAB_EVENTS[event] = window.__ELAB_EVENTS[event].filter(cb => cb !== callback);
      };
    },

    /**
     * Unsubscribe from simulator events
     * @param {string} event
     * @param {Function} callback - the exact function reference passed to on()
     */
    off(event, callback) {
      if (window.__ELAB_EVENTS?.[event]) {
        window.__ELAB_EVENTS[event] = window.__ELAB_EVENTS[event].filter(cb => cb !== callback);
      }
    },
  };
}

/**
 * Emit an event to all listeners
 * @param {string} event
 * @param {*} data
 */
export function emitSimulatorEvent(event, data) {
  if (typeof window !== 'undefined' && window.__ELAB_EVENTS?.[event]) {
    window.__ELAB_EVENTS[event].forEach(cb => {
      try { cb(data); } catch { /* event handler error — silent */ }
    });
  }
}
