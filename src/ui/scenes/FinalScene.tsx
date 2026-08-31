import type { SceneSubmission } from '../../domain/journey/sceneTypes';
import { useI18n } from '../../i18n/useI18n';
import { useJourneyStore } from '../../state/useJourneyStore';
import { TerminalPanel } from '../common/TerminalPanel';
import { SceneLayout } from './SceneLayout';
import styles from './SystemUpgradeScene.module.css';

export function FinalScene() {
  const { locale } = useI18n();
  const answer = useJourneyStore((state) => state.answers['p0-identity']) as SceneSubmission | undefined;
  const researcher = answer?.textValue || (locale === 'ru' ? 'ИССЛЕДОВАТЕЛЬ' : 'RESEARCHER');
  const ru = locale === 'ru';

  return (
    <SceneLayout title="CHAPTER 01 COMPLETE" program="RESEARCH LOG" tone="success">
      <p>{ru ? `${researcher}, входное ядро MY AI работает.` : `${researcher}, the MY AI input core is online.`}</p>
      <div className={styles.savedStatus} role="status">
        <span aria-hidden="true">●</span>
        <strong>{ru ? 'ПРОГРЕСС СОХРАНЁН' : 'PROGRESS SAVED'}</strong>
        <small>MY AI · BUILD 0.2</small>
      </div>
      <TerminalPanel label="RESEARCH LOG // CHAPTER 01">
        <p>{ru ? 'ВОПРОС: Как компьютер может работать с реальным миром?' : 'QUESTION: How can a computer work with the real world?'}</p>
        <p>DISCOVERIES: DATA · FEATURE · REPRESENTATION</p>
        <p>SYSTEM CHANGE: DATA ✓ · FEATURES ✓</p>
        <p>{ru ? 'ОТКРЫТЫЙ ВОПРОС: Как использовать признаки для решения?' : 'OPEN QUESTION: How can features be used to make a decision?'}</p>
      </TerminalPanel>
      <div className={styles.nextModule}>
        <TerminalPanel label={ru ? 'Следующая программа' : 'Next program'}>
          <p>CHAPTER 02 // DECISION ENGINE</p>
          <strong>{ru ? 'НАУЧИ МАШИНУ ПРИНИМАТЬ РЕШЕНИЕ' : 'TEACH THE MACHINE TO MAKE A DECISION'}</strong>
          <p>[ LOCKED ]</p>
        </TerminalPanel>
      </div>
    </SceneLayout>
  );
}
