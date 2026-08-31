import type { Locale, Messages } from './types';

export const messages: Record<Locale, Messages> = {
  ru: {
    program: 'CHAPTER 01 // INITIALIZATION',
    languageLabel: 'Выбор языка',
    title: 'ИССЛЕДОВАТЕЛЬСКАЯ СТАНЦИЯ',
    foundationReady: 'Входное ядро готово. Ожидание механизма решений.',
    monitorLabel: 'Физический монитор AI LAB',
    activeProgram: 'АКТИВНАЯ ПРОГРАММА',
    scene: 'СЦЕНА',
    power: 'ПИТАНИЕ',
    'status.locked': 'заблокировано',
    'status.discovered': 'обнаружено',
    'status.experimenting': 'исследуется',
    'status.installed': 'установлено',
    'status.mastered': 'освоено',
  },
  en: {
    program: 'CHAPTER 01 // INITIALIZATION',
    languageLabel: 'Language selection',
    title: 'RESEARCH STATION',
    foundationReady: 'Input core ready. Awaiting a decision mechanism.',
    monitorLabel: 'AI LAB physical monitor',
    activeProgram: 'ACTIVE PROGRAM',
    scene: 'SCENE',
    power: 'POWER',
    'status.locked': 'locked',
    'status.discovered': 'discovered',
    'status.experimenting': 'experimenting',
    'status.installed': 'installed',
    'status.mastered': 'mastered',
  },
};
