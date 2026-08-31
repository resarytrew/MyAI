import { describe, expect, it } from 'vitest';
import { createInitialMyAIData } from './capabilityCatalog';
import {
  applyMyAIReward,
  CapabilityTransitionError,
} from './rewardReducer';
import { deriveBuildVersion } from './selectors';

describe('MY AI capability state', () => {
  it('does not install a locked capability', () => {
    const state = createInitialMyAIData();

    expect(() =>
      applyMyAIReward(
        state,
        { type: 'install-capability', capabilityId: 'data' },
        1,
      ),
    ).toThrow(CapabilityTransitionError);
  });

  it('respects prerequisites', () => {
    const state = createInitialMyAIData();

    expect(() =>
      applyMyAIReward(
        state,
        { type: 'discover-capability', capabilityId: 'features' },
        1,
      ),
    ).toThrow(/Prerequisites/);
  });

  it('applies capability and discovery rewards idempotently', () => {
    const initial = createInitialMyAIData();
    const discovered = applyMyAIReward(
      initial,
      { type: 'discover-capability', capabilityId: 'data' },
      10,
    );
    const repeated = applyMyAIReward(
      discovered,
      { type: 'discover-capability', capabilityId: 'data' },
      20,
    );
    const withDiscovery = applyMyAIReward(
      repeated,
      {
        type: 'add-discovery',
        discovery: { id: 'numeric-input', sceneId: 'data-feature' },
      },
      30,
    );
    const repeatedDiscovery = applyMyAIReward(
      withDiscovery,
      {
        type: 'add-discovery',
        discovery: { id: 'numeric-input', sceneId: 'data-feature' },
      },
      40,
    );

    expect(repeated).toBe(discovered);
    expect(repeated.capabilities.data.discoveredAt).toBe(10);
    expect(repeatedDiscovery).toBe(withDiscovery);
    expect(repeatedDiscovery.discoveries).toHaveLength(1);
  });

  it('derives build version from installed capabilities', () => {
    let state = createInitialMyAIData();
    state = applyMyAIReward(
      state,
      { type: 'discover-capability', capabilityId: 'data' },
      1,
    );
    state = applyMyAIReward(
      state,
      { type: 'install-capability', capabilityId: 'data' },
      2,
    );

    expect(deriveBuildVersion(state.capabilities)).toBe('0.1');
  });
});
