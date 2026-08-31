import type { Capability, CapabilityId } from './capabilityTypes';

export const CAPABILITY_ORDER: CapabilityId[] = [
  'data',
  'features',
  'parameters',
  'neural-net',
  'learning',
  'text',
  'context',
  'transformer',
  'language-model',
];

const prerequisites: Record<CapabilityId, CapabilityId[]> = {
  data: [],
  features: ['data'],
  parameters: ['features'],
  'neural-net': ['parameters'],
  learning: ['neural-net'],
  text: ['learning'],
  context: ['text'],
  transformer: ['context'],
  'language-model': ['transformer'],
};

const labels: Record<CapabilityId, string> = {
  data: 'DATA',
  features: 'FEATURES',
  parameters: 'PARAMETERS',
  'neural-net': 'NEURAL NET',
  learning: 'LEARNING',
  text: 'TEXT',
  context: 'CONTEXT',
  transformer: 'TRANSFORMER',
  'language-model': 'LANGUAGE MODEL',
};

function createCapability(id: CapabilityId): Capability {
  return {
    id,
    label: labels[id],
    status: 'locked',
    prerequisites: [...prerequisites[id]],
  };
}

export function createInitialCapabilities(): Record<CapabilityId, Capability> {
  return Object.fromEntries(
    CAPABILITY_ORDER.map((id) => [id, createCapability(id)]),
  ) as Record<CapabilityId, Capability>;
}

export function createInitialMyAIData() {
  return {
    capabilities: createInitialCapabilities(),
    discoveries: [],
  };
}
