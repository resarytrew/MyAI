import { describe, expect, it } from 'vitest';
import { createInitialMyAIData } from '../my-ai/capabilityCatalog';
import { applyMyAIReward } from '../my-ai/rewardReducer';
import { deriveBuildVersion, deriveSystemStatus } from '../my-ai/selectors';
import { chapterOneJourney } from './chapterOneJourney';
import { completeScene } from './sceneEngine';
import type { ChapterScene, SceneId, SceneSubmission } from './sceneTypes';

function successfulSubmission(scene: ChapterScene): SceneSubmission {
  if (scene.content.input) return { type: 'chapter-activity', textValue: 'Alex' };
  if (!scene.content.options) return { type: 'chapter-activity' };

  const validation = scene.content.validation;
  const selectedOptionIds = !validation || validation.type === 'any'
    ? [scene.content.options[0]!.id]
    : [...validation.optionIds];
  return { type: 'chapter-activity', selectedOptionIds };
}

describe('CHAPTER 01 domain journey', () => {
  it('completes all 46 scenes and installs only DATA and FEATURES', () => {
    let myAI = createInitialMyAIData();
    const completed: SceneId[] = [];

    for (const scene of chapterOneJourney) {
      const result = completeScene(scene, successfulSubmission(scene), completed);
      expect(result.accepted, scene.id).toBe(true);
      result.rewards.forEach((reward) => {
        myAI = applyMyAIReward(myAI, reward, completed.length + 1);
      });
      completed.push(scene.id);
    }

    expect(completed).toHaveLength(46);
    expect(deriveBuildVersion(myAI.capabilities)).toBe('0.2');
    expect(deriveSystemStatus(myAI.capabilities)).toBe('INPUT CORE ONLINE');
    expect(myAI.capabilities.data.status).toBe('installed');
    expect(myAI.capabilities.features.status).toBe('installed');
    expect(myAI.capabilities.parameters.status).toBe('locked');
    expect(myAI.capabilities['neural-net'].status).toBe('locked');
    expect(myAI.capabilities.learning.status).toBe('locked');
    expect(myAI.discoveries.map(({ id }) => id)).toEqual([
      'intelligence-not-computation', 'data', 'feature', 'representation',
    ]);

    const repeated = completeScene(
      chapterOneJourney[19]!,
      successfulSubmission(chapterOneJourney[19]!),
      completed,
    );
    expect(repeated.rewards).toEqual([]);
  });

  it('links every scene to the next scene in order', () => {
    chapterOneJourney.slice(0, -1).forEach((scene, index) => {
      expect(scene.nextSceneId).toBe(chapterOneJourney[index + 1]!.id);
    });
    expect(chapterOneJourney.at(-1)!.nextSceneId).toBeUndefined();
  });
});
