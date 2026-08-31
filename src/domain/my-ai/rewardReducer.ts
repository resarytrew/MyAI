import type {
  Capability,
  CapabilityId,
  CapabilityStatus,
  Discovery,
  MyAIData,
} from './capabilityTypes';

export type MyAIReward =
  | { type: 'discover-capability'; capabilityId: CapabilityId }
  | { type: 'start-capability-experiment'; capabilityId: CapabilityId }
  | { type: 'install-capability'; capabilityId: CapabilityId }
  | { type: 'master-capability'; capabilityId: CapabilityId }
  | { type: 'add-discovery'; discovery: Omit<Discovery, 'discoveredAt'> };

export class CapabilityTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CapabilityTransitionError';
  }
}

const statusRank: Record<CapabilityStatus, number> = {
  locked: 0,
  discovered: 1,
  experimenting: 2,
  installed: 3,
  mastered: 4,
};

function prerequisitesMet(
  state: MyAIData,
  capability: Capability,
): boolean {
  return capability.prerequisites.every((id) => {
    const status = state.capabilities[id].status;
    return status === 'installed' || status === 'mastered';
  });
}

function withCapability(
  state: MyAIData,
  id: CapabilityId,
  nextStatus: CapabilityStatus,
  now: number,
): MyAIData {
  const current = state.capabilities[id];

  if (statusRank[current.status] >= statusRank[nextStatus]) return state;

  if (!prerequisitesMet(state, current)) {
    throw new CapabilityTransitionError(
      `Prerequisites are not installed for capability "${id}".`,
    );
  }

  if (nextStatus === 'installed' && current.status === 'locked') {
    throw new CapabilityTransitionError(
      `Capability "${id}" must be discovered before installation.`,
    );
  }

  if (nextStatus === 'mastered' && current.status !== 'installed') {
    throw new CapabilityTransitionError(
      `Capability "${id}" must be installed before mastery.`,
    );
  }

  const nextCapability: Capability = {
    ...current,
    status: nextStatus,
    ...(nextStatus === 'discovered' ? { discoveredAt: now } : {}),
    ...(nextStatus === 'installed' ? { installedAt: now } : {}),
  };

  return {
    ...state,
    capabilities: {
      ...state.capabilities,
      [id]: nextCapability,
    },
  };
}

export function applyMyAIReward(
  state: MyAIData,
  reward: MyAIReward,
  now = Date.now(),
): MyAIData {
  switch (reward.type) {
    case 'discover-capability':
      return withCapability(state, reward.capabilityId, 'discovered', now);
    case 'start-capability-experiment':
      return withCapability(state, reward.capabilityId, 'experimenting', now);
    case 'install-capability':
      return withCapability(state, reward.capabilityId, 'installed', now);
    case 'master-capability':
      return withCapability(state, reward.capabilityId, 'mastered', now);
    case 'add-discovery': {
      if (state.discoveries.some(({ id }) => id === reward.discovery.id)) {
        return state;
      }
      return {
        ...state,
        discoveries: [
          ...state.discoveries,
          { ...reward.discovery, discoveredAt: now },
        ],
      };
    }
  }
}
