// ============================================
// ELAB Tutor - Layout Container
// Orchestrates TopBar + Sidebar + Content + ChatOverlay
// Responsive: grid-based, adapts to all screen sizes
// (c) Andrea Marro — 13/02/2026
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import TutorTopBar from './TutorTopBar';
import TutorSidebar, { MobileBottomTabs } from './TutorSidebar';
import ChatOverlay from './ChatOverlay';
import KeyboardManager, { ShortcutsPanel } from './KeyboardManager';
import { useUnlimMode } from '../unlim/UnlimModeSwitch';
import './tutor-responsive.css';

const ONBOARDING_KEY = 'elab_onboarding_seen';

function OnboardingTooltip({ onDismiss, onNavigate }) {
    const tips = [
        { icon: '📖', tab: 'manual', label: 'Manuale', desc: 'Leggi la teoria del volume' },
        { icon: '⚡', tab: 'simulator', label: 'Simulatore', desc: 'Costruisci circuiti sulla breadboard' },
        { icon: '🎮', tab: 'detective', label: 'Giochi', desc: 'Sfide per mettere alla prova le tue conoscenze' },
        { icon: '✏️', tab: 'canvas', label: 'Lavagna', desc: 'Disegna schemi e appunti liberi' },
        { icon: '📓', tab: 'notebooks', label: 'Taccuini', desc: 'Salva le tue note di laboratorio' },
    ];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
        }}>
            <div style={{
                background: 'var(--color-bg)', borderRadius: '16px', padding: '28px 32px',
                maxWidth: '420px', width: '90%', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                textAlign: 'center',
            }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontFamily: 'var(--font-display, Oswald, sans-serif)', color: 'var(--color-primary)' }}>
                    Benvenuto nel Tutor!
                </h2>
                <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Ecco le sezioni principali:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {tips.map(t => (
                        <button
                            key={t.tab}
                            onClick={() => { onNavigate(t.tab); onDismiss(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)',
                                background: 'var(--color-bg-secondary)', cursor: 'pointer', textAlign: 'left',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-chat-camera-bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        >
                            <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-primary)' }}>{t.label}</div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{t.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'var(--color-primary)', color: 'var(--color-text-inverse)', border: 'none',
                        borderRadius: '10px', padding: '12px 32px', fontSize: '15px',
                        fontWeight: 600, cursor: 'pointer', width: '100%',
                    }}
                >
                    Ho capito!
                </button>
            </div>
        </div>
    );
}

