export type EntityStatus = 'locked' | 'discovered' | 'experimenting' | 'installed' | 'mastered';
export type CapabilityStatus = EntityStatus;

export type CoreId =
  | 'input'
  | 'decision'
  | 'learning'
  | 'neural'
  | 'language'
  | 'context'
  | 'transformer'
  | 'language-model';

export type ModuleId =
  | 'data-interface'
  | 'feature-system'
  | 'representation-layer'
  | 'rule-engine'
  | 'parameter-unit'
  | 'prediction-head'
  | 'loss-analyzer'
  | 'gradient-engine'
  | 'optimizer'
  | 'neuron'
  | 'activation'
  | 'layer-stack'
  | 'backpropagation'
  | 'tokenizer'
  | 'vocabulary'
  | 'embedding-space'
  | 'position-encoder'
  | 'attention-module'
  | 'multi-head-attention'
  | 'rmsnorm'
  | 'residual-stream'
  | 'swiglu'
  | 'transformer-blocks'
  | 'causal-mask'
  | 'lm-head'
  | 'sampling-engine';

export type CapabilityId =
  | 'receive-data'
  | 'represent-objects'
  | 'make-predictions'
  | 'measure-error'
  | 'learn-from-examples'
  | 'solve-nonlinear-problems'
  | 'process-language'
  | 'represent-meaning'
  | 'use-context'
  | 'assemble-transformer'
  | 'predict-next-token'
  | 'train-language-model'
  | 'generate-language';

export interface ModuleDefinition {
  id: ModuleId;
  coreId: CoreId;
  label: string;
  build: string;
  prerequisiteIds: ModuleId[];
}

export interface ModuleState extends ModuleDefinition {
  status: EntityStatus;
  discoveredAt?: number;
  installedAt?: number;
}

export interface CoreState {
  id: CoreId;
  label: string;
  moduleIds: ModuleId[];
  validatedAt?: number;
}

export interface Capability {
  id: CapabilityId;
  label: string;
  status: EntityStatus;
  unlockedBy: ModuleId;
  unlockedAt?: number;
}

export interface Discovery {
  id: string;
  sceneId: string;
  discoveredAt: number;
}

export interface BuildRecord {
  build: string;
  moduleId: ModuleId;
  installedAt: number;
}

export interface CertificationRecord {
  coreId: CoreId;
  certifiedAt: number;
}

export interface MyAIData {
  cores: Record<CoreId, CoreState>;
  modules: Record<ModuleId, ModuleState>;
  capabilities: Record<CapabilityId, Capability>;
  discoveries: Discovery[];
  buildHistory: BuildRecord[];
  certifications: CertificationRecord[];
}
