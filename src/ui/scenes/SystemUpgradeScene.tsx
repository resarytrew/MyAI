import type { SystemUpgradeScene as SystemUpgradeSceneData } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { SceneLayout } from './SceneLayout';
import styles from './SystemUpgradeScene.module.css';

export function SystemUpgradeScene({
  scene,
  onContinue,
}: {
  scene: SystemUpgradeSceneData;
  onContinue: () => void;
}) {
  const { locale } = useI18n();
  const ru = locale === 'ru';

  return (
    <SceneLayout
      title={scene.title[locale]}
      tone="success"
      actions={
        <TerminalButton onClick={onContinue}>
          {scene.content.actionLabel[locale]}
        </TerminalButton>
      }
    >
      <section className={styles.upgrade} aria-live="polite">
        <header>
          <span className={styles.pulse} aria-hidden="true" />
          <span>{ru ? 'СИСТЕМНЫЙ ПАТЧ ПРИМЕНЁН' : 'SYSTEM PATCH APPLIED'}</span>
          <strong>PATCH 0.5</strong>
        </header>
        <div className={styles.capability}>
          <small>NEW CAPABILITY</small>
          <strong>FIRST TRAINABLE NEURON</strong>
          <p>{ru ? 'ДАННЫЕ → ПАРАМЕТРЫ → ОШИБКА → ОБУЧЕНИЕ' : 'DATA → PARAMETERS → ERROR → LEARNING'}</p>
        </div>
        <footer>
          <span>STATUS</span>
          <strong>SYSTEM ONLINE</strong>
        </footer>
      </section>
      <p className={styles.summary}>
        {ru
          ? 'Система записала пять базовых узлов: данные, признаки, параметры, нейрон и обучение.'
          : 'The system recorded five foundation nodes: data, features, parameters, neuron, and learning.'}
      </p>
    </SceneLayout>
  );
}
