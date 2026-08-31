export interface LinearGradientInput {
  x: number;
  weight: number;
  bias: number;
  target: number;
}

export interface LinearGradientResult {
  prediction: number;
  error: number;
  loss: number;
  dLossDWeight: number;
  dLossDBias: number;
}

export interface GradientStepResult {
  weight: number;
  bias: number;
}

export function computeLinearGradients(
  input: LinearGradientInput,
): LinearGradientResult {
  const prediction = input.x * input.weight + input.bias;
  const error = prediction - input.target;
  const loss = error ** 2;

  return {
    prediction,
    error,
    loss,
    dLossDWeight: 2 * error * input.x,
    dLossDBias: 2 * error,
  };
}

export function applyGradientStep(
  weight: number,
  bias: number,
  dLossDWeight: number,
  dLossDBias: number,
  learningRate: number,
): GradientStepResult {
  return {
    weight: weight - learningRate * dLossDWeight,
    bias: bias - learningRate * dLossDBias,
  };
}
