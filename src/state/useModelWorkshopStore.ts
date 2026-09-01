import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_MODEL_CONFIG, type ModelConfig, type TrainingMetrics } from '../domain/models/modelRuntime';
import { createVersionedStorage } from './persistence';

export type WorkshopStatus = 'idle' | 'built' | 'training' | 'trained' | 'cancelled' | 'checkpointed';

interface ModelWorkshopState {
  config: ModelConfig;
  status: WorkshopStatus;
  metrics: TrainingMetrics[];
  latestSample: string;
  checkpointId?: string;
  updateConfig: (change: Partial<ModelConfig>) => void;
  setStatus: (status: WorkshopStatus) => void;
  addMetrics: (metrics: TrainingMetrics) => void;
  setSample: (latestSample: string) => void;
  setCheckpoint: (checkpointId: string) => void;
  resetWorkshop: () => void;
}

const initial = {
  config: DEFAULT_MODEL_CONFIG,
  status: 'idle' as const,
  metrics: [],
  latestSample: '',
};

function validWorkshop(value: unknown): boolean {
  return typeof value === 'object' && value !== null && typeof (value as { config?: unknown }).config === 'object';
}

export const useModelWorkshopStore = create<ModelWorkshopState>()(
  persist(
    (set) => ({
      ...initial,
      updateConfig: (change) => set((state) => ({ config: { ...state.config, ...change }, status: 'idle', metrics: [], latestSample: '' })),
      setStatus: (status) => set({ status }),
      addMetrics: (metrics) => set((state) => ({ metrics: [...state.metrics.slice(-11), metrics], latestSample: metrics.sample })),
      setSample: (latestSample) => set({ latestSample }),
      setCheckpoint: (checkpointId) => set({ checkpointId, status: 'checkpointed' }),
      resetWorkshop: () => set(initial),
    }),
    {
      name: 'ai-lab-model-workshop',
      storage: createVersionedStorage('ai-lab-model-workshop', validWorkshop, () => initial),
      partialize: ({ config, status, metrics, latestSample, checkpointId }) => ({ config, status, metrics, latestSample, checkpointId }),
    },
  ),
);
