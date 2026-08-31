import { useState } from 'react';
import {
  applyGradientStep,
  computeLinearGradients,
  computeLinearNeuron,
} from '../../domain/experiments';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import styles from './Experiments.module.css';

export interface GradientStepSnapshot {
  beforeLoss: number;
  afterLoss: number;
  weight: number;
  bias: number;
}

export function GradientStepView({
  onStep,
  initialSnapshot,
}: {
  onStep?: (snapshot: GradientStepSnapshot) => void;
  initialSnapshot?: GradientStepSnapshot;
}) {
  const { locale } = useI18n();
  const [snapshot, setSnapshot] = useState<GradientStepSnapshot | undefined>(
    initialSnapshot,
  );
  const gradient = computeLinearGradients({
    x: 2,
    weight: 1.5,
    bias: 0,
    target: 5,
  });

  const performStep = () => {
    const updated = applyGradientStep(
      1.5,
      0,
      gradient.dLossDWeight,
      gradient.dLossDBias,
      0.05,
    );
    const after = computeLinearNeuron({
      x: 2,
      weight: updated.weight,
      bias: updated.bias,
      target: 5,
    });
    const nextSnapshot = {
      beforeLoss: gradient.loss,
      afterLoss: after.loss ?? Number.NaN,
      weight: updated.weight,
      bias: updated.bias,
    };
    setSnapshot(nextSnapshot);
    onStep?.(nextSnapshot);
  };

  return (
    <div className={styles.gradientView}>
      <dl className={styles.gradientReadout}>
        <div><dt>dL/dw</dt><dd>{gradient.dLossDWeight}</dd></div>
        <div><dt>dL/db</dt><dd>{gradient.dLossDBias}</dd></div>
        <div><dt>{locale === 'ru' ? 'темп' : 'rate'}</dt><dd>0.05</dd></div>
      </dl>

      <div className={styles.gradientEquation}>
        <span>w′ = w − η · dL/dw</span>
        <strong>1.5 − 0.05 · ({gradient.dLossDWeight}) = 1.9</strong>
        <span>b′ = b − η · dL/db</span>
        <strong>0 − 0.05 · ({gradient.dLossDBias}) = 0.2</strong>
      </div>

      {snapshot ? (
        <div className={styles.gradientResult} aria-live="polite">
          <div className={styles.beforeAfterTable}>
            <span />
            <span>{locale === 'ru' ? 'БЫЛО' : 'BEFORE'}</span>
            <span>{locale === 'ru' ? 'СТАЛО' : 'AFTER'}</span>

            <strong>w</strong><span>1.50</span><b>{snapshot.weight.toFixed(2)}</b>
            <strong>b</strong><span>0.00</span><b>{snapshot.bias.toFixed(2)}</b>
            <strong>prediction</strong><span>3.00</span><b>4.00</b>
            <strong>loss</strong><span>{snapshot.beforeLoss.toFixed(2)}</span><b>{snapshot.afterLoss.toFixed(2)}</b>
          </div>
          <p className={styles.learningInsight}>
            <span aria-hidden="true">↓</span>{' '}
            {locale === 'ru'
              ? `Loss снизился с ${snapshot.beforeLoss} до ${snapshot.afterLoss}. Параметры изменились по правилу, а не случайно.`
              : `Loss fell from ${snapshot.beforeLoss} to ${snapshot.afterLoss}. The parameters changed by a rule, not by chance.`}
          </p>
        </div>
      ) : (
        <TerminalButton onClick={performStep}>
          {locale === 'ru' ? 'Сделать шаг обучения' : 'Run learning step'}
        </TerminalButton>
      )}
    </div>
  );
}
