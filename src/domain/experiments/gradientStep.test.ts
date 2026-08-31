import { describe, expect, it } from 'vitest';
import { computeLinearNeuron } from './linearNeuron';
import { applyGradientStep, computeLinearGradients } from './gradientStep';

describe('one explicit gradient step', () => {
  it('reduces known loss from 4 to 1', () => {
    const gradient = computeLinearGradients({
      x: 2,
      weight: 1.5,
      bias: 0,
      target: 5,
    });

    expect(gradient).toEqual({
      prediction: 3,
      error: -2,
      loss: 4,
      dLossDWeight: -8,
      dLossDBias: -4,
    });

    const updated = applyGradientStep(
      1.5,
      0,
      gradient.dLossDWeight,
      gradient.dLossDBias,
      0.05,
    );

    expect(updated.weight).toBeCloseTo(1.9);
    expect(updated.bias).toBeCloseTo(0.2);
    expect(
      computeLinearNeuron({
        x: 2,
        weight: updated.weight,
        bias: updated.bias,
        target: 5,
      }),
    ).toMatchObject({ output: 4, loss: 1 });
  });
});
