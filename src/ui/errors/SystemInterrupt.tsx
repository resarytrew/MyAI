import { useI18n } from '../../i18n/useI18n';
import { TerminalButton } from '../common/TerminalButton';
import { SceneLayout } from '../scenes/SceneLayout';

export function SystemInterrupt({
  kind = 'runtime',
  onRetry,
  onResetCurrent,
  onResetLab,
}: {
  kind?: 'runtime' | 'persistence';
  onRetry?: () => void;
  onResetCurrent?: () => void;
  onResetLab: () => void;
}) {
  const { locale } = useI18n();
  const ru = locale === 'ru';
  const persistence = kind === 'persistence';

  return (
    <SceneLayout
      title="AI LAB // SYSTEM INTERRUPT"
      tone="challenge"
      actions={
        <>
          {onRetry ? (
            <TerminalButton onClick={onRetry}>
              {ru ? 'Повторить' : 'Retry'}
            </TerminalButton>
          ) : null}
          {onResetCurrent ? (
            <TerminalButton variant="secondary" onClick={onResetCurrent}>
              {ru ? 'Сбросить эксперимент' : 'Reset experiment'}
            </TerminalButton>
          ) : null}
          <TerminalButton variant="danger" onClick={onResetLab}>
            {ru ? 'Сбросить лабораторию' : 'Reset lab'}
          </TerminalButton>
        </>
      }
    >
      <p>
        {persistence
          ? ru
            ? 'Сохранение повреждено или создано другой версией. Лаборатория запущена в безопасном состоянии.'
            : 'The saved state is corrupt or belongs to another version. The lab started in a safe state.'
          : ru
            ? 'Эксперимент не удалось продолжить. Уже сохранённые открытия не удалены.'
            : 'The experiment could not continue. Previously saved discoveries were not removed.'}
      </p>
    </SceneLayout>
  );
}
