import { Archive, Flask, ListChecks, Path, Robot, SlidersHorizontal } from '@phosphor-icons/react';
import { useI18n } from '../../i18n/useI18n';
import styles from './WorkspaceNavigation.module.css';

export type WorkspaceId = 'journey' | 'my-ai' | 'archive' | 'log' | 'lab' | 'settings';

const items = [
  { id: 'journey', icon: Path, ru: 'МАРШРУТ', en: 'JOURNEY' },
  { id: 'my-ai', icon: Robot, ru: 'MY AI', en: 'MY AI' },
  { id: 'archive', icon: Archive, ru: 'ЗНАНИЯ', en: 'ARCHIVE' },
  { id: 'log', icon: ListChecks, ru: 'ЖУРНАЛ', en: 'LOG' },
  { id: 'lab', icon: Flask, ru: 'ЛАБ.', en: 'LAB' },
  { id: 'settings', icon: SlidersHorizontal, ru: 'НАСТР.', en: 'SETTINGS' },
] as const;

export function WorkspaceNavigation({ active, labUnlocked, onChange }: { active: WorkspaceId; labUnlocked: boolean; onChange: (id: WorkspaceId) => void }) {
  const { locale } = useI18n();
  return <nav className={styles.navigation} aria-label={locale === 'ru' ? 'Программы AI LAB' : 'AI LAB programs'}>
    {items.map(({ id, icon: Icon, ru, en }) => <button
      key={id}
      type="button"
      aria-current={active === id ? 'page' : undefined}
      disabled={id === 'lab' && !labUnlocked}
      title={id === 'lab' && !labUnlocked ? (locale === 'ru' ? 'Установи первый модуль' : 'Install the first module') : undefined}
      onClick={() => onChange(id)}
    ><Icon aria-hidden="true" size={15} weight="light" /><span>{locale === 'ru' ? ru : en}</span></button>)}
  </nav>;
}
