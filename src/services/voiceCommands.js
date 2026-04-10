/**
 * Voice Shortcut Commands — Pattern matching locale per comandi vocali frequenti.
 * Intercetta il testo STT PRIMA di inviarlo all'AI per esecuzione istantanea.
 *
 * Flusso: STT text → matchVoiceCommand() → se match → esegui via __ELAB_API → feedback TTS
 *                                         → se no match → invia a AI come prima
 *
 * 24 comandi: simulazione, navigazione, pannelli, compilazione, zoom,
 * montaggio circuito (aggiungi/rimuovi componente, pulisci, monta esperimento)
 */

/**
 * @typedef {Object} VoiceCommand
 * @property {string} action - Nome azione (per logging/tracking)
 * @property {string[]} patterns - Parole chiave che attivano il comando
 * @property {function} execute - Funzione che esegue il comando via __ELAB_API
 * @property {string} feedback - Testo feedback TTS dopo esecuzione
 */

/** @type {VoiceCommand[]} */
const VOICE_COMMANDS = [
  // ── Simulazione ──
  {
    action: 'play',
    patterns: ['play', 'avvia', 'fai partire', 'start', 'inizia simulazione', 'avvia simulazione'],
    execute: () => window.__ELAB_API?.play?.(),
    feedback: 'Simulazione avviata!',
  },
  {
    action: 'stop',
    patterns: ['stop', 'ferma', 'pausa', 'fermati', 'ferma simulazione', 'stop simulazione'],
    execute: () => window.__ELAB_API?.pause?.(),
    feedback: 'Simulazione fermata.',
  },
  {
    action: 'reset',
    patterns: ['reset', 'ricomincia', 'resetta', 'riavvia'],
    execute: () => {
      window.__ELAB_API?.pause?.();
      window.__ELAB_API?.reset?.();
    },
    feedback: 'Simulazione resettata.',
  },

  // ── Navigazione esperimento ──
  {
    action: 'nextStep',
    patterns: ['prossimo', 'avanti', 'next', 'passo successivo', 'vai avanti'],
    execute: () => window.__ELAB_API?.nextStep?.(),
    feedback: 'Prossimo passo.',
  },
  {
    action: 'prevStep',
    patterns: ['indietro', 'precedente', 'back', 'passo precedente', 'torna indietro'],
    execute: () => window.__ELAB_API?.prevStep?.(),
    feedback: 'Passo precedente.',
  },

  // ── Pannelli ──
  {
    action: 'showEditor',
    patterns: ['mostra codice', 'editor', 'apri editor', 'mostra editor', 'vedi codice'],
    execute: () => window.__ELAB_API?.showEditor?.(),
    feedback: 'Editor aperto.',
  },
  {
    action: 'showSerial',
    patterns: ['mostra seriale', 'serial monitor', 'monitor seriale', 'apri seriale'],
    execute: () => window.__ELAB_API?.showSerialMonitor?.(),
    feedback: 'Monitor seriale aperto.',
  },

  // ── Compilazione ──
  {
    action: 'compile',
    patterns: ['compila', 'compile', 'carica codice', 'carica programma', 'upload'],
    execute: () => {
      const code = window.__ELAB_API?.getEditorCode?.();
      if (code) {
        window.__ELAB_API?.compile?.(code);
      }
    },
    feedback: 'Compilazione in corso...',
  },

  // ── Zoom/Vista ──
  {
    action: 'zoomFit',
    patterns: ['zoom fit', 'adatta vista', 'vedi tutto', 'mostra tutto', 'fit'],
    execute: () => {
      // Dispatch 'F' key event — SimulatorCanvas handles it to reset/fit view
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
    },
    feedback: 'Vista adattata.',
  },

  // ── UNLIM ONNIPOTENTE: Aggiungi componenti ──
  {
    action: 'addLed',
    patterns: ['aggiungi led', 'metti led', 'aggiungi un led', 'metti un led', 'inserisci led'],
    execute: () => window.__ELAB_API?.addComponent?.('led'),
    feedback: 'Ho aggiunto un LED rosso sulla breadboard!',
  },
  {
    action: 'addResistor',
    patterns: ['aggiungi resistore', 'metti resistore', 'aggiungi un resistore', 'metti un resistore', 'inserisci resistore'],
    execute: () => window.__ELAB_API?.addComponent?.('resistor'),
    feedback: 'Ho aggiunto un resistore da 1kΩ sulla breadboard!',
  },
  {
    action: 'addButton',
    patterns: ['aggiungi pulsante', 'metti pulsante', 'aggiungi un pulsante', 'inserisci pulsante', 'aggiungi bottone'],
    execute: () => window.__ELAB_API?.addComponent?.('pushbutton'),
    feedback: 'Ho aggiunto un pulsante sulla breadboard!',
  },
  {
    action: 'addCapacitor',
    patterns: ['aggiungi condensatore', 'metti condensatore', 'inserisci condensatore'],
    execute: () => window.__ELAB_API?.addComponent?.('capacitor'),
    feedback: 'Ho aggiunto un condensatore sulla breadboard!',
  },
  {
    action: 'addBuzzer',
    patterns: ['aggiungi buzzer', 'metti buzzer', 'aggiungi cicalino', 'inserisci buzzer'],
    execute: () => window.__ELAB_API?.addComponent?.('buzzer'),
    feedback: 'Ho aggiunto un cicalino sulla breadboard!',
  },
  {
    action: 'addPotentiometer',
    patterns: ['aggiungi potenziometro', 'metti potenziometro', 'inserisci potenziometro'],
    execute: () => window.__ELAB_API?.addComponent?.('potentiometer'),
    feedback: 'Ho aggiunto un potenziometro sulla breadboard!',
  },

  // ── UNLIM ONNIPOTENTE: Pulisci circuito ──
  {
    action: 'clearCircuit',
    patterns: ['pulisci circuito', 'svuota circuito', 'pulisci tutto', 'cancella tutto', 'rimuovi tutto'],
    execute: () => window.__ELAB_API?.clearCircuit?.(),
    feedback: 'Circuito pulito! La breadboard è vuota.',
  },

  // ── UNLIM ONNIPOTENTE: Descrizione circuito ──
  {
    action: 'describeCircuit',
    patterns: ['che componenti ci sono', 'descrivi circuito', 'cosa c\'e nel circuito', 'elenca componenti', 'quanti componenti'],
    execute: () => {
      // Questo comando non esegue un'azione — restituisce il testo per TTS
      // Il feedback sarà sovrascritto dinamicamente da executeVoiceCommand
    },
    feedback: '__CIRCUIT_DESCRIPTION__', // token speciale — sostituito in executeVoiceCommand
  },

  // ── UNLIM ONNIPOTENTE: Undo/Redo ──
  {
    action: 'undo',
    patterns: ['annulla', 'undo', 'cancella ultimo', 'disfa'],
    execute: () => window.__ELAB_API?.undo?.(),
    feedback: 'Azione annullata.',
  },
  {
    action: 'redo',
    patterns: ['ripeti', 'redo', 'rifai'],
    execute: () => window.__ELAB_API?.redo?.(),
    feedback: 'Azione ripetuta.',
  },

  // ── UNLIM ONNIPOTENTE: Monta esperimento per numero ──
  {
    action: 'mountExp1',
    patterns: ['monta esperimento uno', 'monta esperimento 1', 'carica esperimento uno', 'carica esperimento 1', 'primo esperimento'],
    execute: () => {
      const list = window.__ELAB_API?.getExperimentList?.();
      const first = list?.vol1?.[0];
      if (first) window.__ELAB_API?.mountExperiment?.(first.id);
    },
    feedback: 'Sto montando il primo esperimento!',
  },
  {
    action: 'mountExpLed',
    patterns: ['monta circuito led', 'monta il led', 'circuito del led', 'monta led'],
    execute: () => {
      // Cerca esperimento con LED nel titolo
      const all = window.__ELAB_API?.getExperimentList?.();
      const exps = [...(all?.vol1 || []), ...(all?.vol2 || []), ...(all?.vol3 || [])];
      const match = exps.find(e => e.title?.toLowerCase().includes('led') || e.id?.includes('led'));
      if (match) window.__ELAB_API?.mountExperiment?.(match.id);
    },
    feedback: 'Sto montando il circuito con il LED!',
  },
  {
    action: 'mountExpSemafor',
    patterns: ['monta semaforo', 'circuito semaforo', 'esperimento semaforo'],
    execute: () => {
      const all = window.__ELAB_API?.getExperimentList?.();
      const exps = [...(all?.vol1 || []), ...(all?.vol2 || []), ...(all?.vol3 || [])];
      const match = exps.find(e => e.title?.toLowerCase().includes('semafor'));
      if (match) window.__ELAB_API?.mountExperiment?.(match.id);
    },
    feedback: 'Sto montando il semaforo!',
// © Andrea Marro — 10/04/2026 — ELAB Tutor — Tutti i diritti riservati
  },

  // ── UNLIM ONNIPOTENTE: Modalità costruzione ──
  {
    action: 'setBuildSandbox',
    patterns: ['modalita libera', 'sandbox', 'modo sandbox', 'costruisci libero'],
    execute: () => window.__ELAB_API?.setBuildMode?.('sandbox'),
    feedback: 'Modalità libera attivata — puoi costruire come vuoi!',
  },
  {
    action: 'setBuildGuided',
    patterns: ['modalita guidata', 'passo passo', 'modo guidato', 'guida passo'],
    execute: () => window.__ELAB_API?.setBuildMode?.('guided'),
    feedback: 'Modalità passo passo attivata!',
  },
];

