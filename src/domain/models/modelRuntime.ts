export interface ModelConfig {
  tokenizer: 'character' | 'bpe';
  contextLength: number;
  dModel: number;
  heads: number;
  layers: number;
  ffnMultiplier: number;
  learningRate: number;
  seed: number;
}

export interface Dataset {
  id: string;
  name: string;
  text: string;
}

export interface TrainingMetrics {
  step: number;
  loss: number;
  tokensPerSecond: number;
  memoryBytes: number;
  sample: string;
}

export interface ModelEstimate {
  parameters: number;
  memoryBytes: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  config: ModelConfig;
  vocabulary: string[];
  step: number;
  loss: number;
  weights: Record<string, number[]>;
  createdAt: number;
}

export interface TinyModel {
  config: ModelConfig;
  vocabulary: string[];
  tokenToId: Map<string, number>;
  weights: Record<string, Float32Array>;
  step: number;
  loss: number;
}

export interface ModelRuntime {
  build(config: ModelConfig, data: Dataset): Promise<TinyModel>;
  train(model: TinyModel, data: Dataset, steps: number, onMetrics?: (metrics: TrainingMetrics) => void, signal?: AbortSignal): Promise<TinyModel>;
  generate(model: TinyModel, prompt: string, maxTokens: number, temperature?: number): Promise<string>;
  saveCheckpoint(model: TinyModel, name: string): Promise<Checkpoint>;
  loadCheckpoint(checkpoint: Checkpoint): Promise<TinyModel>;
  estimate(config: ModelConfig, vocabularySize: number): ModelEstimate;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  tokenizer: 'bpe',
  contextLength: 64,
  dModel: 64,
  heads: 4,
  layers: 2,
  ffnMultiplier: 4,
  learningRate: 0.018,
  seed: 707,
};

export const TINY_STORY_DATASET: Dataset = {
  id: 'tiny-story-v1',
  name: 'Tiny station stories',
  text: 'the researcher entered the quiet station. the machine learned from data. the model found a pattern. the researcher changed the weights. the loss became smaller. the small machine generated a new sentence. ',
};
