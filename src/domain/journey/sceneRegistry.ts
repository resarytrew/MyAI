import type { Scene, SceneId, SceneRegistry } from './sceneTypes';

export const CHAPTER_ONE_SCENE_ORDER: SceneId[] = [
  'p0-power', 'p0-system-check', 'p0-identity', 'p0-brief',
  'l1-machine-test', 'l1-provocation', 'l1-second-test', 'l1-note', 'l1-abilities', 'l1-discovery', 'l1-status',
  'l2-apple', 'l2-machine-view', 'l2-input', 'l2-inputs', 'l2-meaning', 'l2-data-bench',
  'l3-numbers', 'l3-context', 'l3-data', 'l3-information', 'l3-quality', 'l3-install-data',
  'l4-scan', 'l4-select', 'l4-feature', 'l4-task-relative', 'l4-relevance', 'l4-table',
  'l5-numeric', 'l5-color', 'l5-boolean', 'l5-image', 'l5-sound', 'l5-text', 'l5-representation',
  'l6-brief', 'l6-examples', 'l6-select', 'l6-vector', 'l6-new-object', 'l6-dialog', 'l6-explanation', 'l6-install-features',
  'chapter-complete', 'chapter-teaser',
];

export function createSceneRegistry(scenes: Scene[]): Partial<SceneRegistry> {
  const registry: Partial<SceneRegistry> = {};
  for (const scene of scenes) {
    if (registry[scene.id]) throw new Error(`Duplicate scene id: ${scene.id}`);
    registry[scene.id] = scene;
  }
  return registry;
}

export function getScene(id: SceneId, registry: Partial<SceneRegistry>): Scene {
  const scene = registry[id];
  if (!scene) throw new Error(`Unknown scene id: ${id}`);
  return scene;
}
