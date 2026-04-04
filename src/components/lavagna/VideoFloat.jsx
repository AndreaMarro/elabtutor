/**
 * VideoFloat — YouTube search + ELAB videocorsi in FloatingWindow
 * Sessione 3/8 Lavagna Redesign
 * (c) Andrea Marro — 02/04/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Features:
 * - YouTube search: curated catalog + "Apri su YouTube" for broader search
 * - Quick suggestion chips for ELAB topics
 * - Videocorsi ELAB (premium, unlocked by license/purchase)
 * - Picture-in-picture minimize (thumbnail 120x80)
 * - Touch-first, 48px targets, WCAG AA
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import FloatingWindow from './FloatingWindow';
import unlimVideos from '../../data/unlim-videos';
import { VIDEO_COURSES } from '../../data/video-courses';
import css from './VideoFloat.module.css';

const CURATED_VIDEOS = unlimVideos.CURATED_VIDEOS || [];

// ── Tabs ──
const TAB_YOUTUBE = 'youtube';
const TAB_CORSI = 'corsi';

// ── Quick search suggestions (topics aligned with ELAB volumes) ──
const SUGGESTIONS = [
  { label: 'LED', query: 'led' },
  { label: 'Resistore', query: 'resistore' },
  { label: 'Breadboard', query: 'breadboard' },
  { label: 'Legge di Ohm', query: 'ohm' },
  { label: 'Arduino', query: 'arduino' },
  { label: 'Circuito serie', query: 'serie' },
  { label: 'Condensatore', query: 'condensatore' },
  { label: 'Buzzer', query: 'buzzer' },
  { label: 'Motore DC', query: 'motore' },
  { label: 'Sensore luce', query: 'ldr luce' },
];

// ── Single YouTube Video Player ──
function YouTubePlayer({ videoId, title }) {
  if (!videoId) return null;
  return (
    <div className={css.playerWrap}>
      <iframe
        className={css.iframe}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&hl=it`}
        title={title || 'Video ELAB'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

// ── Video Card ──
function VideoCard({ video, onClick }) {
  return (
    <button
      className={css.card}
      onClick={onClick}
      aria-label={`Guarda: ${video.title}`}
    >
      <div className={css.cardThumb}>
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
          alt={video.title || 'Video thumbnail'}
          className={css.thumbImg}
          loading="lazy"
        />
      </div>
      <div className={css.cardInfo}>
        <span className={css.cardTitle}>{video.title}</span>
        <span className={css.cardTopic}>{video.topic || video.channel}</span>
      </div>
    </button>
  );
}

// ── Videocorso Card (premium content) ──
function CorsoCard({ corso, unlocked, onClick }) {
  return (
    <button
      className={`${css.card} ${css.corsoCard} ${!unlocked ? css.cardLocked : ''}`}
      onClick={unlocked ? onClick : undefined}
      aria-label={unlocked ? `Guarda: ${corso.title}` : `${corso.title} — Acquista per sbloccare`}
      disabled={!unlocked}
    >
      <div className={css.cardThumb}>
        <div className={css.corsoThumbPlaceholder} style={{ background: corso.color || '#1E4D8C' }}>
          <span className={css.corsoVolume}>{corso.volumeLabel || 'ELAB'}</span>
        </div>
        {!unlocked && (
          <div className={css.lockOverlay}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#fff" strokeWidth="2" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <div className={css.cardInfo}>
        <span className={css.cardTitle}>{corso.title}</span>
        <span className={css.cardTopic}>{corso.description}</span>
      </div>
    </button>
  );
}

// ── Main VideoFloat Component ──
export default function VideoFloat({
  visible = false,
  minimized = false,
  onClose,
  onMinimize,
  onRestore,
  unlockedVolumes = [],
}) {
  const [activeTab, setActiveTab] = useState(TAB_YOUTUBE);
  const [searchInput, setSearchInput] = useState('');
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState('');
  const searchRef = useRef(null);

  // ── Videocorsi list ──
  const courses = useMemo(() => VIDEO_COURSES || [], []);

  // ── Filtered catalog ──
  const filteredVideos = useMemo(() => {
    const q = searchInput.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!q) return CURATED_VIDEOS;
    return CURATED_VIDEOS.filter(v => {
      const haystack = [v.title, v.topic, v.channel, ...v.keywords].join(' ')
        .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return q.split(/\s+/).every(word => haystack.includes(word));
    });
  }, [searchInput]);

  const handleSelectVideo = useCallback((video) => {
    setActiveVideoId(video.videoId);
    setActiveVideoTitle(video.title);
  }, []);

  const handleBack = useCallback(() => {
    setActiveVideoId(null);
    setActiveVideoTitle('');
  }, []);

  const handleSuggestion = useCallback((query) => {
    setSearchInput(query);
  }, []);

  const handleOpenYouTube = useCallback(() => {
    const q = searchInput.trim() || 'elettronica bambini';
    const safeQuery = encodeURIComponent((q + ' elettronica bambini italiano').slice(0, 120));
    window.open(`https://www.youtube.com/results?search_query=${safeQuery}`, '_blank', 'noopener,noreferrer');
  }, [searchInput]);

  const isVolumeUnlocked = useCallback((volumeId) => {
    return unlockedVolumes.includes(volumeId);
  }, [unlockedVolumes]);

  if (!visible) return null;

  // ── PiP minimize thumbnail ──
  if (minimized) {
    return (
      <button
        className={css.pipThumb}
        onClick={onRestore}
        aria-label="Espandi video"
      >
        {activeVideoId ? (
          <img
            src={`https://img.youtube.com/vi/${activeVideoId}/default.jpg`}
            alt={activeVideoTitle}
            className={css.pipImg}
          />
        ) : (
          <div className={css.pipPlaceholder}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" fill="#fff" />
            </svg>
          </div>
        )}
      </button>
    );
  }

  // Determine window title
  let windowTitle = 'Video';
  if (activeVideoTitle) windowTitle = activeVideoTitle;

  return (
    <FloatingWindow
      id="lavagna-video"
      title={windowTitle}
      defaultPosition={{ x: 80, y: 80 }}
      defaultSize={{ w: 520, h: 420 }}
      onClose={onClose}
      onMinimize={onMinimize}
      glass
    >
      <div className={css.container}>
        {/* Playing a video */}
        {activeVideoId ? (
          <div className={css.searchResults}>
            <YouTubePlayer videoId={activeVideoId} title={activeVideoTitle} />
            <button className={css.backBtn} onClick={handleBack} aria-label="Torna al catalogo">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Catalogo
            </button>
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div className={css.tabs} role="tablist">
              <button
                className={`${css.tab} ${activeTab === TAB_YOUTUBE ? css.tabActive : ''}`}
                onClick={() => setActiveTab(TAB_YOUTUBE)}
                role="tab"
                aria-selected={activeTab === TAB_YOUTUBE}
              >
                YouTube
              </button>
              <button
                className={`${css.tab} ${activeTab === TAB_CORSI ? css.tabActive : ''}`}
                onClick={() => setActiveTab(TAB_CORSI)}
                role="tab"
                aria-selected={activeTab === TAB_CORSI}
              >
                Videocorsi ELAB
              </button>
            </div>

            {/* ══════════ YouTube Tab ══════════ */}
            {activeTab === TAB_YOUTUBE && (
              <div className={css.catalogSection}>
                {/* Search bar */}
                <div className={css.searchBar}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={css.searchIcon} aria-hidden="true">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={searchRef}
                    className={css.searchInput}
                    type="search"
                    placeholder="Cerca video... (es. LED, resistore, Arduino)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Cerca video"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      className={css.clearBtn}
                      onClick={() => { setSearchInput(''); searchRef.current?.focus(); }}
                      aria-label="Cancella ricerca"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Suggestions (when no search) */}
                {!searchInput && (
                  <div className={css.suggestionsWrap}>
                    <div className={css.suggestionsGrid}>
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s.label}
                          className={css.suggestionChip}
                          onClick={() => handleSuggestion(s.query)}
                          aria-label={`Cerca: ${s.label}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                <div className={css.cardList} role="list">
                  {filteredVideos.map((v) => (
                    <VideoCard
                      key={v.videoId}
                      video={v}
                      onClick={() => handleSelectVideo(v)}
                    />
                  ))}
                </div>

                {/* "Cerca su YouTube" button — always visible */}
                <button
                  className={css.youtubeSearchBtn}
                  onClick={handleOpenYouTube}
                  aria-label="Cerca su YouTube"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="1" y="3" width="14" height="10" rx="3" fill="#E54B3D" />
                    <polygon points="6.5,5.5 11.5,8 6.5,10.5" fill="#fff" />
                  </svg>
                  {searchInput ? `Cerca "${searchInput}" su YouTube` : 'Cerca su YouTube'}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={css.externalIcon}>
                    <path d="M4 1h7v7M11 1L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* ══════════ Videocorsi ELAB Tab ══════════ */}
            {activeTab === TAB_CORSI && (
              <div className={css.catalogSection}>
                {courses.length === 0 ? (
                  <div className={css.emptyState}>
                    Nessun videocorso disponibile.
                  </div>
                ) : (
                  <div className={css.cardList} role="list">
                    {courses.map((corso) => (
                      <CorsoCard
                        key={corso.id}
                        corso={corso}
                        unlocked={isVolumeUnlocked(corso.volumeId)}
                        onClick={() => {
                          if (corso.youtubeId) {
                            setActiveVideoId(corso.youtubeId);
                            setActiveVideoTitle(corso.title);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className={css.corsoInfo}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>I videocorsi sono inclusi nel kit ELAB acquistato</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </FloatingWindow>
  );
}
