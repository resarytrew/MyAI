import { useEffect, useMemo, useState } from 'react';
import { chapterOneJourney, chapterOneSceneRegistry } from '../domain/journey/chapterOneJourney';
import { completeScene } from '../domain/journey/sceneEngine';
import { getScene } from '../domain/journey/sceneRegistry';
import type { LocalizedText, SceneSubmission } from '../domain/journey/sceneTypes';
import { useJourneyStore } from '../state/useJourneyStore';
import { useMyAIStore } from '../state/useMyAIStore';
import { resetLab } from '../ui/common/ResetLabButton';
import { SystemInterrupt } from '../ui/errors/SystemInterrupt';
import { MonitorShell } from '../ui/monitor/MonitorShell';
import { FinalScene } from '../ui/scenes/FinalScene';
import { SceneCompletionFeedback } from '../ui/scenes/SceneCompletionFeedback';
import { SceneRenderer } from '../ui/scenes/SceneRenderer';

export function App() {
  const currentSceneId = useJourneyStore((state) => state.currentSceneId);
  const completedSceneIds = useJourneyStore((state) => state.completedSceneIds);
  const answers = useJourneyStore((state) => state.answers);
  const recordCompletion = useJourneyStore((state) => state.completeScene);
  const goToScene = useJourneyStore((state) => state.goToScene);
  const resetCurrentScene = useJourneyStore((state) => state.resetCurrentScene);
  const applyReward = useMyAIStore((state) => state.applyReward);
  const [feedback, setFeedback] = useState<LocalizedText>();
  const [runtimeError, setRuntimeError] = useState(false);

  const scene = useMemo(() => getScene(currentSceneId, chapterOneSceneRegistry), [currentSceneId]);
  const alreadyCompleted = completedSceneIds.includes(scene.id);

  useEffect(() => setFeedback(undefined), [scene.id]);

  const sceneFeedback = feedback ?? (alreadyCompleted ? scene.content.feedback : undefined);

  const handleSubmit = (submission: SceneSubmission) => {
    try {
      const result = completeScene(scene, submission, completedSceneIds);
      if (!result.accepted) {
        setFeedback(result.feedback);
        return;
      }

      result.rewards.forEach(applyReward);
      recordCompletion(scene.id, submission);

      if (result.feedback) {
        setFeedback(result.feedback);
      } else if (result.nextSceneId) {
        goToScene(result.nextSceneId);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('AI LAB scene interrupt', error);
      setRuntimeError(true);
    }
  };

  const sceneIndex = chapterOneJourney.findIndex(({ id }) => id === scene.id) + 1;

  return (
    <MonitorShell activeProgram={scene.program} sceneIndex={sceneIndex} sceneTotal={chapterOneJourney.length}>
      {runtimeError ? (
        <SystemInterrupt
          onRetry={() => setRuntimeError(false)}
          onResetCurrent={() => { resetCurrentScene(); setRuntimeError(false); }}
          onResetLab={resetLab}
        />
      ) : scene.id === 'chapter-teaser' && alreadyCompleted ? (
        <FinalScene />
      ) : sceneFeedback && alreadyCompleted ? (
        <SceneCompletionFeedback
          scene={scene}
          feedback={sceneFeedback}
          answer={answers[scene.id]}
          onContinue={() => { if (scene.nextSceneId) goToScene(scene.nextSceneId); }}
        />
      ) : (
        <SceneRenderer scene={scene} onSubmit={handleSubmit} />
      )}
    </MonitorShell>
  );
}
