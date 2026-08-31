import type { LocalizedText, Scene } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { ChapterVisual } from './ChapterVisual';
import { SceneLayout } from './SceneLayout';

export function SceneCompletionFeedback({
  scene,
  feedback,
  onContinue,
}: {
  scene: Scene;
  feedback: LocalizedText;
  answer?: unknown;
  onContinue: () => void;
}) {
  const { locale } = useI18n();
  return (
    <SceneLayout
      title={scene.title[locale]}
      program={scene.program}
      tone="success"
      actions={<TerminalButton onClick={onContinue}>{locale === 'ru' ? 'Продолжить' : 'Continue'}</TerminalButton>}
    >
      <p aria-live="polite">{feedback[locale]}</p>
      {scene.content.visual ? <ChapterVisual visual={scene.content.visual} /> : null}
    </SceneLayout>
  );
}
