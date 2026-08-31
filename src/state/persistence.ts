import type { PersistStorage, StorageValue } from 'zustand/middleware';

export const PERSISTENCE_SCHEMA_VERSION = 2 as const;

export interface PersistedStateEnvelope<T> {
  schemaVersion: typeof PERSISTENCE_SCHEMA_VERSION;
  data: T;
}

const persistenceIssues = new Set<string>();
const issueListeners = new Set<() => void>();

function reportPersistenceIssue(key: string): void {
  const previousSize = persistenceIssues.size;
  persistenceIssues.add(key);
  if (persistenceIssues.size !== previousSize) {
    issueListeners.forEach((listener) => listener());
  }
}

export function subscribePersistenceIssues(listener: () => void): () => void {
  issueListeners.add(listener);
  return () => issueListeners.delete(listener);
}

export function getPersistenceIssueCount(): number {
  return persistenceIssues.size;
}

export function getPersistenceIssues(): string[] {
  return [...persistenceIssues];
}

export function clearPersistenceIssues(): void {
  if (persistenceIssues.size === 0) return;
  persistenceIssues.clear();
  issueListeners.forEach((listener) => listener());
}

export function clearAllPersistedLabState(): void {
  localStorage.removeItem('ai-lab-journey');
  localStorage.removeItem('ai-lab-my-ai');
  clearPersistenceIssues();
}

export function createVersionedStorage<T>(
  key: string,
  validateState?: (state: unknown) => boolean,
): PersistStorage<T> {
  return {
    getItem: () => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      try {
        const envelope = JSON.parse(raw) as PersistedStateEnvelope<StorageValue<T>>;
        if (
          envelope.schemaVersion !== PERSISTENCE_SCHEMA_VERSION ||
          typeof envelope.data !== 'object' ||
          envelope.data === null ||
          !('state' in envelope.data) ||
          (validateState && !validateState(envelope.data.state))
        ) {
          reportPersistenceIssue(key);
          return null;
        }
        return envelope.data;
      } catch {
        reportPersistenceIssue(key);
        return null;
      }
    },
    setItem: (_name, value) => {
      const envelope: PersistedStateEnvelope<StorageValue<T>> = {
        schemaVersion: PERSISTENCE_SCHEMA_VERSION,
        data: value,
      };
      localStorage.setItem(key, JSON.stringify(envelope));
    },
    removeItem: () => localStorage.removeItem(key),
  };
}
