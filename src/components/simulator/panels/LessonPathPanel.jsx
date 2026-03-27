/* Andrea Marro — 26/03/2026, Ciclo 44: Percorso Lezione */
/**
 * LessonPathPanel — 6-phase structured lesson guide for teachers
 * Generates a lesson path from experiment data so teachers know
 * exactly what to do before, during, and after a lesson.
 *
 * Props:
 *   experiment: { id, title, icon, desc, components, steps, observe, concept, chapter }
 *   allExperiments: Array — full experiment list for "next experiment" logic
 *   onClose: () => void
 *   onSendToUNLIM: (msg) => void — sends a message to Galileo
 *   onLoadExperiment: (id) => void — loads an experiment in the simulator
 */

import React from 'react';
import { getCurriculum } from '../../../data/curriculumData';
import { getLessonPath } from '../../../data/lesson-paths';

/* ─── Component type → Italian display name ─── */
const COMP_NAMES = {
  'battery9v': 'Batteria 9V',
  'breadboard-half': 'Breadboard (mezza)',
  'breadboard': 'Breadboard',
  'resistor': 'Resistore',
  'led': 'LED',
  'led-rgb': 'LED RGB',
  'pushbutton': 'Pulsante',
  'potentiometer': 'Potenziometro',
  'capacitor': 'Condensatore',
  'buzzer': 'Buzzer',
  'photoresistor': 'Fotoresistenza',
  'diode': 'Diodo',
  'mosfet': 'MOSFET',
  'servo': 'Servo motore',
  'lcd16x2': 'Display LCD 16×2',
  'motor-dc': 'Motore DC',
  'nano-r4': 'Arduino Nano',
  'nano-breakout': 'NanoBreakout',
  'multimeter': 'Multimetro',
  'switch': 'Interruttore',
};

function getComponentLabel(comp) {
  let name = COMP_NAMES[comp.type] || comp.type;
  if (comp.type === 'resistor' && comp.value) name += ` ${comp.value}Ω`;
  if (comp.type === 'led' && comp.color) name += ` ${comp.color === 'red' ? 'rosso' : comp.color === 'green' ? 'verde' : comp.color === 'blue' ? 'blu' : comp.color === 'yellow' ? 'giallo' : comp.color}`;
  if (comp.type === 'capacitor' && comp.value) name += ` ${comp.value}`;
  return name;
}

/* ─── Build material list from components ─── */
function buildMaterialList(components) {
  if (!components?.length) return [];
  const counts = {};
  const labels = {};
  for (const c of components) {
    const label = getComponentLabel(c);
    counts[label] = (counts[label] || 0) + 1;
    labels[label] = label;
  }
  return Object.entries(counts).map(([label, qty]) => ({ label, qty }));
}

/* ─── Find next experiment in sequence ─── */
function findNextExperiment(currentId, allExperiments) {
  if (!allExperiments?.length || !currentId) return null;
  const idx = allExperiments.findIndex(e => e.id === currentId);
  if (idx < 0 || idx >= allExperiments.length - 1) return null;
  return allExperiments[idx + 1];
}

