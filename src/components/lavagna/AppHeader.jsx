import React from 'react';
import css from './AppHeader.module.css';

export default function AppHeader({
  experimentName = 'Scegli un esperimento...',
  totalSteps = 0,
  currentStep = 0,
  onPickerOpen,
  onPlay,
  onMenuOpen,
  isPlaying = false,
  onGalileoToggle,
  galileoOpen = false,
  onVideoToggle,
  videoOpen = false,
  activeTab = 'lavagna',
  onTabChange,
  showClasseTab = false,
  showProgressiTab = false,
}) {
  return (
    <header className={css.header} role="banner">
      {/* Left: hamburger + brand */}
      <div className={css.left}>
        <button
          className={css.btn}
          onClick={onMenuOpen}
          aria-label="Apri menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className={css.brand}>ELAB</span>
        {/* Navigation tabs */}
        <div className={css.tabs}>
          <button
            className={`${css.tabBtn} ${activeTab === 'lavagna' ? css.tabBtnActive : ''}`}
            onClick={() => onTabChange?.('lavagna')}
            aria-label="Lavagna"
          >Lavagna</button>
          {showClasseTab && (
            <button
              className={`${css.tabBtn} ${activeTab === 'classe' ? css.tabBtnActive : ''}`}
              onClick={() => onTabChange?.('classe')}
              aria-label="Dashboard classe"
            >Classe</button>
          )}
          {showProgressiTab && (
            <button
              className={`${css.tabBtn} ${activeTab === 'progressi' ? css.tabBtnActive : ''}`}
              onClick={() => onTabChange?.('progressi')}
              aria-label="I miei progressi"
            >Progressi</button>
          )}
        </div>
      </div>

      {/* Center: experiment name + progress */}
      <div className={css.center}>
        <span
          className={css.experimentName}
          onClick={onPickerOpen}
          role="button"
          tabIndex={0}
          aria-label={`Esperimento: ${experimentName}. Clicca per cambiare.`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPickerOpen?.(); } }}
        >
          {experimentName}
        </span>
        {totalSteps > 0 && (
          <div className={css.progressDots} aria-label={`Passo ${currentStep} di ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`${css.dot} ${i < currentStep ? css.dotCompleted : ''} ${i === currentStep ? css.dotCurrent : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Galileo toggle + play */}
      <div className={css.right}>
        {onVideoToggle && (
          <button
            className={`${css.btn} ${videoOpen ? css.btnActive : ''}`}
            onClick={onVideoToggle}
            aria-label={videoOpen ? 'Chiudi video' : 'Apri video'}
            aria-pressed={videoOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 8l4-2v8l-4-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {onGalileoToggle && (
          <button
            className={`${css.btn} ${galileoOpen ? css.btnActive : ''}`}
            onClick={onGalileoToggle}
            aria-label={galileoOpen ? 'Chiudi UNLIM' : 'Apri UNLIM'}
            aria-pressed={galileoOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2a8 8 0 00-8 8 8 8 0 004 6.93V18a1 1 0 001 1h6a1 1 0 001-1v-1.07A8 8 0 0018 10a8 8 0 00-8-8z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="8" cy="9" r="1.5" fill="currentColor" />
              <circle cx="12" cy="9" r="1.5" fill="currentColor" />
              <path d="M7.5 13c.8.8 2.2 1.2 2.5 1.2s1.7-.4 2.5-1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        )}
        <button
          className={`${css.btn} ${css.btnPlay}`}
          onClick={onPlay}
          aria-label={isPlaying ? 'Ferma simulazione' : 'Avvia simulazione'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="4" height="10" rx="1" fill="currentColor" />
              <rect x="9" y="3" width="4" height="10" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 3l10 5-10 5V3z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
