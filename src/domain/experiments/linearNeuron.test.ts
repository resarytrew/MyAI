import { describe, expect, it } from 'vitest';
import { computeLinearNeuron } from './linearNeuron';

describe('computeLinearNeuron', () => {
  it('calibrates weight to reach the target', () => {
    expect(computeLinearNeuron({ x: 2, weight: 2.5, bias: 0 })).toEqual({
      output: 5,
    });
  });

  it('uses bias after the weighted input', () => {
    expect(computeLinearNeuron({ x: 2, weight: 2, bias: 1 })).toEqual({
      output: 5,
    });
  });

  it('returns error and squared loss when a target is present', () => {
    expect(
      computeLinearNeuron({ x: 2, weight: 1.5, bias: 0, target: 5 }),
    ).toEqual({ output: 3, target: 5, error: -2, loss: 4 });
  });
});
