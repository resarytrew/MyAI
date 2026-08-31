import type { ReactNode } from 'react';
import styles from './SceneLayout.module.css';

interface SceneLayoutProps {
  title: string;
  program?: string;
  children: ReactNode;
  actions?: ReactNode;
  tone?: 'boot' | 'neutral' | 'challenge' | 'success';
}

export function SceneLayout({
  title,
  program = 'AI LAB OS',
  children,
  actions,
  tone = 'neutral',
}: SceneLayoutProps) {
  return (
    <article className={styles.scene} data-tone={tone}>
      <header className={styles.sceneHeader}>
        <p className={styles.program}>{program}</p>
        <h1>{title}</h1>
      </header>
      <div className={styles.content}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </article>
  );
}
