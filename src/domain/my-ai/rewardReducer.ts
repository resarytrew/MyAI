import type {
  CapabilityId,
  CoreId,
  Discovery,
  EntityStatus,
  ModuleId,
  MyAIData,
} from './capabilityTypes';

export type MyAIReward =
  | { type: 'discover-module'; moduleId: ModuleId }
  | { type: 'start-module-experiment'; moduleId: ModuleId }
  | { type: 'install-module'; moduleId: ModuleId }
  | { type: 'master-module'; moduleId: ModuleId }
  | { type: 'unlock-capability'; capabilityId: CapabilityId }
  | { type: 'certify-core'; coreId: CoreId }
  | { type: 'add-discovery'; discovery: Omit<Discovery, 'discoveredAt'> };

export class CapabilityTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CapabilityTransitionError';
  }
}

const statusRank: Record<EntityStatus, number> = {
  locked: 0,
  discovered: 1,
  experimenting: 2,
  installed: 3,
  mastered: 4,
};

function prerequisitesMet(state: MyAIData, id: ModuleId): boolean {
  return state.modules[id].prerequisiteIds.every((prerequisiteId) => {
    const status = state.modules[prerequisiteId].status;
    return status === 'installed' || status === 'mastered';
  });
}

function withModule(
  state: MyAIData,
  id: ModuleId,
  nextStatus: EntityStatus,
  now: number,
): MyAIData {
  const current = state.modules[id];
  if (statusRank[current.status] >= statusRank[nextStatus]) return state;
  if (nextStatus !== 'discovered' && !prerequisitesMet(state, id)) {
    throw new CapabilityTransitionError(`Prerequisites are not installed for module "${id}".`);
  }
  if (nextStatus === 'installed' && current.status === 'locked') {
    throw new CapabilityTransitionError(`Module "${id}" must be discovered before installation.`);
  }
  if (nextStatus === 'mastered' && current.status !== 'installed') {
    throw new CapabilityTransitionError(`Module "${id}" must be installed before mastery.`);
  }

  const nextModule = {
    ...current,
    status: nextStatus,
    ...(nextStatus === 'discovered' ? { discoveredAt: now } : {}),
    ...(nextStatus === 'installed' ? { installedAt: now } : {}),
  };

  const autoCapabilities = Object.fromEntries(
    Object.entries(state.capabilities).map(([capabilityId, capability]) => {
      if (capability.unlockedBy !== id || nextStatus !== 'installed') return [capabilityId, capability];
      return [capabilityId, { ...capability, status: 'installed' as const, unlockedAt: now }];
    }),
  ) as MyAIData['capabilities'];

  return {
    ...state,
    modules: { ...state.modules, [id]: nextModule },
    capabilities: autoCapabilities,
    buildHistory: nextStatus === 'installed'
      ? [...state.buildHistory, { build: current.build, moduleId: id, installedAt: now }]
      : state.buildHistory,
  };
}

export function applyMyAIReward(state: MyAIData, reward: MyAIReward, now = Date.now()): MyAIData {
  switch (reward.type) {
    case 'discover-module':
      return withModule(state, reward.moduleId, 'discovered', now);
    case 'start-module-experiment':
      return withModule(state, reward.moduleId, 'experimenting', now);
    case 'install-module':
      return withModule(state, reward.moduleId, 'installed', now);
    case 'master-module':
      return withModule(state, reward.moduleId, 'mastered', now);
    case 'unlock-capability': {
      const capability = state.capabilities[reward.capabilityId];
      if (statusRank[capability.status] >= statusRank.installed) return state;
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          [reward.capabilityId]: { ...capability, status: 'installed', unlockedAt: now },
        },
      };
    }
    case 'certify-core':
      if (state.certifications.some(({ coreId }) => coreId === reward.coreId)) return state;
      if (!state.cores[reward.coreId].moduleIds.every((id) => statusRank[state.modules[id].status] >= statusRank.installed)) {
        throw new CapabilityTransitionError(`Core "${reward.coreId}" cannot be certified before all modules are installed.`);
      }
      return {
        ...state,
        cores: {
          ...state.cores,
          [reward.coreId]: { ...state.cores[reward.coreId], validatedAt: now },
        },
        certifications: [...state.certifications, { coreId: reward.coreId, certifiedAt: now }],
      };
    case 'add-discovery':
      if (state.discoveries.some(({ id }) => id === reward.discovery.id)) return state;
      return {
        ...state,
        discoveries: [...state.discoveries, { ...reward.discovery, discoveredAt: now }],
      };
  }
}
