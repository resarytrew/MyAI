import type { Dataset, TinyModel, TrainingMetrics } from './modelRuntime';

export interface TrainRequest {
  type: 'train';
  requestId: string;
  model: TinyModel;
  data: Dataset;
  steps: number;
}

export interface CancelTrainingRequest {
  type: 'cancel';
  requestId: string;
}

export type TrainingWorkerRequest = TrainRequest | CancelTrainingRequest;

export type TrainingWorkerResponse =
  | { type: 'metrics'; requestId: string; metrics: TrainingMetrics }
  | { type: 'complete'; requestId: string; model: TinyModel }
  | { type: 'cancelled'; requestId: string }
  | { type: 'error'; requestId: string; message: string };
