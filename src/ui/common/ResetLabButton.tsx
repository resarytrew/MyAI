import { useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { clearAllPersistedLabState } from '../../state/persistence';
import { useJourneyStore } from '../../state/useJourneyStore';
import { useMyAIStore } from '../../state/useMyAIStore';
import { useResearchLogStore } from '../../state/useResearchLogStore';
import { useModelWorkshopStore } from '../../state/useModelWorkshopStore';
import { useSettingsStore } from '../../state/useSettingsStore';
import { clearActiveWorkshopModel } from '../../domain/models/modelWorkshop';
import { labDatabase } from '../../state/labDatabase';
import styles from './ResetLabButton.module.css';

export function resetLab(): void {
  useJourneyStore.getState().resetJourney();
  useMyAIStore.getState().resetMyAI();
  useResearchLogStore.getState().clearLog();
  useModelWorkshopStore.getState().resetWorkshop();
  useSettingsStore.getState().resetSettings();
  clearActiveWorkshopModel();
  clearAllPersistedLabState();
  void labDatabase.clearAll();
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
