import { createTokenizer } from './tokenizer';
import type {
  Checkpoint,
  Dataset,
  ModelConfig,
  ModelEstimate,
  ModelRuntime,
  TinyModel,
  TrainingMetrics,
} from './modelRuntime';

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function randomMatrix(size: number, random: () => number, scale: number): Float32Array {
  const values = new Float32Array(size);
  for (let index = 0; index < size; index += 1) values[index] = (random() * 2 - 1) * scale;
  return values;
}

function matVec(vector: Float32Array, matrix: Float32Array, outputSize: number): Float32Array {
  const output = new Float32Array(outputSize);
  for (let row = 0; row < vector.length; row += 1) {
    const value = vector[row]!;
    const offset = row * outputSize;
    for (let column = 0; column < outputSize; column += 1) output[column] += value * matrix[offset + column]!;
  }
  return output;
}

function rmsNorm(vector: Float32Array, scale: Float32Array): Float32Array {
  let sumSquares = 0;
  for (const value of vector) sumSquares += value * value;
  const inverse = 1 / Math.sqrt(sumSquares / vector.length + 1e-5);
  return Float32Array.from(vector, (value, index) => value * inverse * scale[index]!);
}

function softmax(values: Float32Array, temperature = 1): Float32Array {
  const safeTemperature = Math.max(0.05, temperature);
  let max = Number.NEGATIVE_INFINITY;
  for (const value of values) max = Math.max(max, value / safeTemperature);
  const result = new Float32Array(values.length);
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) {
    result[index] = Math.exp(values[index]! / safeTemperature - max);
    sum += result[index]!;
  }
  for (let index = 0; index < result.length; index += 1) result[index] /= sum || 1;
  return result;
}

function add(left: Float32Array, right: Float32Array): Float32Array {
  return Float32Array.from(left, (value, index) => value + right[index]!);
}

function positionalVector(position: number, size: number): Float32Array {
  const vector = new Float32Array(size);
  for (let index = 0; index < size; index += 2) {
    const angle = position / 10_000 ** (index / size);
    vector[index] = Math.sin(angle);
    if (index + 1 < size) vector[index + 1] = Math.cos(angle);
  }
  return vector;
}

function forward(model: TinyModel, inputIds: readonly number[]): { hidden: Float32Array; logits: Float32Array; probabilities: Float32Array } {
  const { dModel, heads, layers, ffnMultiplier, contextLength } = model.config;
  const ids = inputIds.slice(-contextLength);
  const sequence = ids.length ? ids : [0];
  let states = sequence.map((id, position) => {
    const embedding = model.weights.embedding!.slice(id * dModel, (id + 1) * dModel);
    return add(embedding, positionalVector(position, dModel));
  });
  const headSize = dModel / heads;

  for (let layer = 0; layer < layers; layer += 1) {
    const normed = states.map((state) => rmsNorm(state, model.weights[`l${layer}.norm1`]!));
    const queries = normed.map((state) => matVec(state, model.weights[`l${layer}.wq`]!, dModel));
    const keys = normed.map((state) => matVec(state, model.weights[`l${layer}.wk`]!, dModel));
    const values = normed.map((state) => matVec(state, model.weights[`l${layer}.wv`]!, dModel));
    const attended = states.map((_state, position) => {
      const combined = new Float32Array(dModel);
      for (let head = 0; head < heads; head += 1) {
        const scores = new Float32Array(position + 1);
        for (let source = 0; source <= position; source += 1) {
          let dot = 0;
          for (let dimension = 0; dimension < headSize; dimension += 1) {
            const offset = head * headSize + dimension;
            dot += queries[position]![offset]! * keys[source]![offset]!;
          }
          scores[source] = dot / Math.sqrt(headSize);
        }
        const weights = softmax(scores);
        for (let source = 0; source <= position; source += 1) {
          for (let dimension = 0; dimension < headSize; dimension += 1) {
            const offset = head * headSize + dimension;
            combined[offset] += weights[source]! * values[source]![offset]!;
          }
        }
      }
      return matVec(combined, model.weights[`l${layer}.wo`]!, dModel);
    });
    states = states.map((state, index) => add(state, attended[index]!));

    const ffnSize = dModel * ffnMultiplier;
    states = states.map((state) => {
      const normalized = rmsNorm(state, model.weights[`l${layer}.norm2`]!);
      const gate = matVec(normalized, model.weights[`l${layer}.wg`]!, ffnSize);
      const value = matVec(normalized, model.weights[`l${layer}.w1`]!, ffnSize);
      const activated = Float32Array.from(value, (item, index) => item * (gate[index]! / (1 + Math.exp(-gate[index]!))));
      return add(state, matVec(activated, model.weights[`l${layer}.w2`]!, dModel));
    });
  }

  const hidden = rmsNorm(states[states.length - 1]!, model.weights.finalNorm!);
  const logits = matVec(hidden, model.weights.lmHead!, model.vocabulary.length);
  for (let index = 0; index < logits.length; index += 1) logits[index] += model.weights.lmBias![index]!;
  return { hidden, logits, probabilities: softmax(logits) };
}

