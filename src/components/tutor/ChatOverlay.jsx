// ============================================
// ELAB Tutor - Chat Galileo Overlay
// Modern AI chat interface (Claude.ai / NotebookLM style)
// Floating panel, bottom-right
// © Andrea Marro — 13/02/2026
// ============================================

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
// -- XSS-safe markdown formatter --
// SECURITY: HTML escape FIRST, then markdown regex. Defense-in-depth strip after.
function formatMarkdown(text) {
    if (!text) return '';
    // Step 0 (Galileo Onnipotente): defense-in-depth strip of any residual action tags
    let clean = text.replace(/\[AZIONE:[^\]]+\]/gi, '');
    // Step 1: escape ALL HTML entities (prevents <script>, <iframe>, etc.)
    let safe = clean
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    // Step 2: convert markdown to safe HTML subset
    let html = safe
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Markdown links: [text](url) — only http/https
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);text-decoration:underline">$1</a>')
        // Raw URLs (not already inside href="...") — only http/https
        .replace(/(?<!href="|">)(https?:\/\/[^\s<)"]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);text-decoration:underline">$1</a>')
        .replace(/\n/g, '<br/>');
    // Step 3: defense-in-depth — strip any residual event handlers or dangerous tags
    html = html.replace(/\bon\w+\s*=/gi, '');
    html = html.replace(/<\s*\/?\s*(script|iframe|object|embed|form|style)\b[^>]*>/gi, '');
    return html;
}

// -- Default quick suggestions (Italian) --
const DEFAULT_SUGGESTIONS = [
    "Come funziona un LED?",
    "Cosa fa un resistore?",
    "Aiutami con questo circuito",
    "Spiega la Legge di Ohm",
];

// -- Bounce keyframes (injected once) --
const KEYFRAMES_ID = 'galileo-chat-keyframes';
function ensureKeyframes() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(KEYFRAMES_ID)) return;
    const style = document.createElement('style');
    style.id = KEYFRAMES_ID;
    style.textContent = `
        @keyframes galileoBounce {
            0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }
        @keyframes galileoFadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes galileoPanelIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes galileoMsgIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Scoped bubble content styles (code blocks inside markdown) */
        .galileo-bubble-content code {
            background: rgba(0, 0, 0, 0.06);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Fira Code', 'Consolas', monospace;
            font-size: 0.88em;
        }
        .galileo-bubble-content pre {
            background: var(--color-code-bg);
            color: var(--color-code-text);
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 8px 0;
            font-size: 0.85em;
            line-height: 1.5;
        }
        .galileo-bubble-content pre code {
            background: transparent;
            padding: 0;
            color: inherit;
        }
        .galileo-bubble-content strong {
            font-weight: 700;
        }

        /* Scrollbar styling for messages area */
        .galileo-messages-scroll::-webkit-scrollbar {
            width: 5px;
        }
        .galileo-messages-scroll::-webkit-scrollbar-thumb {
            background: var(--color-border-hover);
            border-radius: 3px;
        }
        .galileo-messages-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
    `;
    document.head.appendChild(style);
}