/* ─── Extract chapter number from experiment id ─── */
function getChapterNum(id) {
  const m = id?.match(/cap(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/* ─── Generate starter question based on experiment concept ─── */
function generateStarterQuestion(experiment) {
  const concept = (experiment.concept || '').toLowerCase();
  const title = (experiment.title || '').toLowerCase();

  if (concept.includes('led') || title.includes('led'))
    return 'Secondo voi, questa lucina funziona in entrambi i versi o solo in uno?';
  if (concept.includes('resistor') || concept.includes('protezione'))
    return 'Cosa succede se colleghiamo il LED senza niente che lo protegga?';
  if (concept.includes('rgb') || title.includes('rgb'))
    return 'Quanti colori pensate si possano fare con soli tre colori?';
  if (concept.includes('parallelo'))
    return 'Se una strada è bloccata, la corrente può trovare un\'altra via?';
  if (concept.includes('serie'))
    return 'Cosa succede se mettiamo due LED uno dopo l\'altro?';
  if (concept.includes('condensatore') || concept.includes('capacitor'))
    return 'Avete mai visto qualcosa che si carica e poi si scarica lentamente?';
  if (concept.includes('pulsante') || concept.includes('button'))
    return 'Come facciamo a dire al circuito quando accendersi?';
  if (concept.includes('potenziometro') || concept.includes('pot'))
    return 'Si può rendere una luce più forte o più debole senza spegnerla?';
  if (concept.includes('fotoresist') || concept.includes('ldr'))
    return 'Il circuito può sentire se c\'è luce o buio?';
  if (concept.includes('buzzer'))
    return 'Un circuito può fare un suono? Come?';
  if (concept.includes('mosfet') || concept.includes('transistor'))
    return 'Come può un piccolo segnale controllare qualcosa di grande?';
  if (concept.includes('arduino') || concept.includes('avr'))
    return 'E se il circuito potesse pensare e decidere da solo?';
  if (concept.includes('servo'))
    return 'Come fa un robot a muovere un braccio con precisione?';
  if (concept.includes('lcd'))
    return 'Un circuito può scrivere dei messaggi su uno schermo?';
  return 'Cosa pensate che succeda quando accendiamo questo circuito?';
}

/* ─── Generate experiment-specific common mistakes ─── */
function generateCommonMistakes(experiment) {
  const concept = (experiment.concept || '').toLowerCase();
  const mistakes = [];

  if (concept.includes('led') || concept.includes('polarit'))
    mistakes.push({ error: 'LED al contrario', response: 'Non correggerli. Chiedi: "Funziona? Proviamo a girarlo?"' });
  if (concept.includes('resistor') || concept.includes('protezione'))
    mistakes.push({ error: 'Resistore dimenticato', response: 'Chiedi: "Il LED sembra troppo forte? Cosa potremmo aggiungere?"' });
  if (concept.includes('parallelo'))
    mistakes.push({ error: 'LED in serie invece che parallelo', response: 'Chiedi: "I LED hanno la stessa luminosità? Come dargli strade separate?"' });
  if (concept.includes('serie'))
    mistakes.push({ error: 'Cortocircuito su un LED', response: 'Chiedi: "Tutti i LED si accendono? Segui il percorso della corrente col dito."' });
  if (concept.includes('condensatore') || concept.includes('capacitor'))
    mistakes.push({ error: 'Polarità condensatore sbagliata', response: 'Chiedi: "Qual è il pin lungo? Ricorda la regola del LED."' });
  if (concept.includes('potenziometro'))
    mistakes.push({ error: 'Pin centrale non collegato', response: 'Chiedi: "Quanti pin ha? Quale regola la quantità?"' });
  if (concept.includes('pulsante'))
    mistakes.push({ error: 'Pulsante su fila sbagliata', response: 'Chiedi: "Il pulsante attraversa il gap? Prova a premere: succede qualcosa?"' });
  if (concept.includes('arduino') || concept.includes('avr'))
    mistakes.push({ error: 'Pin sbagliato nel codice', response: 'Chiedi: "Quale numero di pin hai scritto? E il filo dove va?"' });

  // Always add universal mistakes
  mistakes.push({ error: 'Filo nel buco sbagliato', response: 'Chiedi: "Segui il percorso col dito. La corrente arriva?"' });

  return mistakes;
}

/* ─── Prerequisite text based on volume/chapter ─── */
const CHAPTER_CONCEPTS = {
  6: 'circuito chiuso, batteria, LED',
  7: 'resistori, protezione LED',
  8: 'LED RGB, miscelazione colori',
  9: 'circuiti in serie',
  10: 'circuiti in parallelo',
  11: 'potenziometro, resistenza variabile',
  12: 'condensatore, carica/scarica',
  13: 'pulsante, interruttore',
  14: 'fotoresistenza, sensori',
};

function getPrerequisiteText(id) {
  const chapterNum = getChapterNum(id);
  if (!chapterNum || chapterNum <= 6) return null;
  const prevConcepts = CHAPTER_CONCEPTS[chapterNum - 1];
  if (!prevConcepts) return `i concetti del capitolo ${chapterNum - 1}`;
  return `${prevConcepts} (capitolo ${chapterNum - 1})`;
}

/* ─── Phase data structure ─── */
const PHASE_ICONS = ['📋', '🖥️', '❓', '👀', '🤖', '✅'];
const PHASE_TITLES = [
  'PREPARA',
  'MOSTRA',
  'CHIEDI ALLA CLASSE',
  'FAI OSSERVARE',
  'USA GALILEO SE SERVE',
  'CONCLUDI',
];
const PHASE_DURATIONS = ['prima della lezione', '2 min', '3 min', '15 min', 'quando serve', '5 min'];

/* ─── Rich Lesson Path — Renderizza percorso lezione da JSON UNLIM ─── */
function RichLessonPath({ path, experiment, expandedPhase, onExpandPhase, onClose, onSendToUNLIM, onLoadExperiment }) {
  const phases = path.phases;

  // Progress bar visiva: ● PREPARA ○ MOSTRA ○ CHIEDI ○ OSSERVA ○ CONCLUDI
  const progressBar = (
    <div style={RS.progressBar}>
      {phases.map((phase, i) => (
        <button
          key={phase.name}
          onClick={() => onExpandPhase(i)}
          style={{
            ...RS.progressStep,
            ...(expandedPhase === i ? RS.progressStepActive : {}),
          }}
          title={phase.name}
        >
          <span style={expandedPhase === i ? RS.progressDotActive : RS.progressDot}>
            {expandedPhase > i ? '✓' : phase.icon}
          </span>
          <span style={RS.progressLabel}>{phase.name}</span>
        </button>
      ))}
    </div>
  );

  // Render contenuto di ogni fase
  const renderPhaseContent = (phase, index) => {
    const content = [];

    // Teacher message (sempre)
    if (phase.teacher_message) {
      content.push(
        <p key="msg" style={S.phaseText}>{phase.teacher_message}</p>
      );
    }

    // Teacher tip (box evidenziato)
    if (phase.teacher_tip) {
      content.push(
        <div key="tip" style={RS.teacherTipBox}>
          <span style={RS.teacherTipIcon}>💡</span>
          <span>{phase.teacher_tip}</span>
        </div>
      );
    }

    // Lista componenti (fase PREPARA)
    if (phase.components_list) {
      content.push(
        <p key="comp" style={S.phaseNote}>{phase.components_list}</p>
      );
    }

    // Class hook
    if (phase.class_hook) {
      content.push(
        <div key="hook" style={RS.hookBox}>
          <span style={RS.hookIcon}>🎤</span>
          <em>{phase.class_hook}</em>
        </div>
      );
    }

    // Domanda provocatoria (fase CHIEDI)
    if (phase.provocative_question) {
      content.push(
        <div key="question" style={S.questionBox}>
          <span style={S.questionMark}>?</span>
          <span style={S.questionText}>{phase.provocative_question}</span>
        </div>
      );
    }

    // Errori comuni (fase CHIEDI)
    if (phase.common_mistakes?.length > 0) {
      content.push(
        <div key="mistakes">
          <p style={S.phaseLabel}>Errori tipici e come reagire:</p>
          <ul style={S.errorList}>
            {phase.common_mistakes.map((m, i) => (
              <li key={i} style={S.errorItem}>
                <strong>{m.mistake}</strong> → {m.teacher_response}
                {m.analogy && <em style={{ display: 'block', marginTop: 2, color: '#6B7280' }}>Analogia: {m.analogy}</em>}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // "Monta il circuito per me" (fase MOSTRA)
    if (phase.build_circuit?.intent) {
      content.push(
        <button
          key="build"
          onClick={() => {
            const api = window.__ELAB_API;
            if (!api) return;
            const intent = phase.build_circuit.intent;
            // Piazza componenti e fili via __ELAB_API
            if (intent.components) {
              for (const comp of intent.components) {
                if (api.addComponent) api.addComponent(comp.type, comp);
              }
            }
            if (intent.wires) {
              for (const wire of intent.wires) {
                if (api.addWire) api.addWire(wire.from, wire.to, wire.color);
              }
            }
          }}
          style={RS.buildBtn}
        >
          🔧 {phase.build_circuit.button_label || 'Monta il circuito per me'}
        </button>
      );
    }

    // Osservazione (fase OSSERVA)
    if (phase.observation_prompt) {
      content.push(
        <div key="obs" style={RS.observeBox}>
          <span>👀</span>
          <span>{phase.observation_prompt}</span>
        </div>
      );
    }

    // Analogie (fase OSSERVA)
    if (phase.analogies?.length > 0) {
      content.push(
        <div key="analogies">
          <p style={S.phaseLabel}>Analogie per spiegare:</p>
          <ul style={S.errorList}>
            {phase.analogies.map((a, i) => (
              <li key={i} style={{ ...S.errorItem, borderLeftColor: '#7CB342' }}>
                <strong>{a.concept.replace(/_/g, ' ')}</strong>
                <p style={{ margin: '2px 0 0', fontSize: 14 }}>{a.text}</p>
                {a.evidence && <em style={{ fontSize: 12, color: '#999' }}>({a.evidence})</em>}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Summary (fase CONCLUDI)
    if (phase.summary_for_class) {
      content.push(
        <div key="summary" style={RS.summaryBox}>
          <strong>Da dire alla classe:</strong> {phase.summary_for_class}
        </div>
      );
    }

    // Concetti appresi
    if (phase.concepts_learned?.length > 0) {
      content.push(
        <p key="concepts" style={S.phaseNote}>
          Concetti: {phase.concepts_learned.join(', ')}
        </p>
      );
    }

    // Preview prossimo
    if (phase.next_preview) {
      content.push(
        <p key="next" style={{ ...S.phaseHint, marginTop: 8 }}>{phase.next_preview}</p>
      );
    }

    return content;
  };

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.headerIcon}>📚</span>
        <span style={S.headerTitle}>Percorso Lezione</span>
        <button onClick={onClose} style={S.closeBtn} title="Chiudi">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Experiment title + badge */}
      <div style={S.expTitle}>
        <span>{experiment.icon || '●'}</span>
        <span style={{ flex: 1 }}>{path.title}</span>
        <span style={RS.richBadge}>Percorso UNLIM</span>
      </div>

      {/* Obiettivo */}
      {path.objective && (
        <div style={RS.objectiveBox}>
          <strong>Obiettivo:</strong> {path.objective}
        </div>
      )}

      {/* Progress bar 5-step */}
      {progressBar}

      {/* Fasi — accordion */}
      <div style={S.phases}>
        {phases.map((phase, i) => (
          <div key={i} style={S.phase}>
            <button
              onClick={() => onExpandPhase(expandedPhase === i ? -1 : i)}
              style={{
                ...S.phaseHeader,
                ...(expandedPhase === i ? S.phaseHeaderActive : {}),
              }}
            >
              <span style={S.phaseNum}>{i + 1}</span>
              <span style={S.phaseIcon}>{phase.icon}</span>
              <span style={S.phaseName}>{phase.name}</span>
              <span style={S.phaseDuration}>{phase.duration_minutes ? `${phase.duration_minutes} min` : ''}</span>
              <span style={S.phaseChevron}>{expandedPhase === i ? '▾' : '▸'}</span>
            </button>
            {expandedPhase === i && (
              <div style={S.phaseContent}>
                {renderPhaseContent(phase, i)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prossimo esperimento */}
      {path.next_experiment && onLoadExperiment && (
        <div style={{ padding: '8px 14px 14px' }}>
          <p style={S.phaseText}>
            <strong>Prossimo:</strong> {path.next_experiment.title}
          </p>
          {path.next_experiment.preview && (
            <p style={S.phaseHint}>{path.next_experiment.preview}</p>
          )}
          <button
            onClick={() => onLoadExperiment(path.next_experiment.id)}
            style={RS.nextBtn}
          >
            Carica prossimo esperimento →
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Styles for Rich Lesson Path ─── */
const RS = {
  progressBar: {
    display: 'flex',
    gap: 2,
    padding: '8px 14px',
    background: '#F8F9FA',
    borderBottom: '1px solid #E5E5E5',
  },
  progressStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '4px 2px',
    borderRadius: 6,
    minHeight: 44,
  },
  progressStepActive: {
    background: '#E3F2FD',
  },
  progressDot: {
    fontSize: 14,
    opacity: 0.5,
  },
  progressDotActive: {
    fontSize: 16,
    opacity: 1,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    color: '#666',
  },
  richBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    background: '#7CB342',
    padding: '2px 8px',
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  objectiveBox: {
    padding: '8px 14px',
    fontSize: 13,
    color: '#444',
    background: '#F0F7FF',
    borderBottom: '1px solid #E5E5E5',
    lineHeight: 1.5,
  },
  teacherTipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 12px',
    background: '#FFF8E1',
    borderRadius: 8,
    border: '1px solid #FFE082',
    margin: '8px 0',
    fontSize: 13,
    lineHeight: 1.5,
  },
  teacherTipIcon: { flexShrink: 0, fontSize: 16 },
  hookBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 12px',
    background: '#E8F5E9',
    borderRadius: 8,
    border: '1px solid #C8E6C9',
    margin: '8px 0',
    fontSize: 14,
    lineHeight: 1.5,
  },
  hookIcon: { flexShrink: 0, fontSize: 16 },
  buildBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '12px 16px',
    margin: '10px 0',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #1E4D8C, #2A5FA0)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 56,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
  },
  observeBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 12px',
    background: '#E3F2FD',
    borderRadius: 8,
    border: '1px solid #BBDEFB',
    margin: '8px 0',
    fontSize: 14,
    lineHeight: 1.5,
  },
  summaryBox: {
    padding: '10px 12px',
    background: '#E8F5E9',
    borderRadius: 8,
    border: '1px solid #C8E6C9',
    fontSize: 14,
    lineHeight: 1.5,
    margin: '8px 0',
  },
  nextBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px 16px',
    margin: '8px 0 0',
    border: '2px solid #1E4D8C',
    borderRadius: 10,
    background: 'transparent',
    color: '#1E4D8C',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 48,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
  },
};

const LessonPathPanel = React.memo(function LessonPathPanel({
  experiment,
  allExperiments,
  onClose,
  onSendToUNLIM,
  onLoadExperiment,
}) {
  const [expandedPhase, setExpandedPhase] = React.useState(0);

  if (!experiment) return null;

  // Se esiste un percorso lezione JSON ricco, usa quello
  const richPath = getLessonPath(experiment.id);
  if (richPath?.phases?.length > 0) {
    return (
      <RichLessonPath
        path={richPath}
        experiment={experiment}
        expandedPhase={expandedPhase}
        onExpandPhase={setExpandedPhase}
        onClose={onClose}
        onSendToUNLIM={onSendToUNLIM}
        onLoadExperiment={onLoadExperiment}
      />
    );
  }

  const curriculum = getCurriculum(experiment.id);
  const materials = buildMaterialList(experiment.components);
  const nextExp = findNextExperiment(experiment.id, allExperiments);
  const chapterNum = getChapterNum(experiment.id);
  const starterQuestion = generateStarterQuestion(experiment);
  const fallbackMistakes = generateCommonMistakes(experiment);
  const prereqText = getPrerequisiteText(experiment.id);
  const hasCurriculum = !!curriculum;
  const mistakes = hasCurriculum ? curriculum.commonMistakes : fallbackMistakes;

  /* ─── Build phase content ─── */
  const phases = [
    // Phase 1: PREPARA
    <div key="p1" style={S.phaseContent}>
      <p style={S.phaseText}>
        <strong>Oggi facciamo:</strong> {experiment.title || experiment.desc}
      </p>
      {hasCurriculum && (
        <div style={S.curatedBox}>
          <span style={S.curatedIcon}>📋</span>
          <span>{curriculum.teacherBriefing.beforeClass}</span>
        </div>
      )}
      {materials.length > 0 && (
        <>
          <p style={S.phaseLabel}>Materiale per ogni gruppo:</p>
          <ul style={S.materialList}>
            {materials.map((m, i) => (
              <li key={i} style={S.materialItem}>
                <span style={S.materialQty}>{m.qty}×</span> {m.label}
              </li>
            ))}
          </ul>
        </>
      )}
      {prereqText && (
        <p style={S.prereq}>
          Gli studenti devono già sapere: {prereqText}.
        </p>
      )}
    </div>,

    // Phase 2: MOSTRA
    <div key="p2" style={S.phaseContent}>
      <p style={S.phaseText}>
        Il circuito è già montato nel simulatore sulla LIM.
      </p>
      <p style={S.phaseText}>
        Dì alla classe: <em>"Guardate lo schermo: questo è il circuito di oggi."</em>
      </p>
      {hasCurriculum ? (
        <div style={S.curatedBox}>
          <span style={S.curatedIcon}>🎯</span>
          <span>{curriculum.teacherBriefing.duringClass}</span>
        </div>
      ) : experiment.desc ? (
        <p style={S.phaseNote}>{experiment.desc}</p>
      ) : null}
    </div>,

    // Phase 3: CHIEDI ALLA CLASSE
    <div key="p3" style={S.phaseContent}>
      <p style={S.phaseText}>
        Fai questa domanda alla classe:
      </p>
      <div style={S.questionBox}>
        <span style={S.questionMark}>?</span>
        <span style={S.questionText}>{starterQuestion}</span>
      </div>
      <p style={S.phaseHint}>
        Aspetta le risposte. Non correggere subito — lascia che ragionino.
      </p>
      {hasCurriculum && curriculum.teacherBriefing.commonQuestion && (
        <div style={S.teacherTipBox}>
          <span style={S.teacherTipLabel}>Se ti chiedono di più:</span>
          <span>{curriculum.teacherBriefing.commonQuestion}</span>
        </div>
      )}
    </div>,

    // Phase 4: FAI OSSERVARE
    <div key="p4" style={S.phaseContent}>
      {experiment.observe && (
        <p style={S.phaseText}>{experiment.observe}</p>
      )}
      <p style={S.phaseLabel}>Errori tipici e come reagire:</p>
      <ul style={S.errorList}>
        {mistakes.map((m, i) => (
          <li key={i} style={S.errorItem}>
            <strong>{m.error}</strong> → {m.response}
          </li>
        ))}
        <li style={S.errorItem}>Se qualcuno finisce prima → sfida: <em>"Riesci a farlo in un altro modo?"</em></li>
      </ul>
    </div>,

    // Phase 5: USA GALILEO + ANALOGIE
    <div key="p5" style={S.phaseContent}>
      <p style={S.phaseText}>
        Se uno studente fa una domanda difficile:
      </p>
      <div style={S.tipBox}>
        <span style={S.tipIcon}>💡</span>
        <span><em>"Ottima domanda! Chiediamolo a UNLIM."</em></span>
      </div>
      <p style={S.phaseHint}>
        Non devi sapere tutto. Usare UNLIM davanti alla classe è un modello positivo:
        mostra che chiedere aiuto è intelligente, non una debolezza.
      </p>
      {hasCurriculum && curriculum.analogies?.length > 0 && (
        <>
          <p style={S.phaseLabel}>Analogie pronte per spiegare:</p>
          <ul style={S.analogyList}>
            {curriculum.analogies.map((a, i) => (
              <li key={i} style={S.analogyItem}>
                <strong>{a.concept}</strong>
                <p style={S.analogyText}>{a.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>,

    // Phase 6: CONCLUDI
    <div key="p6" style={S.phaseContent}>
      {experiment.concept && (
        <p style={S.phaseText}>
          <strong>Oggi abbiamo imparato:</strong> {experiment.concept}
        </p>
      )}
      {hasCurriculum && curriculum.assessment?.length > 0 && (
        <>
          <p style={S.phaseLabel}>Come capire se hanno capito:</p>
          <ul style={S.assessmentList}>
            {curriculum.assessment.map((a, i) => (
              <li key={i} style={S.assessmentItem}>{a}</li>
            ))}
          </ul>
        </>
      )}
      {nextExp && (
        <div style={S.nextExpBox}>
          <p style={S.phaseText}>
            <strong>La prossima volta:</strong> {nextExp.title}
          </p>
          {onLoadExperiment && (
            <button
              onClick={() => onLoadExperiment(nextExp.id)}
              style={S.nextExpBtn}
            >
              Carica prossimo esperimento →
            </button>
          )}
        </div>
      )}
      <p style={S.phaseHint}>
        Domanda da portare a casa: <em>"Cosa vi ha sorpreso di più oggi?"</em>
      </p>
    </div>,
  ];

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.headerIcon}>📚</span>
        <span style={S.headerTitle}>Percorso Lezione</span>
        <button onClick={onClose} style={S.closeBtn} title="Chiudi">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Experiment title */}
      <div style={S.expTitle}>
        <span>{experiment.icon || '●'}</span>
        <span style={{ flex: 1 }}>{experiment.title}</span>
        {hasCurriculum && <span style={S.curatedBadge}>Preparato da Galileo</span>}
      </div>

      {/* 6 Phases — accordion */}
      <div style={S.phases}>
        {PHASE_TITLES.map((title, i) => (
          <div key={i} style={S.phase}>
            <button
              onClick={() => setExpandedPhase(expandedPhase === i ? -1 : i)}
              style={{
                ...S.phaseHeader,
                ...(expandedPhase === i ? S.phaseHeaderActive : {}),
              }}
            >
              <span style={S.phaseNum}>{i + 1}</span>
              <span style={S.phaseIcon}>{PHASE_ICONS[i]}</span>
              <span style={S.phaseName}>{title}</span>
              <span style={S.phaseDuration}>{PHASE_DURATIONS[i]}</span>
              <span style={S.phaseChevron}>{expandedPhase === i ? '▾' : '▸'}</span>
            </button>
            {expandedPhase === i && phases[i]}
          </div>
        ))}
      </div>

      {/* Ask UNLIM for full lesson path */}
      {onSendToUNLIM && (
        <button
          onClick={() => onSendToUNLIM(
            `Prepara il percorso lezione completo per l'esperimento "${experiment.title}" (${experiment.id}). ` +
            `Includi: materiale, prerequisiti, domanda iniziale, errori tipici, come chiudere. ` +
            `Sono un insegnante, aiutami a preparare questa lezione.`
          )}
          style={S.unlimBtn}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4C7.83 4 8.5 4.67 8.5 5.5C8.5 6.33 7 6.5 7 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7" cy="9.5" r="0.5" fill="currentColor"/>
          </svg>
          Chiedi a UNLIM un percorso più dettagliato
        </button>
      )}
    </div>
  );
});

/* ─── Styles (Apple floating card — same design language as ExperimentGuide) ─── */
const S = {
  root: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 'min(320px, calc(100% - 16px))',
    maxHeight: 'calc(100% - 16px)',
    background: 'rgba(255, 255, 255, 0.97)',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 14,
    boxShadow: 'var(--shadow-lg, 0 4px 24px rgba(0, 0, 0, 0.1))',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontSize: 14,
    color: 'var(--color-text-gray-700, #333)',
    overflow: 'auto',
    zIndex: 20,
    backdropFilter: 'blur(8px)',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'linear-gradient(135deg, var(--color-primary, #1E4D8C) 0%, #2A5FA0 100%)',
    borderRadius: '14px 14px 0 0',
    color: '#fff',
  },

  headerIcon: { fontSize: 18, lineHeight: 1 },

  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  closeBtn: {
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    cursor: 'pointer',
    color: '#fff',
    padding: 6,
    borderRadius: 6,
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  expTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text, #1A1A2E)',
    borderBottom: '1px solid var(--color-border, #F0F0F0)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
  },

  phases: {
    display: 'flex',
    flexDirection: 'column',
  },

  phase: {
    borderBottom: '1px solid var(--color-divider-subtle, #F0EDE6)',
  },

  phaseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    color: 'var(--color-text-gray-700, #333)',
    textAlign: 'left',
    minHeight: 56,
  },

  phaseHeaderActive: {
    background: 'var(--color-primary-light, #E8EEF6)',
  },

  phaseNum: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'var(--color-primary, #1E4D8C)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },

  phaseIcon: { fontSize: 15, flexShrink: 0 },

  phaseName: {
    flex: 1,
    fontWeight: 700,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },

  phaseDuration: {
    fontSize: 15,
    color: 'var(--color-text-secondary, #6B7280)',
    flexShrink: 0,
  },

  phaseChevron: {
    fontSize: 14,
    color: 'var(--color-text-secondary, #6B7280)',
    flexShrink: 0,
  },

  phaseContent: {
    padding: '8px 14px 14px',
    fontSize: 15,
    lineHeight: 1.6,
  },

  phaseText: {
    margin: '0 0 8px',
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--color-text-gray-600, #444)',
  },

  phaseLabel: {
    margin: '8px 0 4px',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-primary, #1E4D8C)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },

  phaseNote: {
    margin: '4px 0 0',
    fontSize: 14,
    color: 'var(--color-text-secondary, #6B7280)',
    fontStyle: 'italic',
  },

  phaseHint: {
    margin: '8px 0 0',
    fontSize: 14,
    color: 'var(--color-text-secondary, #6B7280)',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },

  prereq: {
    margin: '8px 0 0',
    fontSize: 14,
    color: 'var(--color-vol2, #E8941C)',
    fontWeight: 500,
    padding: '6px 10px',
    background: '#FFF8E1',
    borderRadius: 6,
  },

  materialList: {
    margin: '4px 0 0',
    padding: '0 0 0 8px',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },

  materialItem: {
    fontSize: 15,
    color: 'var(--color-text-gray-600, #444)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  materialQty: {
    fontWeight: 700,
    color: 'var(--color-primary, #1E4D8C)',
    minWidth: 22,
  },

  questionBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 12px',
    background: '#E3F2FD',
    borderRadius: 8,
    border: '1px solid #BBDEFB',
    margin: '8px 0',
  },

  questionMark: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--color-primary, #1E4D8C)',
    lineHeight: 1,
    flexShrink: 0,
  },

  questionText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-primary, #1E4D8C)',
    lineHeight: 1.4,
    fontStyle: 'italic',
  },

  errorList: {
    margin: '4px 0 0',
    padding: '0 0 0 8px',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  errorItem: {
    fontSize: 15,
    color: 'var(--color-text-gray-600, #444)',
    lineHeight: 1.5,
    paddingLeft: 8,
    borderLeft: '2px solid var(--color-vol2, #E8941C)',
  },

  tipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 12px',
    background: '#E8F5E9',
    borderRadius: 8,
    border: '1px solid #C8E6C9',
    margin: '8px 0',
    fontSize: 15,
    lineHeight: 1.5,
  },

  tipIcon: { fontSize: 16, flexShrink: 0 },

  nextExpBox: {
    padding: '8px 0',
  },

  nextExpBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    border: '1px solid var(--color-success, #16A34A)',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--color-success, #16A34A)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    marginTop: 4,
    minHeight: 56,
  },

  curatedBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#16A34A',
    background: '#DCFCE7',
    padding: '2px 8px',
    borderRadius: 10,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  curatedBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 12px',
    background: '#FFF8E1',
    borderRadius: 8,
    border: '1px solid #FFE082',
    margin: '8px 0',
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-text-gray-700, #333)',
  },

  curatedIcon: { fontSize: 15, flexShrink: 0, lineHeight: 1.5 },

  teacherTipBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '10px 12px',
    background: '#F3E5F5',
    borderRadius: 8,
    border: '1px solid #CE93D8',
    margin: '8px 0',
    fontSize: 14,
    lineHeight: 1.5,
  },

  teacherTipLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7B1FA2',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },

  analogyList: {
    margin: '4px 0 0',
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  analogyItem: {
    padding: '8px 10px',
    background: '#E8F5E9',
    borderRadius: 8,
    border: '1px solid #C8E6C9',
    fontSize: 14,
    lineHeight: 1.5,
  },

  analogyText: {
    margin: '4px 0 0',
    fontSize: 14,
    color: 'var(--color-text-gray-600, #444)',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },

  assessmentList: {
    margin: '4px 0 0',
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },

  assessmentItem: {
    fontSize: 14,
    color: 'var(--color-text-gray-600, #444)',
    lineHeight: 1.5,
    paddingLeft: 8,
    borderLeft: '2px solid #16A34A',
  },

  unlimBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: '8px 14px 12px',
    padding: '10px 14px',
    border: '1px solid var(--color-primary, #1E4D8C)',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--color-primary, #1E4D8C)',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    cursor: 'pointer',
    width: 'calc(100% - 28px)',
    minHeight: 56,
  },
};

export default LessonPathPanel;
