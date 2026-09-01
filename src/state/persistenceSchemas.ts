import { CAMPAIGN_SCENE_ORDER } from '../domain/journey/campaignJourney';
import { CAPABILITY_ORDER, CORE_ORDER, MODULE_ORDER, createInitialMyAIData } from '../domain/my-ai/capabilityCatalog';
import { applyMyAIReward } from '../domain/my-ai/rewardReducer';
import type { CapabilityStatus, MyAIData } from '../domain/my-ai/capabilityTypes';

const sceneIds = new Set<string>(CAMPAIGN_SCENE_ORDER);
const statuses = new Set<CapabilityStatus>(['locked', 'discovered', 'experimenting', 'installed', 'mastered']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPersistedJourneyState(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value.currentSceneId !== 'string' || !sceneIds.has(value.currentSceneId)) return false;
  if (!Array.isArray(value.completedSceneIds) || !value.completedSceneIds.every((id) => typeof id === 'string' && sceneIds.has(id))) return false;
  if (!isRecord(value.answers)) return false;
  if (value.startedAt !== undefined && typeof value.startedAt !== 'number') return false;
  if (value.completedAt !== undefined && typeof value.completedAt !== 'number') return false;
  return true;
}

export function migratePersistedJourneyState(value: unknown): unknown | null {
  return isPersistedJourneyState(value) ? value : null;
}

export function isPersistedMyAIState(value: unknown): value is MyAIData {
  if (!isRecord(value) || !isRecord(value.cores) || !isRecord(value.modules) || !isRecord(value.capabilities)) return false;
  if (!Array.isArray(value.discoveries) || !Array.isArray(value.buildHistory) || !Array.isArray(value.certifications)) return false;

  for (const id of CORE_ORDER) {
    const core = value.cores[id];
    if (!isRecord(core) || core.id !== id || !Array.isArray(core.moduleIds)) return false;
  }
  for (const id of MODULE_ORDER) {
    const module = value.modules[id];
    if (!isRecord(module) || module.id !== id || typeof module.status !== 'string' || !statuses.has(module.status as CapabilityStatus)) return false;
  }
  for (const id of CAPABILITY_ORDER) {
    const capability = value.capabilities[id];
    if (!isRecord(capability) || capability.id !== id || typeof capability.status !== 'string' || !statuses.has(capability.status as CapabilityStatus)) return false;
  }
  return true;
}

const legacyCapabilityToModules = {
  data: ['data-interface'],
  features: ['feature-system', 'representation-layer'],
  parameters: ['rule-engine', 'parameter-unit', 'prediction-head'],
  'neural-net': ['neuron', 'activation', 'layer-stack', 'backpropagation'],
  learning: ['loss-analyzer', 'gradient-engine', 'optimizer'],
  text: ['tokenizer', 'vocabulary', 'embedding-space'],
  context: ['position-encoder', 'attention-module', 'multi-head-attention'],
  transformer: ['rmsnorm', 'residual-stream', 'swiglu', 'transformer-blocks'],
  'language-model': ['causal-mask', 'lm-head', 'sampling-engine'],
} as const;

export function migratePersistedMyAIState(value: unknown, fromVersion: number): MyAIData | null {
  if (isPersistedMyAIState(value)) return value;
  if (fromVersion !== 2 || !isRecord(value) || !isRecord(value.capabilities) || !Array.isArray(value.discoveries)) return null;

  let migrated = createInitialMyAIData();
  let timestamp = Date.now() - 1000;
  for (const [legacyId, moduleIds] of Object.entries(legacyCapabilityToModules)) {
    const legacy = value.capabilities[legacyId];
    if (!isRecord(legacy) || typeof legacy.status !== 'string') continue;
    if (!['discovered', 'experimenting', 'installed', 'mastered'].includes(legacy.status)) continue;
    for (const moduleId of moduleIds) {
      migrated = applyMyAIReward(migrated, { type: 'discover-module', moduleId }, ++timestamp);
      if (legacy.status === 'experimenting') migrated = applyMyAIReward(migrated, { type: 'start-module-experiment', moduleId }, ++timestamp);
      if (legacy.status === 'installed' || legacy.status === 'mastered') migrated = applyMyAIReward(migrated, { type: 'install-module', moduleId }, ++timestamp);
      if (legacy.status === 'mastered') migrated = applyMyAIReward(migrated, { type: 'master-module', moduleId }, ++timestamp);
    }
  }

  migrated.discoveries = value.discoveries.filter(isRecord).flatMap((discovery) => {
    if (typeof discovery.id !== 'string' || typeof discovery.sceneId !== 'string') return [];
    return [{ id: discovery.id, sceneId: discovery.sceneId, discoveredAt: typeof discovery.discoveredAt === 'number' ? discovery.discoveredAt : Date.now() }];
  });
  return migrated;
}
