import { computeLinearNeuron } from '../../domain/experiments';
import { useI18n } from '../../i18n/useI18n';
import { NumericSlider } from '../common/NumericSlider';
import styles from './Experiments.module.css';

const samples = [
  { x: 1, target: 3 },
  { x: 2, target: 5 },
  { x: 3, target: 7 },
];

export function BiasCalibrationView({
  bias,
  onBiasChange,
}: {
  bias: number;
  onBiasChange: (value: number) => void;
}) {
  const { locale } = useI18n();

  return (
    <div className={styles.experimentStack}>
      <div className={styles.sampleGrid} aria-live="polite">
        {samples.map(({ x, target }) => {
          const result = computeLinearNeuron({ x, weight: 2, bias, target });
          const matches = Math.abs(result.output - target) < 0.01;
          return (
            <article key={x} data-match={matches}>
              <span>x = {x}</span>
              <strong>{result.output.toFixed(1)}</strong>
              <small>{locale === 'ru' ? 'цель' : 'target'} {target}</small>
              <em>{matches ? '✓' : `${(result.error ?? 0) > 0 ? '+' : ''}${result.error?.toFixed(1)}`}</em>
            </article>
          );
        })}
      </div>
      <NumericSlider
        label={locale === 'ru' ? 'Смещение b' : 'Bias b'}
        value={bias}
        min={-2}
        max={2}
        step={0.1}
        onChange={onBiasChange}
      />
    </div>
  );
}
