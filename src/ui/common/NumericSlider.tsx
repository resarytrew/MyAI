import { useId } from 'react';
import styles from './NumericSlider.module.css';

interface NumericSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueLabel?: string;
}

export function NumericSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueLabel,
}: NumericSliderProps) {
  const id = useId();

  return (
    <div className={styles.control}>
      <div className={styles.header}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{valueLabel ?? value.toFixed(1)}</output>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
      <div className={styles.range} aria-hidden="true">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}
