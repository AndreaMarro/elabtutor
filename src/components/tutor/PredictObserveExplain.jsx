// ============================================
// Predict-Observe-Explain (POE)
// Zacharia & Anderson constructivist framework
// CSS classes, persistenza, no trophy, riflessione
// © Andrea Marro — 2026
// ============================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { POE_CHALLENGES } from '../../data/poe-challenges';
import studentTracker from '../../services/studentTracker';
import { LayerBadge, VolumeBadge, LAYER_COLORS } from './shared/LayerBadge';
import { StarDisplay, StarResult, BadgeDisplay, calculateBadge } from './shared/StarRating';
import ReflectionPrompt from './shared/ReflectionPrompt';
import CrossNavigation from './shared/CrossNavigation';
import useGameScore from '../../hooks/useGameScore';
import './TutorTools.css';

const STORAGE_KEY = 'elab_poe_completed';

function calcPOEStars(isCorrect, explanationLength) {
  if (isCorrect && explanationLength >= 30) return 3;
  if (isCorrect || explanationLength >= 30) return 2;
  return 1;
}

const POE_STAR_MESSAGES = {
  3: 'Previsione corretta e spiegazione eccellente!',
  2: 'Buon lavoro! Prova a migliorare previsione o spiegazione.',
  1: 'Sfida completata! Riprova per migliorare.',
};

