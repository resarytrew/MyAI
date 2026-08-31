import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPersistenceIssues,
  createVersionedStorage,
  getPersistenceIssueCount,
  PERSISTENCE_SCHEMA_VERSION,
  subscribePersistenceIssues,
} from './persistence';

describe('versioned persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistenceIssues();
  });

  it('restores a valid schema envelope', () => {
    const storage = createVersionedStorage<{ value: number }>(
      'valid',
      (state) =>
        typeof state === 'object' &&
        state !== null &&
        (state as { value?: unknown }).value === 7,
    );
    localStorage.setItem(
      'valid',
      JSON.stringify({
        schemaVersion: PERSISTENCE_SCHEMA_VERSION,
        data: { state: { value: 7 }, version: 0 },
      }),
    );

    expect(storage.getItem('valid')).toEqual({
      state: { value: 7 },
      version: 0,
    });
    expect(getPersistenceIssueCount()).toBe(0);
  });

  it('reports corrupt state and returns a safe empty result', () => {
    const storage = createVersionedStorage<{ value: number }>('broken');
    localStorage.setItem('broken', '{not-json');
    const listener = vi.fn();
    const unsubscribe = subscribePersistenceIssues(listener);

    expect(storage.getItem('broken')).toBeNull();
    expect(getPersistenceIssueCount()).toBe(1);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
