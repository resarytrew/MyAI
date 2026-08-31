import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { initializeApp } from './app/initializeApp';
import { I18nProvider } from './i18n/I18nProvider';
import { AppErrorBoundary } from './ui/errors/AppErrorBoundary';
import { PersistenceRecovery } from './ui/errors/PersistenceRecovery';
import './styles/tokens.css';
import './styles/global.css';
import './styles/crt.css';

initializeApp();

const root = document.getElementById('root');

if (!root) {
  throw new Error('AI LAB root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <AppErrorBoundary>
        <PersistenceRecovery>
          <App />
        </PersistenceRecovery>
      </AppErrorBoundary>
    </I18nProvider>
  </StrictMode>,
);
