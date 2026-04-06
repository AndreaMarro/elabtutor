/**
 * AVRBridge Unit Tests
 * Tests for the AVR emulation bridge (ATmega328p)
 * Focus: constructor defaults, baud rate normalization, worker message handling,
 * LCD state, servo angles, pin state management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock logger to avoid console noise
vi.mock('../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

// We need to import AVRBridge without triggering Worker creation
// Mock Worker globally
vi.stubGlobal('Worker', undefined);

let AVRBridge;

beforeEach(async () => {
  // Dynamic import to get fresh module per test
  vi.resetModules();
  vi.stubGlobal('Worker', undefined);
  const mod = await import('../../src/components/simulator/engine/AVRBridge.js');
  AVRBridge = mod.default;
});

describe('AVRBridge Constructor', () => {
  it('initializes with correct defaults', () => {
    const bridge = new AVRBridge();
    expect(bridge.cpu).toBeNull();
    expect(bridge.running).toBe(false);
    expect(bridge.flash).toBeNull();
    expect(bridge.serialBuffer).toBe('');
    expect(bridge.avr8jsLoaded).toBe(false);
    expect(bridge.cyclesPerFrame).toBe(16000000 / 60);
    expect(bridge.MS_PER_FRAME).toBe(8);
  });

  it('initializes port references as null', () => {
    const bridge = new AVRBridge();
    expect(bridge.portB).toBeNull(); // D8-D13
    expect(bridge.portC).toBeNull(); // A0-A7
    expect(bridge.portD).toBeNull(); // D0-D7
    expect(bridge.usart).toBeNull(); // Serial
  });

  it('initializes LCD state correctly', () => {
    const bridge = new AVRBridge();
    expect(bridge._lcdState.text).toEqual(['                ', '                ']);
    expect(bridge._lcdState.cursorPos).toEqual({ row: 0, col: 0 });
    expect(bridge._lcdState.cursorVisible).toBe(false);
    expect(bridge._lcdState.displayOn).toBe(true);
    expect(bridge._lcdState.backlight).toBe(true);
    expect(bridge._lcdState._nibbleHigh).toBeNull();
  });

  it('initializes worker state as disabled when Worker is undefined', () => {
    const bridge = new AVRBridge();
    expect(bridge._worker).toBeNull();
    expect(bridge._useWorker).toBe(false);
    expect(bridge._workerReady).toBe(false);
  });

  it('initializes empty analog values and external overrides', () => {
    const bridge = new AVRBridge();
    expect(bridge._analogValues).toEqual({});
    expect(bridge._externalOverrides).toBeInstanceOf(Set);
    expect(bridge._externalOverrides.size).toBe(0);
  });

  it('initializes empty servo angles', () => {
    const bridge = new AVRBridge();
    expect(bridge._servoAngles).toEqual({});
  });
});

describe('AVRBridge._normalizeBaudRate', () => {
  it('normalizes valid baud rates', () => {
    const bridge = new AVRBridge();
    expect(bridge._normalizeBaudRate(9600)).toBe(9600);
    expect(bridge._normalizeBaudRate(115200)).toBe(115200);
    expect(bridge._normalizeBaudRate('9600')).toBe(9600);
  });

  it('returns null for invalid baud rates', () => {
    const bridge = new AVRBridge();
    expect(bridge._normalizeBaudRate(0)).toBeNull();
    expect(bridge._normalizeBaudRate(-1)).toBeNull();
    expect(bridge._normalizeBaudRate(NaN)).toBeNull();
    expect(bridge._normalizeBaudRate(Infinity)).toBeNull();
    expect(bridge._normalizeBaudRate('abc')).toBeNull();
    expect(bridge._normalizeBaudRate(null)).toBeNull();
    expect(bridge._normalizeBaudRate(undefined)).toBeNull();
  });
});

describe('AVRBridge._handleWorkerMessage', () => {
  let bridge;

  beforeEach(() => {
    bridge = new AVRBridge();
  });

  it('handles ready message', () => {
    bridge._handleWorkerMessage({ type: 'ready' });
    expect(bridge._workerReady).toBe(true);
  });

  it('handles single pinChange message', () => {
    const callback = vi.fn();
    bridge.onPinChange = callback;
    bridge._handleWorkerMessage({ type: 'pinChange', pin: 13, value: 1, state: 'high' });
    expect(bridge._workerPinStates['D13']).toBe(1);
    expect(bridge._workerPinStates.d13Led).toBe(1);
    expect(callback).toHaveBeenCalledWith(13, 1, 'high');
  });

  it('handles batch pinChange messages', () => {
    const callback = vi.fn();
    bridge.onPinChange = callback;
    bridge._handleWorkerMessage({
      type: 'pinChange',
      changes: [
        { pin: 2, value: 1, state: 'high' },
        { pin: 3, value: 0, state: 'low' },
        { pin: 13, value: 1, state: 'high' },
      ]
    });
    expect(bridge._workerPinStates['D2']).toBe(1);
    expect(bridge._workerPinStates['D3']).toBe(0);
    expect(bridge._workerPinStates['D13']).toBe(1);
    expect(bridge._workerPinStates.d13Led).toBe(1);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('handles single serialOutput message', () => {
    const callback = vi.fn();
    bridge.onSerialOutput = callback;
    bridge._handleWorkerMessage({ type: 'serialOutput', char: 'H' });
    expect(bridge.serialBuffer).toBe('H');
    expect(callback).toHaveBeenCalledWith('H');
  });

  it('handles batch serialOutput message', () => {
    const callback = vi.fn();
    bridge.onSerialOutput = callback;
    bridge._handleWorkerMessage({ type: 'serialOutput', text: 'Hello' });
    expect(bridge.serialBuffer).toBe('Hello');
    expect(callback).toHaveBeenCalledTimes(5); // one per char
  });

  it('handles pwm message', () => {
    bridge._handleWorkerMessage({ type: 'pwm', duties: { 3: 128, 5: 255 } });
    expect(bridge._workerPWM).toEqual({ 3: 128, 5: 255 });
  });

  it('handles pinStates message', () => {
    bridge._handleWorkerMessage({ type: 'pinStates', states: { D2: 1, D13: 0 } });
    expect(bridge._workerPinStates).toEqual({ D2: 1, D13: 0 });
  });

  it('does not crash with no callbacks set', () => {
    expect(() => {
      bridge._handleWorkerMessage({ type: 'pinChange', pin: 5, value: 1 });
      bridge._handleWorkerMessage({ type: 'serialOutput', char: 'X' });
    }).not.toThrow();
  });
});

describe('AVRBridge._initWorker', () => {
  it('sets _useWorker false when Worker is undefined', () => {
    const bridge = new AVRBridge();
    vi.stubGlobal('Worker', undefined);
    bridge._initWorker();
    expect(bridge._useWorker).toBe(false);
  });
});

describe('AVRBridge._clearHexLoadTimeout', () => {
  it('clears timeout when one exists', () => {
    const bridge = new AVRBridge();
    bridge._hexLoadTimeoutId = setTimeout(() => {}, 10000);
    bridge._clearHexLoadTimeout();
    expect(bridge._hexLoadTimeoutId).toBeNull();
  });

  it('handles null timeout gracefully', () => {
    const bridge = new AVRBridge();
    bridge._hexLoadTimeoutId = null;
    expect(() => bridge._clearHexLoadTimeout()).not.toThrow();
  });
});

describe('AVRBridge._clearBaudRequestTimeout', () => {
  it('clears baud timeout when one exists', () => {
    const bridge = new AVRBridge();
    bridge._baudRequestTimeoutId = setTimeout(() => {}, 10000);
    bridge._clearBaudRequestTimeout();
    expect(bridge._baudRequestTimeoutId).toBeNull();
  });
});

describe('AVRBridge._resetWorkerBaudTracking', () => {
  it('resets baud tracking state', () => {
    const bridge = new AVRBridge();
    bridge._baudRequestPending = true;
    bridge._pendingBaudRequestId = 5;
    bridge._cachedBaudRate = 9600;
    bridge._resetWorkerBaudTracking(true);
    expect(bridge._baudRequestPending).toBe(false);
    expect(bridge._pendingBaudRequestId).toBeNull();
    expect(bridge._cachedBaudRate).toBeNull();
  });

  it('preserves cached baud rate when resetCache is false', () => {
    const bridge = new AVRBridge();
    bridge._cachedBaudRate = 9600;
    bridge._resetWorkerBaudTracking(false);
    expect(bridge._cachedBaudRate).toBe(9600);
  });
});

describe('AVRBridge serial buffer', () => {
  it('accumulates serial output', () => {
    const bridge = new AVRBridge();
    bridge._handleWorkerMessage({ type: 'serialOutput', char: 'H' });
    bridge._handleWorkerMessage({ type: 'serialOutput', char: 'i' });
    expect(bridge.serialBuffer).toBe('Hi');
  });

  it('accumulates batch and single messages', () => {
    const bridge = new AVRBridge();
    bridge._handleWorkerMessage({ type: 'serialOutput', text: 'Hel' });
    bridge._handleWorkerMessage({ type: 'serialOutput', char: 'l' });
    bridge._handleWorkerMessage({ type: 'serialOutput', char: 'o' });
    expect(bridge.serialBuffer).toBe('Hello');
  });
});
