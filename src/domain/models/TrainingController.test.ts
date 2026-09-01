import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL_CONFIG, TINY_STORY_DATASET } from './modelRuntime';
import { startTrainingJob } from './TrainingController';
import { tinyTransformerRuntime } from './tinyTransformerRuntime';

describe('TrainingController', () => {
  it('runs deterministic training through the non-Worker test fallback', async () => {
    vi.stubGlobal('Worker', undefined);
    const model = await tinyTransformerRuntime.build({ ...DEFAULT_MODEL_CONFIG, dModel: 12, heads: 3, layers: 1, ffnMultiplier: 2 }, TINY_STORY_DATASET);
    const metrics = vi.fn();
    const job = startTrainingJob(model, TINY_STORY_DATASET, 4, metrics);
    expect(job.backend).toBe('main-thread-fallback');
    const trained = await job.promise;
    expect(trained.step).toBe(4);
    expect(metrics).toHaveBeenCalled();
    expect(metrics.mock.calls.at(-1)?.[0]).toMatchObject({ step: 4, memoryBytes: expect.any(Number) });
    vi.unstubAllGlobals();
  });
});
