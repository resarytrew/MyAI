import type { DiscoveryScene as DiscoverySceneData } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { TerminalPanel } from '../common/TerminalPanel';
import { SceneLayout } from './SceneLayout';

export function DiscoveryScene({
  scene,
  onContinue,
}: {
  scene: DiscoverySceneData;
  onContinue: () => void;
}) {
  const { locale } = useI18n();

  return (
    <SceneLayout
      title={scene.content.heading[locale]}
      tone="success"
      actions={
        <TerminalButton onClick={onContinue}>
          {scene.content.actionLabel[locale]}
        </TerminalButton>
      }
    >
      <p>{scene.content.intuition[locale]}</p>
      {scene.content.formula ? (
        <TerminalPanel label={scene.title[locale]}>
          <code>{scene.content.formula}</code>
        </TerminalPanel>
      ) : null}
      <ul>
        {scene.content.keyPoints.map((point) => (
          <li key={point[locale]}>{point[locale]}</li>
        ))}
      </ul>
    </SceneLayout>
  );
}
