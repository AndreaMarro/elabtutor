/**
 * ELAB Videocorsi — Premium video courses included with ELAB kit purchase
 * (c) Andrea Marro — 02/04/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Each course is linked to a volume (V1/V2/V3) and unlocked when the
 * student/teacher has a valid license for that volume.
 *
 * youtubeId: set to null for courses delivered as local mp4 files
 * (uploaded by teacher or distributed via kit USB).
 */

export const VIDEO_COURSES = [
  // ── Volume 1: Basi dell'Elettronica ──
  {
    id: 'vc-v1-intro',
    title: 'Introduzione al Kit ELAB',
    description: 'Come aprire il kit, riconoscere i componenti e preparare la breadboard.',
    volumeId: 'v1',
    volumeLabel: 'VOL 1',
    color: '#4A7A25',
    chapter: 'Introduzione',
    youtubeId: null,
    order: 1,
  },
  {
    id: 'vc-v1-breadboard',
    title: 'La Breadboard: come funziona',
    description: 'Le linee di alimentazione, le colonne e come inserire i componenti.',
    volumeId: 'v1',
    volumeLabel: 'VOL 1',
    color: '#4A7A25',
    chapter: 'Cap. 6',
    youtubeId: null,
    order: 2,
  },
  {
    id: 'vc-v1-primo-circuito',
    title: 'Il tuo primo circuito',
    description: 'Accendere un LED con batteria e resistore: passo per passo.',
    volumeId: 'v1',
    volumeLabel: 'VOL 1',
    color: '#4A7A25',
    chapter: 'Cap. 6',
    youtubeId: null,
    order: 3,
  },
  {
    id: 'vc-v1-sicurezza',
    title: 'Sicurezza nei circuiti',
    description: 'Cortocircuiti, polarita e come proteggere i componenti.',
    volumeId: 'v1',
    volumeLabel: 'VOL 1',
    color: '#4A7A25',
    chapter: 'Cap. 7',
    youtubeId: null,
    order: 4,
  },

  // ── Volume 2: Arduino e Programmazione ──
  {
    id: 'vc-v2-arduino-intro',
    title: 'Arduino Nano: primi passi',
    description: 'Collegare Arduino, installare il software e caricare il primo programma.',
    volumeId: 'v2',
    volumeLabel: 'VOL 2',
    color: '#E8941C',
    chapter: 'Cap. 14',
    youtubeId: null,
    order: 5,
  },
  {
    id: 'vc-v2-digitalwrite',
    title: 'DigitalWrite: accendere LED con codice',
    description: 'I pin digitali, HIGH e LOW, e il primo sketch che lampeggia un LED.',
    volumeId: 'v2',
    volumeLabel: 'VOL 2',
    color: '#E8941C',
    chapter: 'Cap. 14',
    youtubeId: null,
    order: 6,
  },
  {
    id: 'vc-v2-sensori',
    title: 'Leggere i sensori',
    description: 'AnalogRead, potenziometro e fotoresistore: come Arduino sente il mondo.',
    volumeId: 'v2',
    volumeLabel: 'VOL 2',
    color: '#E8941C',
    chapter: 'Cap. 16',
    youtubeId: null,
    order: 7,
  },

  // ── Volume 3: Progetti Avanzati ──
  {
    id: 'vc-v3-pwm',
    title: 'PWM: controllare la luminosita',
    description: 'Come Arduino regola la potenza con impulsi rapidi.',
    volumeId: 'v3',
    volumeLabel: 'VOL 3',
    color: '#E54B3D',
    chapter: 'Cap. 20',
    youtubeId: null,
    order: 8,
  },
  {
    id: 'vc-v3-progetto-finale',
    title: 'Progetto finale: Simon Says',
    description: 'Costruire il gioco Simon Says con LED, buzzer e pulsanti.',
    volumeId: 'v3',
    volumeLabel: 'VOL 3',
    color: '#E54B3D',
    chapter: 'Cap. 22',
    youtubeId: null,
    order: 9,
  },
];

export default VIDEO_COURSES;
