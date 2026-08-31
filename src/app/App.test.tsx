import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../i18n/I18nProvider';
import { useJourneyStore } from '../state/useJourneyStore';
import { useMyAIStore } from '../state/useMyAIStore';
import { App } from './App';

describe('App foundation', () => {
  it('boots and switches between Russian and English', () => {
    useJourneyStore.getState().resetJourney();
    useMyAIStore.getState().resetMyAI();
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: 'ru-RU',
    });

    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    expect(screen.getByRole('heading', { name: 'AI LAB' })).toBeInTheDocument();
    expect(screen.getByText('Защищённый терминал отключён. Включи исследовательскую станцию.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByRole('heading', { name: 'AI LAB' })).toBeInTheDocument();
    expect(screen.getByText('The secure terminal is offline. Power on the research station.')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });
});
