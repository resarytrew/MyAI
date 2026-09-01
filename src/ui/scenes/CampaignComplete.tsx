import { useI18n } from '../../i18n/useI18n';
import { useModelWorkshopStore } from '../../state/useModelWorkshopStore';
import { TerminalButton } from '../common/TerminalButton';
import { TerminalPanel } from '../common/TerminalPanel';
import { SceneLayout } from './SceneLayout';
import styles from './SystemUpgradeScene.module.css';

export function CampaignComplete({ onOpenResearch }: { onOpenResearch: () => void }) {
  const { locale } = useI18n();
  const checkpointId = useModelWorkshopStore((state) => state.checkpointId);
  const sample = useModelWorkshopStore((state) => state.latestSample);
  const ru = locale === 'ru';
  return <SceneLayout title="YOU BUILT A LANGUAGE MODEL." program="MY LLM TERMINAL" tone="success" actions={<TerminalButton onClick={onOpenResearch}>{ru ? 'Открыть Research Mode' : 'Open Research Mode'}</TerminalButton>}>
    <p>{ru ? 'PROJECT MY AI: COMPLETE. Собственная модель получила контекст, обновила weights и сгенерировала язык.' : 'PROJECT MY AI: COMPLETE. Your model received context, updated weights, and generated language.'}</p>
    <div className={styles.savedStatus} role="status"><span aria-hidden="true">●</span><strong>CAMPAIGN COMPLETE</strong><small>RESEARCH MODE // UNLOCKED</small></div>
    <TerminalPanel label="TRAINING COMPLETE"><p>CHECKPOINT SAVED</p><p>{checkpointId ?? 'my_llm_final'}</p><p>LANGUAGE GENERATED.</p></TerminalPanel>
    {sample ? <TerminalPanel label="FIRST SAMPLE"><p>{sample}</p></TerminalPanel> : null}
  </SceneLayout>;
}
