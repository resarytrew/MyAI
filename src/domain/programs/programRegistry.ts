import type { LocalizedText } from '../journey/sceneTypes';

export type ProgramId =
  | 'BOOTLOADER'
  | 'SYSTEM DIAGNOSTICS'
  | 'DATA BENCH'
  | 'DECISION ENGINE'
  | 'ERROR ANALYZER'
  | 'NEURON FAB'
  | 'TEXT LAB'
  | 'EMBEDDING SPACE'
  | 'ATTENTION RIG'
  | 'BLOCK ASSEMBLY'
  | 'LM BENCH'
  | 'TRAINING CONSOLE'
  | 'ASSEMBLY BAY'
  | 'MY LLM TERMINAL'
  | 'KNOWLEDGE ARCHIVE'
  | 'RESEARCH LAB'
  | 'RESEARCH LOG'
  | 'CHAPTER COMPLETE';

export interface ProgramDefinition {
  id: ProgramId;
  label: LocalizedText;
  purpose: LocalizedText;
  access: number;
}

const text = (ru: string, en: string): LocalizedText => ({ ru, en });

const definitions: ProgramDefinition[] = [
  { id: 'BOOTLOADER', label: text('Загрузчик', 'Bootloader'), purpose: text('Запуск станции', 'Station startup'), access: 1 },
  { id: 'SYSTEM DIAGNOSTICS', label: text('Диагностика системы', 'System diagnostics'), purpose: text('Проверка MY AI', 'MY AI inspection'), access: 1 },
  { id: 'DATA BENCH', label: text('Стенд данных', 'Data bench'), purpose: text('Данные и представление', 'Data and representation'), access: 1 },
  { id: 'DECISION ENGINE', label: text('Механизм решений', 'Decision engine'), purpose: text('Правила, параметры и прогнозы', 'Rules, parameters, and predictions'), access: 2 },
  { id: 'ERROR ANALYZER', label: text('Анализатор ошибок', 'Error analyzer'), purpose: text('Ошибка, loss и gradient', 'Error, loss, and gradient'), access: 3 },
  { id: 'NEURON FAB', label: text('Фабрика нейронов', 'Neuron fab'), purpose: text('Нейроны и сети', 'Neurons and networks'), access: 4 },
  { id: 'TEXT LAB', label: text('Текстовая лаборатория', 'Text lab'), purpose: text('Токены и словарь', 'Tokens and vocabulary'), access: 5 },
  { id: 'EMBEDDING SPACE', label: text('Пространство представлений', 'Embedding space'), purpose: text('Векторный смысл', 'Vector meaning'), access: 5 },
  { id: 'ATTENTION RIG', label: text('Стенд внимания', 'Attention rig'), purpose: text('Позиции, Q/K/V и attention', 'Position, Q/K/V, and attention'), access: 6 },
  { id: 'BLOCK ASSEMBLY', label: text('Сборка блоков', 'Block assembly'), purpose: text('Transformer block', 'Transformer block'), access: 7 },
  { id: 'LM BENCH', label: text('Стенд языковой модели', 'LM bench'), purpose: text('Предсказание следующего токена', 'Next-token prediction'), access: 8 },
  { id: 'TRAINING CONSOLE', label: text('Консоль обучения', 'Training console'), purpose: text('Реальное обновление весов', 'Real weight updates'), access: 9 },
  { id: 'ASSEMBLY BAY', label: text('Сборочный отсек', 'Assembly bay'), purpose: text('Конфигурация собственной модели', 'Configure your own model'), access: 10 },
  { id: 'MY LLM TERMINAL', label: text('Терминал MY LLM', 'MY LLM terminal'), purpose: text('Генерация языка', 'Language generation'), access: 10 },
  { id: 'KNOWLEDGE ARCHIVE', label: text('Архив знаний', 'Knowledge archive'), purpose: text('Открытия и связи', 'Discoveries and relations'), access: 1 },
  { id: 'RESEARCH LAB', label: text('Исследовательская лаборатория', 'Research lab'), purpose: text('Свободные эксперименты', 'Free experiments'), access: 2 },
  { id: 'RESEARCH LOG', label: text('Журнал исследований', 'Research log'), purpose: text('Гипотезы, наблюдения и ошибки', 'Hypotheses, observations, and failures'), access: 1 },
  { id: 'CHAPTER COMPLETE', label: text('Сертификация', 'Certification'), purpose: text('Полевое испытание', 'Field test'), access: 1 },
];

export const PROGRAM_REGISTRY = Object.fromEntries(
  definitions.map((definition) => [definition.id, definition]),
) as Record<ProgramId, ProgramDefinition>;
