import type {
  ChapterValidation,
  LocalizedText,
  Scene,
  SceneCompletionResult,
  SceneId,
  SceneSubmission,
} from './sceneTypes';

const invalidSubmission: LocalizedText = {
  ru: 'Ответ не удалось прочитать. Попробуй ещё раз.',
  en: 'The response could not be read. Try again.',
};

const incompleteSubmission: LocalizedText = {
  ru: 'Заверши действие перед продолжением.',
  en: 'Complete the activity before continuing.',
};

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item) => right.includes(item));
}

export function validateChapterSelection(
  validation: ChapterValidation | undefined,
  selected: readonly string[],
): boolean {
  if (!validation) return selected.length > 0;
  if (validation.type === 'any') return selected.length > 0;
  if (validation.type === 'exact') return sameSet(selected, validation.optionIds);

  const containsRequired = validation.optionIds.every((id) => selected.includes(id));
  const meetsMinimum = validation.min === undefined || selected.length >= validation.min;
  const meetsMaximum = validation.max === undefined || selected.length <= validation.max;
  return containsRequired && meetsMinimum && meetsMaximum;
}

function acceptedResult(
  scene: Scene,
  completedSceneIds: readonly SceneId[],
): SceneCompletionResult {
  const result: SceneCompletionResult = {
    accepted: true,
    rewards: completedSceneIds.includes(scene.id) ? [] : [...(scene.rewards ?? [])],
  };
  if (scene.content.feedback) result.feedback = scene.content.feedback;
  if (scene.nextSceneId) result.nextSceneId = scene.nextSceneId;
  return result;
}

export function completeScene(
  scene: Scene,
  submission: SceneSubmission,
  completedSceneIds: readonly SceneId[] = [],
): SceneCompletionResult {
  if (submission.type !== 'chapter-activity') {
    return { accepted: false, feedback: invalidSubmission, rewards: [] };
  }

  if (scene.content.input && !submission.textValue?.trim()) {
    return { accepted: false, feedback: incompleteSubmission, rewards: [] };
  }

  if (scene.content.options) {
    const selected = submission.selectedOptionIds ?? [];
    const optionIds = new Set(scene.content.options.map(({ id }) => id));
    if (selected.some((id) => !optionIds.has(id))) {
      return { accepted: false, feedback: invalidSubmission, rewards: [] };
    }
    if (!validateChapterSelection(scene.content.validation, selected)) {
      return {
        accepted: false,
        feedback: scene.content.pendingFeedback ?? incompleteSubmission,
        rewards: [],
      };
    }
  }

  return acceptedResult(scene, completedSceneIds);
}