export default function TutorLayout({
    // Tab/content
    activeTab,
    onTabChange,
    children,
    // Chat props
    messages,
    input,
    onInputChange,
    onSend,
    isLoading,
    onRetry,
    quickActions,
    // Chat visibility
    showChat,
    onToggleChat,
    // Fullscreen
    isFullscreen,
    onToggleFullscreen,
    // Session
    sessionLogLength,
    onExportSession,
    // Volume
    selectedVolume,
    // Mobile detection
    isMobile,
    // Socratic mode
    socraticMode,
    onToggleSocraticMode,
    // Sprint 3: Teacher-gated games
    allowedGames,
    // Screenshot
    onScreenshot,
    // Voice (UNLIM speaks — realtime via nanobot)
    voiceEnabled,
    onVoiceToggle,
    voiceRecording,
    onVoiceRecord,
    voicePlaying,
    voiceAvailable,
    // G12 RESPIRA: hide all navigation for full-screen simulator
    hideNavigation = false,
}) {
    // G14: Nascondi ChatOverlay in UNLIM mode — usa solo UnlimOverlay
    const { isUnlim } = useUnlimMode();

    // S84: Auto-collapse left nav on iPad/tablet to maximize canvas space
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        typeof window !== 'undefined' && window.innerWidth <= 1365
    );
    const [chatExpanded, setChatExpanded] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setSidebarCollapsed(prev => !prev);
    }, []);

    const handleToggleChat = useCallback(() => {
        onToggleChat();
    }, [onToggleChat]);

    const handleFocusChat = useCallback(() => {
        if (!showChat) onToggleChat();
        // Focus will be handled by ChatOverlay's useEffect
    }, [showChat, onToggleChat]);

    const handleCloseOverlay = useCallback(() => {
        if (showShortcuts) {
            setShowShortcuts(false);
        } else if (showChat) {
            onToggleChat();
        }
    }, [showShortcuts, showChat, onToggleChat]);

    const handleToggleChatExpanded = useCallback(() => {
        setChatExpanded(prev => !prev);
    }, []);

    const handleOpenGames = useCallback(() => {
        onTabChange('detective');
    }, [onTabChange]);

    return (
        <div className={`tutor-layout ${isFullscreen ? 'tutor-layout--fullscreen' : ''} ${hideNavigation ? 'tutor-layout--no-nav' : ''}`}>
            {/* Keyboard Shortcuts Manager */}
            <KeyboardManager
                onOpenSimulator={() => onTabChange('simulator')}
                onOpenManual={() => onTabChange('manual')}
                onOpenGames={handleOpenGames}
                onFocusChat={handleFocusChat}
                onToggleSidebar={handleToggleSidebar}
                onCloseOverlay={handleCloseOverlay}
                onShowShortcuts={() => setShowShortcuts(prev => !prev)}
                showShortcuts={showShortcuts}
            />

            {/* Top Bar — hidden in RESPIRA mode */}
            {!isFullscreen && !hideNavigation && (
                <TutorTopBar
                    selectedVolume={selectedVolume}
                    onToggleSidebar={handleToggleSidebar}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleChat={handleToggleChat}
                    showChat={showChat}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={onToggleFullscreen}
                    onExportSession={onExportSession}
                    sessionLogLength={sessionLogLength}
                />
            )}

            {/* Main body: sidebar + content */}
            <div className="tutor-body">
                {/* Sidebar — hidden in RESPIRA mode */}
                {!isMobile && !isFullscreen && !hideNavigation && (
                    <TutorSidebar
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        collapsed={sidebarCollapsed}
                        onToggleCollapsed={handleToggleSidebar}
                        allowedGames={allowedGames}
                    />
                )}

                {/* Content area */}
                <main className="tutor-content">
                    {isFullscreen && (
                        <button className="tutor-fullscreen-exit" onClick={onToggleFullscreen}>
                            Esci Fullscreen
                        </button>
                    )}
                    {children}
                    {/* © Andrea Marro — 27/02/2026 — ELAB Tutor — Tutti i diritti riservati */}
                </main>

                {/* Chat Overlay (floating) — nascosto in UNLIM mode, usa UnlimOverlay */}
                {!isUnlim && <ChatOverlay
                    messages={messages}
                    input={input}
                    onInputChange={onInputChange}
                    onSend={onSend}
                    isLoading={isLoading}
                    onRetry={onRetry}
                    quickActions={quickActions}
                    visible={showChat}
                    onClose={handleToggleChat}
                    expanded={chatExpanded}
                    onToggleExpanded={handleToggleChatExpanded}
                    socraticMode={socraticMode}
                    onToggleSocraticMode={onToggleSocraticMode}
                    onScreenshot={onScreenshot}
                    voiceEnabled={voiceEnabled}
                    onVoiceToggle={voiceAvailable ? onVoiceToggle : undefined}
                    voiceRecording={voiceRecording}
                    onVoiceRecord={onVoiceRecord}
                    voicePlaying={voicePlaying}
                />}
            </div>

            {/* Mobile bottom tabs — hidden in RESPIRA mode */}
            {isMobile && !isFullscreen && !hideNavigation && (
                <MobileBottomTabs
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    allowedGames={allowedGames}
                />
            )}

            {/* Footer — hidden in RESPIRA mode */}
            {!isFullscreen && !hideNavigation && (
                <footer className="tutor-footer">
                    <span>Laboratorio di Elettronica: Impara e sperimenta</span>
                </footer>
            )}

            {/* Shortcuts Panel */}
            <ShortcutsPanel
                visible={showShortcuts}
                onClose={() => setShowShortcuts(false)}
            />

            {/* Onboarding tooltip — first visit only */}
            {showOnboarding && (
                <OnboardingTooltip
                    onDismiss={() => { setShowOnboarding(false); localStorage.setItem(ONBOARDING_KEY, '1'); }}
                    onNavigate={onTabChange}
                />
            )}
        </div>
    );
}
