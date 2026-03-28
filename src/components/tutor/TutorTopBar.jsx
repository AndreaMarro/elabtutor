// ============================================
// ELAB Tutor - Top Bar Component
// Part of the TutorLayout redesign
// © Andrea Marro — 13/02/2026
// ============================================

import React from 'react';

export default function TutorTopBar({
    selectedVolume,
    onToggleSidebar,
    sidebarCollapsed,
    onToggleChat,
    showChat,
    isFullscreen,
    onToggleFullscreen,
    onExportSession,
    sessionLogLength,
}) {
    const volumeLabels = { 1: 'Vol.1', 2: 'Vol.2', 3: 'Vol.3' };
    // WCAG AA: sfondo badge con testo bianco ≥ 4.5:1 contrasto
    const volumeColors = { 1: '#4A7A25', 2: '#C47A0A', 3: '#C43A2D' };

    return (
        <header className="tutor-topbar">
            <div className="topbar-left">
                <button
                    className="topbar-sidebar-toggle"
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? 'Espandi barra laterale (Ctrl+B)' : 'Comprimi barra laterale (Ctrl+B)'}
                    aria-label="Apri/chiudi menu"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                <div className="topbar-brand">
                    <img src="/assets/mascot/logo-senza-sfondo.png" alt="ELAB" className="topbar-mascot" style={{ objectFit: 'contain' }} />
                    <div className="topbar-brand-text">
                        <span className="topbar-title">ELAB</span>
                        <span className="topbar-subtitle">UNLIM</span>
                    </div>
                </div>
            </div>

            <div className="topbar-center">
                {selectedVolume && (
                    <div
                        className="topbar-volume-badge"
                        style={{ background: volumeColors[selectedVolume] || '#1E4D8C' }}
                    >
                        {volumeLabels[selectedVolume] || `Vol.${selectedVolume}`}
                    </div>
                )}

            </div>

            <div className="topbar-right">
                {sessionLogLength > 0 && (
                    <button
                        className="topbar-btn topbar-session-btn"
                        onClick={onExportSession}
                        title="Esporta sessione"
                    >
                        <span className="session-dot" />
                        <span className="topbar-btn-label">Sessione</span>
                    </button>
                )}

                <button
                    className={`topbar-btn ${showChat ? 'active' : ''}`}
                    onClick={onToggleChat}
                    title={showChat ? 'Nascondi Chat UNLIM (Ctrl+K)' : 'Mostra Chat UNLIM (Ctrl+K)'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>

                <button
                    className={`topbar-btn ${isFullscreen ? 'active' : ''}`}
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? 'Esci Fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                            <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
}
