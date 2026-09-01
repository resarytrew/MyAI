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
  const decimals = step < .01 ? 3 : step < 1 ? 2 : 1;

  return (
    <div className={styles.control}>
      <div className={styles.header}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{valueLabel ?? value.toFixed(decimals)}</output>
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
        <span>{min.toFixed(decimals)}</span>
        <span>{max.toFixed(decimals)}</span>
      </div>
    </div>
  );
}
