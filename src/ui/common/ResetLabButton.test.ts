import { beforeEach, describe, expect, it } from 'vitest';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useMyAIStore } from '../../state/useMyAIStore';
import { resetLab } from './ResetLabButton';

describe('resetLab', () => {
  beforeEach(() => {
    localStorage.clear();
    useJourneyStore.getState().resetJourney();
    useMyAIStore.getState().resetMyAI();
  });

  it('returns journey and MY AI to a clean build 0.0', () => {
    useMyAIStore.getState().discoverCapability('data');
    useJourneyStore.getState().goToScene('data-feature');

    resetLab();

    expect(useJourneyStore.getState().currentSceneId).toBe('p0-power');
    expect(useMyAIStore.getState().capabilities.data.status).toBe('locked');
    expect(localStorage.getItem('ai-lab-journey')).toBeNull();
    expect(localStorage.getItem('ai-lab-my-ai')).toBeNull();
  });
});
