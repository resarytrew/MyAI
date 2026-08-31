import { useMemo, useState } from 'react';
import { computeLinearNeuron } from '../../domain/experiments';
import type { SliderExperimentScene as SliderExperimentSceneData } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { NumericSlider } from '../common/NumericSlider';
import { TerminalButton } from '../common/TerminalButton';
import { BiasCalibrationView } from '../experiments/BiasCalibrationView';
import { GradientStepView } from '../experiments/GradientStepView';
import { LinearNeuronView } from '../experiments/LinearNeuronView';
import { SceneLayout } from './SceneLayout';

export function SliderExperimentScene({
  scene,
  onSubmit,
}: {
  scene: SliderExperimentSceneData;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const { locale } = useI18n();
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        scene.content.controls.map((control) => [control.id, control.initialValue]),
      ) as Record<string, number>,
    [scene.content.controls],
  );
  const [values, setValues] = useState(initialValues);

  if (scene.content.experimentId === 'weight-calibration') {
    const weight = values.weight ?? 0;
    const result = computeLinearNeuron({ x: 2, weight, bias: 0 });
    return (
      <SceneLayout
        title={scene.title[locale]}
        tone="challenge"
        actions={
          <TerminalButton
            onClick={() => onSubmit({ weight, output: result.output })}
          >
            {scene.content.actionLabel[locale]}
          </TerminalButton>
        }
      >
        <p>{scene.content.instructions[locale]}</p>
        <LinearNeuronView x={2} weight={weight} bias={0} target={5} />
        <NumericSlider
          label={scene.content.controls[0]?.label[locale] ?? 'weight'}
          value={weight}
          min={0}
          max={4}
          step={0.1}
          onChange={(value) => setValues({ weight: value })}
        />
      </SceneLayout>
    );
  }

  if (scene.content.experimentId === 'bias-calibration') {
    const bias = values.bias ?? 0;
    const errors = [1, 2, 3].map((x) => {
      const target = x * 2 + 1;
      return Math.abs(
        computeLinearNeuron({ x, weight: 2, bias, target }).error ?? Infinity,
      );
    });
    const maxError = Math.max(...errors);
    return (
      <SceneLayout
        title={scene.title[locale]}
        tone="challenge"
        actions={
          <TerminalButton onClick={() => onSubmit({ bias, maxError })}>
            {scene.content.actionLabel[locale]}
          </TerminalButton>
        }
      >
        <p>{scene.content.instructions[locale]}</p>
        <BiasCalibrationView
          bias={bias}
          onBiasChange={(value) => setValues({ bias: value })}
        />
      </SceneLayout>
    );
  }

  if (scene.content.experimentId === 'gradient-step') {
    return (
      <SceneLayout title={scene.title[locale]} tone="challenge">
        <p>{scene.content.instructions[locale]}</p>
        <GradientStepView onStep={(snapshot) => onSubmit(snapshot)} />
      </SceneLayout>
    );
  }

  return (
    <SceneLayout
      title={scene.title[locale]}
      tone="challenge"
      actions={
        <TerminalButton onClick={() => onSubmit(values)}>
          {scene.content.actionLabel[locale]}
        </TerminalButton>
      }
    >
      <p>{scene.content.instructions[locale]}</p>
      {scene.content.controls.map((control) => (
        <NumericSlider
          key={control.id}
          label={control.label[locale]}
          value={values[control.id] ?? control.initialValue}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={(value) =>
            setValues((current) => ({ ...current, [control.id]: value }))
          }
        />
      ))}
    </SceneLayout>
  );
}
