/**
 * Principio Zero Integration Test
 * Verifica che il flusso "docente arriva e insegna subito" funziona.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ExperimentPicker from '../../../src/components/lavagna/ExperimentPicker';
import { deriveState, STATES } from '../../../src/components/lavagna/LavagnaStateManager';

describe('Principio Zero', () => {
  it('picker shows 92 experiments across 3 volumes', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);

    // Vol1 default
    expect(screen.getByText(/Accendi il tuo primo LED/i)).toBeTruthy();
    expect(screen.getByText('0/38 completati')).toBeTruthy();

    // Switch to Vol2
    fireEvent.click(screen.getByText('Volume 2'));
    expect(screen.getByText('0/27 completati')).toBeTruthy();

    // Switch to Vol3
    fireEvent.click(screen.getByText('Volume 3'));
    expect(screen.getByText('0/27 completati')).toBeTruthy();
  });

  it('experiment selection calls onSelect with experiment data', () => {
    const onSelect = vi.fn();
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={onSelect} />);

    const firstCard = screen.getByText(/Accendi il tuo primo LED/i).closest('button');
    fireEvent.click(firstCard);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'v1-cap6-esp1',
        title: expect.stringContaining('Accendi'),
      })
    );
  });

  it('state machine starts in CLEAN state (no experiment)', () => {
    const state = deriveState({ hasExperiment: false });
    expect(state).toBe(STATES.CLEAN);
  });

  it('state transitions to BUILD when experiment loads', () => {
    const state = deriveState({ hasExperiment: true, isPlaying: false, isEditing: false });
    expect(state).toBe(STATES.BUILD);
  });

  it('search filters experiments correctly', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Cerca esperimento...');
    fireEvent.change(input, { target: { value: 'RGB' } });

    // Should show RGB experiments
    expect(screen.getAllByText(/RGB/i).length).toBeGreaterThan(0);
    // Should NOT show non-RGB experiments
    expect(screen.queryByText(/Accendi il tuo primo LED/i)).toBeNull();
  });

  it('picker has correct a11y structure', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Scegli un esperimento');

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });
});
