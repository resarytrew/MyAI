import { useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { clearAllPersistedLabState } from '../../state/persistence';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useMyAIStore } from '../../state/useMyAIStore';
import styles from './ResetLabButton.module.css';

export function resetLab(): void {
  useJourneyStore.getState().resetJourney();
  useMyAIStore.getState().resetMyAI();
  clearAllPersistedLabState();
}

export function ResetLabButton() {
  const { locale } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const ru = locale === 'ru';

  return (
    <button
      type="button"
      className={styles.reset}
      data-confirming={confirming}
      onBlur={() => setConfirming(false)}
      onClick={() => {
        if (!confirming) {
          setConfirming(true);
          return;
        }
        resetLab();
        setConfirming(false);
      }}
    >
      {confirming
        ? ru
          ? 'ПОДТВЕРДИТЬ СБРОС'
          : 'CONFIRM RESET'
        : 'RESET LAB'}
    </button>
  );
}
