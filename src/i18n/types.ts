export type Locale = 'ru' | 'en';

export type MessageKey =
  | 'program'
  | 'languageLabel'
  | 'title'
  | 'foundationReady'
  | 'monitorLabel'
  | 'activeProgram'
  | 'scene'
  | 'power'
  | 'status.locked'
  | 'status.discovered'
  | 'status.experimenting'
  | 'status.installed'
  | 'status.mastered';

export type Messages = Record<MessageKey, string>;
