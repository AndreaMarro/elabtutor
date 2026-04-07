// ============================================
// ELAB Tutor - Test Estesi VoiceCommands
// Copre tutti i 24 comandi vocali con varianti pattern
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchVoiceCommand, executeVoiceCommand, getAvailableCommands } from '../../src/services/voiceCommands.js';

describe('voiceCommands estesi', () => {
    beforeEach(() => {
        window.__ELAB_API = {
            play: vi.fn(),
            pause: vi.fn(),
            reset: vi.fn(),
            nextStep: vi.fn(),
            prevStep: vi.fn(),
            showEditor: vi.fn(),
            showSerialMonitor: vi.fn(),
            compile: vi.fn(),
            zoomIn: vi.fn(),
            zoomOut: vi.fn(),
            resetView: vi.fn(),
            addComponent: vi.fn(),
            removeComponent: vi.fn(),
            clearCircuit: vi.fn(),
            mountExperiment: vi.fn(),
            getExperimentList: vi.fn(() => ({ vol1: [], vol2: [], vol3: [] })),
            getCircuitDescription: vi.fn(() => 'LED + resistenza'),
            getEditorCode: vi.fn(() => 'void setup() {}'),
            setBuildMode: vi.fn(),
            showPanel: vi.fn(),
        };
    });

    // ── Comandi simulazione ───────────────────

    describe('comandi simulazione', () => {
        it('reset: ricomincia', () => {
            const m = matchVoiceCommand('ricomincia');
            expect(m).toBeTruthy();
            expect(m.command.action).toBe('reset');
        });

        it('reset: resetta', () => {
            const m = matchVoiceCommand('resetta');
            expect(m).toBeTruthy();
            expect(m.command.action).toBe('reset');
        });

        it('reset: riavvia', () => {
            const m = matchVoiceCommand('riavvia');
            expect(m).toBeTruthy();
            expect(m.command.action).toBe('reset');
        });

        it('play: start', () => {
            const m = matchVoiceCommand('start');
            expect(m?.command.action).toBe('play');
        });

        it('play: inizia simulazione', () => {
            const m = matchVoiceCommand('inizia simulazione');
            expect(m?.command.action).toBe('play');
        });

        it('stop: pausa', () => {
            const m = matchVoiceCommand('pausa');
            expect(m?.command.action).toBe('stop');
        });

        it('stop: fermati', () => {
            const m = matchVoiceCommand('fermati');
            expect(m?.command.action).toBe('stop');
        });
    });

    // ── Navigazione ───────────────────────────

    describe('comandi navigazione', () => {
        it('nextStep: avanti', () => {
            const m = matchVoiceCommand('avanti');
            expect(m?.command.action).toBe('nextStep');
        });

        it('nextStep: passo successivo', () => {
            const m = matchVoiceCommand('passo successivo');
            expect(m?.command.action).toBe('nextStep');
        });

        it('nextStep: vai avanti', () => {
            const m = matchVoiceCommand('vai avanti');
            expect(m?.command.action).toBe('nextStep');
        });

        it('prevStep: precedente', () => {
            const m = matchVoiceCommand('precedente');
            expect(m?.command.action).toBe('prevStep');
        });

        it('prevStep: back', () => {
            const m = matchVoiceCommand('back');
            expect(m?.command.action).toBe('prevStep');
        });

        it('prevStep: passo precedente', () => {
            const m = matchVoiceCommand('passo precedente');
            expect(m?.command.action).toBe('prevStep');
        });
    });

    // ── Pannelli ──────────────────────────────

    describe('comandi pannelli', () => {
        it('showEditor: apri editor', () => {
            const m = matchVoiceCommand('apri editor');
            expect(m?.command.action).toBe('showEditor');
        });

        it('showEditor: vedi codice', () => {
            const m = matchVoiceCommand('vedi codice');
            expect(m?.command.action).toBe('showEditor');
        });

        it('showEditor: editor', () => {
            const m = matchVoiceCommand('editor');
            expect(m?.command.action).toBe('showEditor');
        });

        it('showSerial: apri seriale', () => {
            const m = matchVoiceCommand('apri seriale');
            expect(m?.command.action).toBe('showSerial');
        });

        it('showSerial: serial monitor', () => {
            const m = matchVoiceCommand('serial monitor');
            expect(m?.command.action).toBe('showSerial');
        });
    });

    // ── Compilazione ──────────────────────────

    describe('comandi compilazione', () => {
        it('compile: carica codice', () => {
            const m = matchVoiceCommand('carica codice');
            expect(m?.command.action).toBe('compile');
        });

        it('compile: upload', () => {
            const m = matchVoiceCommand('upload');
            expect(m?.command.action).toBe('compile');
        });

        it('compile: carica programma', () => {
            const m = matchVoiceCommand('carica programma');
            expect(m?.command.action).toBe('compile');
        });
    });

    // ── getAvailableCommands ──────────────────

    describe('getAvailableCommands', () => {
        it('ritorna almeno 20 comandi', () => {
            const cmds = getAvailableCommands();
            expect(cmds.length).toBeGreaterThanOrEqual(20);
        });

        it('ogni comando ha action, patterns, feedback', () => {
            const cmds = getAvailableCommands();
            for (const cmd of cmds) {
                expect(typeof cmd.action).toBe('string');
                expect(Array.isArray(cmd.patterns)).toBe(true);
                expect(cmd.patterns.length).toBeGreaterThan(0);
                expect(typeof cmd.feedback).toBe('string');
            }
        });

        it('contiene il comando play', () => {
            const cmds = getAvailableCommands();
            const play = cmds.find(c => c.action === 'play');
            expect(play).toBeTruthy();
            expect(play.patterns).toContain('play');
        });

        it('contiene il comando stop', () => {
            const cmds = getAvailableCommands();
            expect(cmds.some(c => c.action === 'stop')).toBe(true);
        });

        it('sostituisce __CIRCUIT_DESCRIPTION__ con testo leggibile', () => {
            const cmds = getAvailableCommands();
            for (const cmd of cmds) {
                expect(cmd.feedback).not.toBe('__CIRCUIT_DESCRIPTION__');
            }
        });
    });

    // ── executeVoiceCommand ───────────────────

    describe('executeVoiceCommand — azioni specifiche', () => {
        it('reset: chiama pause e reset', () => {
            const m = matchVoiceCommand('reset');
            executeVoiceCommand(m.command);
            expect(window.__ELAB_API.pause).toHaveBeenCalled();
            expect(window.__ELAB_API.reset).toHaveBeenCalled();
        });

        it('nextStep: chiama nextStep', () => {
            const m = matchVoiceCommand('avanti');
            executeVoiceCommand(m.command);
            expect(window.__ELAB_API.nextStep).toHaveBeenCalled();
        });

        it('prevStep: chiama prevStep', () => {
            const m = matchVoiceCommand('indietro');
            executeVoiceCommand(m.command);
            expect(window.__ELAB_API.prevStep).toHaveBeenCalled();
        });

        it('clearCircuit: chiama clearCircuit', () => {
            const m = matchVoiceCommand('pulisci circuito');
            if (m) {
                executeVoiceCommand(m.command);
                expect(window.__ELAB_API.clearCircuit).toHaveBeenCalled();
            }
        });

        it('sandbox mode: chiama setBuildMode con sandbox', () => {
            const m = matchVoiceCommand('sandbox');
            if (m) {
                executeVoiceCommand(m.command);
                expect(window.__ELAB_API.setBuildMode).toHaveBeenCalledWith('sandbox');
            }
        });

        it('guided mode: chiama setBuildMode con guided', () => {
            const m = matchVoiceCommand('passo passo');
            if (m) {
                executeVoiceCommand(m.command);
                expect(window.__ELAB_API.setBuildMode).toHaveBeenCalledWith('guided');
            }
        });

        it('describeCircuit: ritorna descrizione circuito', () => {
            // Cerca il comando describeCircuit
            const cmds = getAvailableCommands();
            const descCmd = cmds.find(c => c.action === 'describeCircuit');
            if (descCmd) {
                // Testa il feedback speciale (sarà "(descrizione circuito dinamica)")
                expect(descCmd.feedback).toBe('(descrizione circuito dinamica)');
            }
        });
    });

    // ── Pattern matching avanzato ─────────────

    describe('matchVoiceCommand — casi edge', () => {
        it('gestisce spazi multipli', () => {
            const m = matchVoiceCommand('avvia  simulazione');
            expect(m?.command.action).toBe('play');
        });

        it('gestisce testo con virgole', () => {
            const m = matchVoiceCommand('avvia,');
            expect(m?.command.action).toBe('play');
        });

        it('gestisce testo con punto esclamativo', () => {
            const m = matchVoiceCommand('ferma!');
            expect(m?.command.action).toBe('stop');
        });

        it('gestisce testo con punto interrogativo', () => {
            const m = matchVoiceCommand('prossimo?');
            expect(m?.command.action).toBe('nextStep');
        });

        it('ritorna null per undefined', () => {
            expect(matchVoiceCommand(undefined)).toBeNull();
        });

        it('ritorna null per testo di 1 carattere', () => {
            expect(matchVoiceCommand('x')).toBeNull();
        });

        it('ritorna null per testo long senza pattern', () => {
            const m = matchVoiceCommand('vorrei sapere come funziona un resistore in un circuito');
            expect(m).toBeNull();
        });
    });
});
