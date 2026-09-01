import { describe, expect, it } from 'vitest';
import { createInitialMyAIData } from './capabilityCatalog';
import { applyMyAIReward, CapabilityTransitionError } from './rewardReducer';
import { deriveBuildVersion, deriveCoreStatus } from './selectors';

describe('MY AI core/module state', () => {
  it('does not install a locked module', () => {
    const state = createInitialMyAIData();
    expect(() => applyMyAIReward(state, { type: 'install-module', moduleId: 'data-interface' }, 1)).toThrow(CapabilityTransitionError);
  });

  it('enforces install prerequisites while allowing concepts to be discovered ahead', () => {
    let state = createInitialMyAIData();
    state = applyMyAIReward(state, { type: 'discover-module', moduleId: 'feature-system' }, 1);
    expect(state.modules['feature-system'].status).toBe('discovered');
    expect(() => applyMyAIReward(state, { type: 'install-module', moduleId: 'feature-system' }, 2)).toThrow(/Prerequisites/);
  });

  it('applies module and discovery rewards idempotently', () => {
    const initial = createInitialMyAIData();
    const discovered = applyMyAIReward(initial, { type: 'discover-module', moduleId: 'data-interface' }, 10);
    const repeated = applyMyAIReward(discovered, { type: 'discover-module', moduleId: 'data-interface' }, 20);
    const installed = applyMyAIReward(repeated, { type: 'install-module', moduleId: 'data-interface' }, 30);
    const withDiscovery = applyMyAIReward(installed, { type: 'add-discovery', discovery: { id: 'data', sceneId: 'l3-data' } }, 40);
    const repeatedDiscovery = applyMyAIReward(withDiscovery, { type: 'add-discovery', discovery: { id: 'data', sceneId: 'l3-data' } }, 50);

    expect(repeated).toBe(discovered);
    expect(repeated.modules['data-interface'].discoveredAt).toBe(10);
    expect(installed.buildHistory).toEqual([{ build: '0.1', moduleId: 'data-interface', installedAt: 30 }]);
    expect(installed.capabilities['receive-data'].status).toBe('installed');
    expect(repeatedDiscovery).toBe(withDiscovery);
    expect(repeatedDiscovery.discoveries).toHaveLength(1);
  });

  it('derives milestone build and certifies a complete core', () => {
    let state = createInitialMyAIData();
    for (const moduleId of ['data-interface', 'feature-system', 'representation-layer'] as const) {
      state = applyMyAIReward(state, { type: 'discover-module', moduleId }, 1);
      state = applyMyAIReward(state, { type: 'install-module', moduleId }, 2);
    }
    expect(deriveBuildVersion(state.modules)).toBe('0.3');
    expect(deriveCoreStatus(state, 'input')).toBe('ONLINE');
    state = applyMyAIReward(state, { type: 'certify-core', coreId: 'input' }, 3);
    expect(deriveCoreStatus(state, 'input')).toBe('VALIDATED');
  });
});
