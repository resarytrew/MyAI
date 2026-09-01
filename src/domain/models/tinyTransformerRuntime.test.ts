import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL_CONFIG, TINY_STORY_DATASET } from './modelRuntime';
import { TinyTransformerRuntime } from './tinyTransformerRuntime';

describe('TinyTransformerRuntime', () => {
  it('keeps the default final model in the educational 100K–3M parameter range', () => {
    const estimate = new TinyTransformerRuntime().estimate(DEFAULT_MODEL_CONFIG, 512);
    expect(estimate.parameters).toBeGreaterThanOrEqual(100_000);
    expect(estimate.parameters).toBeLessThanOrEqual(3_000_000);
  });

  it('builds a causal Transformer, updates real weights, checkpoints, and generates', async () => {
    const runtime = new TinyTransformerRuntime();
    const model = await runtime.build({ ...DEFAULT_MODEL_CONFIG, dModel: 12, heads: 3, contextLength: 12 }, TINY_STORY_DATASET);
    const before = model.weights.lmHead![0];
    const samples: string[] = [];
    await runtime.train(model, TINY_STORY_DATASET, 16, (metrics) => samples.push(metrics.sample));
    expect(model.step).toBe(16);
    expect(Number.isFinite(model.loss)).toBe(true);
    expect(model.weights.lmHead![0]).not.toBe(before);
    expect(samples.length).toBeGreaterThan(0);
    const generated = await runtime.generate(model, 'the ', 12, .8);
    expect(generated.startsWith('the ')).toBe(true);
    expect(generated.length).toBeGreaterThan(4);
    const checkpoint = await runtime.saveCheckpoint(model, 'test');
    const restored = await runtime.loadCheckpoint(checkpoint);
    expect(restored.step).toBe(16);
    expect(restored.weights.lmHead).toEqual(model.weights.lmHead);
  });

  it('rejects incompatible head geometry', async () => {
    const runtime = new TinyTransformerRuntime();
    await expect(runtime.build({ ...DEFAULT_MODEL_CONFIG, dModel: 10, heads: 3 }, TINY_STORY_DATASET)).rejects.toThrow(/divisible/);
  });
});