export default function PredictObserveExplain({ onOpenSimulator, logSession, onSendToUNLIM }) {
  const { saveScore, getScore, getAllScores } = useGameScore('poe');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [phase, setPhase] = useState('predict');
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [volumeFilter, setVolumeFilter] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const gameStartTime = useRef(null);
  const [completedIds, setCompletedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
  }, [completedIds]);

  const filtered = volumeFilter === 0
    ? POE_CHALLENGES
    : POE_CHALLENGES.filter(c => c.volume === volumeFilter);

  const selectChallenge = useCallback((challenge) => {
    setSelectedChallenge(challenge);
    setPhase('predict');
    setPrediction(null);
    setExplanation('');
    setShowReflection(false);
    setEarnedStars(0);
    gameStartTime.current = Date.now();
    logSession?.('poe-start', { challengeId: challenge.id, volume: challenge.volume });
  }, [logSession]);

  const submitPrediction = (answerIndex) => {
    setPrediction(answerIndex);
    setPhase('observe');
    logSession?.('poe-predict', {
      challengeId: selectedChallenge.id,
      prediction: answerIndex,
      correct: answerIndex === selectedChallenge.correctAnswer
    });
  };

  const goToExplain = () => setPhase('explain');

  const submitExplanation = () => {
    if (explanation.trim().length < 10) return;
    const isCorrect = prediction === selectedChallenge.correctAnswer;
    const stars = calcPOEStars(isCorrect, explanation.trim().length);
    setEarnedStars(stars);
    saveScore(selectedChallenge.id, stars);
    const newCompleted = [...new Set([...completedIds, selectedChallenge.id])];
    setCompletedIds(newCompleted);
    const timeSpent = gameStartTime.current ? Math.round((Date.now() - gameStartTime.current) / 1000) : 0;
    studentTracker.logGameResult('predict-observe-explain', stars, 3, timeSpent);
    logSession?.('poe-explain', {
      challengeId: selectedChallenge.id,
      correct: isCorrect,
      explanation,
      stars
    });
    setPhase('complete');
    setShowReflection(true);
  };

  const goBack = () => {
    setSelectedChallenge(null);
    setPhase('predict');
    setPrediction(null);
    setExplanation('');
    setShowReflection(false);
  };

  // === LISTA SFIDE ===
  if (!selectedChallenge) {
    return (
      <div className="elab-tool">
        <div className="elab-tool__hero">
          <span className="elab-tool__hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 5v-2" />
              <path d="M12 21v2" />
            </svg>
          </span>
          <h2>Prevedi, Osserva, Spiega</h2>
          <p>
            Prima fai la tua previsione, poi scopri cosa succede davvero!
            <br />Sbagliare la previsione è il modo migliore per imparare.
          </p>
          {completedIds.length > 0 && (
            <div className="elab-tool__progress-counter">
              Sfide completate: {completedIds.length}/{POE_CHALLENGES.length}
              {(() => {
                const badge = calculateBadge(getAllScores());
                return badge ? <span style={{ marginLeft: 8 }}><BadgeDisplay badge={badge} /></span> : null;
              })()}
            </div>
          )}
        </div>

        <div className="elab-tool__filters">
          {[0, 1, 2, 3].map(v => (
            <button
              key={v}
              onClick={() => setVolumeFilter(v)}
              className={`elab-tool__filter-btn ${volumeFilter === v ? 'active' : ''}`}
            >
              {v === 0 ? 'Tutti' : `Volume ${v}`}
            </button>
          ))}
        </div>

        <div className="elab-tool__list">
          {filtered.map(challenge => {
            const isCompleted = completedIds.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                onClick={() => selectChallenge(challenge)}
                className={`elab-tool__list-item elab-tool__list-item--${challenge.layer} ${isCompleted ? 'completed' : ''}`}
              >
                <span className="elab-tool__list-item-icon">
                  {isCompleted ? '\u2713' : '\u25CF'}
                  {getScore(challenge.id) > 0 && (
                    <span style={{ display: 'block', marginTop: 2 }}><StarDisplay stars={getScore(challenge.id)} size={12} /></span>
                  )}
                </span>
                <div className="elab-tool__list-item-body">
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <VolumeBadge volume={challenge.volume} chapter={challenge.chapter} />
                    <LayerBadge layer={challenge.layer} />
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--elab-text)', margin: 0, fontWeight: 500 }}>{challenge.question}</p>
                  <span className="elab-tool__badge elab-tool__badge--concept" style={{ marginTop: 4, display: 'inline-block' }}>{challenge.concept}</span>
                </div>
                <span className="elab-tool__list-item-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === FASI POE ===
  const isCorrect = prediction === selectedChallenge.correctAnswer;

  return (
    <div className="elab-tool">
      <button onClick={goBack} className="elab-tool__back">← Torna alla lista</button>

      {/* Progress bar */}
      <div className="elab-tool__progress-bar">
        {['predict', 'observe', 'explain'].map((p, i) => {
          const phases = ['predict', 'observe', 'explain', 'complete'];
          const currentIdx = phases.indexOf(phase);
          return <div key={p} className={`elab-tool__progress-step ${i <= currentIdx ? 'active' : ''}`} />;
        })}
      </div>

      {/* Header */}
      <div className="elab-tool__card" style={{ borderTop: `4px solid ${LAYER_COLORS[selectedChallenge.layer].text}` }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <VolumeBadge volume={selectedChallenge.volume} chapter={selectedChallenge.chapter} />
          <LayerBadge layer={selectedChallenge.layer} />
        </div>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{selectedChallenge.question}</h3>
      </div>

      {/* FASE 1: PREDICT */}
      {phase === 'predict' && (
        <div className="elab-tool__card">
          <h3>Fase 1: Prevedi</h3>
          <p style={{ color: 'var(--elab-muted)', fontSize: '0.875rem', marginBottom: 20 }}>Cosa pensi che succederà? Scegli la tua risposta:</p>
          <div style={{ display: 'grid', gap: 10 }}>
            {/* © Andrea Marro — 20/02/2026 */}
            {selectedChallenge.options.map((option, i) => (
              <button key={i} onClick={() => submitPrediction(i)} className="elab-tool__option">
                <span className="elab-tool__option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FASE 2: OBSERVE */}
      {phase === 'observe' && (
        <div className="elab-tool__card">
          <h3>Fase 2: Osserva</h3>

          <div className="elab-tool__compare">
            <div className="elab-tool__compare-box">
              <div className="elab-tool__compare-label">La tua previsione</div>
              <div className="elab-tool__compare-value">{selectedChallenge.options[prediction]}</div>
            </div>
            <div className="elab-tool__compare-box" style={{
              borderColor: isCorrect ? 'var(--elab-lime)' : '#ef4444',
              background: isCorrect ? 'rgba(145,191,69,0.05)' : 'rgba(239,68,68,0.05)'
            }}>
              <div className="elab-tool__compare-label">Cosa succede davvero</div>
              <div className="elab-tool__compare-value">{selectedChallenge.options[selectedChallenge.correctAnswer]}</div>
            </div>
          </div>

          <div className={`elab-tool__result ${isCorrect ? 'elab-tool__result--correct' : 'elab-tool__result--incorrect'}`} style={{ marginBottom: 16 }}>
            <span className="elab-tool__result-icon">{isCorrect ? '\u2713' : '?'}</span>
            <p className="elab-tool__result-text">
              {isCorrect ? 'Hai previsto correttamente!' : 'La realtà è diversa dalla tua previsione!'}
            </p>
            {!isCorrect && (
              <p className="elab-tool__result-sub">
                Nessun problema — scoprire dove sbagliamo è come impariamo davvero!
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(selectedChallenge.experimentId || selectedChallenge.wokwiId) && (
              <button
                onClick={() => onOpenSimulator?.(selectedChallenge.experimentId || selectedChallenge.wokwiId)}
                className="elab-tool__btn elab-tool__btn--secondary"
                style={{ flex: 1 }}
              >
                Provalo nel simulatore
              </button>
            )}
            {!isCorrect && onSendToUNLIM && (
              <button
                onClick={() => onSendToUNLIM(`Nella sfida POE "${selectedChallenge.question}", ho previsto "${selectedChallenge.options[prediction]}" ma la risposta corretta è "${selectedChallenge.options[selectedChallenge.correctAnswer]}". Puoi spiegarmi perché?`)}
                className="elab-tool__btn elab-tool__btn--secondary"
                style={{ flex: 1 }}
              >
                Chiedi a UNLIM perché
              </button>
            )}
            <button onClick={goToExplain} className="elab-tool__btn elab-tool__btn--navy" style={{ flex: 1 }}>
              Continua → Spiega
            </button>
          </div>
        </div>
      )}

      {/* FASE 3: EXPLAIN */}
      {phase === 'explain' && (
        <div className="elab-tool__card">
          <h3>Fase 3: Spiega</h3>
          <p style={{ color: 'var(--elab-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            {isCorrect
              ? 'Bravo! Prova a spiegare PERCHÉ hai ragione. Come funziona?'
              : 'Perché pensi che la realtà sia diversa dalla tua previsione?'}
          </p>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="Scrivi qui la tua spiegazione..."
            className="elab-tool__textarea"
          />
          {explanation.trim().length > 0 && explanation.trim().length < 10 && (
            <p style={{ color: '#ea580c', fontSize: '0.875rem', marginTop: 4 }}>
              Scrivi almeno qualche parola per riflettere...
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {onSendToUNLIM && (
              <button
                onClick={() => onSendToUNLIM(`Nella sfida POE "${selectedChallenge.question}", aiutami a capire: ${isCorrect ? 'perché la mia previsione era corretta?' : 'perché il risultato è diverso dalla mia previsione?'}`)}
                className="elab-tool__btn elab-tool__btn--secondary"
                style={{ flex: 1 }}
              >
                UNLIM, aiutami
              </button>
            )}
            <button
              onClick={submitExplanation}
              disabled={explanation.trim().length < 10}
              className="elab-tool__btn elab-tool__btn--primary"
              style={{ flex: 2 }}
            >
              Completa
            </button>
          </div>
        </div>
      )}

      {/* COMPLETO */}
      {phase === 'complete' && (
        <div className="elab-tool__card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Ecco la spiegazione</h3>
          </div>

          <div style={{ marginBottom: 12 }}>
            <StarResult stars={earnedStars} message={POE_STAR_MESSAGES[earnedStars]} />
          </div>

          <div style={{
            padding: 16, borderRadius: 'var(--elab-radius)', marginBottom: 16,
            background: 'rgba(31,61,133,0.04)', borderLeft: '4px solid var(--elab-navy)'
          }}>
            <p style={{ margin: 0 }}>{selectedChallenge.explanation}</p>
          </div>

          {selectedChallenge.funFact && (
            <div className="elab-tool__funfact">
              <span className="elab-tool__funfact-label">Lo sapevi? </span>
              <span className="elab-tool__funfact-text">{selectedChallenge.funFact}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={goBack} className="elab-tool__btn elab-tool__btn--secondary" style={{ flex: 1 }}>
              ← Altra sfida
            </button>
            <button onClick={() => onOpenSimulator?.(selectedChallenge.experimentId || selectedChallenge.wokwiId)} className="elab-tool__btn elab-tool__btn--navy" style={{ flex: 1 }}>
              Prova nel Simulatore
            </button>
          </div>
        </div>
      )}

      {/* Reflection */}
      {showReflection && phase === 'complete' && (
        <ReflectionPrompt
          toolName="poe"
          activityId={selectedChallenge.id}
          onSave={(entry) => { logSession?.('poe-reflection', entry); setShowReflection(false); }}
          onDismiss={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}
