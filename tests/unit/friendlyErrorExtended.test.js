// ============================================
// ELAB Tutor - Extended tests for friendlyError.js
// More GCC error patterns and edge cases
// ============================================

import { friendlyError } from '../../src/components/simulator/utils/friendlyError';
import { describe, it, expect } from 'vitest';

describe('friendlyError - extended patterns', () => {
  it('should translate missing closing brace', () => {
    const gcc = "sketch.ino:20:1: error: expected '}' before end";
    const result = friendlyError(gcc);
    expect(result).toContain('graffa');
  });

  it('should translate generic expected token', () => {
    const gcc = "sketch.ino:5:10: error: expected '+' before ';'";
    const result = friendlyError(gcc);
    expect(result).toContain('Manca');
  });

  it('should translate function redefinition', () => {
    const gcc = "sketch.ino:15:6: error: redefinition of 'setup'";
    const result = friendlyError(gcc);
    expect(result).toContain('setup');
    expect(result).toContain('definito due volte');
  });

  it('should translate too few arguments', () => {
    const gcc = "sketch.ino:8:5: error: too few arguments to function 'digitalWrite'";
    const result = friendlyError(gcc);
    expect(result).toContain('Mancano');
  });

  it('should translate too many arguments', () => {
    const gcc = "sketch.ino:8:5: error: too many arguments to function 'digitalWrite'";
    const result = friendlyError(gcc);
    expect(result).toContain('troppi');
  });

  it('should translate void value not ignored', () => {
    const gcc = "sketch.ino:12:15: error: void value not ignored as it ought to be";
    const result = friendlyError(gcc);
    expect(result).toContain('void');
  });

  it('should translate control reaches end of non-void', () => {
    const gcc = "sketch.ino:30:1: error: control reaches end of non-void function";
    const result = friendlyError(gcc);
    expect(result).toContain('return');
  });

  it('should translate ISO C++ forbidden syntax', () => {
    const gcc = "sketch.ino:9:3: error: ISO C++ forbids declaration of 'x'";
    const result = friendlyError(gcc);
    expect(result).toContain('C++');
  });

  it('should translate lvalue required', () => {
    const gcc = "sketch.ino:14:7: error: lvalue required as left operand of assignment";
    const result = friendlyError(gcc);
    expect(result).toContain('assegnare');
  });

  it('should translate subscripted value not array', () => {
    const gcc = "sketch.ino:16:8: error: subscripted value is not an array, pointer, or vector";
    const result = friendlyError(gcc);
    expect(result).toContain('array');
  });

  it('should translate invalid conversion', () => {
    const gcc = "sketch.ino:11:20: error: invalid conversion from 'int' to 'char*'";
    const result = friendlyError(gcc);
    expect(result).toContain('tipo di dato');
  });

  it('should translate cannot convert', () => {
    const gcc = "sketch.ino:18:10: error: cannot convert 'int' to 'String'";
    const result = friendlyError(gcc);
    expect(result).toContain('corrispondono');
  });

  it('should translate no matching function', () => {
    const gcc = "sketch.ino:22:5: error: no matching function for call to 'myFunction'";
    const result = friendlyError(gcc);
    expect(result).toContain('myFunction');
    expect(result).toContain('parametri');
  });

  it('should translate stray character error', () => {
    const gcc = "sketch.ino:3:1: error: stray '\\342' in program";
    const result = friendlyError(gcc);
    expect(result).toContain('carattere strano');
  });

  it('should translate unqualified-id error', () => {
    const gcc = "sketch.ino:7:1: error: expected unqualified-id before '}'";
    const result = friendlyError(gcc);
    expect(result).toContain('strano');
  });

  it('should handle multiline GCC error', () => {
    const gcc = [
      "sketch.ino:5:3: error: 'ledPin' was not declared in this scope",
      "sketch.ino:10:1: error: expected ';' before '}' token",
    ].join('\n');
    const result = friendlyError(gcc);
    // Both errors should be translated
    expect(result).toContain('ledPin');
    expect(result).toContain('punto e virgola');
  });

  it('should handle mixed known and unknown errors in multiline', () => {
    const gcc = [
      "sketch.ino:5:3: error: 'x' was not declared in this scope",
      "some unknown technical detail",
    ].join('\n');
    const result = friendlyError(gcc);
    expect(result).toContain('non esiste');
    expect(result).toContain('some unknown technical detail');
  });

  it('should include Riga prefix when line number present in pattern', () => {
    const gcc = "sketch.ino:42:5: error: 'myVar' was not declared in this scope";
    const result = friendlyError(gcc);
    expect(result).toContain('Riga 42');
  });

  it('should not include Riga prefix when no line number in error', () => {
    const gcc = "'foo' was not declared in this scope";
    const result = friendlyError(gcc);
    expect(result).not.toContain('Riga');
    expect(result).toContain('foo');
  });

  it('should return input unchanged for empty string', () => {
    expect(friendlyError('')).toBe('');
  });

  it('should handle error with only whitespace lines', () => {
    const gcc = '\n\n\n';
    const result = friendlyError(gcc);
    // Whitespace-only lines are filtered (trim check)
    expect(typeof result).toBe('string');
  });

  it('should handle single unknown error gracefully', () => {
    const gcc = 'completely unknown gcc output';
    const result = friendlyError(gcc);
    expect(result).toBe(gcc);
  });
});
