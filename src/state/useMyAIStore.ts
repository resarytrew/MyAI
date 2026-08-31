import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialMyAIData } from '../domain/my-ai/capabilityCatalog';
import {
  applyMyAIReward,
  type MyAIReward,
} from '../domain/my-ai/rewardReducer';
import type {
  CapabilityId,
  MyAIData,
} from '../domain/my-ai/capabilityTypes';
import { createVersionedStorage } from './persistence';
import { isPersistedMyAIState } from './persistenceSchemas';

export interface MyAIState extends MyAIData {
  discoverCapability: (id: CapabilityId) => void;
  startExperiment: (id: CapabilityId) => void;
  installCapability: (id: CapabilityId) => void;
  masterCapability: (id: CapabilityId) => void;
  applyReward: (reward: MyAIReward) => void;
  resetMyAI: () => void;
}

const initialMyAI = createInitialMyAIData();

export const useMyAIStore = create<MyAIState>()(
  persist(
    (set) => ({
      ...initialMyAI,
      applyReward: (reward) => set((state) => applyMyAIReward(state, reward)),
      discoverCapability: (capabilityId) =>
        set((state) =>
          applyMyAIReward(state, { type: 'discover-capability', capabilityId }),
        ),
      startExperiment: (capabilityId) =>
        set((state) =>
          applyMyAIReward(state, {
            type: 'start-capability-experiment',
            capabilityId,
          }),
        ),
      installCapability: (capabilityId) =>
        set((state) =>
          applyMyAIReward(state, { type: 'install-capability', capabilityId }),
        ),
      masterCapability: (capabilityId) =>
        set((state) =>
          applyMyAIReward(state, { type: 'master-capability', capabilityId }),
        ),
      resetMyAI: () => set(createInitialMyAIData()),
    }),
    {
      name: 'ai-lab-my-ai',
      storage: createVersionedStorage('ai-lab-my-ai', isPersistedMyAIState),
      partialize: ({ capabilities, discoveries }) => ({ capabilities, discoveries }),
    },
  ),
);
