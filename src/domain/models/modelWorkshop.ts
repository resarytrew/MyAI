import { labDatabase } from '../../state/labDatabase';
import { useModelWorkshopStore } from '../../state/useModelWorkshopStore';
import { TINY_STORY_DATASET, type Dataset, type TinyModel } from './modelRuntime';
import { tinyTransformerRuntime } from './tinyTransformerRuntime';
import { startTrainingJob, type TrainingJob } from './TrainingController';

let activeModel: TinyModel | undefined;
let activeTraining: TrainingJob | undefined;
let activeDataset: Dataset = TINY_STORY_DATASET;

export function setWorkshopDataset(dataset: Dataset): void {
  activeDataset = dataset;
  activeModel = undefined;
  useModelWorkshopStore.getState().setStatus('idle');
}

export function getWorkshopDataset(): Dataset {
  return activeDataset;
}

export async function buildWorkshopModel(): Promise<TinyModel> {
  const { config, setStatus } = useModelWorkshopStore.getState();
  activeModel = await tinyTransformerRuntime.build(config, activeDataset);
  setStatus('built');
  return activeModel;
}

export async function trainWorkshopModel(steps = 160): Promise<TinyModel> {
  const store = useModelWorkshopStore.getState();
  const model = activeModel ?? await buildWorkshopModel();
  store.setStatus('training');
  const metrics = [];
  activeTraining = startTrainingJob(model, activeDataset, steps, (value) => {
    metrics.push(value);
    useModelWorkshopStore.getState().addMetrics(value);
  });
  try {
    activeModel = await activeTraining.promise;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') useModelWorkshopStore.getState().setStatus('cancelled');
    else useModelWorkshopStore.getState().setStatus('built');
    throw error;
  } finally {
    activeTraining = undefined;
  }
  useModelWorkshopStore.getState().setStatus('trained');
  await labDatabase.saveTrainingRun({
    id: `run-${Date.now()}`,
    modelId: 'active-model',
    datasetId: activeDataset.id,
    seed: activeModel.config.seed,
    metrics,
    createdAt: Date.now(),
  });
  return activeModel;
}

export function cancelWorkshopTraining(): void {
  activeTraining?.cancel();
}

export async function generateWorkshopText(prompt: string, temperature = 0.72): Promise<string> {
  const model = activeModel ?? await buildWorkshopModel();
  const sample = await tinyTransformerRuntime.generate(model, prompt, 56, temperature);
  useModelWorkshopStore.getState().setSample(sample);
  return sample;
}

export async function saveWorkshopCheckpoint(name = 'my_llm_final'): Promise<string> {
  const model = activeModel ?? await buildWorkshopModel();
  const checkpoint = await tinyTransformerRuntime.saveCheckpoint(model, name);
  await labDatabase.saveCheckpoint(checkpoint);
  await labDatabase.saveModel({
    id: `model-${Date.now()}`,
    name,
    config: model.config,
    checkpointId: checkpoint.id,
    loss: model.loss,
    sample: useModelWorkshopStore.getState().latestSample,
    createdAt: Date.now(),
  });
  useModelWorkshopStore.getState().setCheckpoint(checkpoint.id);
  return checkpoint.id;
}

export async function loadWorkshopCheckpoint(checkpointId: string): Promise<void> {
  const checkpoint = await labDatabase.getCheckpoint(checkpointId);
  if (!checkpoint) throw new Error('Checkpoint not found.');
  activeModel = await tinyTransformerRuntime.loadCheckpoint(checkpoint);
  useModelWorkshopStore.setState({
    config: checkpoint.config,
    status: 'checkpointed',
    checkpointId,
  });
}

export function clearActiveWorkshopModel(): void {
  activeModel = undefined;
  activeDataset = TINY_STORY_DATASET;
}
