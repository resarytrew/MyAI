import type { Scene, SceneSubmission } from '../../domain/journey/sceneTypes';
import { BootSequenceScene } from './BootSequenceScene';
import { ChapterScene } from './ChapterScene';

export function SceneRenderer({
  scene,
  onSubmit,
}: {
  scene: Scene;
  onSubmit: (submission: SceneSubmission) => void;
}) {
  if (scene.id === 'p0-power') {
    return <BootSequenceScene scene={scene} onSubmit={onSubmit} />;
  }

  return <ChapterScene scene={scene} onSubmit={onSubmit} />;
}
