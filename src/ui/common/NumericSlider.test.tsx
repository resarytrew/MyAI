import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NumericSlider } from './NumericSlider';

describe('NumericSlider', () => {
  it('is labelled and reports numeric changes', () => {
    const onChange = vi.fn();
    render(
      <NumericSlider
        label="Вес"
        value={1.5}
        min={0}
        max={4}
        step={0.1}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole('slider', { name: 'Вес' }), {
      target: { value: '2.5' },
    });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });
});
