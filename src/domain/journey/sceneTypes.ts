import type { Locale } from '../../i18n/types';
import type { MyAIReward } from '../my-ai/rewardReducer';
import type { ProgramId } from '../programs/programRegistry';

export type SceneId = string;

export type LocalizedText = Record<Locale, string>;

export type ChapterProgram = ProgramId;

export type ScenePrimitive =
  | 'narrative'
  | 'briefing'
  | 'choice'
  | 'prediction'
  | 'explain'
  | 'manipulate'
  | 'graph'
  | 'build'
  | 'tokenize'
  | 'code'
  | 'train'
  | 'generate'
  | 'observe'
  | 'discovery'
  | 'install'
  | 'reflection'
  | 'field-test';

export type LabId =
  | 'linear-parameter'
  | 'loss-landscape'
  | 'gradient-step'
  | 'xor-network'
  | 'tokenizer'
  | 'embedding'
  | 'attention'
  | 'transformer-assembly'
  | 'next-token'
  | 'training'
  | 'model-assembly';

export type ChapterVisual =
  | 'power'
  | 'diagnostics'
  | 'identity'
  | 'project-map'
  | 'calculation'
  | 'cat-reasoning'
  | 'ai-status'
  | 'apple'
  | 'pixel-grid'
  | 'input-map'
  | 'three-numbers'
  | 'context-values'
  | 'data-information'
  | 'sensor-values'
  | 'data-install'
  | 'car-scan'
  | 'task-features'
  | 'feature-table'
  | 'color-encoding'
  | 'boolean-encoding'
  | 'image-matrix'
  | 'sound-wave'
  | 'text-lock'
  | 'representation'
  | 'capsule-mission'
  | 'capsule-examples'
  | 'input-vector'
  | 'new-object'
  | 'decision-gap'
  | 'feature-install'
  | 'chapter-summary'
  | 'teaser';

export interface ChapterOption {
  id: string;
  label: LocalizedText;
  detail?: LocalizedText;
}

export type ChapterValidation =
  | { type: 'any' }
  | { type: 'includes-all'; optionIds: string[]; min?: number; max?: number }
  | { type: 'exact'; optionIds: string[] };

export interface ChapterScene {
  id: SceneId;
  type: 'chapter';
  program: ChapterProgram;
  title: LocalizedText;
  chapterId?: string;
  chapterNumber?: number;
  levelId?: string;
  primitive?: ScenePrimitive;
  nextSceneId?: SceneId;
  rewards?: MyAIReward[];
  content: {
    eyebrow?: LocalizedText;
    body: LocalizedText;
    prompt?: LocalizedText;
    options?: ChapterOption[];
    selectionMode?: 'single' | 'multiple';
    validation?: ChapterValidation;
    feedback?: LocalizedText;
    pendingFeedback?: LocalizedText;
    actionLabel: LocalizedText;
    visual?: ChapterVisual;
    lab?: LabId;
    input?: {
      label: LocalizedText;
      placeholder: LocalizedText;
      maxLength: number;
    };
    deepDive?: LocalizedText;
    tone?: 'boot' | 'neutral' | 'challenge' | 'success';
  };
}

export type Scene = ChapterScene;

export type SceneSubmission = {
  type: 'chapter-activity';
  selectedOptionIds?: string[];
  textValue?: string;
};

export interface SceneCompletionResult {
  accepted: boolean;
  feedback?: LocalizedText;
  rewards: MyAIReward[];
  nextSceneId?: SceneId;
}

export type SceneRegistry = Record<SceneId, Scene>;
