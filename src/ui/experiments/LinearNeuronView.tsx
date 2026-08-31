import { motion, useReducedMotion } from 'framer-motion';
import { useState, type KeyboardEvent } from 'react';
import { computeLinearNeuron } from '../../domain/experiments';
import { useI18n } from '../../i18n/useI18n';
import styles from './Experiments.module.css';

type NeuronPart = 'input' | 'weight' | 'bias' | 'sum' | 'output';

const explanation: Record<NeuronPart, { ru: string; en: string }> = {
  input: {
    ru: 'Вход x передаёт числовой признак.',
    en: 'Input x carries a numerical feature.',
  },
  weight: {
    ru: 'Вес w задаёт силу влияния входа.',
    en: 'Weight w controls the input influence.',
  },
  bias: {
    ru: 'Смещение b сдвигает результат.',
    en: 'Bias b shifts the result.',
  },
  sum: {
    ru: 'Сумматор объединяет взвешенный вход и смещение.',
    en: 'The sum combines the weighted input and bias.',
  },
  output: {
    ru: 'Выход y является предсказанием нейрона.',
    en: 'Output y is the neuron prediction.',
  },
};

interface LinearNeuronViewProps {
  x: number;
  weight: number;
  bias: number;
  target?: number;
  interactive?: boolean;
}

export function LinearNeuronView({
  x,
  weight,
  bias,
  target,
  interactive = false,
}: LinearNeuronViewProps) {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const [activePart, setActivePart] = useState<NeuronPart>('input');
  const result = computeLinearNeuron({
    x,
    weight,
    bias,
    ...(target === undefined ? {} : { target }),
  });

  const selectPart = (part: NeuronPart) => {
    if (interactive) setActivePart(part);
  };

  const onKeyDown = (event: KeyboardEvent<SVGGElement>, part: NeuronPart) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPart(part);
    }
  };

  return (
    <div className={styles.neuronView}>
      <svg
        className={styles.neuronDiagram}
        viewBox="0 0 720 260"
        role="img"
        aria-label={
          locale === 'ru'
            ? 'Схема линейного нейрона: вход, вес, смещение и выход'
            : 'Linear neuron diagram: input, weight, bias and output'
        }
      >
        <defs>
          <marker
            id="neuron-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0 0L8 4L0 8Z" fill="currentColor" />
          </marker>
        </defs>

        <motion.path
          className={styles.signalPath}
          d="M108 98H238M326 98H442M522 98H640M482 196V140"
          markerEnd="url(#neuron-arrow)"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: 'easeOut' }}
        />

        <g
          className={styles.diagramNode}
          data-active={activePart === 'input'}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={() => selectPart('input')}
          onKeyDown={(event) => onKeyDown(event, 'input')}
          aria-label={interactive ? explanation.input[locale] : undefined}
        >
          <circle cx="68" cy="98" r="40" />
          <text x="68" y="91">INPUT</text>
          <text x="68" y="115">x = {x.toFixed(1)}</text>
        </g>

        <g
          className={styles.diagramNode}
          data-active={activePart === 'weight'}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={() => selectPart('weight')}
          onKeyDown={(event) => onKeyDown(event, 'weight')}
          aria-label={interactive ? explanation.weight[locale] : undefined}
        >
          <rect x="238" y="58" width="88" height="80" rx="8" />
          <text x="282" y="91">× WEIGHT</text>
          <text x="282" y="115">w = {weight.toFixed(1)}</text>
        </g>

        <g
          className={styles.diagramNode}
          data-active={activePart === 'sum'}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={() => selectPart('sum')}
          onKeyDown={(event) => onKeyDown(event, 'sum')}
          aria-label={interactive ? explanation.sum[locale] : undefined}
        >
          <circle cx="482" cy="98" r="40" />
          <text x="482" y="108" className={styles.sumSymbol}>Σ</text>
        </g>

        <g
          className={styles.diagramNode}
          data-active={activePart === 'bias'}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={() => selectPart('bias')}
          onKeyDown={(event) => onKeyDown(event, 'bias')}
          aria-label={interactive ? explanation.bias[locale] : undefined}
        >
          <rect x="438" y="176" width="88" height="54" rx="8" />
          <text x="482" y="199">+ BIAS</text>
          <text x="482" y="218">b = {bias.toFixed(1)}</text>
        </g>

        <g
          className={styles.diagramNode}
          data-active={activePart === 'output'}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={() => selectPart('output')}
          onKeyDown={(event) => onKeyDown(event, 'output')}
          aria-label={interactive ? explanation.output[locale] : undefined}
        >
          <circle cx="680" cy="98" r="38" />
          <text x="680" y="91">OUTPUT</text>
          <text x="680" y="115">y = {result.output.toFixed(1)}</text>
        </g>
      </svg>

      {interactive ? (
        <p className={styles.explanation} aria-live="polite">
          {explanation[activePart][locale]}
        </p>
      ) : null}

      <dl className={styles.readout}>
        <div><dt>x</dt><dd>{x.toFixed(1)}</dd></div>
        <div><dt>w</dt><dd>{weight.toFixed(1)}</dd></div>
        <div><dt>b</dt><dd>{bias.toFixed(1)}</dd></div>
        <div><dt>{locale === 'ru' ? 'выход' : 'output'}</dt><dd>{result.output.toFixed(1)}</dd></div>
        {target === undefined ? null : (
          <div><dt>{locale === 'ru' ? 'цель' : 'target'}</dt><dd>{target.toFixed(1)}</dd></div>
        )}
      </dl>
    </div>
  );
}
