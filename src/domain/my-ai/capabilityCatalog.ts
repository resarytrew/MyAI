import type {
  Capability,
  CapabilityId,
  CoreId,
  CoreState,
  ModuleDefinition,
  ModuleId,
  ModuleState,
  MyAIData,
} from './capabilityTypes';

export const CORE_ORDER: CoreId[] = [
  'input', 'decision', 'learning', 'neural', 'language', 'context', 'transformer', 'language-model',
];

const coreLabels: Record<CoreId, string> = {
  input: 'INPUT CORE',
  decision: 'DECISION CORE',
  learning: 'LEARNING CORE',
  neural: 'NEURAL CORE',
  language: 'LANGUAGE CORE',
  context: 'CONTEXT CORE',
  transformer: 'TRANSFORMER',
  'language-model': 'LANGUAGE MODEL',
};

const module = (
  id: ModuleId,
  coreId: CoreId,
  label: string,
  build: string,
  prerequisiteIds: ModuleId[] = [],
): ModuleDefinition => ({ id, coreId, label, build, prerequisiteIds });

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  module('data-interface', 'input', 'Data Interface', '0.1'),
  module('feature-system', 'input', 'Feature System', '0.2', ['data-interface']),
  module('representation-layer', 'input', 'Representation Layer', '0.3', ['feature-system']),
  module('rule-engine', 'decision', 'Rule Engine', '0.4', ['representation-layer']),
  module('parameter-unit', 'decision', 'Parameter Unit', '0.4', ['rule-engine']),
  module('prediction-head', 'decision', 'Prediction Head', '0.4', ['parameter-unit']),
  module('loss-analyzer', 'learning', 'Loss Analyzer', '0.5', ['prediction-head']),
  module('gradient-engine', 'learning', 'Gradient Engine', '0.5', ['loss-analyzer']),
  module('optimizer', 'learning', 'Optimizer', '0.5', ['gradient-engine']),
  module('neuron', 'neural', 'Neuron', '0.6', ['optimizer']),
  module('activation', 'neural', 'Activation', '0.6', ['neuron']),
  module('layer-stack', 'neural', 'Layer Stack', '0.6', ['activation']),
  module('backpropagation', 'neural', 'Backpropagation', '0.6', ['layer-stack']),
  module('tokenizer', 'language', 'Tokenizer', '0.7', ['backpropagation']),
  module('vocabulary', 'language', 'Vocabulary', '0.7', ['tokenizer']),
  module('embedding-space', 'language', 'Embedding Space', '0.7', ['vocabulary']),
  module('position-encoder', 'context', 'Position Encoder', '0.8', ['embedding-space']),
  module('attention-module', 'context', 'Attention Module', '0.8', ['position-encoder']),
  module('multi-head-attention', 'context', 'Multi-Head Attention', '0.8', ['attention-module']),
  module('rmsnorm', 'transformer', 'RMSNorm', '0.9', ['multi-head-attention']),
  module('residual-stream', 'transformer', 'Residual Stream', '0.9', ['rmsnorm']),
  module('swiglu', 'transformer', 'SwiGLU', '0.9', ['residual-stream']),
  module('transformer-blocks', 'transformer', 'Transformer Blocks', '0.9', ['swiglu']),
  module('causal-mask', 'language-model', 'Causal Mask', '1.0', ['transformer-blocks']),
  module('lm-head', 'language-model', 'LM Head', '1.0', ['causal-mask']),
  module('sampling-engine', 'language-model', 'Sampling Engine', '1.0', ['lm-head']),
];

export const MODULE_ORDER = MODULE_DEFINITIONS.map(({ id }) => id);

const capabilityDefinitions: Array<Omit<Capability, 'status'>> = [
  { id: 'receive-data', label: 'can receive information', unlockedBy: 'data-interface' },
  { id: 'represent-objects', label: 'can represent an object', unlockedBy: 'representation-layer' },
  { id: 'make-predictions', label: 'can make a prediction', unlockedBy: 'prediction-head' },
  { id: 'measure-error', label: 'can measure prediction error', unlockedBy: 'loss-analyzer' },
  { id: 'learn-from-examples', label: 'can learn from examples', unlockedBy: 'optimizer' },
  { id: 'solve-nonlinear-problems', label: 'can solve nonlinear problems', unlockedBy: 'backpropagation' },
  { id: 'process-language', label: 'can process language', unlockedBy: 'tokenizer' },
  { id: 'represent-meaning', label: 'can represent meaning', unlockedBy: 'embedding-space' },
  { id: 'use-context', label: 'can use contextual relations', unlockedBy: 'multi-head-attention' },
  { id: 'assemble-transformer', label: 'can transform contextual states', unlockedBy: 'transformer-blocks' },
  { id: 'predict-next-token', label: 'can predict the next token', unlockedBy: 'lm-head' },
  { id: 'train-language-model', label: 'can improve from text', unlockedBy: 'lm-head' },
  { id: 'generate-language', label: 'can generate language', unlockedBy: 'sampling-engine' },
];

export const CAPABILITY_ORDER = capabilityDefinitions.map(({ id }) => id);

export function createInitialModules(): Record<ModuleId, ModuleState> {
  return Object.fromEntries(MODULE_DEFINITIONS.map((definition) => [
    definition.id,
    { ...definition, prerequisiteIds: [...definition.prerequisiteIds], status: 'locked' },
  ])) as Record<ModuleId, ModuleState>;
}

export function createInitialCores(): Record<CoreId, CoreState> {
  return Object.fromEntries(CORE_ORDER.map((id) => [id, {
    id,
    label: coreLabels[id],
    moduleIds: MODULE_DEFINITIONS.filter(({ coreId }) => coreId === id).map(({ id: moduleId }) => moduleId),
  }])) as Record<CoreId, CoreState>;
}

export function createInitialCapabilities(): Record<CapabilityId, Capability> {
  return Object.fromEntries(capabilityDefinitions.map((definition) => [
    definition.id,
    { ...definition, status: 'locked' },
  ])) as Record<CapabilityId, Capability>;
}

export function createInitialMyAIData(): MyAIData {
  return {
    cores: createInitialCores(),
    modules: createInitialModules(),
    capabilities: createInitialCapabilities(),
    discoveries: [],
    buildHistory: [],
    certifications: [],
  };
}
