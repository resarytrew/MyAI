import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../../i18n/I18nProvider';
import { BiasCalibrationView } from './BiasCalibrationView';
import { GradientStepView } from './GradientStepView';
import { LinearNeuronView } from './LinearNeuronView';
import { LossView } from './LossView';

function withI18n(node: React.ReactNode) {
  return render(<I18nProvider>{node}</I18nProvider>);
}

describe('experiment views', () => {
  it('shows weight-calibrated output', () => {
    withI18n(<LinearNeuronView x={2} weight={2.5} bias={0} target={5} />);
    expect(screen.getByText('y = 5.0')).toBeInTheDocument();
  });

  it('shows all bias samples matched at bias one', () => {
    withI18n(<BiasCalibrationView bias={1} onBiasChange={vi.fn()} />);
    expect(screen.getAllByText('✓')).toHaveLength(3);
  });

  it('shows the known error and loss', () => {
    withI18n(<LossView />);
    expect(screen.getByText(/error = 3 - 5 =/)).toHaveTextContent('-2');
    expect(screen.getByText(/loss = error² =/)).toHaveTextContent('4');
  });

  it('performs one explicit learning step and reports lower loss', () => {
    const onStep = vi.fn();
    withI18n(<GradientStepView onStep={onStep} />);
    fireEvent.click(screen.getByRole('button', { name: /Run learning step/i }));
    expect(onStep).toHaveBeenCalledWith({
      beforeLoss: 4,
      afterLoss: 1,
      weight: 1.9,
      bias: 0.2,
    });
  });
});
