import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialMyAIData } from '../domain/my-ai/capabilityCatalog';
import { applyMyAIReward, type MyAIReward } from '../domain/my-ai/rewardReducer';
import type { CapabilityId, CoreId, ModuleId, MyAIData } from '../domain/my-ai/capabilityTypes';
import { createVersionedStorage } from './persistence';
import { isPersistedMyAIState, migratePersistedMyAIState } from './persistenceSchemas';

export interface MyAIState extends MyAIData {
  discoverModule: (id: ModuleId) => void;
  startExperiment: (id: ModuleId) => void;
  installModule: (id: ModuleId) => void;
  masterModule: (id: ModuleId) => void;
  unlockCapability: (id: CapabilityId) => void;
  certifyCore: (id: CoreId) => void;
  applyReward: (reward: MyAIReward) => void;
  resetMyAI: () => void;
}

const initialMyAI = createInitialMyAIData();

export const useMyAIStore = create<MyAIState>()(
  persist(
    (set) => ({
      ...initialMyAI,
      applyReward: (reward) => set((state) => applyMyAIReward(state, reward)),
      discoverModule: (moduleId) => set((state) => applyMyAIReward(state, { type: 'discover-module', moduleId })),
      startExperiment: (moduleId) => set((state) => applyMyAIReward(state, { type: 'start-module-experiment', moduleId })),
      installModule: (moduleId) => set((state) => applyMyAIReward(state, { type: 'install-module', moduleId })),
      masterModule: (moduleId) => set((state) => applyMyAIReward(state, { type: 'master-module', moduleId })),
      unlockCapability: (capabilityId) => set((state) => applyMyAIReward(state, { type: 'unlock-capability', capabilityId })),
      certifyCore: (coreId) => set((state) => applyMyAIReward(state, { type: 'certify-core', coreId })),
      resetMyAI: () => set(createInitialMyAIData()),
    }),
    {
      name: 'ai-lab-my-ai',
      storage: createVersionedStorage('ai-lab-my-ai', isPersistedMyAIState, migratePersistedMyAIState),
      partialize: ({ cores, modules, capabilities, discoveries, buildHistory, certifications }) => ({
        cores, modules, capabilities, discoveries, buildHistory, certifications,
      }),
    },
  ),
);
