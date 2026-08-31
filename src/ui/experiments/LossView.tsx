import { useState } from 'react';
import { computeLinearNeuron } from '../../domain/experiments';
import { useI18n } from '../../i18n/useI18n';
import styles from './Experiments.module.css';

type CandidateId = 'difference' | 'absolute' | 'squared';

const axisX = (value: number) => 42 + (value / 6) * 636;

export function LossView({
  x = 2,
  weight = 1.5,
  bias = 0,
  target = 5,
}: {
  x?: number;
  weight?: number;
  bias?: number;
  target?: number;
}) {
  const { locale } = useI18n();
  const [selected, setSelected] = useState<CandidateId>('squared');
  const result = computeLinearNeuron({ x, weight, bias, target });
  const prediction = result.output;
  const error = result.error ?? 0;
  const loss = result.loss ?? 0;
  const ru = locale === 'ru';
  const candidates: Array<{
    id: CandidateId;
    label: string;
    formula: string;
    value: number;
    verdict: string;
    note: string;
  }> = [
    {
      id: 'difference',
      label: ru ? 'РАЗНОСТЬ' : 'DIFFERENCE',
      formula: 'prediction − target',
      value: error,
      verdict: ru ? 'ЗНАК ЕСТЬ' : 'SIGNED',
      note: ru
        ? 'Показывает направление ошибки, но положительные и отрицательные промахи могут взаимно уничтожиться.'
        : 'Shows error direction, but positive and negative misses can cancel each other out.',
    },
    {
      id: 'absolute',
      label: ru ? 'МОДУЛЬ' : 'ABSOLUTE',
      formula: '|prediction − target|',
      value: Math.abs(error),
      verdict: ru ? 'ПОЧТИ' : 'ALMOST',
      note: ru
        ? 'Всегда неотрицателен, но большие и малые ошибки растут одинаково линейно.'
        : 'Always non-negative, but large and small errors still grow at the same linear rate.',
    },
    {
      id: 'squared',
      label: ru ? 'КВАДРАТ' : 'SQUARED',
      formula: '(prediction − target)²',
      value: loss,
      verdict: ru ? 'ПРИНЯТО' : 'ACCEPTED',
      note: ru
        ? 'Неотрицателен и сильнее штрафует большие промахи. Это функция потерь для нашего нейрона.'
        : 'Non-negative and penalizes large misses more strongly. This is our neuron loss function.',
    },
  ];
  const activeCandidate = candidates.find(({ id }) => id === selected) ?? candidates[2];

  return (
    <div className={styles.lossView} aria-live="polite">
      <svg
        className={styles.numberLine}
        viewBox="0 0 720 124"
        role="img"
        aria-label={
          ru
            ? `Числовая ось: предсказание ${prediction}, цель ${target}, разрыв ${Math.abs(error)}`
            : `Number line: prediction ${prediction}, target ${target}, gap ${Math.abs(error)}`
        }
      >
        <rect
          className={styles.errorGap}
          x={axisX(Math.min(prediction, target))}
          y="60"
          width={axisX(Math.max(prediction, target)) - axisX(Math.min(prediction, target))}
          height="10"
          rx="5"
        />
        <line className={styles.numberAxis} x1="42" y1="65" x2="678" y2="65" />
        {Array.from({ length: 7 }, (_, tick) => (
          <g key={tick}>
            <line className={styles.numberTick} x1={axisX(tick)} y1="59" x2={axisX(tick)} y2="72" />
            <text className={styles.numberTickLabel} x={axisX(tick)} y="94" textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        <circle className={styles.predictionMarker} cx={axisX(prediction)} cy="65" r="7" />
        <text className={styles.predictionLabel} x={axisX(prediction)} y="35" textAnchor="middle">
          PREDICTION {prediction}
        </text>
        <circle className={styles.targetMarker} cx={axisX(target)} cy="65" r="7" />
        <text className={styles.targetLabel} x={axisX(target)} y="35" textAnchor="middle">
          TARGET {target}
        </text>
        <text className={styles.gapLabel} x={(axisX(prediction) + axisX(target)) / 2} y="118" textAnchor="middle">
          {ru ? 'РАЗРЫВ' : 'GAP'}: {Math.abs(error)}
        </text>
      </svg>

      <div className={styles.lossComparison}>
        <div>
          <span>{ru ? 'ПРЕДСКАЗАНИЕ' : 'PREDICTION'}</span>
          <strong>{prediction.toFixed(0)}</strong>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <span>{ru ? 'ЦЕЛЬ' : 'TARGET'}</span>
          <strong>{target.toFixed(0)}</strong>
        </div>
      </div>

      <div className={styles.lossCandidates} role="group" aria-label={ru ? 'Способы измерить ошибку' : 'Ways to measure error'}>
        {candidates.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            className={styles.lossCandidate}
            data-selected={candidate.id === selected}
            data-best={candidate.id === 'squared'}
            aria-pressed={candidate.id === selected}
            onClick={() => setSelected(candidate.id)}
          >
            <span>{candidate.label}</span>
            <code>{candidate.formula}</code>
            <strong>{candidate.value}</strong>
            <small>{candidate.verdict}</small>
          </button>
        ))}
      </div>

      <div className={styles.lossNote} data-best={selected === 'squared'}>
        <strong>{activeCandidate?.label}</strong>
        <p>{activeCandidate?.note}</p>
      </div>

      <div className={styles.formulaSteps}>
        <p>error = {prediction.toFixed(0)} - {target.toFixed(0)} = <strong>{error}</strong></p>
        <p>loss = error² = <strong>{loss}</strong></p>
      </div>
    </div>
  );
}
