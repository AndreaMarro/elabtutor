// ============================================
// ELAB Tutor - Tests for logger.js
// Conditional logger: debug/info in dev, warn/error always
// ============================================

import { describe, it, expect, vi, afterEach } from 'vitest';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export a logger object as default', async () => {
    const mod = await import('../../src/utils/logger.js');
    const logger = mod.default;
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
  });

  it('should have a warn function', async () => {
    const mod = await import('../../src/utils/logger.js');
    expect(typeof mod.default.warn).toBe('function');
  });

  it('should have an error function', async () => {
    const mod = await import('../../src/utils/logger.js');
    expect(typeof mod.default.error).toBe('function');
  });

  it('should have a debug function', async () => {
    const mod = await import('../../src/utils/logger.js');
    expect(typeof mod.default.debug).toBe('function');
  });

  it('should have an info function', async () => {
    const mod = await import('../../src/utils/logger.js');
    expect(typeof mod.default.info).toBe('function');
  });

  it('should call console.warn when warn is invoked', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../../src/utils/logger.js');
    mod.default.warn('test warning');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('should call console.error when error is invoked', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mod = await import('../../src/utils/logger.js');
    mod.default.error('test error');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should not throw when calling debug', async () => {
    const mod = await import('../../src/utils/logger.js');
    expect(() => mod.default.debug('debug msg')).not.toThrow();
  });

  it('should not throw when calling info', async () => {
    const mod = await import('../../src/utils/logger.js');
    expect(() => mod.default.info('info msg')).not.toThrow();
  });

  it('should not throw when calling warn', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mod = await import('../../src/utils/logger.js');
    expect(() => mod.default.warn('warn msg')).not.toThrow();
  });

  it('should not throw when calling error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const mod = await import('../../src/utils/logger.js');
    expect(() => mod.default.error('error msg')).not.toThrow();
  });
});
