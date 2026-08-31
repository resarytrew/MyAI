import { describe, expect, it } from 'vitest';
import { completeScene, validateChapterSelection } from './sceneEngine';
import type { ChapterScene } from './sceneTypes';

const text = (ru: string, en = ru) => ({ ru, en });
const baseScene: ChapterScene = {
  id: 'l3-quality', type: 'chapter', program: 'DATA BENCH',
  title: text('Проверка'), nextSceneId: 'l3-install-data',
  rewards: [{ type: 'install-capability', capabilityId: 'data' }],
  content: {
    body: text('Найди выброс.'),
    options: [
      { id: 'normal', label: text('23.1') },
      { id: 'outlier', label: text('91.7') },
    ],
    selectionMode: 'single', validation: { type: 'exact', optionIds: ['outlier'] },
    feedback: text('Выброс найден.'), pendingFeedback: text('Сравни значения.'),
    actionLabel: text('Проверить'),
  },
};

describe('chapter scene engine', () => {
  it('accepts hypothesis choices without grading them', () => {
    const scene: ChapterScene = {
      ...baseScene,
      id: 'l1-provocation',
      content: { ...baseScene.content, validation: { type: 'any' } },
    };
    const result = completeScene(scene, { type: 'chapter-activity', selectedOptionIds: ['normal'] });
    expect(result.accepted).toBe(true);
    expect(result.feedback).toEqual(scene.content.feedback);
  });

  it('rejects an incorrect exact selection and accepts the target', () => {
    const pending = completeScene(baseScene, { type: 'chapter-activity', selectedOptionIds: ['normal'] });
    const accepted = completeScene(baseScene, { type: 'chapter-activity', selectedOptionIds: ['outlier'] });
    expect(pending.accepted).toBe(false);
    expect(pending.feedback).toEqual(baseScene.content.pendingFeedback);
    expect(accepted.accepted).toBe(true);
  });

  it('validates required subsets and selection limits', () => {
    const rule = { type: 'includes-all' as const, optionIds: ['a', 'b'], min: 2, max: 3 };
    expect(validateChapterSelection(rule, ['a'])).toBe(false);
    expect(validateChapterSelection(rule, ['a', 'b', 'c'])).toBe(true);
    expect(validateChapterSelection(rule, ['a', 'b', 'c', 'd'])).toBe(false);
  });

  it('requires researcher name input', () => {
    const scene: ChapterScene = {
      ...baseScene,
      id: 'p0-identity',
      content: {
        body: text('Имя'), actionLabel: text('Войти'),
        input: { label: text('Имя'), placeholder: text('Алекс'), maxLength: 24 },
      },
    };
    expect(completeScene(scene, { type: 'chapter-activity', textValue: '  ' }).accepted).toBe(false);
    expect(completeScene(scene, { type: 'chapter-activity', textValue: 'Alex' }).accepted).toBe(true);
  });

  it('returns rewards once and always preserves the configured next scene', () => {
    const first = completeScene(baseScene, { type: 'chapter-activity', selectedOptionIds: ['outlier'] });
    const repeated = completeScene(baseScene, { type: 'chapter-activity', selectedOptionIds: ['outlier'] }, ['l3-quality']);
    expect(first.nextSceneId).toBe('l3-install-data');
    expect(first.rewards).toHaveLength(1);
    expect(repeated.nextSceneId).toBe(first.nextSceneId);
    expect(repeated.rewards).toEqual([]);
  });
});
