import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { getChapterByScene } from '../domain/campaign/campaignCatalog';
import { campaignJourney, campaignSceneRegistry } from '../domain/journey/campaignJourney';
import { completeScene } from '../domain/journey/sceneEngine';
import { getScene } from '../domain/journey/sceneRegistry';
import type { LocalizedText, SceneSubmission } from '../domain/journey/sceneTypes';
import { deriveBuildVersion } from '../domain/my-ai/selectors';
import { useJourneyStore } from '../state/useJourneyStore';
import { useMyAIStore } from '../state/useMyAIStore';
import { useResearchLogStore } from '../state/useResearchLogStore';
import { resetLab } from '../ui/common/ResetLabButton';
import { SystemInterrupt } from '../ui/errors/SystemInterrupt';
import { MonitorShell } from '../ui/monitor/MonitorShell';
import { WorkspaceNavigation, type WorkspaceId } from '../ui/programs/WorkspaceNavigation';
import { CampaignComplete } from '../ui/scenes/CampaignComplete';
import { SceneCompletionFeedback } from '../ui/scenes/SceneCompletionFeedback';
import { SceneRenderer } from '../ui/scenes/SceneRenderer';

const ResearchLog = lazy(() => import('../ui/journal/ResearchLog').then((module) => ({ default: module.ResearchLog })));
const KnowledgeArchive = lazy(() => import('../ui/knowledge/KnowledgeArchive').then((module) => ({ default: module.KnowledgeArchive })));
const MyAIWorkbench = lazy(() => import('../ui/my-ai/MyAIWorkbench').then((module) => ({ default: module.MyAIWorkbench })));
const ResearchLab = lazy(() => import('../ui/research/ResearchLab').then((module) => ({ default: module.ResearchLab })));

const workspacePrograms: Partial<Record<WorkspaceId, string>> = {
  'my-ai': 'SYSTEM DIAGNOSTICS', archive: 'KNOWLEDGE ARCHIVE', log: 'RESEARCH LOG', lab: 'RESEARCH LAB', settings: 'RESEARCH LAB',
};

export function App() {
  const currentSceneId = useJourneyStore((state) => state.currentSceneId);
  const completedSceneIds = useJourneyStore((state) => state.completedSceneIds);
  const answers = useJourneyStore((state) => state.answers);
  const recordCompletion = useJourneyStore((state) => state.completeScene);
  const goToScene = useJourneyStore((state) => state.goToScene);
  const resetCurrentScene = useJourneyStore((state) => state.resetCurrentScene);
  const applyReward = useMyAIStore((state) => state.applyReward);
  const modules = useMyAIStore((state) => state.modules);
  const recordScene = useResearchLogStore((state) => state.recordScene);
  const recordFailure = useResearchLogStore((state) => state.recordFailure);
  const [feedback, setFeedback] = useState<LocalizedText>();
  const [runtimeError, setRuntimeError] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceId>('journey');

  const scene = useMemo(() => getScene(currentSceneId, campaignSceneRegistry), [currentSceneId]);
  const chapter = useMemo(() => getChapterByScene(scene.id), [scene.id]);
  const alreadyCompleted = completedSceneIds.includes(scene.id);
  const sceneFeedback = feedback ?? (alreadyCompleted ? scene.content.feedback : undefined);
  const sceneIndex = campaignJourney.findIndex(({ id }) => id === scene.id) + 1;
  const levelIndex = Math.max(0, chapter.levels.findIndex((level) => level.sceneIds.includes(scene.id)));
  const labUnlocked = deriveBuildVersion(modules) !== '0.0';
  const finalComplete = completedSceneIds.includes('c10-complete');

  useEffect(() => setFeedback(undefined), [scene.id]);

  const handleSubmit = (submission: SceneSubmission) => {
    try {
      const result = completeScene(scene, submission, completedSceneIds);
      if (!result.accepted) {
        setFeedback(result.feedback);
        recordFailure(scene, result.feedback?.ru ?? 'Activity validation failed.');
        return;
      }
      result.rewards.forEach(applyReward);
      recordScene(scene, submission, result.rewards);
      recordCompletion(scene.id, submission);
      if (result.feedback) setFeedback(result.feedback);
      else if (result.nextSceneId) goToScene(result.nextSceneId);
    } catch (error) {
      if (import.meta.env.DEV) console.error('AI LAB scene interrupt', error);
      setRuntimeError(true);
    }
  };

  const replay = (sceneId: string) => {
    goToScene(sceneId);
    setWorkspace('journey');
  };

  const activeProgram = workspacePrograms[workspace] ?? scene.program;
  const renderWorkspace = () => {
    if (workspace === 'my-ai') return <MyAIWorkbench />;
    if (workspace === 'archive') return <KnowledgeArchive onReplay={replay} />;
    if (workspace === 'log') return <ResearchLog />;
    if (workspace === 'lab' || workspace === 'settings') return <ResearchLab initialTab={workspace === 'settings' ? 'settings' : 'workbench'} />;
    if (runtimeError) return <SystemInterrupt onRetry={() => setRuntimeError(false)} onResetCurrent={() => { resetCurrentScene(); setRuntimeError(false); }} onResetLab={resetLab} />;
    if (scene.id === 'c10-complete' && alreadyCompleted) return <CampaignComplete onOpenResearch={() => setWorkspace('lab')} />;
    if (sceneFeedback && alreadyCompleted) return <SceneCompletionFeedback scene={scene} feedback={sceneFeedback} answer={answers[scene.id]} onContinue={() => { if (scene.nextSceneId) goToScene(scene.nextSceneId); }} />;
    return <SceneRenderer scene={scene} onSubmit={handleSubmit} />;
  };

  return <MonitorShell
    activeProgram={activeProgram}
    sceneIndex={sceneIndex}
    sceneTotal={campaignJourney.length}
    chapterNumber={chapter.number}
    chapterCode={chapter.code}
    levelLabel={`LEVEL ${String(levelIndex + 1).padStart(2, '0')} / ${String(chapter.levels.length).padStart(2, '0')}`}
    focusMode={workspace === 'journey' && Boolean(scene.content.lab)}
  >
    <WorkspaceNavigation active={workspace} labUnlocked={labUnlocked || finalComplete} onChange={setWorkspace} />
    <Suspense fallback={<p role="status">LOADING PROGRAM…</p>}>{renderWorkspace()}</Suspense>
  </MonitorShell>;
}
