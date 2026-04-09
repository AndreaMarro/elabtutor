/**
 * voiceCommands.test.js — Test per il sistema comandi vocali ELAB
 * Target: matchVoiceCommand, executeVoiceCommand, getAvailableCommands
 * 40+ test: exact match, normalization, edge cases, execute, mount, build mode
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchVoiceCommand, executeVoiceCommand, getAvailableCommands } from '../../src/services/voiceCommands';

const mockAPI = {
  play: vi.fn(), pause: vi.fn(), reset: vi.fn(),
  nextStep: vi.fn(), prevStep: vi.fn(),
  showEditor: vi.fn(), showSerialMonitor: vi.fn(),
  getEditorCode: vi.fn(() => 'void setup(){}'), compile: vi.fn(),
  addComponent: vi.fn(), clearCircuit: vi.fn(),
  getCircuitDescription: vi.fn(() => '2 LED, 1 resistore'),
  undo: vi.fn(), redo: vi.fn(),
  getExperimentList: vi.fn(() => ({
    vol1: [{ id: 'v1-cap1-esp1', title: 'Il primo LED' }],
    vol2: [{ id: 'v2-cap1-esp1', title: 'Semaforo base' }],
    vol3: [],
  })),
  mountExperiment: vi.fn(), setBuildMode: vi.fn(),
};

beforeEach(() => { window.__ELAB_API = mockAPI; vi.clearAllMocks(); });
afterEach(() => { delete window.__ELAB_API; });

describe('matchVoiceCommand — exact match', () => {
  it('matches "play"', () => expect(matchVoiceCommand('play')?.command.action).toBe('play'));
  it('matches "stop"', () => expect(matchVoiceCommand('stop')?.command.action).toBe('stop'));
  it('matches "compila"', () => expect(matchVoiceCommand('compila')?.command.action).toBe('compile'));
  it('matches "reset"', () => expect(matchVoiceCommand('reset')?.command.action).toBe('reset'));
  it('matches "annulla"', () => expect(matchVoiceCommand('annulla')?.command.action).toBe('undo'));
  it('matches "ripeti"', () => expect(matchVoiceCommand('ripeti')?.command.action).toBe('redo'));
  it('matches all commands via first pattern', () => {
    const cmds = getAvailableCommands();
    expect(cmds.length).toBeGreaterThanOrEqual(24);
    for (const cmd of cmds) {
      const r = matchVoiceCommand(cmd.patterns[0]);
      expect(r).not.toBeNull();
      expect(r.command.action).toBe(cmd.action);
    }
  });
});

describe('matchVoiceCommand — normalization', () => {
  it('ignores case', () => expect(matchVoiceCommand('PLAY')?.command.action).toBe('play'));
  it('strips accents', () => expect(matchVoiceCommand('modalità guidata')?.command.action).toBe('setBuildGuided'));
  it('strips punctuation', () => expect(matchVoiceCommand('compila!')?.command.action).toBe('compile'));
  it('collapses whitespace', () => expect(matchVoiceCommand('aggiungi   led')?.command.action).toBe('addLed'));
  it('trims', () => expect(matchVoiceCommand('  stop  ')?.command.action).toBe('stop'));
  it('handles mixed', () => expect(matchVoiceCommand('  AVVIA, Simulazione!  ')?.command.action).toBe('play'));
});

describe('matchVoiceCommand — edge cases', () => {
  it('null → null', () => expect(matchVoiceCommand(null)).toBeNull());
  it('undefined → null', () => expect(matchVoiceCommand(undefined)).toBeNull());
  it('empty → null', () => expect(matchVoiceCommand('')).toBeNull());
  it('single char → null', () => expect(matchVoiceCommand('a')).toBeNull());
  it('nonsense → null', () => expect(matchVoiceCommand('asdfghjkl zxcvbnm')).toBeNull());
  it('numbers → null', () => expect(matchVoiceCommand('12345')).toBeNull());
  it('emoji no crash', () => {
    expect(() => matchVoiceCommand('play 🎮')).not.toThrow();
    expect(matchVoiceCommand('play 🎮')?.command.action).toBe('play');
  });
  it('regex chars no injection', () => {
    expect(() => matchVoiceCommand('play.*test')).not.toThrow();
    expect(() => matchVoiceCommand('(play)')).not.toThrow();
    expect(() => matchVoiceCommand('[stop]')).not.toThrow();
  });
});

describe('executeVoiceCommand', () => {
  it('play calls API.play()', () => {
    executeVoiceCommand(matchVoiceCommand('play').command);
    expect(mockAPI.play).toHaveBeenCalledOnce();
  });
  it('stop calls API.pause()', () => {
    executeVoiceCommand(matchVoiceCommand('stop').command);
    expect(mockAPI.pause).toHaveBeenCalledOnce();
  });
  it('reset calls pause + reset', () => {
    executeVoiceCommand(matchVoiceCommand('reset').command);
    expect(mockAPI.pause).toHaveBeenCalledOnce();
    expect(mockAPI.reset).toHaveBeenCalledOnce();
  });
  it('compile gets code then compiles', () => {
    executeVoiceCommand(matchVoiceCommand('compila').command);
    expect(mockAPI.getEditorCode).toHaveBeenCalledOnce();
    expect(mockAPI.compile).toHaveBeenCalledWith('void setup(){}');
  });
  it('compile no code → no compile call', () => {
    mockAPI.getEditorCode.mockReturnValueOnce(null);
    executeVoiceCommand(matchVoiceCommand('compila').command);
    expect(mockAPI.compile).not.toHaveBeenCalled();
  });
  it('addLed calls addComponent("led")', () => {
    executeVoiceCommand(matchVoiceCommand('aggiungi led').command);
    expect(mockAPI.addComponent).toHaveBeenCalledWith('led');
  });
  it('addResistor calls addComponent("resistor")', () => {
    executeVoiceCommand(matchVoiceCommand('aggiungi resistore').command);
    expect(mockAPI.addComponent).toHaveBeenCalledWith('resistor');
  });
  it('clearCircuit calls API', () => {
    executeVoiceCommand(matchVoiceCommand('pulisci circuito').command);
    expect(mockAPI.clearCircuit).toHaveBeenCalledOnce();
  });
  it('describeCircuit returns dynamic text', () => {
    const fb = executeVoiceCommand(matchVoiceCommand('descrivi circuito').command);
    expect(fb).toBe('2 LED, 1 resistore');
  });
  it('describeCircuit fallback when null', () => {
    mockAPI.getCircuitDescription.mockReturnValueOnce(null);
    const fb = executeVoiceCommand(matchVoiceCommand('descrivi circuito').command);
    expect(fb).toBe('Circuito vuoto.');
  });
  it('undo calls API', () => {
    executeVoiceCommand(matchVoiceCommand('annulla').command);
    expect(mockAPI.undo).toHaveBeenCalledOnce();
  });
  it('redo calls API', () => {
    executeVoiceCommand(matchVoiceCommand('ripeti').command);
    expect(mockAPI.redo).toHaveBeenCalledOnce();
  });
  it('returns error feedback on throw', () => {
    mockAPI.play.mockImplementationOnce(() => { throw new Error('fail'); });
    const fb = executeVoiceCommand(matchVoiceCommand('play').command);
    expect(fb).toBe('Comando non riuscito.');
  });
  it('no crash without API', () => {
    delete window.__ELAB_API;
    expect(() => executeVoiceCommand(matchVoiceCommand('play').command)).not.toThrow();
  });
});

describe('executeVoiceCommand — mount experiments', () => {
  it('mounts first experiment', () => {
    executeVoiceCommand(matchVoiceCommand('monta esperimento uno').command);
    expect(mockAPI.mountExperiment).toHaveBeenCalledWith('v1-cap1-esp1');
  });
  it('mounts LED experiment', () => {
    executeVoiceCommand(matchVoiceCommand('monta circuito led').command);
    expect(mockAPI.mountExperiment).toHaveBeenCalledWith('v1-cap1-esp1');
  });
  it('mounts semaforo', () => {
    executeVoiceCommand(matchVoiceCommand('monta semaforo').command);
    expect(mockAPI.mountExperiment).toHaveBeenCalledWith('v2-cap1-esp1');
  });
  it('no mount if not found', () => {
    mockAPI.getExperimentList.mockReturnValueOnce({ vol1: [], vol2: [], vol3: [] });
    executeVoiceCommand(matchVoiceCommand('monta circuito led').command);
    expect(mockAPI.mountExperiment).not.toHaveBeenCalled();
  });
});

describe('executeVoiceCommand — build mode', () => {
  it('sets sandbox', () => {
    executeVoiceCommand(matchVoiceCommand('modalita libera').command);
    expect(mockAPI.setBuildMode).toHaveBeenCalledWith('sandbox');
  });
  it('sets guided', () => {
    executeVoiceCommand(matchVoiceCommand('passo passo').command);
    expect(mockAPI.setBuildMode).toHaveBeenCalledWith('guided');
  });
});

describe('getAvailableCommands', () => {
  it('returns 24+ commands', () => expect(getAvailableCommands().length).toBeGreaterThanOrEqual(24));
  it('all have action+patterns+feedback', () => {
    for (const c of getAvailableCommands()) {
      expect(c.action).toBeTruthy();
      expect(c.patterns.length).toBeGreaterThan(0);
      expect(c.feedback).toBeTruthy();
    }
  });
  it('describeCircuit feedback is readable', () => {
    const d = getAvailableCommands().find(c => c.action === 'describeCircuit');
    expect(d.feedback).not.toBe('__CIRCUIT_DESCRIPTION__');
  });
  it('all actions unique', () => {
    const actions = getAvailableCommands().map(c => c.action);
    expect(new Set(actions).size).toBe(actions.length);
  });
});
