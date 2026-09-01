import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResearchEntry, ResearchLogData } from '../domain/journal/researchLogTypes';
import type { ChapterScene, SceneSubmission } from '../domain/journey/sceneTypes';
import type { MyAIReward } from '../domain/my-ai/rewardReducer';
import { createVersionedStorage } from './persistence';

interface ResearchLogState extends ResearchLogData {
  recordScene: (scene: ChapterScene, submission: SceneSubmission, rewards: MyAIReward[]) => void;
  recordFailure: (scene: ChapterScene, detail: string) => void;
  setResearcherName: (name: string) => void;
  clearLog: () => void;
}

const initialState: ResearchLogData = { entries: [] };

function entryType(scene: ChapterScene, rewards: MyAIReward[]): ResearchEntry['type'] {
  if (scene.primitive === 'prediction') return 'hypothesis';
  if (scene.primitive === 'manipulate' || scene.primitive === 'train') return 'experiment';
  if (scene.primitive === 'observe') return 'observation';
  if (scene.primitive === 'generate') return 'generation';
  if (rewards.some(({ type }) => type === 'certify-core')) return 'certification';
  if (rewards.some(({ type }) => type === 'install-module')) return 'installation';
  if (rewards.some(({ type }) => type === 'add-discovery')) return 'discovery';
  return 'observation';
}

function answerFromSubmission(submission: SceneSubmission): string | undefined {
  if (submission.textValue) return submission.textValue;
  if (submission.selectedOptionIds?.length) return submission.selectedOptionIds.join(', ');
  return undefined;
}

function isResearchLogData(value: unknown): value is ResearchLogData {
  return typeof value === 'object' && value !== null && Array.isArray((value as ResearchLogData).entries);
}

export const useResearchLogStore = create<ResearchLogState>()(
  persist(
    (set) => ({
      ...initialState,
      recordScene: (scene, submission, rewards) => set((state) => {
        if (state.entries.some(({ sceneId }) => sceneId === scene.id)) return state;
        const answer = answerFromSubmission(submission);
        const entry: ResearchEntry = {
          id: `${scene.id}-${Date.now()}`,
          type: entryType(scene, rewards),
          sceneId: scene.id,
          chapterNumber: scene.chapterNumber ?? 1,
          title: scene.title,
          detail: scene.content.feedback ?? scene.content.body,
          ...(answer ? { answer } : {}),
          createdAt: Date.now(),
        };
        return {
          ...state,
          ...(scene.id === 'p0-identity' && submission.textValue ? { researcherName: submission.textValue } : {}),
          entries: [...state.entries, entry],
        };
      }),
      recordFailure: (scene, detail) => set((state) => ({
        ...state,
        entries: [...state.entries, {
          id: `failure-${scene.id}-${Date.now()}`,
          type: 'failure',
          sceneId: scene.id,
          chapterNumber: scene.chapterNumber ?? 1,
          title: { ru: 'НЕУДАЧНЫЙ ЭКСПЕРИМЕНТ', en: 'FAILED EXPERIMENT' },
          detail: { ru: detail, en: detail },
          createdAt: Date.now(),
        }],
      })),
      setResearcherName: (researcherName) => set({ researcherName }),
      clearLog: () => set(initialState),
    }),
    {
      name: 'ai-lab-research-log',
      storage: createVersionedStorage('ai-lab-research-log', isResearchLogData, (state) => isResearchLogData(state) ? state : initialState),
      partialize: ({ researcherName, entries }) => ({ researcherName, entries }),
    },
  ),
);
