import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExperimentPicker from '../../../src/components/lavagna/ExperimentPicker';

describe('ExperimentPicker', () => {
  const mockClose = vi.fn();
  const mockSelect = vi.fn();

  afterEach(() => { vi.clearAllMocks(); });

  it('does not render when closed', () => {
    const { container } = render(
      <ExperimentPicker open={false} onClose={mockClose} onSelect={mockSelect} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with 3 volume tabs when open', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    expect(screen.getByText('Volume 1')).toBeTruthy();
    expect(screen.getByText('Volume 2')).toBeTruthy();
    expect(screen.getByText('Volume 3')).toBeTruthy();
  });

  it('shows experiment cards from Volume 1 by default', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    // Vol1 has "Accendi il tuo primo LED" as first experiment
    expect(screen.getByText(/Accendi il tuo primo LED/i)).toBeTruthy();
  });

  it('switches volume when tab is clicked', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    fireEvent.click(screen.getByText('Volume 2'));
    // Vol2 has "LED in serie" experiments (multiple matches OK)
    expect(screen.getAllByText(/LED in serie/i).length).toBeGreaterThan(0);
    // Vol1 content should not be visible
    expect(screen.queryByText(/Accendi il tuo primo LED/i)).toBeNull();
  });

  it('filters experiments by search', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const input = screen.getByPlaceholderText('Cerca esperimento...');
    fireEvent.change(input, { target: { value: 'pulsante' } });
    // Should show pulsante experiments, not LED base
    expect(screen.queryByText(/Accendi il tuo primo LED/i)).toBeNull();
  });

  it('calls onSelect and onClose when experiment card is clicked', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const firstCard = screen.getByText(/Accendi il tuo primo LED/i).closest('button');
    fireEvent.click(firstCard);
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'v1-cap6-esp1' }));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('shows completion count', () => {
    render(
      <ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} completedIds={['v1-cap6-esp1']} />
    );
    expect(screen.getByText(/1\/38 completati/)).toBeTruthy();
  });

  it('has accessible dialog role and label', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Scegli un esperimento');
  });
});
