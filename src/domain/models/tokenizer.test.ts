import { describe, expect, it } from 'vitest';
import { createBpeTokenizer, createCharacterTokenizer, runBpeSteps } from './tokenizer';

describe('tokenizers', () => {
  it('round-trips character and learned BPE representations', () => {
    const corpus = 'the model learned the model pattern';
    for (const tokenizer of [createCharacterTokenizer(corpus), createBpeTokenizer(corpus)]) {
      expect(tokenizer.decode(tokenizer.encode(corpus))).toBe(corpus);
    }
    expect(createBpeTokenizer(corpus).encode(corpus).length).toBeLessThan(corpus.length);
    expect(runBpeSteps(corpus).length).toBeGreaterThan(0);
  });
});
