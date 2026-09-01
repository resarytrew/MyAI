import { describe, expect, it } from 'vitest';
import { labDatabase } from './labDatabase';

describe('labDatabase', () => {
  it('clears research artifacts during a full lab reset', async () => {
    await labDatabase.saveDataset({ id: 'reset-test', name: 'Reset test', text: 'data' });
    expect(await labDatabase.listDatasets()).toContainEqual({ id: 'reset-test', name: 'Reset test', text: 'data' });
    await labDatabase.clearAll();
    expect(await labDatabase.listDatasets()).toEqual([]);
  });
});
