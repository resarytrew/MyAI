import type { ReactNode } from 'react';
import styles from './TerminalPanel.module.css';

interface TerminalPanelProps {
  children: ReactNode;
  className?: string;
  label?: string;
}

export function TerminalPanel({ children, className, label }: TerminalPanelProps) {
  return (
    <section
      className={[styles.panel, className].filter(Boolean).join(' ')}
      aria-label={label}
    >
      {label ? <p className={styles.label} aria-hidden="true">{label}</p> : null}
      {children}
    </section>
  );
}
