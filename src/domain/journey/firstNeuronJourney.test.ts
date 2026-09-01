import { describe, expect, it } from 'vitest';
import { MODULE_ORDER, createInitialMyAIData } from '../my-ai/capabilityCatalog';
import { applyMyAIReward } from '../my-ai/rewardReducer';
import { deriveBuildVersion, deriveCoreStatus, deriveSystemStatus } from '../my-ai/selectors';
import { campaignJourney } from './campaignJourney';
import { chapterOneJourney } from './chapterOneJourney';
import { completeScene } from './sceneEngine';
import type { ChapterScene, SceneId, SceneSubmission } from './sceneTypes';

function successfulSubmission(scene: ChapterScene): SceneSubmission {
  if (scene.content.input) return { type: 'chapter-activity', textValue: 'Alex' };
  if (!scene.content.options) return { type: 'chapter-activity' };
  const validation = scene.content.validation;
  const selectedOptionIds = !validation || validation.type === 'any' ? [scene.content.options[0]!.id] : [...validation.optionIds];
  return { type: 'chapter-activity', selectedOptionIds };
}

function completeDomainJourney(scenes: ChapterScene[]) {
  let myAI = createInitialMyAIData();
  const completed: SceneId[] = [];
  for (const scene of scenes) {
    const result = completeScene(scene, successfulSubmission(scene), completed);
    expect(result.accepted, scene.id).toBe(true);
    result.rewards.forEach((reward) => { myAI = applyMyAIReward(myAI, reward, completed.length + 1); });
    completed.push(scene.id);
  }
  return { myAI, completed };
}

describe('AI LAB campaign journey', () => {
  it('completes CHAPTER 01 with three INPUT CORE modules and four discoveries', () => {
    const { myAI, completed } = completeDomainJourney(chapterOneJourney);
    expect(completed).toHaveLength(46);
    expect(deriveBuildVersion(myAI.modules)).toBe('0.3');
    expect(deriveSystemStatus(myAI)).toBe('INPUT CORE ONLINE');
    expect(deriveCoreStatus(myAI, 'input')).toBe('VALIDATED');
    expect(myAI.modules['data-interface'].status).toBe('installed');
    expect(myAI.modules['feature-system'].status).toBe('installed');
    expect(myAI.modules['representation-layer'].status).toBe('installed');
    expect(myAI.modules['rule-engine'].status).toBe('locked');
    expect(myAI.discoveries.map(({ id }) => id)).toEqual(['intelligence-not-computation', 'data', 'feature', 'representation']);
  });

  it('links and completes all ten chapters through MY LLM BUILD 1.0', () => {
    const { myAI, completed } = completeDomainJourney(campaignJourney);
    expect(completed.length).toBeGreaterThan(100);
    expect(completed.at(-1)).toBe('c10-complete');
    expect(deriveBuildVersion(myAI.modules)).toBe('1.0');
    expect(deriveSystemStatus(myAI)).toBe('READY');
    expect(MODULE_ORDER.every((id) => myAI.modules[id].status === 'installed')).toBe(true);
    expect(myAI.certifications).toHaveLength(8);
    campaignJourney.slice(0, -1).forEach((scene, index) => expect(scene.nextSceneId).toBe(campaignJourney[index + 1]!.id));
  });
});
