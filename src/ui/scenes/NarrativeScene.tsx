import type { NarrativeScene as NarrativeSceneData } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { LinearNeuronView } from '../experiments/LinearNeuronView';
import { SceneLayout } from './SceneLayout';

export function NarrativeScene({
  scene,
  onContinue,
}: {
  scene: NarrativeSceneData;
  onContinue: () => void;
}) {
  const { locale } = useI18n();

  return (
    <SceneLayout
      title={scene.title[locale]}
      tone={scene.content.tone}
      actions={
        <TerminalButton onClick={onContinue}>
          {scene.content.actionLabel[locale]}
        </TerminalButton>
      }
    >
      <p>{scene.content.body[locale]}</p>
      {scene.id === 'build-neuron' ? (
        <LinearNeuronView x={2} weight={2} bias={1} target={5} interactive />
      ) : null}
    </SceneLayout>
  );
}
