// ============================================
// ELAB Tutor V4 - Assistente AI Premium
// Smart container: state + logic + composition
// Rendering extracted to sub-components
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import './ElabTutorV4.css';
import { sendChat, analyzeImage, checkRateLimit, diagnoseCircuit, getExperimentHints } from '../../services/api';
import { getTotalExperiments, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../../data/experiments-index';
import { validateMessage, sanitizeOutput } from '../../utils/contentFilter';
import { galileoMemory } from '../../services/galileoMemory'; // Galileo Onnipotente: persistent memory
import { formatForContext as formatActivityContext, pushActivity } from '../../services/activityBuffer'; // Sprint 1 Context Mastery
import { sessionMetrics } from '../../services/sessionMetrics'; // Sprint 1 Context Mastery: session metrics
import { findVideo, getYouTubeSearchUrl } from '../../data/galileo-videos'; // Galileo Onnipotente: curated YouTube DB
import { TabHint } from './ContextualHints';
import NewElabSimulator from '../simulator/NewElabSimulator';
const CircuitDetective = lazy(() => import('./CircuitDetective'));
const PredictObserveExplain = lazy(() => import('./PredictObserveExplain'));
const ReverseEngineeringLab = lazy(() => import('./ReverseEngineeringLab'));
const CircuitReview = lazy(() => import('./CircuitReview'));
// (projectHistoryService rimosso — usato solo da handleCompile eliminato)
import studentService from '../../services/studentService';
import ConsentBanner from '../common/ConsentBanner';
import { useConfirmModal } from '../common/ConfirmModal';
import TutorLayout from './TutorLayout';
import useIsMobile from '../../hooks/useIsMobile';
import { useAuth } from '../../context/AuthContext';
import { SessionRecorderProvider } from '../../context/SessionRecorderContext';
import ManualTab from './ManualTab';
import CanvasTab from './CanvasTab';
import NotebooksTab from './NotebooksTab';
import VideosTab from './VideosTab';

import PresentationModal from './PresentationModal';
import { loadPdfJs } from './utils/documentConverters';
import logger from '../../utils/logger';
import { captureWhiteboardScreenshot } from '../../utils/whiteboardScreenshot';

/**
 * Extract [INTENT:{...}] tags from text using balanced-brace matching.
 * Unlike regex, this correctly handles nested JSON brackets.
 * @returns {Array<{fullMatch: string, json: string}>}
 */
function extractIntentTags(text) {
    const results = [];
    const marker = '[INTENT:';
    let pos = 0;
    while (pos < text.length) {
        const start = text.indexOf(marker, pos);
        if (start === -1) break;
        const jsonStart = start + marker.length;
        if (text[jsonStart] !== '{') { pos = jsonStart; continue; }
        let depth = 0;
        let end = -1;
        for (let i = jsonStart; i < text.length; i++) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') {
                depth--;
                if (depth === 0) { end = i; break; }
            }
        }
        if (end === -1) break;
        if (text[end + 1] === ']') {
            results.push({
                fullMatch: text.substring(start, end + 2),
                json: text.substring(jsonStart, end + 1)
            });
        }
        pos = (end !== -1) ? end + 2 : jsonStart;
    }
    return results;
}

const TOTAL_EXPERIMENTS = getTotalExperiments();
const VOL1_COUNT = EXPERIMENTS_VOL1?.experiments?.length || 0;
const VOL2_COUNT = EXPERIMENTS_VOL2?.experiments?.length || 0;
const VOL3_COUNT = EXPERIMENTS_VOL3?.experiments?.length || 0;

