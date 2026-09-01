import type { ChapterId } from '../campaign/campaignTypes';
import type { LocalizedText, SceneId } from '../journey/sceneTypes';
import type { ModuleId } from '../my-ai/capabilityTypes';

export interface KnowledgeConcept {
  id: string;
  label: LocalizedText;
  chapterId: ChapterId;
  why: LocalizedText;
  intuition: LocalizedText;
  formal: LocalizedText;
  example: LocalizedText;
  math?: string;
  code?: string;
  moduleId?: ModuleId;
  related: string[];
  replaySceneId?: SceneId;
}

export interface ConceptGraphEdge {
  from: string;
  to: string;
}
