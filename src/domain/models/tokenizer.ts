export interface CharacterTokenizer {
  vocabulary: string[];
  tokenToId: Map<string, number>;
  encode: (text: string) => number[];
  decode: (ids: readonly number[]) => string;
}

export function createCharacterTokenizer(corpus: string): CharacterTokenizer {
  const vocabulary = [...new Set(corpus.toLowerCase())].sort();
  if (!vocabulary.includes(' ')) vocabulary.unshift(' ');
  const tokenToId = new Map(vocabulary.map((token, index) => [token, index]));
  const fallback = tokenToId.get(' ') ?? 0;
  return {
    vocabulary,
    tokenToId,
    encode: (text) => [...text.toLowerCase()].map((token) => tokenToId.get(token) ?? fallback),
    decode: (ids) => ids.map((id) => vocabulary[id] ?? '').join(''),
  };
}

export interface BPEStep {
  pair: string;
  count: number;
  sequence: string[];
}

export function createBpeTokenizer(corpus: string, maxMerges = 48): CharacterTokenizer {
  const normalized = corpus.toLowerCase();
  let sequence = [...normalized];
  const merges: Array<[string, string]> = [];
  for (let merge = 0; merge < maxMerges; merge += 1) {
    const counts = new Map<string, number>();
    for (let index = 0; index < sequence.length - 1; index += 1) {
      const key = `${sequence[index]}\u0000${sequence[index + 1]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0];
    if (!best || best[1] < 2) break;
    const [left, right] = best[0].split('\u0000') as [string, string];
    merges.push([left, right]);
    const next: string[] = [];
    for (let index = 0; index < sequence.length; index += 1) {
      if (sequence[index] === left && sequence[index + 1] === right) { next.push(left + right); index += 1; }
      else next.push(sequence[index]!);
    }
    sequence = next;
  }
  const base = [...new Set(normalized)].sort();
  const vocabulary = [...new Set([...base, ...merges.map(([left, right]) => left + right)])];
  if (!vocabulary.includes(' ')) vocabulary.unshift(' ');
  const tokenToId = new Map(vocabulary.map((token, index) => [token, index]));
  const fallback = tokenToId.get(' ') ?? 0;
  const tokenize = (value: string) => {
    let tokens = [...value.toLowerCase()];
    for (const [left, right] of merges) {
      const next: string[] = [];
      for (let index = 0; index < tokens.length; index += 1) {
        if (tokens[index] === left && tokens[index + 1] === right) { next.push(left + right); index += 1; }
        else next.push(tokens[index]!);
      }
      tokens = next;
    }
    return tokens;
  };
  return {
    vocabulary,
    tokenToId,
    encode: (value) => tokenize(value).map((token) => tokenToId.get(token) ?? fallback),
    decode: (ids) => ids.map((id) => vocabulary[id] ?? '').join(''),
  };
}

export function createTokenizer(corpus: string, mode: 'character' | 'bpe' = 'character'): CharacterTokenizer {
  return mode === 'bpe' ? createBpeTokenizer(corpus) : createCharacterTokenizer(corpus);
}

export function runBpeSteps(text: string, maxMerges = 6): BPEStep[] {
  let sequence = [...text.toLowerCase().replace(/\s+/g, ' ').trim()];
  const steps: BPEStep[] = [];
  for (let merge = 0; merge < maxMerges; merge += 1) {
    const counts = new Map<string, number>();
    for (let index = 0; index < sequence.length - 1; index += 1) {
      const pair = `${sequence[index]}\u0000${sequence[index + 1]}`;
      counts.set(pair, (counts.get(pair) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0];
    if (!best || best[1] < 2) break;
    const [left, right] = best[0].split('\u0000');
    const next: string[] = [];
    for (let index = 0; index < sequence.length; index += 1) {
      if (sequence[index] === left && sequence[index + 1] === right) {
        next.push(`${left}${right}`);
        index += 1;
      } else {
        next.push(sequence[index]!);
      }
    }
    sequence = next;
    steps.push({ pair: `${left} + ${right}`, count: best[1], sequence: [...sequence] });
  }
  return steps;
}
