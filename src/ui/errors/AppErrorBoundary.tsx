import type { ReactNode } from 'react';
import { resetLab } from '../common/ResetLabButton';
import { DomainErrorBoundary } from './DomainErrorBoundary';
import { SystemInterrupt } from './SystemInterrupt';

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <DomainErrorBoundary
      fallback={(retry) => (
        <SystemInterrupt onRetry={retry} onResetLab={resetLab} />
      )}
    >
      {children}
    </DomainErrorBoundary>
  );
}