// -- Typing indicator (animated 3 dots) --
function TypingIndicator() {
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            animation: 'galileoMsgIn 0.25s ease',
        }}>
            <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--color-primary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, marginTop: '2px',
            }}>
                <span style={{ fontSize: '14px', lineHeight: 1 }} role="img" aria-hidden="true">G</span>
            </div>
            <div style={{
                display: 'flex', gap: '5px', padding: '14px 18px',
                background: 'var(--color-bg-secondary)', borderRadius: '16px 16px 16px 4px',
                width: 'fit-content', alignItems: 'center',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: 'var(--color-chat-thinking)',
                        animation: `galileoBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    );
}

// -- Suggestion chip --
function SuggestionChip({ text, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: hovered ? 'var(--color-chat-hover-bg)' : 'var(--color-bg-tertiary)',
                border: '1px solid ' + (hovered ? 'var(--color-chat-hover-border)' : 'var(--color-border)'),
                fontSize: '14px',
                color: hovered ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: "'Open Sans', -apple-system, sans-serif",
                lineHeight: '1.4',
                whiteSpace: 'nowrap',
                minHeight: '44px',
            }}
        >
            {text}
        </button>
    );
}

// ============================
// Main ChatOverlay component
// ============================
export default React.memo(function ChatOverlay({
    messages,
    input,
    onInputChange,
    onSend,
    isLoading,
    onRetry,
    quickActions,
    // Visibility
    visible,
    onClose,
    // Size state
    expanded,
    onToggleExpanded,
    // Socratic mode
    socraticMode = true,
    onToggleSocraticMode,
    // Screenshot
    onScreenshot,
}) {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [minimized, setMinimized] = useState(false);
    const [sendHovered, setSendHovered] = useState(false);
    // (codeHovered rimosso — editor eliminato)
    const [actionsExpanded, setActionsExpanded] = useState(false);

    // ── Draggable & Fullscreen State ──
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [position, setPosition] = useState({ x: -24, y: -24 }); // Base offset via transform
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    // Inject keyframes on mount
    useEffect(() => { ensureKeyframes(); }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Focus input when overlay opens
    useEffect(() => {
        if (visible && !minimized && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 250);
            return () => clearTimeout(timer);
        }
    }, [visible, minimized]);

    // Handle Enter key in textarea
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                onSend();
            }
        }
    }, [input, isLoading, onSend]);

    // Handle suggestion click
    const handleSuggestion = useCallback((text) => {
        onInputChange(text);
        // Send immediately after setting
        setTimeout(() => onSend(), 50);
    }, [onInputChange, onSend]);

    // Determine if we should show default suggestions
    const showDefaultSuggestions = useMemo(() => {
        return messages.length <= 1 && !isLoading;
    }, [messages.length, isLoading]);

    // ── Drag Logic ──
    const handlePointerDown = (e) => {
        if (isFullscreen || minimized) return; // Don't drag if fullscreen or minimized
        // Check if clicking on buttons
        if (e.target.closest('button')) return;

        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
            x: dragRef.current.initialX + dx,
            y: dragRef.current.initialY + dy
        });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
    };

    if (!visible) return null;

    // --- S85: Viewport-responsive chat dimensions ---
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const panelWidth = expanded
        ? (vw < 820 ? 320 : vw < 1024 ? 360 : vw < 1440 ? 390 : 420)
        : (vw < 820 ? 260 : vw < 1024 ? 300 : vw < 1440 ? 340 : 380);
    const panelHeight = expanded
        ? (vw < 820 ? 500 : 600)
        : (vw < 820 ? 400 : 480);

    // ========================
    // MINIMIZED STATE
    // ========================
    if (minimized) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '24px', right: '24px',
                width: `${panelWidth}px`,
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                zIndex: 400,
                animation: 'galileoFadeInUp 0.2s ease',
            }}>
                {/* Header only */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
                    cursor: 'pointer',
                }} onClick={() => setMinimized(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/elab-mascot.png" alt="Galileo"
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.3px' }}>
                            Galileo
                        </span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '14px', opacity: 0.8, fontFamily: 'Open Sans, sans-serif',
                        }}>
                            <span style={{
                                width: '7px', height: '7px', borderRadius: '50%',
                                background: 'var(--color-accent)', display: 'inline-block',
                            }} />
                            Online
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <HeaderButton onClick={(e) => { e.stopPropagation(); setMinimized(false); }} title="Espandi">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="17 11 12 6 7 11" /><polyline points="17 18 12 13 7 18" />
                            </svg>
                        </HeaderButton>
                        <HeaderButton onClick={(e) => { e.stopPropagation(); setMinimized(false); onClose(); }} title="Chiudi chat">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </HeaderButton>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // FULL PANEL
    // ========================
    const panelStyle = isFullscreen ? {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh',
        transform: 'none', resize: 'none',
        background: 'var(--color-bg)', display: 'flex', flexDirection: 'column',
        fontFamily: "'Open Sans', -apple-system, sans-serif",
    } : {
        position: 'fixed',
        bottom: 0, right: 0, transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${panelWidth}px`, height: `${panelHeight}px`,
        maxWidth: '100vw', maxHeight: '100vh',
        background: 'var(--color-bg)', borderRadius: '16px',
        boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        zIndex: 400, transition: isDragging ? 'none' : 'width 300ms ease, height 300ms ease',
        animation: 'galileoPanelIn 0.3s ease',
        fontFamily: "'Open Sans', -apple-system, sans-serif",
        resize: 'both', overflow: 'hidden', // Make it natively resizable
        minWidth: '320px', minHeight: '400px',
    };

    return (
        <div style={panelStyle}>

            {/* ======== HEADER ======== */}
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
                    borderRadius: isFullscreen ? '0' : '16px 16px 0 0',
                    flexShrink: 0,
                    cursor: isFullscreen ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                    userSelect: 'none', touchAction: 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/elab-mascot.png" alt="Galileo"
                        style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '15px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.3px' }}>
                            Galileo
                        </span>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '14px', opacity: 0.8,
                        }}>
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: 'var(--color-accent)', display: 'inline-block',
                            }} />
                            {isLoading ? 'Sta scrivendo...' : 'Sono qui'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                    <HeaderButton onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? 'Riduci Finestra' : 'A Tutto Schermo'}>
                        {isFullscreen ? (
                            /* Minimize — 4 inward corner brackets (distinct from "Comprimi" diagonal arrows) */
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                            </svg>
                        ) : (
                            /* Maximize — 4 outward corner brackets (distinct from "Espandi Larghezza" diagonal arrows) */
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            </svg>
                        )}
                    </HeaderButton>
                    {!isFullscreen && (
                        <HeaderButton onClick={() => setMinimized(true)} title="Riduci a barra">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </HeaderButton>
                    )}
                    {!isFullscreen && (
                        <HeaderButton onClick={onToggleExpanded} title={expanded ? 'Comprimi' : 'Espandi Larghezza'}>
                            {expanded ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                                    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            )}
                        </HeaderButton>
                    )}
                    <HeaderButton onClick={onClose} title="Chiudi chat (Esc)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </HeaderButton>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '10px 16px',
                background: 'var(--color-chat-suggestion-bg)',
                borderBottom: '1px solid var(--color-chat-suggestion-border)',
                flexShrink: 0,
            }}>
                <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    letterSpacing: '0.2px',
                    fontFamily: 'Open Sans, sans-serif',
                }}>
                    Modalità Guida
                </span>
                <button
                    type="button"
                    onClick={() => onToggleSocraticMode?.()}
                    aria-pressed={socraticMode}
                    aria-label="Attiva o disattiva Modalità Guida"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: socraticMode ? '1px solid var(--color-accent-hover)' : '1px solid var(--color-border-hover)',
                        background: socraticMode ? 'var(--color-accent)' : 'var(--color-border)',
                        color: socraticMode ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                        borderRadius: '999px',
                        padding: '4px 10px 4px 4px',
                        minHeight: '44px',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        fontSize: '14px',
                        fontWeight: 700,
                    }}
                >
                    <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--color-bg)',
                        display: 'inline-block',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                    {socraticMode ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* ======== MESSAGES AREA ======== */}
            <div
                ref={messagesContainerRef}
                className="galileo-messages-scroll"
                style={{
                    flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    background: 'var(--color-bg)',
                    scrollBehavior: 'smooth',
                }}
            >
                {/* AI Disclaimer — shown at chat start */}
                {messages.length <= 1 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', margin: '0 0 8px',
                        background: 'var(--color-chat-socratic-bg)', borderRadius: '10px',
                        border: '1px solid var(--color-chat-socratic-border)', fontSize: '14px',
                        color: 'var(--color-chat-socratic-text)', lineHeight: '1.4',
                    }}>
                        <span style={{ flexShrink: 0, fontWeight: 700, color: 'var(--color-vol2)' }}>{'\u26A0'}</span>
                        <span>Galileo è un assistente AI e può commettere errori. Verifica sempre le informazioni importanti con il tuo insegnante.</span>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onRetry={onRetry}
                    />
                ))}

                {/* Typing indicator */}
                {isLoading && <TypingIndicator />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>


            {/* ======== QUICK SUGGESTIONS (default + dynamic) ======== */}
            {(showDefaultSuggestions || (quickActions && quickActions.length > 0)) && (
                <div style={{
                    display: 'flex', gap: '8px', flexWrap: 'wrap',
                    padding: '8px 16px 4px',
                    borderTop: '1px solid var(--color-chat-footer-border)',
                    overflowX: 'auto',
                }}>
                    {/* Show dynamic quickActions — first 3 by default, all when expanded */}
                    {quickActions && quickActions.length > 0 && (
                        <>
                            {(actionsExpanded ? quickActions : quickActions.slice(0, 3)).map((a, i) => (
                                <SuggestionChip key={`qa-${i}`} text={a.text} onClick={a.action} />
                            ))}
                            {quickActions.length > 3 && (
                                <button
                                    onClick={() => setActionsExpanded(!actionsExpanded)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '20px',
                                        background: actionsExpanded ? 'var(--color-chat-actions-bg)' : 'var(--color-bg-tertiary)',
                                        border: '1px solid var(--color-chat-actions-border)',
                                        fontSize: '14px',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        fontFamily: "'Open Sans', -apple-system, sans-serif",
                                        lineHeight: '1.4',
                                        whiteSpace: 'nowrap',
                                        minHeight: '44px',
                                        fontWeight: '600',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    {actionsExpanded ? '\u25B2 Meno' : `\u25BC Altro (${quickActions.length - 3})`}
                                </button>
                            )}
                        </>
                    )}
                    {/* Show default suggestions only when chat is nearly empty and no dynamic actions */}
                    {showDefaultSuggestions && (!quickActions || quickActions.length === 0) && DEFAULT_SUGGESTIONS.map((s, i) => (
                        <SuggestionChip key={`ds-${i}`} text={s} onClick={() => handleSuggestion(s)} />
                    ))}
                </div>
            )}

            {/* ======== INPUT AREA ======== */}
            <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '8px',
                padding: '12px 16px 14px',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-chat-footer-bg)',
                flexShrink: 0,
            }}>
                {/* Text input */}
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Chiedi a Galileo..."
                    disabled={isLoading}
                    rows={1}
                    style={{
                        flex: 1,
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '11px 14px',
                        fontSize: '15px',
                        fontFamily: "'Open Sans', -apple-system, sans-serif",
                        outline: 'none',
                        resize: 'none',
                        minHeight: '44px',
                        maxHeight: '120px',
                        lineHeight: '1.45',
                        transition: 'border-color 200ms',
                        background: isLoading ? 'var(--color-bg-secondary)' : 'var(--color-bg)',
                        color: 'var(--color-text)',
                        boxSizing: 'border-box',
                        overflowY: 'auto',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,77,140,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />

                {/* Screenshot button (always visible) */}
                {onScreenshot && (
                    <button
                        onClick={onScreenshot}
                        disabled={isLoading}
                        aria-label="Cattura screenshot e chiedi a Galileo"
                        title="Cattura screenshot"
                        style={{
                            width: '44px', height: '44px', borderRadius: '10px',
                            background: isLoading ? 'var(--color-border)' : 'var(--color-chat-camera-bg)',
                            color: isLoading ? 'var(--color-muted)' : 'var(--color-primary)',
                            border: '1px solid ' + (isLoading ? 'var(--color-border)' : 'var(--color-chat-camera-border)'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 150ms',
                            flexShrink: 0,
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </button>
                )}

                {/* Send button */}
                <button
                    onClick={() => onSend()}
                    disabled={!input.trim() || isLoading}
                    onMouseEnter={() => setSendHovered(true)}
                    onMouseLeave={() => setSendHovered(false)}
                    aria-label="Invia messaggio"
                    style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: (!input.trim() || isLoading) ? 'var(--color-chat-disabled-bg)' : (sendHovered ? 'var(--color-primary-hover)' : 'var(--color-primary)'),
                        color: 'white', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                        transition: 'background 150ms, transform 100ms',
                        flexShrink: 0,
                        transform: sendHovered && input.trim() && !isLoading ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>

            {/* ======== AI DISCLAIMER FOOTER ======== */}
            <div style={{
                textAlign: 'center', padding: '4px 16px 6px',
                fontSize: '14px', color: 'var(--color-text-secondary)',
                background: 'var(--color-chat-footer-bg)', borderTop: '1px solid var(--color-chat-footer-border)',
                lineHeight: '1.3', flexShrink: 0,
            }}>
                Le risposte di Galileo sono generate dall'AI e potrebbero non essere accurate.
            </div>
        </div>
    );
})

// ============================
// Sub-components
// ============================

// -- Header control button --
function HeaderButton({ onClick, title, children }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '44px', height: '44px', borderRadius: '8px',
                background: hovered ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms',
                padding: 0,
            }}
        >
            {children}
        </button>
    );
}

