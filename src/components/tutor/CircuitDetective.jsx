// ============================================
// Circuit Detective — Trova il guasto!
// Productive Failure (Kafai SIGCSE 2019)
// CSS classes, persistenza, cross-nav, riflessione
// © Andrea Marro — 2026
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import { BROKEN_CIRCUITS } from '../../data/broken-circuits';
import { LayerBadge, DifficultyBadge, ConceptBadge, LAYER_COLORS } from './shared/LayerBadge';
import ReflectionPrompt from './shared/ReflectionPrompt';
import CrossNavigation from './shared/CrossNavigation';
import { StarDisplay, StarResult, BadgeDisplay, calculateBadge } from './shared/StarRating';
import useGameScore from '../../hooks/useGameScore';
import './TutorTools.css';

const STORAGE_KEY = 'elab_detective_solved';

function calcDetectiveStars(hintsUsed, guessedBlind) {
  if (guessedBlind) return 1;
  if (hintsUsed === 0) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

const STAR_MESSAGES = {
  3: 'Detective perfetto! Zero indizi!',
  2: 'Buon lavoro, pochi indizi usati.',
  1: 'Caso risolto! Usa meno indizi la prossima volta.',
};

export default function CircuitDetective({ onSendToUNLIM, onOpenSimulator, logSession }) {
  const { saveScore, getScore, getAllScores } = useGameScore('detective');
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showSolution, setShowSolution] = useState(false);
  const [studentGuess, setStudentGuess] = useState('');
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showReflection, setShowReflection] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [solvedIds, setSolvedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedIds));
  }, [solvedIds]);

  const filteredCircuits = filter === 'all'
    ? BROKEN_CIRCUITS
    : BROKEN_CIRCUITS.filter(c => c.layer === filter);

  const selectCircuit = useCallback((circuit) => {
    setSelectedCircuit(circuit);
    setCurrentHintIndex(-1);
    setShowSolution(false);
    setStudentGuess('');
    setGuessSubmitted(false);
    setShowReflection(false);
    setEarnedStars(0);
    logSession?.('detective-start', { circuitId: circuit.id, difficulty: circuit.difficulty });
  }, [logSession]);

  const revealHint = () => {
    if (selectedCircuit && currentHintIndex < selectedCircuit.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
      logSession?.('detective-hint', { circuitId: selectedCircuit.id, hintIndex: currentHintIndex + 1 });
    }
  };

  const submitGuess = () => {
    if (!studentGuess.trim()) return;
    setGuessSubmitted(true);
    logSession?.('detective-guess', {
      circuitId: selectedCircuit.id,
      guess: studentGuess,
      hintsUsed: currentHintIndex + 1
    });
  };

  const revealSolution = () => {
    const hintsUsed = currentHintIndex + 1;
    const guessedBlind = studentGuess === 'Non lo so';
    const stars = calcDetectiveStars(hintsUsed, guessedBlind);
    setEarnedStars(stars);
    saveScore(selectedCircuit.id, stars);
    setShowSolution(true);
    setShowReflection(true);
    const newSolved = [...new Set([...solvedIds, selectedCircuit.id])];
    setSolvedIds(newSolved);
    logSession?.('detective-solved', {
      circuitId: selectedCircuit.id,
      hintsUsed,
      hadGuess: guessSubmitted,
      stars
    });
  };

  const askUNLIM = () => {
    if (selectedCircuit) {
      const msg = `Sono nel Circuit Detective e sto cercando di risolvere "${selectedCircuit.title}". ${selectedCircuit.description} Puoi aiutarmi con una domanda socratica senza darmi la risposta?`;
      onSendToUNLIM?.(msg);
    }
  };

  const handleConfusedGuess = () => {
    setStudentGuess('Non lo so');
    setGuessSubmitted(true);
    logSession?.('detective-confused', { circuitId: selectedCircuit.id });
  };

  const goBack = () => {
    setSelectedCircuit(null);
    setCurrentHintIndex(-1);
    setShowSolution(false);
    setStudentGuess('');
    setGuessSubmitted(false);
    setShowReflection(false);
  };

  // === LISTA CIRCUITI ===
  if (!selectedCircuit) {
    const solvedCount = solvedIds.length;
    return (
      <div className="elab-tool">
        <div className="elab-tool__hero">
          <span className="elab-tool__hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6" />
              <path d="M8 11h6" />
            </svg>
          </span>
          <h2>Circuit Detective</h2>
          <p>
            Ogni circuito ha un guasto nascosto. Il tuo compito: trovarlo!
            <br />Usa i suggerimenti solo se sei davvero bloccato.
          </p>
          {solvedCount > 0 && (
            <div className="elab-tool__progress-counter">
              Circuiti risolti: {solvedCount}/{BROKEN_CIRCUITS.length}
              {(() => {
                const badge = calculateBadge(getAllScores());
                return badge ? <span style={{ marginLeft: 8 }}><BadgeDisplay badge={badge} /></span> : null;
              })()}
            </div>
          )}
        </div>

        <div className="elab-tool__filters">
          {['all', 'terra', 'schema', 'cielo'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`elab-tool__filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? 'Tutti' : LAYER_COLORS[f].label}
            </button>
          ))}
        </div>

        <div className="elab-tool__list">
          {filteredCircuits.map(circuit => {
            const isSolved = solvedIds.includes(circuit.id);
            return (
              <div
                key={circuit.id}
                onClick={() => selectCircuit(circuit)}
                className={`elab-tool__list-item elab-tool__list-item--${circuit.layer} ${isSolved ? 'completed' : ''}`}
              >
                <span className="elab-tool__list-item-icon">
                  {isSolved ? '\u2713' : circuit.icon}
                  {getScore(circuit.id) > 0 && (
                    <span style={{ display: 'block', marginTop: 2 }}><StarDisplay stars={getScore(circuit.id)} size={12} /></span>
                  )}
                </span>
                <div className="elab-tool__list-item-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 className="elab-tool__list-item-title" style={{ margin: 0 }}>{circuit.title}</h3>
                    <LayerBadge layer={circuit.layer} />
                  </div>
                  <p className="elab-tool__list-item-desc">{circuit.description}</p>
                  <div className="elab-tool__list-item-meta">
                    <DifficultyBadge level={circuit.difficulty} />
                    <ConceptBadge concept={circuit.concept} />
                  </div>
                </div>
                <span className="elab-tool__list-item-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === DETTAGLIO CIRCUITO ===
  const allHintsShown = currentHintIndex >= selectedCircuit.hints.length - 1;

  return (
    <div className="elab-tool">
      {/* © Andrea Marro — 20/02/2026 */}
      <button onClick={goBack} className="elab-tool__back">← Torna alla lista</button>

      <div className={`elab-tool__card`} style={{ borderTop: `4px solid ${LAYER_COLORS[selectedCircuit.layer].text}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: '2rem' }}>{selectedCircuit.icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedCircuit.title}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <LayerBadge layer={selectedCircuit.layer} />
              <DifficultyBadge level={selectedCircuit.difficulty} />
            </div>
          </div>
        </div>
        <p>{selectedCircuit.description}</p>
      </div>

      {selectedCircuit.schematicText && (
        <div className="elab-tool__card">
          <h3>Schema del circuito</h3>
          <div className="elab-tool__schematic">{selectedCircuit.schematicText}</div>
        </div>
      )}

      <div className="elab-tool__card">
        <h3>La tua indagine</h3>

        {currentHintIndex >= 0 && (
          <div style={{ marginBottom: 16 }}>
            {selectedCircuit.hints.slice(0, currentHintIndex + 1).map((hint, i) => (
              <div key={i} className="elab-tool__hint">
                <strong>Suggerimento {i + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        )}

        <div className="elab-tool__actions">
          {!allHintsShown && (
            <button onClick={revealHint} className="elab-tool__btn elab-tool__btn--secondary">
              Suggerimento ({currentHintIndex + 1}/{selectedCircuit.hints.length})
            </button>
          )}
          <button onClick={askUNLIM} className="elab-tool__btn elab-tool__btn--navy">
            Chiedi a UNLIM
          </button>
        </div>

        {!showSolution && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--elab-text)', fontSize: '0.88rem', marginBottom: 8 }}>
              Qual è la tua ipotesi?
            </label>
            <div className="elab-tool__input-row">
              <input
                type="text"
                value={studentGuess}
                onChange={e => setStudentGuess(e.target.value)}
                placeholder="Scrivi cosa pensi sia il problema..."
                className="elab-tool__input"
                onKeyDown={e => e.key === 'Enter' && submitGuess()}
                disabled={guessSubmitted}
              />
              {!guessSubmitted ? (
                <button onClick={submitGuess} disabled={!studentGuess.trim()} className="elab-tool__btn elab-tool__btn--primary">
                  Invia
                </button>
              ) : (
                <span style={{ padding: 10, color: 'var(--elab-lime)', fontWeight: 700 }}>✓</span>
              )}
            </div>
            {!guessSubmitted && (
              <button onClick={handleConfusedGuess} style={{
                background: 'none', border: 'none', color: 'var(--elab-muted)',
                fontSize: '0.875rem', cursor: 'pointer', padding: '4px 0',
                fontFamily: 'inherit', textDecoration: 'underline'
              }}>
                Non lo so — e va bene!
              </button>
            )}
          </div>
        )}

        {guessSubmitted && studentGuess === 'Non lo so' && !showSolution && (
          <div className="elab-tool__result elab-tool__result--correct" style={{ marginBottom: 12 }}>
            <span className="elab-tool__result-icon">?</span>
            <p className="elab-tool__result-text">Perfetto!</p>
            <p className="elab-tool__result-sub">La confusione è il primo passo della scoperta. Prova a usare i suggerimenti!</p>
          </div>
        )}

        {!showSolution && (guessSubmitted || allHintsShown) && (
          <button onClick={revealSolution} className="elab-tool__btn elab-tool__btn--danger elab-tool__btn--full">
            Rivela la soluzione
          </button>
        )}

        {showSolution && (
          <div className="elab-tool__card elab-tool__card--success" style={{ animation: 'elab-slideUp 0.4s ease' }}>
            <h3 style={{ color: '#16a34a' }}>Soluzione</h3>
            <p style={{ marginBottom: 12 }}>{selectedCircuit.solution}</p>
            <div style={{ marginBottom: 12 }}>
              <StarResult stars={earnedStars} message={STAR_MESSAGES[earnedStars]} />
            </div>
            <div className="elab-tool__learn">
              <strong>Hai imparato:</strong> {selectedCircuit.whatYouLearn}
            </div>
            <div className="elab-tool__learn" style={{ marginTop: 8 }}>
              <strong>Concetto:</strong> {selectedCircuit.concept}
            </div>
          </div>
        )}
      </div>

      {showReflection && showSolution && (
        <ReflectionPrompt
          toolName="detective"
          activityId={selectedCircuit.id}
          onSave={(entry) => { logSession?.('detective-reflection', entry); setShowReflection(false); }}
          onDismiss={() => setShowReflection(false)}
        />
      )}

      {showSolution && (
        <CrossNavigation links={[
          { icon: '', label: 'Prova nel Simulatore', action: () => onOpenSimulator?.(selectedCircuit.experimentId || selectedCircuit.wokwiId) },
          { icon: '←', label: 'Prossimo circuito', action: goBack }
        ]} />
      )}
    </div>
  );
}
