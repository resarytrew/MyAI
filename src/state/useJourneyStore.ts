import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SceneId } from '../domain/journey/sceneTypes';
import { createVersionedStorage } from './persistence';
import { isPersistedJourneyState } from './persistenceSchemas';

export interface JourneyState {
  currentSceneId: SceneId;
  completedSceneIds: SceneId[];
  answers: Partial<Record<SceneId, unknown>>;
  startedAt?: number;
  completedAt?: number;
  goToScene: (id: SceneId) => void;
  completeScene: (id: SceneId, answer?: unknown) => void;
  resetCurrentScene: () => void;
  resetJourney: () => void;
}

const initialJourney = {
  currentSceneId: 'p0-power',
  completedSceneIds: [],
  answers: {},
} satisfies Pick<JourneyState, 'currentSceneId' | 'completedSceneIds' | 'answers'>;

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      ...initialJourney,
      goToScene: (id) => set({ currentSceneId: id }),
      completeScene: (id, answer) =>
        set((state) => ({
          completedSceneIds: state.completedSceneIds.includes(id)
            ? state.completedSceneIds
            : [...state.completedSceneIds, id],
          answers:
            answer === undefined
              ? state.answers
              : { ...state.answers, [id]: answer },
          startedAt: state.startedAt ?? Date.now(),
          ...(id === 'chapter-teaser' ? { completedAt: Date.now() } : {}),
        })),
      resetCurrentScene: () =>
        set((state) => {
          const answers = { ...state.answers };
          delete answers[state.currentSceneId];
          return {
            answers,
            completedSceneIds: state.completedSceneIds.filter(
              (id) => id !== state.currentSceneId,
            ),
          };
        }),
      resetJourney: () => set(initialJourney),
    }),
    {
      name: 'ai-lab-journey',
      storage: createVersionedStorage(
        'ai-lab-journey',
        isPersistedJourneyState,
      ),
      partialize: ({ currentSceneId, completedSceneIds, answers, startedAt, completedAt }) => ({
        currentSceneId,
        completedSceneIds,
        answers,
        startedAt,
        completedAt,
      }),
    },
  ),
);
