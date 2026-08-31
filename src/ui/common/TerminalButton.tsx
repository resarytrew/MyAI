import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './TerminalButton.module.css';

interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function TerminalButton({
  children,
  className,
  variant = 'primary',
  ...props
}: TerminalButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type="button" {...props}>
      <span aria-hidden="true">›</span>
      <span>{children}</span>
      <span aria-hidden="true">‹</span>
    </button>
  );
}