/**
 * Normalizza il testo per il matching: lowercase, trim, rimuove punteggiatura, accenti.
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .trim()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Cerca un match tra il testo STT e i comandi vocali.
 * @param {string} text - Testo riconosciuto da STT
 * @returns {{ command: VoiceCommand, matched: string } | null}
 */
export function matchVoiceCommand(text) {
  if (!text || text.length < 2) return null;

  const normalized = normalize(text);

  for (const cmd of VOICE_COMMANDS) {
    for (const pattern of cmd.patterns) {
      if (normalized === pattern) {
        return { command: cmd, matched: pattern };
      }
      // Word-boundary match: pattern must appear as whole words within text
      const re = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (re.test(normalized)) {
        return { command: cmd, matched: pattern };
      }
    }
  }

  return null;
}

/**
 * Esegui un comando vocale e ritorna il feedback.
 * Gestisce il token speciale __CIRCUIT_DESCRIPTION__ per describeCircuit.
 * @param {VoiceCommand} command
 * @returns {string} feedback text
 */
export function executeVoiceCommand(command) {
  try {
    command.execute();

    // Token speciale: sostituisci con la descrizione reale del circuito
    if (command.feedback === '__CIRCUIT_DESCRIPTION__') {
      return window.__ELAB_API?.getCircuitDescription?.() || 'Circuito vuoto.';
    }

    return command.feedback;
  } catch (_err) {
    return 'Comando non riuscito.';
  }
}

/**
 * Lista comandi disponibili (per help/debug).
 * @returns {Array<{action: string, patterns: string[], feedback: string}>}
 */
export function getAvailableCommands() {
  return VOICE_COMMANDS.map(({ action, patterns, feedback }) => ({
    action,
    patterns,
    feedback: feedback === '__CIRCUIT_DESCRIPTION__' ? '(descrizione circuito dinamica)' : feedback,
  }));
}
