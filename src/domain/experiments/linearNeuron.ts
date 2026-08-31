export interface LinearNeuronInput {
  x: number;
  weight: number;
  bias: number;
  target?: number;
}

export interface LinearNeuronResult {
  output: number;
  target?: number;
  error?: number;
  loss?: number;
}

export function computeLinearNeuron(
  input: LinearNeuronInput,
): LinearNeuronResult {
  const output = input.x * input.weight + input.bias;

  if (input.target === undefined) {
    return { output };
  }

  const error = output - input.target;
  const loss = error ** 2;

  return {
    output,
    target: input.target,
    error,
    loss,
  };
}
