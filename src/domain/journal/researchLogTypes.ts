import type { LocalizedText, SceneId } from '../journey/sceneTypes';

export type ResearchEntryType = 'hypothesis' | 'experiment' | 'observation' | 'discovery' | 'installation' | 'failure' | 'certification' | 'generation';

export interface ResearchEntry {
  id: string;
  type: ResearchEntryType;
  sceneId: SceneId;
  chapterNumber: number;
  title: LocalizedText;
  detail: LocalizedText;
  answer?: string;
  createdAt: number;
}

export interface ResearchLogData {
  researcherName?: string;
  entries: ResearchEntry[];
}
