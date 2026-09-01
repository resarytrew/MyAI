import type { Checkpoint, Dataset, ModelConfig, TrainingMetrics } from '../domain/models/modelRuntime';

export interface SavedModelRecord {
  id: string;
  name: string;
  config: ModelConfig;
  checkpointId: string;
  loss: number;
  sample: string;
  createdAt: number;
}

export interface TrainingRunRecord {
  id: string;
  modelId: string;
  datasetId: string;
  seed: number;
  metrics: TrainingMetrics[];
  createdAt: number;
}

type StoreName = 'checkpoints' | 'models' | 'training-runs' | 'datasets';

const memoryFallback = new Map<StoreName, Map<string, unknown>>();

function memoryStore(name: StoreName): Map<string, unknown> {
  const existing = memoryFallback.get(name);
  if (existing) return existing;
  const created = new Map<string, unknown>();
  memoryFallback.set(name, created);
  return created;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ai-lab-research', 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      for (const name of ['checkpoints', 'models', 'training-runs', 'datasets'] satisfies StoreName[]) {
        if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put<T extends { id: string }>(storeName: StoreName, value: T): Promise<void> {
  const database = await openDatabase().catch(() => null);
  if (!database) { memoryStore(storeName).set(value.id, value); return; }
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(value);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function list<T>(storeName: StoreName): Promise<T[]> {
  const database = await openDatabase().catch(() => null);
  if (!database) return [...memoryStore(storeName).values()] as T[];
  const values = await new Promise<T[]>((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return values;
}

async function get<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  const database = await openDatabase().catch(() => null);
  if (!database) return memoryStore(storeName).get(id) as T | undefined;
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return value;
}

export const labDatabase = {
  saveCheckpoint: (checkpoint: Checkpoint) => put('checkpoints', checkpoint),
  listCheckpoints: () => list<Checkpoint>('checkpoints'),
  getCheckpoint: (id: string) => get<Checkpoint>('checkpoints', id),
  saveModel: (model: SavedModelRecord) => put('models', model),
  listModels: () => list<SavedModelRecord>('models'),
  saveTrainingRun: (run: TrainingRunRecord) => put('training-runs', run),
  listTrainingRuns: () => list<TrainingRunRecord>('training-runs'),
  saveDataset: (dataset: Dataset) => put('datasets', dataset),
  listDatasets: () => list<Dataset>('datasets'),
  clearAll: async () => {
    memoryFallback.clear();
    const database = await openDatabase().catch(() => null);
    if (!database) return;
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(['checkpoints', 'models', 'training-runs', 'datasets'] satisfies StoreName[], 'readwrite');
      for (const name of ['checkpoints', 'models', 'training-runs', 'datasets'] satisfies StoreName[]) transaction.objectStore(name).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  },
};
