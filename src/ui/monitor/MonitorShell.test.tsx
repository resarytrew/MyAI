import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n/I18nProvider';
import { useMyAIStore } from '../../state/useMyAIStore';
import { MonitorShell } from './MonitorShell';

describe('MonitorShell', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: 'ru-RU',
    });
    useMyAIStore.getState().resetMyAI();
  });

  it('keeps the full MY AI state visible at build 0.0', () => {
    render(
      <I18nProvider>
        <MonitorShell activeProgram="FIRST NEURON">
          <h1>BOOTLOADER</h1>
        </MonitorShell>
      </I18nProvider>,
    );

    expect(screen.getByRole('heading', { name: 'MY AI' })).toBeInTheDocument();
    expect(screen.getByText('BUILD 0.0')).toBeInTheDocument();
    expect(screen.getByText('LANGUAGE MODEL')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/OFFLINE/)).toHaveLength(8);
  });
});