// ── GALILEO ONNIPOTENTE: Map action commands to human-readable Italian labels ──
function actionToLabel(action) {
    const cmd = (action || '').split(':')[0];
    const labels = {
        play: '\u25B6 Avviato',
        pause: '\u23F8 In pausa',
        reset: '\u21BA Resettato',
        highlight: '\uD83D\uDD0D Evidenziato',
        loadexp: '\uD83D\uDCE6 Caricato',
        opentab: '\uD83D\uDCC2 Aperto',
        openvolume: '\uD83D\uDCD6 Manuale',
        addwire: '\uD83D\uDD17 Filo aggiunto',
        removewire: '\u2702 Filo rimosso',
        addcomponent: '\u2795 Componente aggiunto',
        removecomponent: '\u2796 Componente rimosso',
        interact: '\uD83D\uDD98 Interazione',
        compile: '\u2699 Compilato',
        movecomponent: '\u21C4 Spostato',
        clearall: '\uD83D\uDDD1 Pulito tutto',
        quiz: '\u2753 Quiz aperto',
        youtube: '\uD83C\uDFA5 Ricerca video',
        setcode: '\uD83D\uDCDD Codice impostato',
    };
    return labels[cmd] || `\u2705 ${action}`;
}

// -- Message bubble (Galileo or User) --
function MessageBubble({ msg, onRetry }) {
    const isUser = msg.role === 'user';
    const isError = msg.isError;

    // Format content safely
    const htmlContent = formatMarkdown(
        typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || '')
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '12px',
            animation: 'galileoMsgIn 0.25s ease',
        }}>
            {/* Avatar */}
            {!isUser && (
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--color-primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                    color: 'var(--color-text-inverse)', fontSize: '14px', fontWeight: 700,
                    fontFamily: 'Oswald, sans-serif',
                }}>
                    G
                </div>
            )}

            <div style={{
                maxWidth: '85%', display: 'flex', flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
            }}>
                {/* Image attachment — supports image, imageUrl, and attachment fields */}
                {(msg.image || msg.imageUrl || msg.attachment) && (
                    <img
                        src={msg.image || msg.imageUrl || msg.attachment}
                        alt="Allegato"
                        style={{
                            maxWidth: '100%',
                            borderRadius: '8px',
                            marginTop: '8px',
                            display: 'block',
                            border: '1px solid rgba(0,0,0,0.08)',
                        }}
                    />
                )}

                {/* Bubble */}
                <div
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    style={{
                        padding: '12px 16px',
                        background: isError
                            ? 'var(--color-chat-msg-error-bg)'
                            : (isUser ? 'var(--color-primary)' : 'var(--color-bg-secondary)'),
                        color: isError
                            ? 'var(--color-chat-msg-error-text)'
                            : (isUser ? 'var(--color-text-inverse)' : 'var(--color-text)'),
                        borderRadius: isUser
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                        fontSize: '15px',
                        lineHeight: '1.55',
                        wordBreak: 'break-word',
                        border: isError ? '1px solid var(--color-chat-msg-error-border)' : 'none',
                        // Code block styling via nested CSS (handled by ElabTutorV4.css .v4-bubble fallback)
                    }}
                    className="galileo-bubble-content"
                />

                {/* ── GALILEO ONNIPOTENTE: Executed actions badge ── */}
                {msg._executedActions?.length > 0 && (
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '4px',
                        marginTop: '6px',
                    }}>
                        {msg._executedActions.map((action, i) => (
                            <span key={i} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '3px',
                                padding: '2px 8px', background: 'var(--color-chat-action-tag-bg)',
                                borderRadius: '10px', fontSize: '14px', color: 'var(--color-chat-action-tag-text)',
                                fontWeight: 600, lineHeight: '1.4',
                                animation: 'galileoFadeInUp 0.3s ease',
                            }}>
                                {actionToLabel(action)}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── GALILEO ONNIPOTENTE: YouTube search card ── */}
                {msg.youtubeSearch && (
                    <a
                        href={msg.youtubeSearch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            marginTop: '8px', padding: '10px 14px',
                            background: 'var(--color-bg)', borderRadius: '12px',
                            border: '1.5px solid var(--color-chat-youtube-border)', textDecoration: 'none',
                            color: 'var(--color-text)', fontSize: '14px', fontWeight: 500,
                            transition: 'border-color 150ms, box-shadow 150ms',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-youtube-red)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-chat-youtube-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <span style={{ fontSize: '18px' }}>{'\u25B6\uFE0F'}</span>
                        <span>Cerca su YouTube: <strong>{msg.youtubeSearch.query}</strong></span>
                    </a>
                )}

                {/* Local knowledge indicator */}
                {msg.source === 'local-knowledge' && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        marginTop: '4px', padding: '3px 10px',
                        background: 'var(--color-chat-suggestion-bg)', borderRadius: '12px',
                        fontSize: '14px', color: 'var(--color-primary)',
                        fontWeight: 500, lineHeight: '1.3',
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>{'\u25B8'}</span>
                        Risposta dalla guida locale
                    </div>
                )}

                {/* Retry button for errors */}
                {isError && msg.retryMessage && (
                    <button
                        onClick={() => onRetry(msg.retryMessage)}
                        style={{
                            marginTop: '6px', padding: '8px 16px',
                            borderRadius: '8px', background: 'var(--color-bg)',
                            border: '1.5px solid var(--color-vol3)', color: 'var(--color-vol3)',
                            cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                            transition: 'all 150ms', minHeight: '44px',
                        }}
                    >
                        Riprova
                    </button>
                )}
            </div>

            {/* User avatar */}
            {isUser && (
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--color-accent)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                    color: 'var(--color-text-inverse)', fontSize: '14px', fontWeight: 700,
                }}>
                    Tu
                </div>
            )}
        </div>
    );
}
