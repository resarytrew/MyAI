import { useSyncExternalStore, type ReactNode } from 'react';
import {
  getPersistenceIssueCount,
  subscribePersistenceIssues,
} from '../../state/persistence';
import { resetLab } from '../common/ResetLabButton';
import { SystemInterrupt } from './SystemInterrupt';

export function PersistenceRecovery({ children }: { children: ReactNode }) {
  const issueCount = useSyncExternalStore(
    subscribePersistenceIssues,
    getPersistenceIssueCount,
    () => 0,
  );

  if (issueCount > 0) {
    return <SystemInterrupt kind="persistence" onResetLab={resetLab} />;
  }

  return children;
}
