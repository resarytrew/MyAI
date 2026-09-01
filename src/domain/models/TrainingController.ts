import type { Dataset, TinyModel, TrainingMetrics } from './modelRuntime';
import { tinyTransformerRuntime } from './tinyTransformerRuntime';
import type { TrainingWorkerRequest, TrainingWorkerResponse } from './trainingProtocol';

export interface TrainingJob {
  promise: Promise<TinyModel>;
  cancel: () => void;
  backend: 'worker' | 'main-thread-fallback';
}

export function startTrainingJob(
  model: TinyModel,
  data: Dataset,
  steps: number,
  onMetrics: (metrics: TrainingMetrics) => void,
): TrainingJob {
  const requestId = `train-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (typeof Worker === 'undefined') {
    const controller = new AbortController();
    return {
      backend: 'main-thread-fallback',
      promise: tinyTransformerRuntime.train(model, data, steps, onMetrics, controller.signal),
      cancel: () => controller.abort(),
    };
  }

  const worker = new Worker(new URL('./training.worker.ts', import.meta.url), { type: 'module', name: 'ai-lab-training' });
  let settled = false;
  const promise = new Promise<TinyModel>((resolve, reject) => {
    worker.addEventListener('message', ({ data }: MessageEvent<TrainingWorkerResponse>) => {
      if (data.requestId !== requestId) return;
      if (data.type === 'metrics') onMetrics(data.metrics);
      if (data.type === 'complete') { settled = true; worker.terminate(); resolve(data.model); }
      if (data.type === 'cancelled') { settled = true; worker.terminate(); reject(new DOMException('Training cancelled.', 'AbortError')); }
      if (data.type === 'error') { settled = true; worker.terminate(); reject(new Error(data.message)); }
    });
    worker.addEventListener('error', (event) => {
      settled = true;
      worker.terminate();
      reject(new Error(event.message || 'Training worker failed.'));
    });
    const request: TrainingWorkerRequest = { type: 'train', requestId, model, data, steps };
    worker.postMessage(request);
  });

  return {
    backend: 'worker',
    promise,
    cancel: () => {
      if (!settled) worker.postMessage({ type: 'cancel', requestId } satisfies TrainingWorkerRequest);
    },
  };
}