function trainStep(model: TinyModel, encoded: readonly number[]): number {
  const targetPosition = 1 + (model.step % Math.max(1, encoded.length - 1));
  const start = Math.max(0, targetPosition - model.config.contextLength);
  const input = encoded.slice(start, targetPosition);
  const target = encoded[targetPosition] ?? 0;
  const { hidden, probabilities } = forward(model, input);
  const loss = -Math.log(Math.max(1e-9, probabilities[target]!));
  const gradient = Float32Array.from(probabilities);
  gradient[target] -= 1;
  const { learningRate, dModel } = model.config;
  const vocabularySize = model.vocabulary.length;

  const hiddenGradient = new Float32Array(dModel);
  for (let dimension = 0; dimension < dModel; dimension += 1) {
    for (let token = 0; token < vocabularySize; token += 1) {
      const index = dimension * vocabularySize + token;
      hiddenGradient[dimension] += model.weights.lmHead![index]! * gradient[token]!;
      model.weights.lmHead![index] -= learningRate * hidden[dimension]! * gradient[token]!;
    }
  }
  for (let token = 0; token < vocabularySize; token += 1) model.weights.lmBias![token] -= learningRate * gradient[token]!;

  const lastInput = input[input.length - 1] ?? 0;
  for (let dimension = 0; dimension < dModel; dimension += 1) {
    model.weights.embedding![lastInput * dModel + dimension] -= learningRate * 0.08 * hiddenGradient[dimension]!;
  }
  model.step += 1;
  model.loss = loss;
  return loss;
}

export class TinyTransformerRuntime implements ModelRuntime {
  estimate(config: ModelConfig, vocabularySize: number): ModelEstimate {
    const ffn = config.dModel * config.ffnMultiplier;
    const embedding = vocabularySize * config.dModel;
    const perLayer = config.dModel * config.dModel * 4 + config.dModel * ffn * 3 + config.dModel * 2;
    const head = config.dModel * vocabularySize + vocabularySize + config.dModel;
    const parameters = embedding + perLayer * config.layers + head;
    return { parameters, memoryBytes: parameters * 4 };
  }

  async build(config: ModelConfig, data: Dataset): Promise<TinyModel> {
    if (config.dModel % config.heads !== 0) throw new Error('dModel must be divisible by heads.');
    const tokenizer = createTokenizer(data.text, config.tokenizer);
    const random = seededRandom(config.seed);
    const scale = 1 / Math.sqrt(config.dModel);
    const weights: Record<string, Float32Array> = {
      embedding: randomMatrix(tokenizer.vocabulary.length * config.dModel, random, scale),
      finalNorm: Float32Array.from({ length: config.dModel }, () => 1),
      lmHead: randomMatrix(config.dModel * tokenizer.vocabulary.length, random, scale),
      lmBias: new Float32Array(tokenizer.vocabulary.length),
    };
    for (let layer = 0; layer < config.layers; layer += 1) {
      const ffn = config.dModel * config.ffnMultiplier;
      weights[`l${layer}.norm1`] = Float32Array.from({ length: config.dModel }, () => 1);
      weights[`l${layer}.norm2`] = Float32Array.from({ length: config.dModel }, () => 1);
      for (const key of ['wq', 'wk', 'wv', 'wo']) weights[`l${layer}.${key}`] = randomMatrix(config.dModel * config.dModel, random, scale);
      weights[`l${layer}.w1`] = randomMatrix(config.dModel * ffn, random, scale);
      weights[`l${layer}.wg`] = randomMatrix(config.dModel * ffn, random, scale);
      weights[`l${layer}.w2`] = randomMatrix(ffn * config.dModel, random, 1 / Math.sqrt(ffn));
    }
    return { config: { ...config }, vocabulary: tokenizer.vocabulary, tokenToId: tokenizer.tokenToId, weights, step: 0, loss: Number.POSITIVE_INFINITY };
  }

