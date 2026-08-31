import { useState } from 'react';
import type { PredictionScene as PredictionSceneData } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { SceneLayout } from './SceneLayout';
import styles from './PredictionScene.module.css';

export function PredictionScene({
  scene,
  onSubmit,
}: {
  scene: PredictionSceneData;
  onSubmit: (optionId: string) => void;
}) {
  const { locale } = useI18n();
  const [selected, setSelected] = useState<string>();

  return (
    <SceneLayout
      title={scene.title[locale]}
      actions={
        <TerminalButton
          disabled={!selected}
          onClick={() => selected && onSubmit(selected)}
        >
          {scene.content.actionLabel[locale]}
        </TerminalButton>
      }
    >
      <fieldset className={styles.options}>
        <legend>{scene.content.question[locale]}</legend>
        {scene.content.options.map((option, index) => (
          <label key={option.id} className={styles.option}>
            <input
              type="radio"
              name={`prediction-${scene.id}`}
              value={option.id}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
            />
            <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
            <strong>{option.label[locale]}</strong>
          </label>
        ))}
      </fieldset>
    </SceneLayout>
  );
}
