import type { PersistStorage, StorageValue } from 'zustand/middleware';

export const PERSISTENCE_SCHEMA_VERSION = 3 as const;

export interface PersistedStateEnvelope<T> {
  schemaVersion: number;
  data: T;
}

export type StateMigration<T> = (state: unknown, fromVersion: number) => T | null;

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
  localStorage.removeItem('ai-lab-research-log');
  localStorage.removeItem('ai-lab-settings');
  localStorage.removeItem('ai-lab-model-workshop');
  clearPersistenceIssues();
}

export function createVersionedStorage<T>(
  key: string,
  validateState?: (state: unknown) => boolean,
  migrateState?: StateMigration<T>,
): PersistStorage<T> {
  return {
    getItem: () => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      try {
        const envelope = JSON.parse(raw) as PersistedStateEnvelope<StorageValue<T>>;
        if (
          typeof envelope.data !== 'object' ||
          envelope.data === null ||
          !('state' in envelope.data)
        ) {
          reportPersistenceIssue(key);
          return null;
        }

        if (envelope.schemaVersion !== PERSISTENCE_SCHEMA_VERSION) {
          const migrated = migrateState?.(envelope.data.state, envelope.schemaVersion);
          if (migrated === null || migrated === undefined || (validateState && !validateState(migrated))) {
            reportPersistenceIssue(key);
            return null;
          }
          return { ...envelope.data, state: migrated } as StorageValue<T>;
        }

        if (validateState && !validateState(envelope.data.state)) {
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
