import type { Scene, SceneSubmission } from '../../domain/journey/sceneTypes';
import { ChapterScene } from './ChapterScene';

export function SceneRenderer({
  scene,
  onSubmit,
}: {
  scene: Scene;
  onSubmit: (submission: SceneSubmission) => void;
}) {
  return <ChapterScene scene={scene} onSubmit={onSubmit} />;
}
