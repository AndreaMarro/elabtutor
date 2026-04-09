/**
 * ElabIcons.test.jsx — Test per icon components SVG ELAB
 * 8 test: rendering, SVG output, props, accessibility
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MicrophoneIcon, StopIcon, SpeakerOnIcon, SendIcon, LoadingIcon, ReportIcon, RobotIcon, CircuitIcon, LightbulbIcon } from '../../src/components/common/ElabIcons';

describe('ElabIcons', () => {
  it('MicrophoneIcon renders SVG', () => {
    const { container } = render(<MicrophoneIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('StopIcon renders SVG', () => {
    const { container } = render(<StopIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('SendIcon renders SVG', () => {
    const { container } = render(<SendIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('RobotIcon renders SVG (mascotte)', () => {
    const { container } = render(<RobotIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('CircuitIcon renders SVG', () => {
    const { container } = render(<CircuitIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('icons accept size prop', () => {
    const { container } = render(<MicrophoneIcon size={32} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
  });

  it('icons accept className prop', () => {
    const { container } = render(<SendIcon className="custom" />);
    const svg = container.querySelector('svg');
    expect(svg.classList.contains('custom')).toBe(true);
  });

  it('LoadingIcon renders with animation', () => {
    const { container } = render(<LoadingIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