export default function ElabTutorV4() {
    // ===================== STATE =====================
    const { user, isDocente } = useAuth();
    const { confirm: confirmModal, ConfirmDialog } = useConfirmModal();

    // Chat State
    const [messages, setMessages] = useState([{
        id: 'welcome',
        role: 'assistant',
        content: `**Ciao, sono Galileo**

Ti accompagno nei laboratori ELAB con spiegazioni pratiche e domande guida.

**Da dove vuoi partire?**
▸ **Manuale** — ad esempio: *"apri volume 1 pagina 5"*
▸ **Simulatore** — ${TOTAL_EXPERIMENTS} esperimenti pronti
▸ **Immagine** — inviami una foto del circuito per analizzarla
▸ **Circuit Detective** — prova a trovare il guasto

*Se preferisci, usa i pulsanti rapidi qui sotto.*`
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSocraticMode, setIsSocraticMode] = useState(false);

    // S92: Safety timeout — auto-reset isLoading if stuck for >30s
    useEffect(() => {
        if (!isLoading) return;
        const timeout = setTimeout(() => {
            console.warn('[Galileo] isLoading stuck for 30s — auto-resetting');
            setIsLoading(false);
        }, 30000);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    // (CodePanel rimosso — editor Arduino eliminato)

    // Context Panel State
    const [activeTab, _setActiveTab] = useState('manual');
    const setActiveTab = useCallback((tab) => {
      _setActiveTab(prev => { if (prev !== tab) pushActivity('tab_switch', `${prev}→${tab}`); return tab; });
    }, []);
    const [pendingExperimentId, setPendingExperimentId] = useState(null);
    const [pdfZoom, setPdfZoom] = useState(1);
    const [fitMode, setFitMode] = useState('width');

    // UI Visibility State
    const [showChat, setShowChat] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Preloaded Volumes State
    const [volumePages, setVolumePages] = useState({ 1: [], 2: [], 3: [] });
    const [loadingVolume, setLoadingVolume] = useState(null);
    const [volumeProgress, setVolumeProgress] = useState(null); // S112: download progress 0-100
    const [selectedVolume, setSelectedVolume] = useState(null);

    // Document Viewer State
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [currentDocPage, setCurrentDocPage] = useState(0);
    const [viewMode, setViewMode] = useState('manual');
    const docViewerRef = useRef(null);

    // Canvas refs (shared with CanvasTab)
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    // YouTube + Meet state (shared with VideosTab)
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [meetLink, setMeetLink] = useState('');
    const [meetActive, setMeetActive] = useState(false);
    const [meetCopied, setMeetCopied] = useState(false);

    // AbortController for analyzeImage — cancels previous in-flight request (race condition fix)
    const analyzeAbortRef = useRef(null);

    // GALILEO PERVASIVO: Live circuit state from NewElabSimulator (ref = no re-render)
    // Updated via onCircuitStateChange callback, read when user sends chat message
    const circuitStateRef = useRef(null);

    // Active Experiment (for AI context) — MUST be declared before useCallbacks that depend on it
    const [activeExperiment, setActiveExperiment] = useState(null);

    // ── GALILEO ONNIPOTENTE: Tracking refs ──
    const interactionHistoryRef = useRef([]); // last N user interactions with circuit
    const errorHistoryRef = useRef([]);       // recent circuit errors (polarita, short, etc.)
    const sessionStartRef = useRef(Date.now());
    // ── Session Report: refs passed to simulator for PDF generation ──
    const messagesForReportRef = useRef([]);
    const quizResultsForReportRef = useRef(null);
    useEffect(() => { messagesForReportRef.current = messages; }, [messages]);
    const buildStepIndexRef = useRef(-1);
    const inactivityTimerRef = useRef(null);
    const proactiveCooldownRef = useRef(0); // prevent spam: last proactive auto-send timestamp

    // Sprint 1 Context Mastery: track tab switches
    const prevTabRef = useRef(activeTab);
    useEffect(() => {
        if (activeTab !== prevTabRef.current) {
            pushActivity('tab_switch', activeTab);
            prevTabRef.current = activeTab;
        }
    }, [activeTab]);

    // ── GALILEO ONNIPOTENTE: Experiment change handler with memory tracking ──
    const handleExperimentChange = useCallback((experiment) => {
        setActiveExperiment(experiment);
        // Track in persistent memory
        if (experiment?.id) {
            try { galileoMemory.trackExperimentCompletion(experiment.id, 'loaded'); } catch { /* silent */ }
        }
    }, []);

    // GALILEO PERVASIVO: Proactive event handler — Galileo intervenes on circuit events
    // Called by NewElabSimulator when critical events happen (LED burned, high current, etc.)
    // S58 FIX: Anti-spam — deduplicate messages, longer cooldowns, suppress repeated success msgs
    const lastProactiveRef = useRef({ message: '', timestamp: 0 }); // dedup tracker
    const handleCircuitEvent = useCallback((event) => {
        if (!event?.message) return;

        // ── GALILEO ONNIPOTENTE: Track interaction history ──
        interactionHistoryRef.current.push({
            type: event.type || 'event',
            summary: `${event.type || 'event'}:${event.componentId || ''}`,
            timestamp: Date.now(),
        });
        if (interactionHistoryRef.current.length > 20) {
            interactionHistoryRef.current = interactionHistoryRef.current.slice(-20);
        }
        // Track errors specifically
        if (event.type === 'burnout' || event.type === 'short-circuit' || event.type === 'high-current') {
            errorHistoryRef.current.push(`${event.type}:${event.componentId || ''}`);
            if (errorHistoryRef.current.length > 10) {
                errorHistoryRef.current = errorHistoryRef.current.slice(-10);
            }
            // Track mistake in persistent memory
            try { galileoMemory.trackMistake(event.type, `${event.componentId || 'unknown'}: ${(event.message || '').slice(0, 80)}`); } catch { /* silent */ }
        }

        // ── S58 FIX: Anti-spam deduplication ──
        // Suppress identical messages within 30s, and success events ("LED acceso", "Bravo") within 120s
        const now = Date.now();
        const msgKey = event.message.slice(0, 50); // first 50 chars as dedup key
        const isSuccess = /bravo|funziona|acceso|accendi/i.test(event.message);
        const dedupWindow = isSuccess ? 120000 : 30000; // 2min for success, 30s for errors
        if (msgKey === lastProactiveRef.current.message && now - lastProactiveRef.current.timestamp < dedupWindow) {
            return; // Skip duplicate — already shown recently
        }
        lastProactiveRef.current = { message: msgKey, timestamp: now };

        // ── GALILEO ONNIPOTENTE (Fase 6): Proactive auto-diagnosis on critical errors ──
        // After showing the built-in event message, auto-send to AI for deeper analysis
        // S58 FIX: Increased cooldown 10s → 60s to prevent diagnosis spam
        if ((event.type === 'burnout' || event.type === 'short-circuit' || event.type === 'high-current') &&
            now - proactiveCooldownRef.current > 60000) { // 60s cooldown between auto-diagnoses
            proactiveCooldownRef.current = now;
            setTimeout(() => {
                const autoMsg = `[EVENTO CIRCUITO: ${event.type} su ${event.componentId || 'componente'}] Analizza questo errore del circuito e aiuta lo studente a capire cosa è andato storto e come correggere.`;
                handleSend(autoMsg);
            }, 2000); // 2s delay so user sees the event first
        }

        // Add Galileo's proactive message to chat
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: event.message,
            proactive: true, // Mark as proactive (not user-triggered)
        }]);
        // S92: Only auto-open chat for critical events (burnout, short-circuit, high-current).
        // Non-critical events add the message silently — user sees notification badge.
        if (event.type === 'burnout' || event.type === 'short-circuit' || event.type === 'high-current') {
            setShowChat(true);
        }
    }, []);

    // ── GALILEO ONNIPOTENTE: YouTube search handler (curated DB + fallback) ──
    const handleYouTubeSearch = useCallback((query) => {
        // Try curated video DB first
        const curated = findVideo(query);
        if (curated) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: `🎬 Ho trovato un video perfetto su **${curated.topic}**: "${curated.title}" di ${curated.channel}`,
                proactive: true,
                youtubeSearch: { url: curated.url, query: curated.title, curated: true },
            }]);
        } else {
            // Fallback: YouTube search URL
            const searchUrl = getYouTubeSearchUrl(query);
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: `Ecco, ho cercato "${query}" su YouTube per te!`,
                proactive: true,
                youtubeSearch: { url: searchUrl, query: query },
            }]);
        }
    }, []);

    // MCP Tool: diagnoseCircuit — proactive circuit diagnosis via nanobot
    const handleDiagnoseCircuit = useCallback(async () => {
        const state = circuitStateRef.current?.text || circuitStateRef.current;
        if (!state) {
            setMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: '🔍 Non c\'è un circuito attivo da analizzare. Apri un esperimento nel simulatore e costruisci qualcosa!',
                proactive: true,
            }]);
            setShowChat(true);
            return;
        }
        setIsLoading(true);
        setShowChat(true);
        try {
            const result = await diagnoseCircuit(
                circuitStateRef.current?.structured || state,
                activeExperiment?.id
            );
            if (result?.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(), role: 'assistant',
                    content: `🔍 **Diagnosi Circuito**\n\n${result.diagnosis}`,
                    proactive: true,
                }]);
            } else {
                // Fallback: ask Galileo via chat
                const fallbackMsg = 'Analizza il mio circuito e dimmi se ci sono errori di cablaggio, polarità o componenti mancanti. Dai una diagnosi con voto da 1 a 5 stelle.';
                setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: fallbackMsg }]);
                const chatResult = await sendChat(fallbackMsg, [], { experimentContext: state, experimentId: activeExperiment?.id || null });
                if (chatResult.success) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1, role: 'assistant',
                        content: sanitizeOutput(typeof chatResult.response === 'string' ? chatResult.response : JSON.stringify(chatResult.response)),
                    }]);
                }
            }
        } catch { /* diagnose/chat error — silent */ }
        setIsLoading(false);
    }, [activeExperiment]);

    // MCP Tool: getExperimentHints — progressive hints via nanobot
    const handleGetHints = useCallback(async () => {
        if (!activeExperiment?.id) {
            setMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: '💡 Seleziona un esperimento nel simulatore per ricevere suggerimenti mirati!',
                proactive: true,
            }]);
            setShowChat(true);
            return;
        }
        setIsLoading(true);
        setShowChat(true);
        try {
            const result = await getExperimentHints(activeExperiment.id);
            if (result?.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(), role: 'assistant',
                    content: `💡 **Suggerimenti per "${activeExperiment.title || activeExperiment.id}"**\n\n${result.hints}`,
                    proactive: true,
                }]);
            } else {
                // Fallback: ask Galileo via chat
                const fallbackMsg = `Dammi 3 suggerimenti progressivi per l'esperimento "${activeExperiment.title || activeExperiment.id}": uno leggero (domanda guida), uno medio (indizio concreto), uno diretto (soluzione passo passo).`;
                setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: fallbackMsg }]);
                const chatResult = await sendChat(fallbackMsg, [], { socraticMode: true, experimentId: activeExperiment?.id || null });
                if (chatResult.success) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1, role: 'assistant',
                        content: sanitizeOutput(typeof chatResult.response === 'string' ? chatResult.response : JSON.stringify(chatResult.response)),
                    }]);
                }
            }
        } catch { /* hints/chat error — silent */ }
        setIsLoading(false);
    }, [activeExperiment]);

    // Video/Slide State
    const [slides, setSlides] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    // Google Meet State

    // Session Recording State
    const [sessionLog, setSessionLog] = useState([]);
    const sessionStartTime = useRef(Date.now());


    // Notebooks State
    const [notebooks, setNotebooks] = useState([]);
    const [notebookTitle, setNotebookTitle] = useState('');
    const [activeNotebookId, setActiveNotebookId] = useState(null);
    const [activePageIndex, setActivePageIndex] = useState(0);

    // YouTube helpers
    const addYoutubeVideo = useCallback(() => {
        const match = youtubeUrl.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) { setCurrentVideoId(match[1]); setYoutubeUrl(''); }
    }, [youtubeUrl]);

    // Google Meet helpers
    const startMeet = useCallback(() => {
        if (meetLink.trim()) { setMeetActive(true); }
    }, [meetLink]);
    const joinMeet = useCallback(() => {
        if (meetLink.trim()) window.open(meetLink, '_blank', 'noopener');
    }, [meetLink]);
    const copyMeetLink = useCallback(() => {
        navigator.clipboard.writeText(meetLink).then(() => {
            setMeetCopied(true);
            setTimeout(() => setMeetCopied(false), 2000);
        }).catch(() => { });
    }, [meetLink]);
    const stopMeet = useCallback(() => {
        setMeetActive(false); setMeetLink('');
    }, []);

    const getStoredCurrentUser = useCallback(() => {
        try {
            const raw = sessionStorage.getItem('elab_current_user') || localStorage.getItem('elab_current_user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    const getCurrentUserId = useCallback(() => {
        return user?.id || getStoredCurrentUser()?.id || 'anonymous';
    }, [getStoredCurrentUser, user?.id]);

    // ===================== EFFECTS =====================

    // Content protection (light) - © Andrea Marro 2026
    useEffect(() => {
        const handleCopy = (e) => {
            const el = e.target;
            if (el.closest('.v4-manual') || el.closest('.v4-pdf-viewer')) {
                e.preventDefault();
                e.clipboardData?.setData('text/plain', '© ELAB Tutor - Contenuto protetto');
            }
        };
        const handleDragStart = (e) => {
            if (e.target.tagName?.toLowerCase() === 'img' && e.target.closest('.v4-manual')) {
                e.preventDefault();
            }
        };
        document.addEventListener('copy', handleCopy);
        document.addEventListener('dragstart', handleDragStart);
        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    // Load notebooks from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('elab-notebooks');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                parsed = parsed.map(n => ({ ...n, pages: n.pages || [n.data] }));
                setNotebooks(parsed);
            } catch { /* corrupt localStorage — ignore */ }
        }
    }, []);

    // Slides persistence
    useEffect(() => {
        const saved = localStorage.getItem('elab_tutor_slides');
        if (saved) {
            try { setSlides(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (slides.length > 0) {
            localStorage.setItem('elab_tutor_slides', JSON.stringify(slides));
        }
    }, [slides]);

    // Fullscreen event listener
    useEffect(() => {
        const handler = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            // S92: Don't force-open chat on fullscreen exit — let user decide
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // ── GALILEO ONNIPOTENTE: Persistent memory — save session summary on unload ──
    useEffect(() => {
        const handleBeforeUnload = () => {
            try {
                const chatCount = messages.filter(m => m.id !== 'welcome').length;
                if (chatCount < 2) return; // no meaningful session
                const lastMsg = messages[messages.length - 1];
                const duration = Math.round((Date.now() - sessionStartRef.current) / 60000);
                const expName = activeExperiment?.title || activeExperiment?.id || 'nessuno';
                const summary = `${chatCount} msg, ${duration}min, esp: ${expName}, ultimo: ${(lastMsg?.content || '').slice(0, 60)}`;
                galileoMemory.saveSessionSummary(summary);
                // Track experiment if one was active
                if (activeExperiment?.id) {
                    galileoMemory.trackExperimentCompletion(activeExperiment.id, 'session-end');
                }
            } catch { /* silent — never block page unload */ }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [messages, activeExperiment]);

    // ── GALILEO ONNIPOTENTE (Fase 5): Backend memory sync — init on mount ──
    useEffect(() => {
        try { galileoMemory.initSync(); } catch { /* silent — backend sync is optional */ }
    }, []);

    // ── GALILEO ONNIPOTENTE (Fase 6): Inactivity nudge ──
    // If >120s without chat interaction and an experiment is loaded, Galileo offers help
    useEffect(() => {
        if (!activeExperiment) return;
        // Reset timer on every new message
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            // Only nudge if chat is open and there are components loaded
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            const states = api?.getComponentStates?.() || {};
            if (Object.keys(states).length === 0) return; // empty board, don't bother
            setMessages(prev => {
                // Don't add if last message is already a proactive nudge
                const last = prev[prev.length - 1];
                if (last?.proactive && last?.content?.includes('Tutto bene')) return prev;
                return [...prev, {
                    id: Date.now(),
                    role: 'assistant',
                    content: `💡 Tutto bene? Stai lavorando su **${activeExperiment?.title || 'questo esperimento'}**. Se hai bisogno di aiuto, chiedimi pure! Posso spiegarti il circuito, avviare la simulazione, o darti un suggerimento.`,
                    proactive: true,
                }];
            });
            // S92: Don't force-open chat — nudge message visible via notification badge
        }, 120000); // 2 minutes
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [messages.length, activeExperiment]);

    // ===================== SESSION LOGGING =====================

    const SESSION_LOG_KEY = 'elab_session_log';
    const studentSessionId = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(SESSION_LOG_KEY);
            if (saved) setSessionLog(JSON.parse(saved));
        } catch { }
        try {
            const userId = getCurrentUserId();
            studentSessionId.current = studentService.startSession(userId);
            return () => {
                if (studentSessionId.current) {
                    studentService.endSession(userId, studentSessionId.current);
                }
            };
        } catch { }
    }, [getCurrentUserId]);

    const logSession = useCallback((type, data) => {
        const entry = {
            time: Date.now() - sessionStartTime.current,
            timestamp: new Date().toLocaleTimeString('it-IT'),
            type,
            data
        };
        setSessionLog(prev => {
            const updated = [...prev, entry];
            try {
                localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(updated.slice(-500)));
            } catch { }
            return updated;
        });
        try {
            const userId = getCurrentUserId();
            if (studentSessionId.current) {
                studentService.logActivity(userId, studentSessionId.current, {
                    tipo: type,
                    dettaglio: JSON.stringify(data).substring(0, 200)
                });
            }
        } catch { }
    }, [getCurrentUserId]);

    useEffect(() => {
        if (messages.length > 1) {
            const last = messages[messages.length - 1];
            if (last.id !== 'welcome') {
                logSession(last.role === 'user' ? 'chat-user' : 'chat-ai', {
                    content: typeof last.content === 'string' ? last.content.substring(0, 200) : ''
                });
            }
        }
    }, [messages.length]);

    useEffect(() => {
        logSession('tab-change', { tab: activeTab });
    }, [activeTab]);

    const exportSession = () => {
        const sessionData = {
            exportDate: new Date().toISOString(),
            duration: Math.round((Date.now() - sessionStartTime.current) / 1000),
            chatMessages: messages.filter(m => m.id !== 'welcome').map(m => ({
                role: m.role,
                content: typeof m.content === 'string' ? m.content : '',
                hasImage: !!m.image
            })),
            notebooks: notebooks.map(n => ({ title: n.title, date: n.date, pageCount: n.pages?.length || 0 })),
            slides: slides.length,
            log: sessionLog
        };
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elab-sessione-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ===================== FULLSCREEN =====================

    const toggleNativeFullscreen = useCallback(() => {
        const el = document.querySelector('.elab-v4');
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        } else {
            el.requestFullscreen().catch(() => {
                setIsFullscreen(!isFullscreen);
            });
        }
    }, [isFullscreen]);

    // ===================== VOLUME LOADING =====================
    // S112: Lazy PDF rendering — store the pdf object, render pages on demand
    // Old approach: rendered ALL 114 pages at 3x scale → blocked UI for minutes + GB of RAM
    // New approach: load PDF once, render only the visible page on navigation

    const volumePdfRef = useRef({}); // { [volNum]: pdfDocument }

    const renderVolumePage = useCallback(async (volNum, pageNum) => {
        const pdf = volumePdfRef.current[volNum];
        if (!pdf) return null;
        const pageIndex = pageNum + 1; // pdf.js is 1-indexed
        if (pageIndex < 1 || pageIndex > pdf.numPages) return null;
        try {
            const page = await pdf.getPage(pageIndex);
            const scale = 1.5; // S112: was 3 — 75% less memory per page
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            return canvas.toDataURL('image/jpeg', 0.85); // S112: JPEG = ~5x smaller than PNG
        } catch (err) {
            logger.error(`Errore render pagina ${pageIndex}:`, err);
            return null;
        }
    }, []);

    const loadVolume = async (volNum) => {
        // If PDF already loaded, just switch to it
        if (volumePdfRef.current[volNum]) {
            setSelectedVolume(volNum);
            setCurrentDocPage(0);
            setViewMode('manual');
            // Render first page if not cached
            if (!volumePages[volNum]?.[0]) {
                const firstPage = await renderVolumePage(volNum, 0);
                if (firstPage) {
                    setVolumePages(prev => ({ ...prev, [volNum]: [firstPage] }));
                }
            }
            setLoadingVolume(null);
            return;
        }

        setLoadingVolume(volNum);
        setVolumeProgress(0);

        try {
            if (!window.pdfjsLib) {
                await loadPdfJs();
            }
            const response = await fetch(`/volumes/volume${volNum}.pdf`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // S112: Stream download with progress tracking
            const contentLength = +response.headers.get('Content-Length') || 0;
            let arrayBuffer;
            if (contentLength && response.body) {
                const reader = response.body.getReader();
                const chunks = [];
                let received = 0;
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    setVolumeProgress(Math.round((received / contentLength) * 90)); // 0-90% = download
                }
                const combined = new Uint8Array(received);
                let offset = 0;
                for (const chunk of chunks) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }
                arrayBuffer = combined.buffer;
            } else {
                // Fallback: no Content-Length header
                arrayBuffer = await response.arrayBuffer();
                setVolumeProgress(90);
            }

            setVolumeProgress(92); // Parsing PDF...
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Store the PDF document for lazy page rendering
            volumePdfRef.current[volNum] = pdf;

            // Render only the first page immediately — rest rendered on navigation
            setVolumeProgress(95); // Rendering first page...
            const firstPage = await renderVolumePage(volNum, 0);
            const placeholders = new Array(pdf.numPages).fill(null);
            if (firstPage) placeholders[0] = firstPage;

            setVolumeProgress(100);
            setVolumePages(prev => ({ ...prev, [volNum]: placeholders }));
            setSelectedVolume(volNum);
            setCurrentDocPage(0);
            setViewMode('manual');
        } catch (err) {
            logger.error('Errore caricamento volume:', err);
            alert(`Errore nel caricamento del Volume ${volNum}. Controlla la connessione.`);
        }

        setLoadingVolume(null);
        setVolumeProgress(null);
    };

    // S112: Lazy page renderer — renders pages as the user navigates
    useEffect(() => {
        if (viewMode !== 'manual' || !selectedVolume) return;
        const volNum = selectedVolume;
        const pageIdx = currentDocPage;

        // Already rendered?
        if (volumePages[volNum]?.[pageIdx]) return;
        // PDF not loaded?
        if (!volumePdfRef.current[volNum]) return;

        let cancelled = false;
        renderVolumePage(volNum, pageIdx).then(rendered => {
            if (cancelled || !rendered) return;
            setVolumePages(prev => {
                const pages = [...(prev[volNum] || [])];
                pages[pageIdx] = rendered;
                return { ...prev, [volNum]: pages };
            });
        });

        // Pre-render adjacent pages for smooth navigation
        const prerender = [pageIdx - 1, pageIdx + 1];
        for (const adj of prerender) {
            if (adj < 0 || !volumePdfRef.current[volNum] || adj >= volumePdfRef.current[volNum].numPages) continue;
            if (volumePages[volNum]?.[adj]) continue;
            renderVolumePage(volNum, adj).then(rendered => {
                if (cancelled || !rendered) return;
                setVolumePages(prev => {
                    const pages = [...(prev[volNum] || [])];
                    if (!pages[adj]) { // Don't overwrite if already rendered
                        pages[adj] = rendered;
                        return { ...prev, [volNum]: pages };
                    }
                    return prev;
                });
            });
        }

        return () => { cancelled = true; };
    }, [viewMode, selectedVolume, currentDocPage, renderVolumePage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ===================== DOC SCREENSHOT =====================

    const sendDocScreenshotToChat = async () => {
        let imageData = null;
        if (viewMode === 'manual' && selectedVolume && volumePages[selectedVolume]?.[currentDocPage]) {
            imageData = volumePages[selectedVolume][currentDocPage];
        } else if (viewMode === 'document' && currentDoc && currentDoc.pages[currentDocPage]) {
            imageData = currentDoc.pages[currentDocPage];
        }

        if (!imageData) {
            alert('Nessun documento visualizzato da inviare');
            return;
        }

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: '*Screenshot documento allegato*',
            image: imageData
        };
        setMessages(prev => [...prev, userMsg]);

        // Abort previous analyzeImage if still in-flight (race condition fix)
        if (analyzeAbortRef.current) analyzeAbortRef.current.abort();
        const abortController = new AbortController();
        analyzeAbortRef.current = abortController;

        setIsLoading(true);
        try {
            const result = await analyzeImage(imageData, 'Analizza questa immagine e descrivi cosa vedi. Se contiene testo, circuiti elettronici, codice o diagrammi, spiegali in dettaglio.', { signal: abortController.signal });
            if (abortController.signal.aborted) { setIsLoading(false); return; }
            const assistantMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: result.response || 'Non sono riuscito ad analizzare l\'immagine.'
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            // Ignore aborted requests (superseded by newer call)
            if (err.name === 'AbortError') { setIsLoading(false); return; }
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Errore nell\'analisi dell\'immagine. Riprova.'
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        setIsLoading(false);
    };

    // ===================== SEND IMAGE TO GALILEO (Whiteboard / generic) =====================
    const handleSendImageToGalileo = useCallback(async (imageDataUrl, message) => {
        setShowChat(true);
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: message || '*Disegno dalla lavagna allegato*',
            image: imageDataUrl,
        };
        setMessages(prev => [...prev, userMsg]);

        if (analyzeAbortRef.current) analyzeAbortRef.current.abort();
        const abortController = new AbortController();
        analyzeAbortRef.current = abortController;

        setIsLoading(true);
        try {
            const base64 = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
            const images = [{ base64, mimeType: 'image/png' }];
            const result = await sendChat(message || 'Analizza questo disegno dalla lavagna.', images, {
                socraticMode: isSocraticMode,
                experimentContext: null,
                circuitState: null,
                experimentId: null,
                signal: abortController.signal,
            });
            if (abortController.signal.aborted) { setIsLoading(false); return; }
            if (result?.success) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: sanitizeOutput(typeof result.response === 'string' ? result.response : JSON.stringify(result.response || 'Non sono riuscito ad analizzare il disegno.')),
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: sanitizeOutput(String(result?.response || 'Non sono riuscito ad analizzare il disegno. Riprova.')),
                    isError: true,
                }]);
            }
        } catch (err) {
            if (err.name === 'AbortError') { setIsLoading(false); return; }
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Errore nell\'analisi del disegno. Riprova.',
            }]);
        }
        setIsLoading(false);
    }, [isSocraticMode]);

    // ===================== SLIDES =====================

    const addCanvasToSlides = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSlides(prev => [...prev, { id: Date.now(), type: 'image', content: dataUrl }]);
    };

    const goToSlide = (index) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlideIndex(index);
        }
    };

    // ===================== NOTEBOOKS =====================

    const clearCanvas = () => {
        const ctx = ctxRef.current;
        if (!ctx || !canvasRef.current) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const loadPageImage = (dataUrl) => {
        if (!dataUrl) {
            setTimeout(clearCanvas, 50);
            return;
        }
        const img = new Image();
        img.onload = () => {
            setTimeout(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            }, 50);
        };
        img.src = dataUrl;
    };

    const createNotebook = (initialTitle = null, initialImage = null) => {
        const title = initialTitle || notebookTitle.trim() || `Lezione ${new Date().toLocaleDateString()}`;
        let firstPage = null;
        if (initialImage) {
            firstPage = initialImage;
        } else if (canvasRef.current) {
            firstPage = canvasRef.current.toDataURL('image/jpeg', 0.6);
        }

        const newNote = { id: Date.now(), title, date: new Date().toLocaleString(), pages: [firstPage] };
        const updated = [newNote, ...notebooks];
        setNotebooks(updated);
        try {
            localStorage.setItem('elab-notebooks', JSON.stringify(updated));
        } catch (e) {
            if (e?.name === 'QuotaExceededError' || e?.code === 22) {
                alert('Spazio di archiviazione pieno! Elimina alcuni taccuini vecchi per liberare spazio.');
            }
        }
        setNotebookTitle('');
        setActiveNotebookId(newNote.id);
        setActivePageIndex(0);
        setActiveTab('canvas');
        if (initialImage) {
            setTimeout(() => loadPageImage(initialImage), 100);
        }
    };

    const savePage = () => {
        if (!canvasRef.current || !activeNotebookId) return;
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
        const updated = notebooks.map(n => {
            if (n.id === activeNotebookId) {
                const newPages = [...(n.pages || [])];
                if (activePageIndex >= newPages.length) {
                    newPages.push(dataUrl);
                } else {
                    newPages[activePageIndex] = dataUrl;
                }
                while (newPages.length <= activePageIndex) newPages.push(null);
                return { ...n, pages: newPages, date: new Date().toLocaleString() };
            }
            return n;
        });
        setNotebooks(updated);
        try {
            localStorage.setItem('elab-notebooks', JSON.stringify(updated));
        } catch (e) {
            if (e?.name === 'QuotaExceededError' || e?.code === 22) {
                alert('Spazio di archiviazione pieno! Elimina alcuni taccuini vecchi per liberare spazio.');
            }
        }
    };

    const addPage = () => {
        savePage();
        clearCanvas();
        const updated = notebooks.map(n => {
            if (n.id === activeNotebookId) {
                return { ...n, pages: [...(n.pages || []), null] };
            }
            return n;
        });
        setNotebooks(updated);
        try {
            localStorage.setItem('elab-notebooks', JSON.stringify(updated));
        } catch (e) {
            if (e?.name === 'QuotaExceededError' || e?.code === 22) {
                alert('Spazio di archiviazione pieno! Elimina alcuni taccuini vecchi per liberare spazio.');
            }
        }
        setActivePageIndex(prev => prev + 1);
    };

    const openNotebook = (note) => {
        setActiveNotebookId(note.id);
        setActivePageIndex(0);
        const pages = note.pages || [note.data];
        loadPageImage(pages[0]);
        setActiveTab('canvas');
    };

    const changePage = (index) => {
        savePage();
        setActivePageIndex(index);
        const note = notebooks.find(n => n.id === activeNotebookId);
        if (note) {
            const pages = note.pages || [note.data];
            loadPageImage(pages[index]);
        }
    };

    const deleteNotebookNew = async (id) => {
        if (!await confirmModal('Eliminare questo taccuino?')) return;
        const updated = notebooks.filter(n => n.id !== id);
        setNotebooks(updated);
        localStorage.setItem('elab-notebooks', JSON.stringify(updated));
        if (activeNotebookId === id) closeNotebook();
    };

    const closeNotebook = () => {
        if (activeNotebookId) savePage();
        setActiveNotebookId(null);
        setActiveTab('notebooks');
    };

    // (codeTemplates rimosso — editor Arduino eliminato, code generation passa all'AI)

    // ===================== INTENT DETECTION =====================

    const detectIntent = (text) => {
        // Rimosse tutte le "frasi fatte" (Regex)
        // L'utente ha richiesto che Galileo sia completamente autonomo (autoscienza), 
        // interfacciato a tutti i comandi tramite intelligenza artificiale pura.
        // Restituendo sempre null forziamo TUTTO ad andare al backend/nanobot.
        return null;
    };

    // ===================== TUTOR CONTEXT (~30 tokens/msg) =====================
    // Built on-demand when user sends a message — AI always knows current state
    const buildTutorContext = useCallback(() => {
        const parts = [];
        parts.push(`tab=${activeTab}`);
        if (activeExperiment) parts.push(`esp=${activeExperiment.id} "${activeExperiment.title || ''}"`);
        if (selectedVolume) parts.push(`manuale=Vol${selectedVolume} p.${currentDocPage + 1}`);
        if (currentVideoId) parts.push(`video=youtube:${currentVideoId}`);
        else if (meetActive) parts.push(`video=meet-attivo`);
        if (activeNotebookId) {
            const nb = notebooks.find(n => n.id === activeNotebookId);
            parts.push(`taccuino="${nb?.title || ''}" p.${activePageIndex + 1}`);
        }
        parts.push(`socratico=${isSocraticMode ? 'si' : 'no'}`);
        // Enriched context from simulator API (when available)
        try {
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            if (api) {
                const states = api.getComponentStates();
                const componentCount = Object.keys(states).length;
                if (componentCount > 0) {
                    parts.push(`componenti=${componentCount}`);
                    // Report LED states
                    const leds = Object.entries(states).filter(([k]) => k.startsWith('led'));
                    if (leds.length > 0) {
                        const ledSummary = leds.map(([id, s]) => `${id}:${s.on ? 'ON' : 'OFF'}`).join(',');
                        parts.push(`led=[${ledSummary}]`);
                    }
                    // Report button states
                    const buttons = Object.entries(states).filter(([k]) => k.startsWith('btn') || k.startsWith('push'));
                    if (buttons.length > 0) {
                        parts.push(`pulsanti=[${buttons.map(([id, s]) => `${id}:${s.pressed ? 'premuto' : 'rilasciato'}`).join(',')}]`);
                    }
                    // Report potentiometer states
                    const pots = Object.entries(states).filter(([k]) => k.startsWith('pot'));
                    if (pots.length > 0) {
                        parts.push(`potenziometri=[${pots.map(([id, s]) => `${id}:${Math.round((s.position || 0) * 100)}%`).join(',')}]`);
                    }
                    // Report buzzer states
                    const buzzers = Object.entries(states).filter(([k]) => k.startsWith('buz'));
                    if (buzzers.length > 0) {
                        parts.push(`buzzer=[${buzzers.map(([id, s]) => `${id}:${s.active ? 'attivo' : 'spento'}`).join(',')}]`);
                    }
                    // Report servo states
                    const servos = Object.entries(states).filter(([k]) => k.startsWith('srv') || k.startsWith('servo'));
                    if (servos.length > 0) {
                        parts.push(`servo=[${servos.map(([id, s]) => `${id}:${s.angle || 0}°`).join(',')}]`);
                    }
                }
            }
            // Report all component IDs with types for AI awareness
            if (activeExperiment?.components?.length > 0) {
                const compList = activeExperiment.components.map(c => `${c.id}(${c.type})`).join(',');
                parts.push(`tutti_componenti=[${compList}]`);
            }
            // ── S58: Component positions for spatial awareness ──
            if (api.getComponentPositions) {
                const positions = api.getComponentPositions();
                const posEntries = Object.entries(positions);
                if (posEntries.length > 0 && posEntries.length <= 15) {
                    // Include positions for small circuits (≤15 components)
                    parts.push(`posizioni=[${posEntries.map(([id, p]) => `${id}:${Math.round(p.x || 0)},${Math.round(p.y || 0)}`).join('|')}]`);
                }
            }
            // ── S58: Connection details (wires) for circuit awareness ──
            if (api.getLayout) {
                const layout = api.getLayout();
                if (layout?.connections?.length > 0) {
                    const wireCount = layout.connections.length;
                    parts.push(`fili=${wireCount}`);
                    // Show first 8 connections for context
                    const wireDetails = layout.connections.slice(0, 8).map((c, i) =>
                        `${i}:${c.from || '?'}→${c.to || '?'}`
                    ).join('|');
                    parts.push(`connessioni=[${wireDetails}]`);
                }
            }
        } catch { /* silent */ }

        // ── GALILEO ONNIPOTENTE: Enriched context data ──
        // Interaction history (last 5 actions)
        if (interactionHistoryRef.current.length > 0) {
            const recent = interactionHistoryRef.current.slice(-5);
            parts.push(`ultime_azioni=[${recent.map(a => a.summary).join(',')}]`);
        }
        // Build step progress
        if (buildStepIndexRef.current >= 0 && activeExperiment?.buildSteps) {
            const total = activeExperiment.buildSteps.length;
            parts.push(`passo=${buildStepIndexRef.current + 1}/${total}`);
        }
        // Error history
        if (errorHistoryRef.current.length > 0) {
            parts.push(`errori_recenti=[${errorHistoryRef.current.slice(-3).join(',')}]`);
        }
        // Session stats
        parts.push(`messaggi=${messages.length}`);
        const sessionMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
        if (sessionMinutes > 0) parts.push(`durata=${sessionMinutes}min`);

        // ── Sprint 1 Context Mastery: 5 new context blocks ──
        try {
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            if (api) {
                // G2: Selected Component
                const sel = api.getSelectedComponent?.();
                if (sel) parts.push(`componente_selezionato=${sel.id}(${sel.type})`);
                // G3: Compilation Result
                const comp = api.getCompilationSnapshot?.();
                if (comp && comp.status && comp.status !== 'idle') {
                    parts.push(`compilazione=${comp.status}`);
                    if (comp.errors) parts.push(`errore_compilazione=${String(comp.errors).slice(0, 150)}`);
                    if (comp.warnings) parts.push(`warning_compilazione=${String(comp.warnings).slice(0, 100)}`);
                }
                // G4: Serial Output (last 10 lines)
                const serial = api.getSerialOutput?.();
                if (serial && serial.lastLines.length > 0) {
                    parts.push(`serial_output=[${serial.lastLines.slice(-5).join(' | ')}] (${serial.lineCount} righe totali)`);
                }
                // G8: Editor Mode
                const edMode = api.getEditorMode?.();
                if (edMode) parts.push(`editor=${edMode}`);
                const edVis = api.isEditorVisible?.();
                if (edVis !== undefined) parts.push(`editor_visibile=${edVis ? 'si' : 'no'}`);
            }
        } catch { /* silent */ }
        // G1: Activity Ring Buffer (last 5 actions with timestamps)
        const activityBlock = formatActivityContext(5);
        if (activityBlock) parts.push(activityBlock);
        // G9: Session Metrics (time on experiment, compilations, idle time)
        const metricsBlock = sessionMetrics.formatForContext();
        if (metricsBlock) parts.push(metricsBlock);

        // Student memory context (from galileoMemory service)
        let memoryContext = '';
        try {
            if (typeof window !== 'undefined' && window.__galileoMemory) {
                memoryContext = window.__galileoMemory.buildMemoryContext();
            }
        } catch { /* silent */ }

        // S58: Streamlined context — clear, structured, no redundancy with nanobot.yml system prompt
        return `[CONTESTO DI SISTEMA — GALILEO v3.0]

STATO ATTUALE INTERFACCIA:
${parts.join('\n')}

REGOLE CRITICHE PER QUESTA RISPOSTA:
1. ONESTA': Se l'utente chiede "cosa vedi?" → descrivi SOLO i dati qui sopra (componenti, connessioni, LED, posizioni). Non inventare.
2. AZIONE OBBLIGATORIA: Se l'utente chiede di FARE qualcosa → includi [AZIONE:...] alla fine. Mai dire "l'ho fatto" senza il tag.
3. CONTESTO REALE: Se led=[led1:OFF] → il LED e' spento. Se fili=0 → non ci sono fili. Basa OGNI risposta su questi dati.
4. DOMANDE OFF-TOPIC: Rispondi brevemente (max 1 frase) e ridireziona all'elettronica. Non fare lezioni step-by-step su matematica o altro.
5. TAG FORMATO: [AZIONE:comando:args] — AZIONE sempre MAIUSCOLO, tag alla FINE della risposta, dopo la spiegazione.
6. PER RIMUOVERE TUTTI I FILI: Se fili=N, emetti N tag [AZIONE:removewire:i] per i da N-1 a 0 (partendo dall'ultimo).${memoryContext ? `\n\n${memoryContext}` : ''}`;
    }, [activeTab, activeExperiment, selectedVolume, currentDocPage,
        currentVideoId, meetActive,
        activeNotebookId, notebooks, activePageIndex, isSocraticMode, messages.length]);

    // ===================== AUTO-SCREENSHOT (Galileo Onnipotente — FASE 4) =====================
    // Detects when the student's message needs visual context from the simulator
    // and auto-captures a screenshot to send to the Vision specialist
    const VISUAL_KEYWORDS = /(?:cosa vedi|guarda|screen|mostrami|fammi vedere|controlla il circuito|analizza|verifica|è giusto|è corretto|check|foto|screenshot|schermata|sembra|vedi qualcosa|dov'è l'errore|dove sbaglio|non funziona|non si accende|si è bruciato|bruciato|cortocircuito|short|errore nel circuito|lavagna|disegno|ho disegnato|ho scritto sulla|scritto qui|questa pagina|questo esperimento|questa immagine|questo schema)/i;
    const CANVAS_KEYWORDS = /(?:lavagna|disegno|ho disegnato|ho scritto sulla|scritto qui|canvas|whiteboard)/i;
    // S63 FIX: action-intent messages must go to /tutor-chat (circuit specialist), NOT /chat (vision).
    // Auto-screenshot + images → /chat → vision specialist → no [AZIONE:] tags → commands broken.
    // S66 FIX: expanded with 20+ missing Italian action verbs that were causing
    // action messages to route to vision specialist instead of circuit specialist.
    // Every verb here BLOCKS auto-screenshot so the message goes to /tutor-chat.
    const ACTION_INTENT_KEYWORDS = /\b(carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|evidenzia|sposta|premi|gira|avvia|ferma|reset|compila|imposta|setta|cancella|pulisci|interagisci|svuota|azzera|facciamo|fai|fammi|elimina|cambia|modifica|sostituisci|ricollega|rifai|monta|smonta|scollega|inserisci|posiziona|piazza|sistema|ripara|correggi|al\s+posto)\b/i;
    const shouldAutoScreenshot = useCallback((message) => {
        // S63 FIX: NEVER auto-screenshot for action commands — they must route to /tutor-chat
        // so the circuit specialist can generate [AZIONE:...] tags for the simulator.
        if (ACTION_INTENT_KEYWORDS.test(message)) return false;
        // Condition 1: visual keywords in the message
        if (VISUAL_KEYWORDS.test(message)) return true;
        // Condition 2: simulator tab is active AND student asks about their circuit
        if (activeTab === 'simulator' && /circuito|circuit|schema|collegament|esperiment/i.test(message)) return true;
        // Condition 3: canvas tab is active AND student asks about anything visual
        if (activeTab === 'canvas') return true;
        // Condition 4: manual/document tab + page-oriented question
        if (activeTab === 'manual' && /pagina|manuale|documento|figura|immagine|schema/i.test(message)) return true;
        return false;
    }, [activeTab]);

    const captureActiveVisualContext = useCallback(async (message = '') => {
        const wantsCanvas = activeTab === 'canvas' || CANVAS_KEYWORDS.test(message);

        // S66 FIX: canvas ref may be null right after tab switch. Retry once after short delay.
        let canvasEl = activeTab === 'canvas' ? canvasRef.current : null;
        if (activeTab === 'canvas' && !canvasEl) {
            await new Promise(r => setTimeout(r, 150));
            canvasEl = canvasRef.current;
        }

        const whiteboardShot = captureWhiteboardScreenshot({
            tutorCanvas: canvasEl,
        });

        if (whiteboardShot.dataUrl && (
            wantsCanvas ||
            activeTab === 'canvas' ||
            whiteboardShot.source === 'simulator-whiteboard'
        )) {
            return whiteboardShot;
        }

        if (activeTab === 'manual') {
            if (viewMode === 'manual' && selectedVolume && volumePages[selectedVolume]?.[currentDocPage]) {
                return { dataUrl: volumePages[selectedVolume][currentDocPage], source: 'manual-page' };
            }
            if (viewMode === 'document' && currentDoc?.pages?.[currentDocPage]) {
                return { dataUrl: currentDoc.pages[currentDocPage], source: 'document-page' };
            }
        }

        if (activeTab === 'simulator') {
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            if (api?.captureScreenshot) {
                const simulatorData = await api.captureScreenshot();
                if (simulatorData) {
                    return { dataUrl: simulatorData, source: 'simulator' };
                }
            }
        }

        try {
            if (typeof document !== 'undefined') {
                const panel = document.querySelector('.v4-panel');
                if (panel) {
                    const { default: html2canvas } = await import('html2canvas');
                    const canvas = await html2canvas(panel, {
                        backgroundColor: '#FFFFFF', /* html2canvas requires literal hex */
                        useCORS: true,
                        logging: false,
                        scale: 1,
                    });
                    const dataUrl = canvas?.toDataURL?.('image/png');
                    if (dataUrl) {
                        return { dataUrl, source: 'active-tab' };
                    }
                }
            }
        } catch (err) {
            if (typeof console !== 'undefined') console.warn('[Galileo] Active tab screenshot fallback failed:', err?.message || err);
        }

        return { dataUrl: null, source: null };
    }, [
        activeTab,
        currentDoc,
        currentDocPage,
        selectedVolume,
        viewMode,
        volumePages,
    ]);

    // ===================== CHAT HANDLER =====================

    const handleSend = async (messageOverride) => {
        const userMessage = messageOverride || input;
        if (!userMessage.trim() || isLoading) return;

        pushActivity('message_sent', userMessage.slice(0, 60));
        sessionMetrics.trackInteraction();
        const validation = validateMessage(userMessage);
        if (!validation.allowed) {
            setMessages(prev => [...prev,
            { id: Date.now(), role: 'user', content: userMessage },
            { id: Date.now() + 1, role: 'assistant', content: validation.message }
            ]);
            if (!messageOverride) setInput('');
            return;
        }

        const rateCheck = checkRateLimit();
        if (!rateCheck.allowed) {
            setMessages(prev => [...prev,
            { id: Date.now(), role: 'user', content: userMessage },
            { id: Date.now() + 1, role: 'assistant', content: rateCheck.message }
            ]);
            if (!messageOverride) setInput('');
            return;
        }

        if (!messageOverride) setInput('');
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);

        // detectIntent: try/catch protects chat from any runtime error in command parsing
        let localResponse = null;
        try {
            localResponse = detectIntent(userMessage);
        } catch (err) {
            // Log silently — never break chat flow due to detectIntent bugs
            if (typeof console !== 'undefined') console.warn('[Galileo] detectIntent error:', err.message);
        }
        if (localResponse) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: localResponse
            }]);
            return;
        }

        setIsLoading(true);
        const volNum = activeExperiment?.id?.match(/^v(\d+)-/)?.[1] || '?';
        // GALILEO CENTRO DI COMANDO: always include tutor context + circuit state
        const tutorContext = buildTutorContext();
        const liveCircuit = circuitStateRef.current?.text || circuitStateRef.current || '';

        // S73 FIX-6: Goal state enrichment — tell the backend WHAT the user wants
        let goalContext = '';
        if (ACTION_INTENT_KEYWORDS.test(userMessage)) {
            const circuitData = circuitStateRef.current?.structured || circuitStateRef.current || {};
            const currentComponents = (circuitData.components || []).map(c => `${c.id} (${c.type})`);
            const currentWires = (circuitData.connections || []).length;
            goalContext = `\n[Richiesta utente]: "${userMessage.substring(0, 150)}"`;
            goalContext += `\n[Componenti attuali]: ${currentComponents.length > 0 ? currentComponents.join(', ') : 'nessuno'}`;
            goalContext += `\n[Fili attuali]: ${currentWires}`;
            if (activeExperiment?.components) {
                const expectedTypes = activeExperiment.components.map(c => c.type);
                const currentTypes = (circuitData.components || []).map(c => c.type);
                const missing = expectedTypes.filter(t => !currentTypes.includes(t));
                if (missing.length > 0) {
                    goalContext += `\n[Componenti mancanti per esperimento]: ${missing.join(', ')}`;
                }
            }
        }

        const experimentContext = liveCircuit
            ? `${tutorContext}\n${liveCircuit}${goalContext}`
            : activeExperiment
                ? `${tutorContext}\n[Esp: Vol.${volNum} "${activeExperiment.title || activeExperiment.id || ''}" — ${activeExperiment.chapter || ''} — componenti: ${(activeExperiment.components || []).map(c => c.type).join(', ')}]${goalContext}`
                : `${tutorContext}${goalContext}`;

        // ── Auto-screenshot (Galileo Onnipotente — FASE 4 + Smart Canvas) ──
        // Capture screenshot from the CORRECT source based on active tab
        let autoImages = [];
        let autoScreenshotSource = null;
        if (shouldAutoScreenshot(userMessage)) {
            try {
                const { dataUrl, source } = await captureActiveVisualContext(userMessage);
                autoScreenshotSource = source;

                if (dataUrl) {
                    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
                    autoImages = [{ base64, mimeType: 'image/png' }];
                }
            } catch (err) {
                // Never break chat flow due to screenshot failure
                if (typeof console !== 'undefined') console.warn('[Galileo] Auto-screenshot failed:', err.message);
            }
        }

        const isWhiteboardScreenshot = autoScreenshotSource === 'tutor-canvas' || autoScreenshotSource === 'simulator-whiteboard';
        const isNonSimulatorVisual = isWhiteboardScreenshot ||
            autoScreenshotSource === 'manual-page' ||
            autoScreenshotSource === 'document-page' ||
            autoScreenshotSource === 'active-tab';
        // S104: Collect unified simulator context for Galileo Context Engine
        let simulatorContext = null;
        if (!isNonSimulatorVisual) {
            try {
                const api = typeof window !== 'undefined' && window.__ELAB_API;
                if (api?.getSimulatorContext) {
                    simulatorContext = api.getSimulatorContext();
                }
            } catch { /* silent — don't break chat flow */ }
        }

        const result = await sendChat(userMessage, autoImages, {
            socraticMode: isSocraticMode,
            experimentContext: isNonSimulatorVisual ? null : experimentContext,
            circuitState: isNonSimulatorVisual ? null : (circuitStateRef.current
                ? (circuitStateRef.current.structured
                    ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
                    : { raw: circuitStateRef.current })
                : null),
            experimentId: isNonSimulatorVisual ? null : (activeExperiment?.id || null),
            simulatorContext,
        });

        if (result.success) {
            const rawResponse = (typeof result.response === 'string') ? result.response : (result.response ? JSON.stringify(result.response) : 'Errore: risposta non valida.');
            const aiResponse = sanitizeOutput(rawResponse);
            const aiLower = aiResponse.toLowerCase();
            const userLower = userMessage.toLowerCase();

            // ── Strip action tags from display text (Galileo Onnipotente: esecuzione silenziosa) ──
            // Tags get executed below but NEVER shown to the student
            // S58 FIX: More permissive regex — also catches [Azione:...], [azione:...], and partial matches
            // Strip INTENT tags using balanced-brace parser (regex fails on nested JSON brackets)
            let strippedResponse = aiResponse;
            for (const { fullMatch } of extractIntentTags(aiResponse)) {
                strippedResponse = strippedResponse.replace(fullMatch, '');
            }
            const displayText = strippedResponse
                .replace(/\[azione:[^\]]+\]/gi, '')  // catch all case variants
                .replace(/\[AZIONE:[^\]]+\]/g, '')   // exact uppercase (redundant safety)
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            const msgId = Date.now() + 1;
            setMessages(prev => [...prev, {
                id: msgId,
                role: 'assistant',
                content: displayText || aiResponse,
                source: result.source || null,
                _executedActions: [], // populated after action parsing
            }]);

            // ── AI Action Tags: parse [AZIONE:cmd:args] from ORIGINAL response ──
            // Allows nanobot to trigger frontend actions via structured tags
            // S58 FIX: Case-insensitive match + robust inner extraction
            let actionTags = aiResponse.match(/\[azione:([^\]]+)\]/gi) || [];
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            const executedActions = []; // track what was executed for badge display
            const actionFailures = [];
            const actionIntentRegex = /\b(carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|evidenzia|mostra|mostrami|sposta|premi|gira|avvia|ferma|reset|compila|imposta|setta|cancella|pulisci|interagisci|annulla|ripeti|indietro|avanti|prossimo|precedente|scrivi|elenca|stato|misura|diagnostica|programma|codice|codifica|ripristina)\b/i;

            // Ralph Loop hardening: if user asked for an action but AI omitted tags,
            // do a silent second-pass request to recover missing [AZIONE:...] commands.
            if (actionTags.length === 0 && actionIntentRegex.test(userMessage)) {
                try {
                    const repairPrompt = [
                        '[RIPARAZIONE TAG AZIONE]',
                        "L'utente ha chiesto un'azione ma la risposta precedente non contiene tag [AZIONE:...].",
                        'Genera SOLO i tag [AZIONE:...] necessari (uno per riga), senza testo aggiuntivo.',
                        '',
                        `[MESSAGGIO UTENTE]\\n${userMessage}`,
                        '',
                        `[RISPOSTA PRECEDENTE]\\n${aiResponse}`,
                    ].join('\\n');

                    const repairResult = await sendChat(repairPrompt, [], {
                        socraticMode: false,
                        experimentContext,
                        circuitState: circuitStateRef.current?.structured
                            ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
                            : (circuitStateRef.current ? { raw: circuitStateRef.current } : null),
                        experimentId: activeExperiment?.id || null,
                    });

                    if (repairResult?.success && repairResult?.response) {
                        const repaired = sanitizeOutput(String(repairResult.response));
                        const recovered = repaired.match(/\[azione:([^\]]+)\]/gi) || [];
                        if (recovered.length > 0) {
                            actionTags = recovered;
                        }
                    }
                } catch {
                    // Silent: keep original response even if repair step fails.
                }
            }

            const parseIntOr = (value, fallback) => {
                const parsed = Number.parseInt(value, 10);
                return Number.isFinite(parsed) ? parsed : fallback;
            };
            const normalizeComponentToken = (value) =>
                (value || '').toLowerCase().replace(/[\s_-]+/g, '');
            const TYPE_ALIASES = {
                led: 'led',
                rgbled: 'rgb-led',
                resistor: 'resistor',
                resistore: 'resistor',
                resistenza: 'resistor',
                battery: 'battery9v',
                batteria: 'battery9v',
                battery9v: 'battery9v',
                buzzer: 'buzzer-piezo',
                cicalino: 'buzzer-piezo',
                buzzerpiezo: 'buzzer-piezo',
                button: 'push-button',
                pulsante: 'push-button',
                pushbutton: 'push-button',
                potentiometer: 'potentiometer',
                potenziometro: 'potentiometer',
                pot: 'potentiometer',
                photoresistor: 'photo-resistor',
                fotoresistore: 'photo-resistor',
                ldr: 'photo-resistor',
                reed: 'reed-switch',
                reedswitch: 'reed-switch',
                motor: 'motor-dc',
                motore: 'motor-dc',
                motoredc: 'motor-dc',
                capacitor: 'capacitor',
                condensatore: 'capacitor',
                diode: 'diode',
                diodo: 'diode',
                mosfet: 'mosfet-n',
                mosfetn: 'mosfet-n',
                servo: 'servo',
                arduino: 'nano-r4-board',
                nano: 'nano-r4-board',
                nanor4board: 'nano-r4-board',
            };
            const getLiveComponents = () => {
                try {
                    const layout = api?.getLayout?.();
                    return Array.isArray(layout?.components) ? layout.components : [];
                } catch {
                    return [];
                }
            };
            const resolveComponentIds = (token, allowMultiple = false) => {
                const cleaned = (token || '').trim();
                if (!cleaned) return [];

                const components = getLiveComponents();
                if (!components.length) return [cleaned];

                const normalizedToken = normalizeComponentToken(cleaned);
                const byId = components.filter(c => normalizeComponentToken(c?.id) === normalizedToken);
                if (byId.length) {
                    return allowMultiple ? byId.map(c => c.id) : [byId[0].id];
                }

                const byPrefixId = components.filter(c => normalizeComponentToken(c?.id).startsWith(normalizedToken));
                if (byPrefixId.length) {
                    return allowMultiple ? byPrefixId.map(c => c.id) : [byPrefixId[0].id];
                }

                const normalizedType = normalizeComponentToken(TYPE_ALIASES[normalizedToken] || cleaned);
                const byType = components.filter(c => normalizeComponentToken(c?.type) === normalizedType);
                if (byType.length) {
                    return allowMultiple ? byType.map(c => c.id) : [byType[0].id];
                }

                return [];
            };
            const resolveSingleComponentId = (token) => {
                const ids = resolveComponentIds(token, false);
                return ids.length ? ids[0] : null;
            };
            const resolveExperimentId = (requestedId) => {
                const raw = (requestedId || '').trim();
                if (!raw || !api?.getExperimentList) return raw;

                // Exact runtime ID
                if (api?.getExperiment?.(raw)) return raw;

                // Backward-compat aliases used by older prompts/docs
                const EXP_ID_ALIASES = {
                    'v1-cap6-primo-circuito': 'v1-cap6-esp1',
                    'v1-cap6-led-rosso': 'v1-cap6-esp2',
                    'v1-cap6-led-bruciato': 'v1-cap6-esp3',
                    'v1-cap8-pulsante-led': 'v1-cap8-esp1',
                    'v1-cap8-semaforo-pulsante': 'v1-cap8-esp5',
                    'v1-cap11-buzzer': 'v1-cap11-esp1',
                    'v3-cap6-led-blink': 'v3-cap6-blink',
                };
                if (EXP_ID_ALIASES[raw]) return EXP_ID_ALIASES[raw];

                const normalize = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
                const prefixMatch = raw.match(/^(v\d-cap\d+)/i);
                const prefix = prefixMatch ? prefixMatch[1].toLowerCase() : '';
                const rawTokens = raw.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
                    .filter(tok => !/^v\d$/.test(tok) && !/^cap\d+$/.test(tok) && tok !== 'esp');

                const list = api.getExperimentList?.() || {};
                const flat = [...(list.vol1 || []), ...(list.vol2 || []), ...(list.vol3 || [])];
                let candidates = flat;
                if (prefix) {
                    const prefixed = flat.filter(exp => (exp.id || '').toLowerCase().startsWith(prefix));
                    if (prefixed.length) candidates = prefixed;
                }
                if (!candidates.length) return raw;

                const scored = candidates.map(exp => {
                    const idNorm = normalize(exp.id);
                    const titleNorm = normalize(exp.title);
                    let score = 0;
                    if (idNorm.includes(normalize(raw))) score += 8;
                    for (const tok of rawTokens) {
                        if (idNorm.includes(tok)) score += 3;
                        if (titleNorm.includes(tok)) score += 4;
                    }
                    return { id: exp.id, score };
                }).sort((a, b) => b.score - a.score);

                if (scored[0]?.score > 0) return scored[0].id;
                if (candidates.length === 1) return candidates[0].id;
                return raw;
            };
            const recordActionFailure = (tagText, reason) => {
                const failure = `${tagText} → ${reason}`;
                actionFailures.push(failure);
            };

            // ── NEW: Placement Engine intent resolution ──
            // Processes [INTENT:{json}] tags BEFORE the existing [AZIONE:] loop.
            // Two-pass execution: (1) addcomponent → capture real IDs, (2) addwire → remap pe_* IDs.
            // If INTENT fails → fallback silently to raw AZIONE tags from LLM.
            const PLACEMENT_ENGINE_ENABLED = true; // kill-switch
            // Use balanced-brace parser instead of regex (regex fails on nested JSON brackets)
            const intentTags = extractIntentTags(aiResponse);

            if (PLACEMENT_ENGINE_ENABLED && intentTags.length > 0 && api) {
                try {
                    const { resolvePlacement } = await import('../simulator/engine/PlacementEngine');
                    const currentLayout = api.getLayout?.() || {};
                    const snapshot = {
                        components: currentLayout.components || [],
                        connections: currentLayout.connections || [],
                        layout: currentLayout.layout || {},
                        pinAssignments: currentLayout.pinAssignments || {},
                    };

                    // Collect ALL PE actions across all intents
                    const peActions = [];
                    for (const tag of intentTags) {
                        try {
                            const intent = JSON.parse(tag.json);
                            const placementResult = resolvePlacement(intent, snapshot);
                            if (placementResult.success) {
                                peActions.push(...placementResult.actions);
                                // Update snapshot for subsequent intents
                                for (const action of placementResult.actions) {
                                    if (action.pinAssignments) {
                                        Object.assign(snapshot.pinAssignments, action.pinAssignments);
                                    }
                                }
                            }
                            if (placementResult.errors.length > 0) {
                                console.warn('[PlacementEngine]', placementResult.errors);
                            }
                        } catch (parseErr) {
                            console.warn('[PlacementEngine] Invalid INTENT JSON:', parseErr.message);
                        }
                    }

                    // Two-pass execution: addcomponent first (capture real IDs), then addwire (remap IDs)
                    if (peActions.length > 0) {
                        const peIdMap = {}; // pe_* synthetic ID → real simulator ID

                        // Pass 1: Execute addcomponent actions, build ID map
                        for (const action of peActions) {
                            if (action.type !== 'addcomponent') continue;
                            try {
                                const tagMatch = action.tag.match(/addcomponent:([^:]+):(-?\d+):(-?\d+)/);
                                if (!tagMatch) continue;
                                const type = TYPE_ALIASES[normalizeComponentToken(tagMatch[1])] || tagMatch[1];
                                const x = parseInt(tagMatch[2], 10) || 200;
                                const y = parseInt(tagMatch[3], 10) || 150;
                                if (api.addComponent) {
                                    const realId = api.addComponent(type, { x, y });
                                    if (realId && action.componentId) {
                                        peIdMap[action.componentId] = realId;
                                    }
                                    executedActions.push(`addcomponent:${realId || type}`);
                                }
                            } catch (err) {
                                recordActionFailure(action.tag, err.message);
                            }
                        }

                        // Pass 2: Execute addwire actions with pe_* → real ID remapping
                        for (const action of peActions) {
                            if (action.type !== 'addwire') continue;
                            try {
                                const inner = action.tag.slice(action.tag.indexOf(':') + 1, -1);
                                const parts = inner.split(':').map(s => s.trim());
                                // parts: [addwire, fromComp, fromPin, toComp, toPin, (color)]
                                if (!(parts[1] && parts[2] && parts[3] && parts[4])) continue;

                                // Remap pe_* synthetic IDs to real simulator IDs
                                let fromComp = peIdMap[parts[1]] || parts[1];
                                let toComp = peIdMap[parts[3]] || parts[3];

                                // Resolve to actual simulator component IDs
                                const fromId = resolveSingleComponentId(fromComp) || fromComp;
                                const toId = resolveSingleComponentId(toComp) || toComp;

                                const fromPin = `${fromId}:${parts[2]}`;
                                const toPin = `${toId}:${parts[4]}`;
                                if (api.addWire) {
                                    api.addWire(fromPin, toPin);
                                    executedActions.push(`addwire:${fromPin}->${toPin}`);
                                }
                            } catch (err) {
                                recordActionFailure(action.tag, err.message);
                            }
                        }
                    }
                } catch (err) {
                    // PlacementEngine import or resolution failed — fall back silently
                    console.warn('[PlacementEngine] fallback to raw AZIONE tags:', err.message);
                }
            }

            for (const tag of actionTags) {
                // S58: Robust inner extraction — find first ":" after "[" bracket
                const colonIdx = tag.indexOf(':');
                if (colonIdx < 0) continue;
                const inner = tag.slice(colonIdx + 1, -1); // everything between first : and ]
                const parts = inner.split(':').map(s => s.trim());
                const cmd = parts[0]?.toLowerCase();
                const tagText = `[AZIONE:${inner}]`;
                try {
                    if (cmd === 'play') {
                        if (!api?.play) throw new Error('API simulatore non disponibile');
                        api.play();
                        executedActions.push('play');
                    }
                    else if (cmd === 'pause') {
                        if (!api?.pause) throw new Error('API simulatore non disponibile');
                        api.pause();
                        executedActions.push('pause');
                    }
                    else if (cmd === 'reset') {
                        if (!api?.reset) throw new Error('API simulatore non disponibile');
                        api.reset();
                        executedActions.push('reset');
                    }
                    else if (cmd === 'highlight') {
                        if (!api?.galileo?.highlightComponent) throw new Error('highlight non disponibile');
                        const rawTargets = (parts[1] || '').split(',').map(s => s.trim()).filter(Boolean);
                        const resolvedTargets = [...new Set(rawTargets.flatMap(token => resolveComponentIds(token, true)))];
                        if (!resolvedTargets.length) throw new Error('componenti da evidenziare non trovati');
                        api.galileo.highlightComponent(resolvedTargets);
                        setTimeout(() => api.galileo.clearHighlights(), 4000);
                        executedActions.push(`highlight:${resolvedTargets.join(',')}`);
                    }
                    else if (cmd === 'loadexp' && parts[1]) {
                        const requestedId = parts[1];
                        const resolvedId = resolveExperimentId(requestedId);
                        if (!api?.getExperiment?.(resolvedId)) {
                            throw new Error(`esperimento non trovato: ${requestedId}`);
                        }
                        setPendingExperimentId(resolvedId);
                        setActiveTab('simulator');
                        executedActions.push(`loadexp:${resolvedId}`);
                    }
                    else if (cmd === 'opentab' && parts[1]) {
                        const tabMap = { simulatore: 'simulator', manuale: 'manual', video: 'videos', lavagna: 'canvas', taccuini: 'notebooks', detective: 'detective', poe: 'poe', reverse: 'reverse', review: 'review' };
                        const tab = tabMap[parts[1].toLowerCase()] || parts[1];
                        setActiveTab(tab);
                        executedActions.push(`opentab:${parts[1]}`);
                    }
                    else if (cmd === 'openvolume' && parts[1]) {
                        const vol = parseInt(parts[1]);
                        const page = parts[2] ? parseInt(parts[2]) : null;
                        if (vol >= 1 && vol <= 3) {
                            loadVolume(vol).then(() => { if (page) setCurrentDocPage(Math.max(0, page - 1)); }).catch(() => { });
                            setActiveTab('manual');
                            executedActions.push(`openvolume:${parts[1]}`);
                        } else {
                            throw new Error(`volume non valido: ${parts[1]}`);
                        }
                    }
                    else if (cmd === 'addwire') {
                        if (!api?.addWire) throw new Error('addWire non disponibile');
                        if (!(parts[1] && parts[2] && parts[3] && parts[4])) {
                            throw new Error('argomenti addwire incompleti');
                        }
                        const fromId = resolveSingleComponentId(parts[1]);
                        const toId = resolveSingleComponentId(parts[3]);
                        if (!fromId) throw new Error(`componente sorgente non trovato: ${parts[1]}`);
                        if (!toId) throw new Error(`componente destinazione non trovato: ${parts[3]}`);
                        const fromPin = `${fromId}:${parts[2]}`;
                        const toPin = `${toId}:${parts[4]}`;
                        api.addWire(fromPin, toPin);
                        executedActions.push(`addwire:${fromPin}->${toPin}`);
                    }
                    else if (cmd === 'removewire') {
                        if (!api?.removeWire) throw new Error('removeWire non disponibile');
                        const wireIndex = Number.parseInt(parts[1], 10);
                        if (!Number.isFinite(wireIndex) || wireIndex < 0) {
                            throw new Error(`indice filo non valido: ${parts[1] || ''}`);
                        }
                        api.removeWire(wireIndex);
                        executedActions.push(`removewire:${wireIndex}`);
                    }
                    else if (cmd === 'addcomponent') {
                        if (!api?.addComponent) throw new Error('addComponent non disponibile');
                        if (!parts[1]) throw new Error('tipo componente mancante');
                        const rawType = parts[1];
                        const type = TYPE_ALIASES[normalizeComponentToken(rawType)] || rawType;
                        const x = parseIntOr(parts[2], 200);
                        const y = parseIntOr(parts[3], 150);
                        const addedId = api.addComponent(type, { x, y });
                        if (!addedId) throw new Error(`aggiunta componente fallita: ${type}`);
                        executedActions.push(`addcomponent:${addedId}`);
                    }
                    else if (cmd === 'removecomponent') {
                        if (!api?.removeComponent) throw new Error('removeComponent non disponibile');
                        if (!parts[1]) throw new Error('componente da rimuovere mancante');
                        const targets = [...new Set(resolveComponentIds(parts[1], true))];
                        if (!targets.length) throw new Error(`componente non trovato: ${parts[1]}`);
                        targets.forEach(id => api.removeComponent(id));
                        executedActions.push(`removecomponent:${targets.join(',')}`);
                    }
                    else if (cmd === 'interact') {
                        if (!api?.interact) throw new Error('interact non disponibile');
                        if (!parts[1]) throw new Error('componente da interagire mancante');
                        const compId = resolveSingleComponentId(parts[1]) || parts[1];
                        // S58 FIX: was `break` which killed ALL subsequent actions! → `continue`
                        // Also try interact even if component not in stale state ref — let API handle it
                        const action = parts[2] || 'press';
                        const parsedValue = parts[3] ? Number.parseFloat(parts[3]) : undefined;
                        const value = Number.isFinite(parsedValue) ? parsedValue : undefined;
                        api.interact(compId, action, value);
                        if (action === 'press') {
                            setTimeout(() => api.interact(compId, 'release'), 300);
                        }
                        executedActions.push(`interact:${compId}:${action}`);
                    }
                    else if (cmd === 'compile') {
                        if (!api?.getEditorCode) throw new Error('compile non disponibile');
                        const code = api.getEditorCode();
                        if (code) {
                            // S116: Use compileAndLoad (updates UI + loads hex into AVR)
                            // Falls back to raw api.compile if compileAndLoad not available
                            const compileFn = api.compileAndLoad || api.compile;
                            compileFn(code).then(compileResult => {
                                // compileAndLoad returns undefined on success, raw compile returns {success, errors}
                                if (compileResult && !compileResult.success) {
                                    setMessages(prev => [...prev, {
                                        id: Date.now(),
                                        role: 'assistant',
                                        content: `\u274C Errore: ${compileResult.errors || 'sconosciuto'}`,
                                        proactive: true,
                                    }]);
                                }
                                // Success message is already shown by compilationStatus UI
                            }).catch(() => {
                                recordActionFailure(tagText, 'compilazione fallita');
                            });
                        } else {
                            throw new Error('editor codice vuoto');
                        }
                        executedActions.push('compile');
                    }
                    // ── NEW ACTION TAGS (Galileo Onnipotente) ──
                    else if (cmd === 'movecomponent') {
                        if (!api?.moveComponent) throw new Error('moveComponent non disponibile');
                        if (!parts[1]) throw new Error('componente da spostare mancante');
                        const compId = resolveSingleComponentId(parts[1]) || parts[1];
                        const positions = api?.getComponentPositions?.() || {};
                        const fallbackPos = positions?.[compId] || { x: 200, y: 150 };
                        const x = parseIntOr(parts[2], fallbackPos.x);
                        const y = parseIntOr(parts[3], fallbackPos.y);
                        api.moveComponent(compId, x, y);
                        executedActions.push(`movecomponent:${compId}`);
                    }
                    else if (cmd === 'clearall') {
                        if (!api?.clearAll) throw new Error('clearAll non disponibile');
                        api.clearAll();
                        executedActions.push('clearall');
                    }
                    else if (cmd === 'quiz') {
                        const expId = parts[1] || activeExperiment?.id || null;
                        window.dispatchEvent(new CustomEvent('galileo-quiz', { detail: { experimentId: expId } }));
                        executedActions.push('quiz');
                    }
                    else if (cmd === 'youtube' && parts.length > 1) {
                        const query = parts.slice(1).join(' ');
                        handleYouTubeSearch(query);
                        executedActions.push(`youtube:${query.slice(0, 20)}`);
                    }
                    // S115-FIX: old setcode handler REMOVED — replaced by S115 version below with showEditor+setEditorMode
                    // S66: create notebook from chat — "crea un taccuino chiamato X"
                    else if (cmd === 'createnotebook') {
                        const notebookName = parts.slice(1).join(' ').trim();
                        const title = notebookName || `Lezione ${new Date().toLocaleDateString()}`;
                        createNotebook(title);
                        executedActions.push(`createnotebook:${title}`);
                    }
                    else if (cmd === 'setvalue') {
                        // [AZIONE:setvalue:componentId:paramName:value]
                        // Es: [AZIONE:setvalue:r1:resistance:470], [AZIONE:setvalue:pot1:position:0.5]
                        if (!api?.interact) throw new Error('interact non disponibile');
                        if (!parts[1] || !parts[2] || parts[3] === undefined) throw new Error('argomenti setvalue incompleti (id:param:value)');
                        const compId = resolveSingleComponentId(parts[1]) || parts[1];
                        const param = parts[2].toLowerCase();
                        const value = Number.parseFloat(parts[3]);
                        if (!Number.isFinite(value)) throw new Error(`valore non numerico: ${parts[3]}`);

                        // Map param names to interact actions
                        const PARAM_MAP = {
                            resistance: 'setResistance',
                            position: 'setPosition',
                            lightlevel: 'setLightLevel',
                            light: 'setLightLevel',
                            luce: 'setLightLevel',
                            angle: 'setPosition',
                            angolo: 'setPosition',
                        };
                        const action = PARAM_MAP[param] || `set${param.charAt(0).toUpperCase()}${param.slice(1)}`;
                        api.interact(compId, action, value);
                        executedActions.push(`setvalue:${compId}:${param}:${value}`);
                    }
                    else if (cmd === 'measure') {
                        // [AZIONE:measure:componentId] — legge tensione e corrente
                        if (!parts[1]) throw new Error('componente da misurare mancante');
                        const compId = resolveSingleComponentId(parts[1]) || parts[1];
                        const circuitState = api?.getCircuitState?.();
                        if (!circuitState?.measurements) throw new Error('misurazioni non disponibili — avvia la simulazione');
                        const meas = circuitState.measurements[compId];
                        if (!meas) throw new Error(`nessuna misura per ${compId}`);
                        const vStr = meas.voltage !== undefined ? `${meas.voltage.toFixed(3)} V` : 'N/D';
                        const iStr = meas.current !== undefined ? `${(meas.current * 1000).toFixed(1)} mA` : 'N/D';
                        setMessages(prev => [...prev, {
                            id: Date.now() + 2,
                            role: 'assistant',
                            content: `📊 **Misura ${compId}**: Tensione = ${vStr} | Corrente = ${iStr}`,
                            proactive: true,
                        }]);
                        executedActions.push(`measure:${compId}`);
                    }
                    else if (cmd === 'diagnose') {
                        // [AZIONE:diagnose] — analisi completa circuito
                        handleDiagnoseCircuit();
                        executedActions.push('diagnose');
                    }
                    // ── S76: Scratch Universale — Editor control action tags ──
                    else if (cmd === 'openeditor') {
                        // [AZIONE:openeditor] — apre il pannello editor codice
                        if (!api?.showEditor) throw new Error('showEditor non disponibile');
                        api.showEditor();
                        executedActions.push('openeditor');
                    }
                    else if (cmd === 'closeeditor') {
                        // [AZIONE:closeeditor] — chiude il pannello editor codice
                        if (!api?.hideEditor) throw new Error('hideEditor non disponibile');
                        api.hideEditor();
                        executedActions.push('closeeditor');
                    }
                    else if (cmd === 'switcheditor') {
                        // [AZIONE:switcheditor:scratch] or [AZIONE:switcheditor:arduino]
                        if (!api?.setEditorMode) throw new Error('setEditorMode non disponibile');
                        const mode = (parts[1] || '').toLowerCase();
                        if (mode !== 'scratch' && mode !== 'arduino') {
                            throw new Error(`modo editor non valido: ${mode} (usa 'scratch' o 'arduino')`);
                        }
                        // Auto-open editor if not visible
                        if (!api.isEditorVisible?.()) api.showEditor?.();
                        api.setEditorMode(mode);
                        executedActions.push(`switcheditor:${mode}`);
                    }
                    else if (cmd === 'loadblocks') {
                        // [AZIONE:loadblocks:xml] — carica workspace Blockly pre-costruito
                        if (!api?.loadScratchWorkspace) throw new Error('loadScratchWorkspace non disponibile');
                        const xml = parts.slice(1).join(':');
                        if (!xml) throw new Error('XML workspace mancante');
                        api.loadScratchWorkspace(xml);
                        executedActions.push('loadblocks');
                    }
                    // ── S115: Galileo Onnipotente v2 — 12 nuove azioni ──
                    else if (cmd === 'undo') {
                        if (!api?.undo) throw new Error('undo non disponibile');
                        api.undo();
                        executedActions.push('undo');
                    }
                    else if (cmd === 'redo') {
                        if (!api?.redo) throw new Error('redo non disponibile');
                        api.redo();
                        executedActions.push('redo');
                    }
                    else if (cmd === 'highlightpin') {
                        // [AZIONE:highlightpin:r1:pin1,led1:anode]
                        if (!api?.highlightPin) throw new Error('highlightPin non disponibile');
                        const rawPins = (parts.slice(1).join(':') || '').split(',').map(s => s.trim()).filter(Boolean);
                        if (!rawPins.length) throw new Error('pin da evidenziare mancanti');
                        api.highlightPin(rawPins);
                        setTimeout(() => api.highlightPin([]), 4000); // S115-FIX: clear pin highlights, not component highlights
                        executedActions.push(`highlightpin:${rawPins.join(',')}`);
                    }
                    else if (cmd === 'serialwrite') {
                        // [AZIONE:serialwrite:testo] — scrive nel monitor seriale
                        if (!api?.serialWrite) throw new Error('serialWrite non disponibile');
                        const text = parts.slice(1).join(':');
                        if (!text) throw new Error('testo seriale mancante');
                        api.serialWrite(text);
                        executedActions.push('serialwrite');
                    }
                    else if (cmd === 'setbuildmode') {
                        // [AZIONE:setbuildmode:guided] — cambia modalità costruzione
                        if (!api?.setBuildMode) throw new Error('setBuildMode non disponibile');
                        const modeMap = {
                            montato: 'complete', 'già montato': 'complete', giamontato: 'complete', complete: 'complete',
                            passopasso: 'guided', 'passo passo': 'guided', guided: 'guided',
                            libero: 'sandbox', costruisci: 'sandbox', sandbox: 'sandbox',
                        };
                        const mode = modeMap[(parts[1] || '').toLowerCase().replace(/[\s_-]+/g, '')] || parts[1];
                        if (!mode) throw new Error('modalità mancante (montato/passopasso/libero)');
                        api.setBuildMode(mode);
                        executedActions.push(`setbuildmode:${mode}`);
                    }
                    else if (cmd === 'nextstep') {
                        // [AZIONE:nextstep] — avanza di un passo in Passo Passo
                        if (!api?.nextStep) throw new Error('nextStep non disponibile');
                        api.nextStep();
                        executedActions.push('nextstep');
                    }
                    else if (cmd === 'prevstep') {
                        // [AZIONE:prevstep] — torna indietro di un passo
                        if (!api?.prevStep) throw new Error('prevStep non disponibile');
                        api.prevStep();
                        executedActions.push('prevstep');
                    }
                    else if (cmd === 'showbom') {
                        // [AZIONE:showbom] — mostra lista componenti (Bill of Materials)
                        if (!api?.showBom) throw new Error('showBom non disponibile');
                        api.showBom();
                        executedActions.push('showbom');
                    }
                    else if (cmd === 'showserial') {
                        // [AZIONE:showserial] — apre il monitor seriale
                        if (!api?.showSerialMonitor) throw new Error('showSerialMonitor non disponibile');
                        api.showSerialMonitor();
                        executedActions.push('showserial');
                    }
                    else if (cmd === 'listcomponents') {
                        // [AZIONE:listcomponents] — elenca componenti piazzati come messaggio
                        const components = getLiveComponents();
                        if (components.length === 0) {
                            setMessages(prev => [...prev, {
                                id: Date.now() + 2, role: 'assistant',
                                content: '📋 **Componenti**: Nessun componente piazzato.', proactive: true,
                            }]);
                        } else {
                            const list = components.map(c => `• **${c.id}** (${c.type})`).join('\n');
                            setMessages(prev => [...prev, {
                                id: Date.now() + 2, role: 'assistant',
                                content: `📋 **Componenti piazzati** (${components.length}):\n${list}`, proactive: true,
                            }]);
                        }
                        executedActions.push('listcomponents');
                    }
                    else if (cmd === 'getstate') {
                        // [AZIONE:getstate] — mostra stato completo del circuito
                        const circuitState = api?.getCircuitState?.() || api?.galileo?.getCircuitState?.();
                        if (!circuitState) throw new Error('stato circuito non disponibile');
                        const comps = (circuitState.components || []).length;
                        const wires = (circuitState.connections || []).length;
                        const simState = circuitState.isSimulating ? '▶ In esecuzione' : '⏸ Fermata';
                        const expName = circuitState.experiment?.title || 'Nessuno';
                        setMessages(prev => [...prev, {
                            id: Date.now() + 2, role: 'assistant',
                            content: `📊 **Stato Circuito**:\n• Esperimento: **${expName}**\n• Componenti: **${comps}**\n• Fili: **${wires}**\n• Simulazione: **${simState}**`,
                            proactive: true,
                        }]);
                        executedActions.push('getstate');
                    }
                    // ── S115: Code Control — Galileo scrive/legge codice Arduino e Scratch ──
                    else if (cmd === 'setcode') {
                        // [AZIONE:setcode:CODE] — sostituisce tutto il codice nell'editor
                        const arg = parts.slice(1).join(':').replace(/\\n/g, '\n');
                        if (!arg) throw new Error('codice mancante');
                        if (!api?.setEditorCode) throw new Error('setEditorCode non disponibile');
                        api.showEditor?.();
                        api.setEditorMode?.('arduino');
                        api.setEditorCode(arg);
                        executedActions.push('setcode');
                    }
                    else if (cmd === 'appendcode') {
                        // [AZIONE:appendcode:CODE] — aggiunge codice alla fine dell'editor
                        const arg = parts.slice(1).join(':').replace(/\\n/g, '\n');
                        if (!arg) throw new Error('codice mancante');
                        if (!api?.appendEditorCode) throw new Error('appendEditorCode non disponibile');
                        api.showEditor?.();
                        api.setEditorMode?.('arduino');
                        api.appendEditorCode(arg);
                        executedActions.push('appendcode');
                    }
                    else if (cmd === 'getcode') {
                        // [AZIONE:getcode] — legge il codice corrente e lo mostra nel chat
                        const code = api?.getEditorCode?.() || '';
                        const mode = api?.getEditorMode?.() || 'arduino';
                        const displayCode = code ? code.substring(0, 500) + (code.length > 500 ? '\n// ... (troncato)' : '') : '(vuoto)';
                        setMessages(prev => [...prev, {
                            id: Date.now() + 2, role: 'assistant',
                            content: `📝 **Codice ${mode === 'scratch' ? 'Scratch (generato)' : 'Arduino'}**:\n\`\`\`cpp\n${displayCode}\n\`\`\``,
                            proactive: true,
                        }]);
                        executedActions.push('getcode');
                    }
                    else if (cmd === 'resetcode') {
                        // [AZIONE:resetcode] — ripristina il codice originale dell'esperimento
                        if (!api?.resetEditorCode) throw new Error('resetEditorCode non disponibile');
                        api.showEditor?.();
                        api.setEditorMode?.('arduino');
                        api.resetEditorCode();
                        executedActions.push('resetcode');
                    }
                } catch (err) {
                    recordActionFailure(tagText, err?.message || 'errore sconosciuto');
                }
            }

            if (actionFailures.length > 0) {
                const uniqueFailures = [...new Set(actionFailures)];
                errorHistoryRef.current.push(...uniqueFailures.map(f => `action_fail:${f}`));
                if (errorHistoryRef.current.length > 10) {
                    errorHistoryRef.current = errorHistoryRef.current.slice(-10);
                }
                if (typeof console !== 'undefined') {
                    console.warn('[Galileo] Action failures:', uniqueFailures);
                }
            }

            // ── S58: Quiz fallback — if user asked for quiz but AI forgot the tag ──
            // Dispatches without expId so simulator handler uses its own currentExperiment
            const quizKeywords = /\b(quiz|verificami|testami|domande\s+di\s+verifica)\b/i;
            if (quizKeywords.test(userLower) && !executedActions.some(a => a === 'quiz')) {
                const expId = activeExperiment?.id || null;
                window.dispatchEvent(new CustomEvent('galileo-quiz', { detail: { experimentId: expId } }));
                executedActions.push('quiz');
            }

            // Update message with executed actions for badge display
            if (executedActions.length > 0) {
                setMessages(prev => prev.map(m =>
                    m.id === msgId ? { ...m, _executedActions: executedActions } : m
                ));
            }

            // ── Implicit navigation from AI response text ──
            if (!actionTags.length) {
                if (aiLower.includes('simulatore') || aiLower.includes('circuito')) {
                    setActiveTab('simulator');
                }

                const elabPageMatch = aiResponse.match(/\[V(\d)P(\d+)\]/i);
                const volPageMatch2 = aiLower.match(/(?:volume|vol\.?|v)\s*(\d)\s*(?:pagina|pag\.?|p\.?)\s*(\d+)/i) ||
                    aiLower.match(/v(\d)p(\d+)/i);
                const simplePageMatch = aiLower.match(/pagina\s*(\d+)/);

                if (elabPageMatch) {
                    const vol = parseInt(elabPageMatch[1]);
                    const pageNum = parseInt(elabPageMatch[2]);
                    loadVolume(vol).then(() => setCurrentDocPage(Math.max(0, pageNum - 1))).catch(() => { });
                    setActiveTab('manual');
                } else if (volPageMatch2) {
                    const vol = parseInt(volPageMatch2[1]);
                    const pageNum = parseInt(volPageMatch2[2]);
                    loadVolume(vol).then(() => setCurrentDocPage(Math.max(0, pageNum - 1))).catch(() => { });
                    setActiveTab('manual');
                } else if (simplePageMatch) {
                    const pageNum = parseInt(simplePageMatch[1]);
                    const volMention = aiLower.match(/(?:volume|vol\.?)\s*(\d)/);
                    const vol = volMention ? parseInt(volMention[1]) : 1;
                    loadVolume(vol).then(() => setCurrentDocPage(Math.max(0, pageNum - 1))).catch(() => { });
                    setActiveTab('manual');
                }

                if (userLower.includes('led') && (userLower.includes('accendi') || userLower.includes('spegni'))) {
                    setActiveTab('simulator');
                }
            }

        } else {
            const errorMsg = result.error || 'Errore sconosciuto';
            let friendlyError = errorMsg;
            if (errorMsg.includes('Timeout') || errorMsg.includes('timeout')) {
                friendlyError = 'Galileo ci sta mettendo un po\'. Riprova tra qualche secondo.';
            } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
                friendlyError = 'Controlla la connessione internet e riprova.';
            } else if (errorMsg.includes('500') || errorMsg.includes('502') || errorMsg.includes('503')) {
                friendlyError = 'Il server ha un problema temporaneo. Riprova tra un momento.';
            }
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: friendlyError,
                isError: true,
                retryMessage: userMessage
            }]);
        }
        setIsLoading(false);
    };

    const handleRetry = (retryMessage) => {
        setMessages(prev => prev.filter(m => !m.isError || m.retryMessage !== retryMessage));
        handleSend(retryMessage);
    };

    // (handleCompile rimosso — editor Arduino eliminato)

    // ===================== QUICK ACTIONS =====================

    const showLessonChecklist = useCallback(() => {
        setShowChat(true);
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: `**Checklist Lezione (30 min)**\n\n- Obiettivo spiegato in 1 frase (oggi cosa impariamo?)\n- Manuale Vol.1 aperto sulla pagina iniziale\n- Simulatore avviato con 1 circuito base (LED + resistenza)\n- Almeno 1 prova fatta dagli studenti (Play/Stop o piccola modifica)\n- Chiusura con 1 domanda di riflessione + 1 mini compito per casa\n\nSe vuoi, ti preparo anche una scaletta pronta da leggere in classe.`
        }]);
    }, []);

    const defaultQuickActions = [
        { text: 'Esperimento', action: () => setActiveTab('simulator') },
        { text: 'Manuale', action: () => setActiveTab('manual') },
        { text: '🔍 Diagnosi Circuito', action: handleDiagnoseCircuit },
        { text: '💡 Suggerimenti', action: handleGetHints },
        {
            text: 'Fammi una domanda guida',
            action: () => handleSend('Fammi una domanda guida su questo argomento. Usa parole semplici, una domanda alla volta, adatta a ragazzi 8-14 anni.')
        },
        {
            text: 'Aiutami senza dirmi la risposta',
            action: () => handleSend('Aiutami a risolvere questo esercizio senza dirmi la risposta finale. Guidami passo passo con suggerimenti brevi per studenti 8-14 anni.')
        },
        {
            text: 'Controlla il mio ragionamento',
            action: () => handleSend('Controlla il mio ragionamento: dimmi cosa va bene, cosa migliorare e fammi una domanda di verifica. Tono chiaro per eta 8-14.')
        },
        {
            text: 'Dammi un indizio',
            action: () => handleSend('Dammi solo un indizio breve per andare avanti, senza spoiler della soluzione. Linguaggio semplice per 8-14 anni.')
        },
        { text: 'Trova il Guasto', action: () => setActiveTab('detective') },
        { text: 'Prevedi e Spiega', action: () => setActiveTab('poe') },
        { text: 'Circuito Misterioso', action: () => setActiveTab('reverse') },
        { text: 'Controlla Circuito', action: () => setActiveTab('review') },
        { text: 'Lavagna', action: () => setActiveTab('canvas') },
    ];

    const quickActions = isDocente
        ? [
            { text: 'Apri Manuale Vol1', action: () => { setActiveTab('manual'); loadVolume(1); } },
            { text: 'Apri Simulatore Base', action: () => { setPendingExperimentId(null); setActiveTab('simulator'); } },
            { text: 'Checklist Lezione', action: showLessonChecklist },
            ...defaultQuickActions,
        ]
        : defaultQuickActions;

    const isMobile = useIsMobile(768);

    // ===================== RENDER =====================

    return (
        <SessionRecorderProvider>
            <div className={`elab-v4 ${isFullscreen ? 'fullscreen-mode' : ''}`}>
                <TutorLayout
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    messages={messages}
                    input={input}
                    onInputChange={setInput}
                    onSend={handleSend}
                    isLoading={isLoading}
                    onRetry={handleRetry}
                    quickActions={quickActions}
                    showChat={showChat}
                    onToggleChat={() => setShowChat(p => !p)}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleNativeFullscreen}
                    sessionLogLength={sessionLog.length}
                    onExportSession={exportSession}
                    selectedVolume={selectedVolume}
                    isMobile={isMobile}
                    socraticMode={isSocraticMode}
                    onToggleSocraticMode={() => setIsSocraticMode(prev => !prev)}
                    allowedGames={isDocente ? null : user?.classActiveGames ?? null}
                    onScreenshot={async () => {
                        try {
                            const { dataUrl, source: captureSource } = await captureActiveVisualContext('screenshot');
                            if (dataUrl) {
                                const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
                                const images = [{ base64, mimeType: 'image/png' }];
                                const isCanvas = captureSource === 'tutor-canvas' || captureSource === 'simulator-whiteboard';
                                const isManualPage = captureSource === 'manual-page' || captureSource === 'document-page';
                                const chatMsg = isCanvas
                                    ? 'Analizza questo disegno dalla lavagna e dimmi cosa vedi, se ci sono errori o suggerimenti.'
                                    : isManualPage
                                        ? 'Analizza questa pagina e spiegami i concetti principali in modo semplice.'
                                        : 'Analizza questa schermata del simulatore e dimmi se vedi qualcosa di sbagliato o se va tutto bene.';
                                setMessages(prev => [...prev, {
                                    id: Date.now(), role: 'user',
                                    content: isCanvas ? 'Analizza il mio disegno dalla lavagna' : isManualPage ? 'Analizza questa pagina' : 'Analizza questa schermata',
                                    image: dataUrl,
                                }]);
                                setShowChat(true);
                                setIsLoading(true);
                                // Canvas screenshots: no circuit context (distract vision)
                                // Simulator screenshots: include full context
                                const result = isCanvas
                                    ? await sendChat(chatMsg, images, {
                                        socraticMode: isSocraticMode,
                                        experimentContext: null,
                                        circuitState: null,
                                        experimentId: null,
                                    })
                                    : isManualPage
                                        ? await sendChat(chatMsg, images, {
                                            socraticMode: isSocraticMode,
                                            experimentContext: null,
                                            circuitState: null,
                                            experimentId: null,
                                        })
                                        : await sendChat(chatMsg, images, {
                                            socraticMode: isSocraticMode,
                                            experimentContext: buildTutorContext(),
                                            circuitState: circuitStateRef.current?.structured
                                                ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
                                                : (circuitStateRef.current ? { raw: circuitStateRef.current } : null),
                                            experimentId: activeExperiment?.id || null,
                                        });
                                setIsLoading(false);
                                if (result.success) {
                                    const displayText = (result.response || '').replace(/\[azione:[^\]]+\]/gi, '').replace(/\n{3,}/g, '\n\n').trim();
                                    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: displayText, source: result.source || null }]);
                                } else {
                                    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Non sono riuscito ad analizzare lo screenshot. Riprova!', isError: true }]);
                                }
                            } else {
                                setShowChat(true);
                                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Non c\'e nulla da catturare. Apri il simulatore o la lavagna e riprova!' }]);
                            }
                        } catch (err) {
                            setIsLoading(false);
                            if (typeof console !== 'undefined') console.warn('[Screenshot] Error:', err);
                        }
                    }}
                >
                    {/* === CONTENT PANEL === */}
                    <div className="v4-panel" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <TabHint tabId={activeTab} onDismiss={() => { }} />

                        {activeTab === 'manual' && (
                            <ManualTab
                                selectedVolume={selectedVolume}
                                volumePages={volumePages}
                                loadingVolume={loadingVolume}
                                volumeProgress={volumeProgress}
                                onLoadVolume={loadVolume}
                                uploadedDocs={uploadedDocs}
                                currentDoc={currentDoc}
                                currentDocPage={currentDocPage}
                                viewMode={viewMode}
                                fitMode={fitMode}
                                pdfZoom={pdfZoom}
                                onSetUploadedDocs={setUploadedDocs}
                                onSetCurrentDoc={setCurrentDoc}
                                onSetCurrentDocPage={setCurrentDocPage}
                                onSetViewMode={setViewMode}
                                onSetFitMode={setFitMode}
                                onSetPdfZoom={setPdfZoom}
                                onSendDocScreenshot={sendDocScreenshotToChat}
                                onToggleFullscreen={toggleNativeFullscreen}
                                isFullscreen={isFullscreen}
                                docViewerRef={docViewerRef}
                            />
                        )}

                        <div style={{ display: activeTab === 'simulator' ? 'block' : 'none', height: activeTab === 'simulator' ? '100%' : 0 }}>
                            <NewElabSimulator
                                onExperimentChange={handleExperimentChange}
                                onCircuitStateChange={(ctx) => { circuitStateRef.current = ctx; }}
                                onCircuitEvent={handleCircuitEvent}
                                initialExperimentId={pendingExperimentId}
                                onInitialExperimentConsumed={() => setPendingExperimentId(null)}
                                userKits={isDocente || user?.ruolo === 'admin' ? null : (user?.kits || [])}
                                onDiagnoseCircuit={handleDiagnoseCircuit}
                                onGetHints={handleGetHints}
                                onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                                onSendImageToGalileo={handleSendImageToGalileo}
                                messagesRef={messagesForReportRef}
                                quizResultsRef={quizResultsForReportRef}
                                sessionStartRef={sessionStartRef}
                                circuitStateRef={circuitStateRef}
                            />
                        </div>

                        {activeTab === 'detective' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <CircuitDetective
                                    onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'poe' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <PredictObserveExplain
                                    onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'reverse' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <ReverseEngineeringLab
                                    onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'review' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <CircuitReview
                                    onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'canvas' && (
                            <CanvasTab
                                canvasRef={canvasRef}
                                ctxRef={ctxRef}
                                slides={slides}
                                onSetIsPresentationMode={setIsPresentationMode}
                                onAddCanvasToSlides={addCanvasToSlides}
                                activeNotebookId={activeNotebookId}
                                activePageIndex={activePageIndex}
                                onChangePage={changePage}
                                onSetShowChat={setShowChat}
                                onSetMessages={setMessages}
                                onSetIsLoading={setIsLoading}
                                onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                                onSendImageToGalileo={handleSendImageToGalileo}
                            />
                        )}

                        {activeTab === 'notebooks' && (
                            <NotebooksTab
                                notebooks={notebooks}
                                activeNotebookId={activeNotebookId}
                                activePageIndex={activePageIndex}
                                notebookTitle={notebookTitle}
                                onSetNotebookTitle={setNotebookTitle}
                                onCreateNotebook={createNotebook}
                                onOpenNotebook={openNotebook}
                                onDeleteNotebook={deleteNotebookNew}
                                onCloseNotebook={closeNotebook}
                                onChangePage={changePage}
                                onAddPage={addPage}
                                onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                            />
                        )}

                        {activeTab === 'videos' && (
                            <VideosTab
                                youtubeUrl={youtubeUrl}
                                currentVideoId={currentVideoId}
                                onSetYoutubeUrl={setYoutubeUrl}
                                onSetCurrentVideoId={setCurrentVideoId}
                                onAddYoutubeVideo={addYoutubeVideo}
                                meetLink={meetLink}
                                meetActive={meetActive}
                                meetCopied={meetCopied}
                                onSetMeetLink={setMeetLink}
                                onSetMeetActive={setMeetActive}
                                onStartMeet={startMeet}
                                onJoinMeet={joinMeet}
                                onCopyMeetLink={copyMeetLink}
                                onStopMeet={stopMeet}
                                onSendToGalileo={(msg) => { setShowChat(true); handleSend(msg); }}
                            />
                        )}

                        {/* © Andrea Marro — 27/02/2026 — ELAB Tutor — Tutti i diritti riservati */}
                    </div>
                </TutorLayout>

                {/* Presentation Modal */}
                {isPresentationMode && slides.length > 0 && (
                    <PresentationModal
                        slides={slides}
                        currentSlideIndex={currentSlideIndex}
                        onGoToSlide={goToSlide}
                        onClose={() => setIsPresentationMode(false)}
                    />
                )}

                {/* GDPR: Analytics Consent Banner */}
                <ConsentBanner />
                {/* S99: Custom confirmation modal */}
                <ConfirmDialog />
            </div>
        </SessionRecorderProvider>
    );
}
