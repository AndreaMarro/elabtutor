// ELAB Tutor - © Andrea Marro — 08/02/2026
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.jsx'
import { initCodeProtection } from './utils/codeProtection.js'
import studentTracker from './services/studentTracker.js'
import './index.css'
import './styles/design-system.css'
import './styles/accessibility-fixes.css'  // WCAG 2.1 AA — DO NOT REMOVE

import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

// Polyfill Buffer for @react-pdf/renderer
window.Buffer = Buffer

// Polyfill mobile drag and drop for touch devices
polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});
window.addEventListener('touchmove', function () { }, { passive: false });

// Anti-tampering (solo produzione)
initCodeProtection()

// Student activity tracker — persiste dati reali in localStorage
studentTracker.init()

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
