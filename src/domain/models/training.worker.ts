/// <reference lib="webworker" />
import { tinyTransformerRuntime } from './tinyTransformerRuntime';
import type { TrainingWorkerRequest, TrainingWorkerResponse } from './trainingProtocol';

const workerScope = self as DedicatedWorkerGlobalScope;
const controllers = new Map<string, AbortController>();

function respond(message: TrainingWorkerResponse): void {
  workerScope.postMessage(message);
}

workerScope.addEventListener('message', async ({ data }: MessageEvent<TrainingWorkerRequest>) => {
  if (data.type === 'cancel') {
    controllers.get(data.requestId)?.abort();
    return;
  }

  const controller = new AbortController();
  controllers.set(data.requestId, controller);
  try {
    const model = await tinyTransformerRuntime.train(
      data.model,
      data.data,
      data.steps,
      (metrics) => respond({ type: 'metrics', requestId: data.requestId, metrics }),
      controller.signal,
    );
    respond({ type: 'complete', requestId: data.requestId, model });
  } catch (error) {
    if (controller.signal.aborted) respond({ type: 'cancelled', requestId: data.requestId });
    else respond({ type: 'error', requestId: data.requestId, message: error instanceof Error ? error.message : 'Training worker failed.' });
  } finally {
    controllers.delete(data.requestId);
  }
});

export {};
