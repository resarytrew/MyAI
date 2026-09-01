import type { LocalizedText, SceneId } from '../journey/sceneTypes';
import type { CoreId, ModuleId } from '../my-ai/capabilityTypes';
import type { ProgramId } from '../programs/programRegistry';

export type ChapterId =
  | 'initialization'
  | 'decision-engine'
  | 'learning-protocol'
  | 'neural-core'
  | 'text-lab'
  | 'context'
  | 'block-assembly'
  | 'language-model'
  | 'training-console'
  | 'my-llm';

export interface LevelDefinition {
  id: string;
  title: LocalizedText;
  sceneIds: SceneId[];
}

export interface ChapterDefinition {
  id: ChapterId;
  number: number;
  code: string;
  title: LocalizedText;
  mission: LocalizedText;
  question: LocalizedText;
  program: ProgramId;
  coreId: CoreId;
  moduleIds: ModuleId[];
  levels: LevelDefinition[];
  fieldTest: LocalizedText;
}

export interface CampaignDefinition {
  id: 'build-intelligence';
  title: LocalizedText;
  objective: LocalizedText;
  chapters: ChapterDefinition[];
}
