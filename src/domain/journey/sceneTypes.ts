import type { Locale } from '../../i18n/types';
import type { MyAIReward } from '../my-ai/rewardReducer';

export type SceneId =
  | 'p0-power'
  | 'p0-system-check'
  | 'p0-identity'
  | 'p0-brief'
  | 'l1-machine-test'
  | 'l1-provocation'
  | 'l1-second-test'
  | 'l1-note'
  | 'l1-abilities'
  | 'l1-discovery'
  | 'l1-status'
  | 'l2-apple'
  | 'l2-machine-view'
  | 'l2-input'
  | 'l2-inputs'
  | 'l2-meaning'
  | 'l2-data-bench'
  | 'l3-numbers'
  | 'l3-context'
  | 'l3-data'
  | 'l3-information'
  | 'l3-quality'
  | 'l3-install-data'
  | 'l4-scan'
  | 'l4-select'
  | 'l4-feature'
  | 'l4-task-relative'
  | 'l4-relevance'
  | 'l4-table'
  | 'l5-numeric'
  | 'l5-color'
  | 'l5-boolean'
  | 'l5-image'
  | 'l5-sound'
  | 'l5-text'
  | 'l5-representation'
  | 'l6-brief'
  | 'l6-examples'
  | 'l6-select'
  | 'l6-vector'
  | 'l6-new-object'
  | 'l6-dialog'
  | 'l6-explanation'
  | 'l6-install-features'
  | 'chapter-complete'
  | 'chapter-teaser';

export type LocalizedText = Record<Locale, string>;

export type ChapterProgram =
  | 'BOOTLOADER'
  | 'SYSTEM DIAGNOSTICS'
  | 'DATA BENCH'
  | 'CHAPTER COMPLETE';

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