  async train(model: TinyModel, data: Dataset, steps: number, onMetrics?: (metrics: TrainingMetrics) => void, signal?: AbortSignal): Promise<TinyModel> {
    const tokenizer = createTokenizer(data.text, model.config.tokenizer);
    const encoded = tokenizer.encode(data.text);
    const started = performance.now();
    let smoothedLoss = Number.NaN;
    for (let index = 0; index < steps; index += 1) {
      if (signal?.aborted) throw new DOMException('Training cancelled.', 'AbortError');
      const loss = trainStep(model, encoded);
      smoothedLoss = Number.isNaN(smoothedLoss) ? loss : smoothedLoss * 0.92 + loss * 0.08;
      if ((index + 1) % Math.max(1, Math.floor(steps / 8)) === 0 || index === steps - 1) {
        const elapsed = Math.max(1, performance.now() - started);
        const sample = await this.generate(model, 'the ', 28, 0.72);
        onMetrics?.({ step: model.step, loss: smoothedLoss, tokensPerSecond: (index + 1) * 1000 / elapsed, memoryBytes: this.estimate(model.config, model.vocabulary.length).memoryBytes, sample });
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }
    model.loss = smoothedLoss;
    return model;
  }

  async generate(model: TinyModel, prompt: string, maxTokens: number, temperature = 0.8): Promise<string> {
    const fallback = model.tokenToId.get(' ') ?? 0;
    const vocabularyByLength = [...model.vocabulary].sort((left, right) => right.length - left.length);
    const normalizedPrompt = prompt.toLowerCase();
    const ids: number[] = [];
    for (let cursor = 0; cursor < normalizedPrompt.length;) {
      const token = vocabularyByLength.find((candidate) => normalizedPrompt.startsWith(candidate, cursor));
      ids.push(token ? model.tokenToId.get(token) ?? fallback : fallback);
      cursor += token?.length ?? 1;
    }
    const random = seededRandom(model.config.seed + model.step + ids.length);
    for (let step = 0; step < maxTokens; step += 1) {
      const { logits } = forward(model, ids);
      const distribution = softmax(logits, temperature);
      let cursor = random();
      let selected = distribution.length - 1;
      for (let index = 0; index < distribution.length; index += 1) {
        cursor -= distribution[index]!;
        if (cursor <= 0) { selected = index; break; }
      }
      ids.push(selected);
    }
    return ids.map((id) => model.vocabulary[id] ?? '').join('');
  }

  async saveCheckpoint(model: TinyModel, name: string): Promise<Checkpoint> {
    return {
      id: `${name}-${model.step}-${Date.now()}`,
      name,
      config: { ...model.config },
      vocabulary: [...model.vocabulary],
      step: model.step,
      loss: model.loss,
      weights: Object.fromEntries(Object.entries(model.weights).map(([key, values]) => [key, Array.from(values)])),
      createdAt: Date.now(),
    };
  }

  async loadCheckpoint(checkpoint: Checkpoint): Promise<TinyModel> {
    return {
      config: { ...checkpoint.config },
      vocabulary: [...checkpoint.vocabulary],
      tokenToId: new Map(checkpoint.vocabulary.map((token, index) => [token, index])),
      weights: Object.fromEntries(Object.entries(checkpoint.weights).map(([key, values]) => [key, Float32Array.from(values)])),
      step: checkpoint.step,
      loss: checkpoint.loss,
    };
  }
}

export const tinyTransformerRuntime = new TinyTransformerRuntime();
