/**
 * ScratchCompileBar — Compile bar for Scratch mode (no code visible)
 * + ScratchErrorBoundary — Graceful fallback on Blockly crash
 *
 * Extracted from NewElabSimulator.jsx — Andrea Marro
 */
import React, { useState, useEffect } from 'react';
import logger from '../../../utils/logger';

// ErrorBoundary for ScratchEditor — graceful fallback on Blockly crash
// S161.4: retryKey forces full React remount on retry (cleans orphaned Blockly DOM)
export class ScratchErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, retryKey: 0 }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { logger.error('[ScratchErrorBoundary]', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: 12, padding: 24, background: 'var(--color-editor-active-bg)', color: 'var(--color-blockly-text)',
          fontFamily: "var(--font-sans)", textAlign: 'center',
        }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <p style={{ fontSize: 14, margin: 0 }}>Errore nell'editor blocchi.</p>
          <button
            onClick={() => this.setState(prev => ({ hasError: false, retryKey: prev.retryKey + 1 }))}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'var(--color-accent)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600,
            }}
          >Riprova</button>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>Oppure usa la tab "Arduino C++"</p>
        </div>
      );
    }
    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}

/* ─── S93: Compile bar for Scratch mode (no code visible) ─── */
const ScratchCompileBar = React.memo(function ScratchCompileBar({
  onCompile, compilationStatus, compilationErrors, compilationWarnings, compilationSize,
}) {
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => { if (compilationErrors) setShowErrors(true); }, [compilationErrors]);

  const statusColor = compilationStatus === 'success' ? 'var(--color-accent)'
    : compilationStatus === 'error' ? 'var(--color-vol3)'
    : compilationStatus === 'compiling' ? 'var(--color-status-compiling)' : 'var(--color-muted)';

  const statusText = compilationStatus === 'success'
    ? (compilationSize ? `\u2705 ${compilationSize.bytes}/${compilationSize.total} bytes (${compilationSize.percent}%)` : '\u2705 Compilazione OK')
    : compilationStatus === 'error' ? '\u274C Errore'
    : compilationStatus === 'compiling' ? '\u231B Compilazione...'
    : 'Pronto';

  return (
    <div style={{
      flexShrink: 0, borderTop: '1px solid var(--color-blockly-grid, #2a3040)',
      background: 'var(--color-code-header, #181825)',
    }}>
      {/* Warning panel */}
      {compilationWarnings && (
        <div style={{ padding: 'var(--space-1-5) var(--space-2-5)', borderTop: '2px solid var(--color-warning-panel-border)', background: 'var(--color-warning-panel-bg)' }}>
          <span style={{ color: 'var(--color-warning-panel-text)', fontWeight: 700, fontSize: 15 }}>{'\u26A0'} Avvisi</span>
          <pre style={{ margin: 'var(--space-1) 0 0', fontSize: 14, color: 'var(--color-warning-panel-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "var(--font-mono)" }}>
            {compilationWarnings}
          </pre>
        </div>
      )}
      {/* Error panel */}
      {showErrors && compilationErrors && (
        <div style={{ padding: 'var(--space-1-5) var(--space-2-5)', borderTop: '2px solid var(--color-vol3)', background: 'var(--color-error-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-vol3)', fontWeight: 700, fontSize: 15 }}>{'\u274C'} Errori di compilazione</span>
            <button
              onClick={() => setShowErrors(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: 16, padding: 0, minWidth: 56, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Chiudi pannello errori"
            >{'\u2715'}</button>
          </div>
          <pre style={{ margin: 'var(--space-1) 0 0', fontSize: 14, color: 'var(--color-vol3)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "var(--font-mono)" }}>
            {compilationErrors}
          </pre>
        </div>
      )}
      {/* Status + Compile button row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-2-5)' }}>
        <span style={{ flex: 1, fontSize: 14, color: statusColor, fontFamily: "var(--font-mono)" }}>
          {statusText}
        </span>
        <button
          onClick={onCompile}
          disabled={compilationStatus === 'compiling'}
          style={{
            padding: '6px 16px', border: 'none', borderRadius: 4,
            background: 'var(--color-accent)', color: 'var(--color-text-inverse)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 44,
            opacity: compilationStatus === 'compiling' ? 0.5 : 1,
            fontFamily: "var(--font-sans)",
          }}
        >
          {compilationStatus === 'compiling' ? '\u231B Compilazione...' : '\u25B6 Compila & Carica'}
        </button>
      </div>
    </div>
  );
});

export default ScratchCompileBar;
