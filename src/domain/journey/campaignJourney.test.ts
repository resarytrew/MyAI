import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../campaign/campaignCatalog';
import { CORE_ORDER, MODULE_ORDER } from '../my-ai/capabilityCatalog';
import { campaignJourney } from './campaignJourney';

describe('full AI LAB campaign', () => {
  it('is a complete, unique, linear 10-chapter journey', () => {
    expect(CHAPTERS).toHaveLength(10);
    expect(campaignJourney).toHaveLength(115);
    expect(new Set(campaignJourney.map(({ id }) => id)).size).toBe(campaignJourney.length);
    campaignJourney.slice(0, -1).forEach((scene, index) => expect(scene.nextSceneId).toBe(campaignJourney[index + 1]!.id));
    expect(campaignJourney.at(-1)?.id).toBe('c10-complete');
    expect(campaignJourney.at(-1)?.nextSceneId).toBeUndefined();
  });

  it('installs every module once and certifies every core', () => {
    const rewards = campaignJourney.flatMap(({ rewards = [] }) => rewards);
    const installed = rewards.flatMap((reward) => reward.type === 'install-module' ? [reward.moduleId] : []);
    const certified = rewards.flatMap((reward) => reward.type === 'certify-core' ? [reward.coreId] : []);
    expect(installed).toEqual(MODULE_ORDER);
    expect(new Set(certified)).toEqual(new Set(CORE_ORDER));
  });
});
