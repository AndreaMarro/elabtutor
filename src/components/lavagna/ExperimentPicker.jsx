/**
 * ExperimentPicker — Modal selezione esperimenti per la Lavagna ELAB
 * 3 volumi (Lime/Orange/Red), card per esperimento, ricerca, lucchetti, progress badge.
 * (c) Andrea Marro — 02/04/2026
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { getChapterMap, getChapterGroups } from '../../data/chapter-map';
import css from './ExperimentPicker.module.css';

const VOLUMES = getChapterMap();

export default function ExperimentPicker({ open, onClose, onSelect, completedIds = [], onAskUnlim }) {
  const [activeVol, setActiveVol] = useState(1);
  const [search, setSearch] = useState('');
  const backdropRef = useRef(null);
  const searchRef = useRef(null);

  // Focus search on open
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const vol = VOLUMES.find(v => v.key === activeVol);
  const experiments = useMemo(() => {
    if (!vol) return [];
    return vol.chapters.flatMap(c => c.experiments);
  }, [vol]);

  const filtered = useMemo(() => {
    if (!search.trim()) return experiments;
    const q = search.toLowerCase();
    return experiments.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.desc?.toLowerCase().includes(q) ||
      e.chapter?.toLowerCase().includes(q)
    );
  }, [experiments, search]);

  const chapters = useMemo(() => getChapterGroups(filtered), [filtered]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  const handleSelect = useCallback((exp) => {
    onSelect?.(exp);
    onClose();
  }, [onSelect, onClose]);

  // Focus trap for modal (WCAG 2.4.3)
  useEffect(() => {
    if (!open) return;
    const modal = backdropRef.current?.querySelector('[class*="modal"]');
    if (!modal) return;
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Auto-focus first element
    const timer = setTimeout(() => {
      const first = modal.querySelector('button, input');
      if (first) first.focus();
    }, 100);
    return () => { document.removeEventListener('keydown', handleKeyDown); clearTimeout(timer); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className={css.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Scegli un esperimento"
    >
      <div className={css.modal}>
        {/* Header */}
        <div className={css.header}>
          <h2 className={css.title}>Scegli Esperimento</h2>
          <button className={css.closeBtn} onClick={onClose} aria-label="Chiudi">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Volume tabs */}
        <div className={css.tabRow} role="tablist">
          {VOLUMES.map(v => (
            <button
              key={v.key}
              role="tab"
              aria-selected={activeVol === v.key}
              className={`${css.tab} ${activeVol === v.key ? css.tabActive : ''}`}
              style={activeVol === v.key ? { background: v.color, borderColor: v.color, color: '#fff' } : { borderColor: v.color, color: v.color }}
              onClick={() => { setActiveVol(v.key); setSearch(''); }}
            >
              <span className={css.tabLabel}>{v.label}</span>
              <span className={css.tabSub}>{v.sub}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={css.searchRow}>
          <input
            ref={searchRef}
            type="text"
            className={css.searchInput}
            placeholder="Cerca esperimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cerca esperimento"
          />
          {search && (
            <button className={css.clearBtn} onClick={() => setSearch('')} aria-label="Cancella ricerca">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Experiment list grouped by chapter */}
        <div className={css.body}>
          {/* UNLIM suggestion banner */}
          {onAskUnlim && chapters.length > 0 && (
            <button
              className={css.unlimSuggest}
              onClick={() => { onAskUnlim('Quale esperimento mi consigli per iniziare?'); onClose(); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="14" height="10" rx="3" fill="#1E4D8C" />
                <circle cx="8" cy="10" r="1.5" fill="#4A7A25" />
                <circle cx="12" cy="10" r="1.5" fill="#4A7A25" />
              </svg>
              <span>Non sai da dove iniziare? <strong>Chiedi a UNLIM</strong></span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {chapters.length === 0 && (
            <p className={css.empty}>Nessun esperimento trovato.</p>
          )}
          {chapters.map(([chapter, exps]) => (
            <div key={chapter} className={css.chapterGroup}>
              <h3 className={css.chapterTitle} style={{ color: vol.color }}>{chapter}</h3>
              <div className={css.cardGrid}>
                {exps.map(exp => {
                  const done = completedIds.includes(exp.id);
                  return (
                    <button
                      key={exp.id}
                      className={css.card}
                      onClick={() => handleSelect(exp)}
                      aria-label={`${exp.title}${done ? ' — completato' : ''}`}
                    >
                      <div className={css.cardTop} style={{ borderLeftColor: vol.color }}>
                        <span className={css.cardTitle}>{exp.title?.replace(/Cap\.\s*\d+\s*Esp\.\s*\d+\s*-\s*/, '')}</span>
                        {done && (
                          <svg className={css.checkIcon} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="Completato">
                            <circle cx="10" cy="10" r="8" fill="#4A7A25" />
                            <path d="M6 10l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {exp.desc && <p className={css.cardDesc}>{exp.desc}</p>}
                      {/* Metadata row: type badge, difficulty, time, components */}
                      <div className={css.cardMeta}>
                        {exp.simulationMode === 'avr' && (
                          <span className={css.typeBadge} title="Richiede codice Arduino">
                            Arduino
                          </span>
                        )}
                        {exp.difficulty != null && (
                          <span className={css.metaItem} title={`Difficoltà ${exp.difficulty}/3`}>
                            {'★'.repeat(Math.min(exp.difficulty, 3))}{'☆'.repeat(3 - Math.min(exp.difficulty, 3))}
                          </span>
                        )}
                        {exp.components?.length > 0 && (
                          <span className={css.metaItem} title={`${exp.components.length} componenti`}>
                            {exp.components.length} pz
                          </span>
                        )}
                        {exp.steps?.length > 0 && (
                          <span className={css.metaItem} title="Tempo stimato">
                            ~{Math.max(3, exp.steps.length * 2)} min
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div className={css.footer}>
          <span className={css.footerStat}>
            {completedIds.filter(id => experiments.some(e => e.id === id)).length}/{experiments.length} completati
          </span>
        </div>
      </div>
    </div>
  );
}
