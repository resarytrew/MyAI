import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createVersionedStorage } from './persistence';

export interface LabSettings {
  phosphor: 'off' | 'low' | 'normal';
  scanlines: boolean;
  sound: boolean;
  ambient: boolean;
  animations: 'full' | 'reduced';
  fontScale: 'normal' | 'large';
}

interface SettingsState extends LabSettings {
  updateSetting: <K extends keyof LabSettings>(key: K, value: LabSettings[K]) => void;
  resetSettings: () => void;
}

const defaults: LabSettings = {
  phosphor: 'normal', scanlines: true, sound: false, ambient: true, animations: 'full', fontScale: 'normal',
};

function validSettings(value: unknown): value is LabSettings {
  if (typeof value !== 'object' || value === null) return false;
  const settings = value as Partial<LabSettings>;
  return ['off', 'low', 'normal'].includes(settings.phosphor ?? '')
    && typeof settings.scanlines === 'boolean'
    && typeof settings.sound === 'boolean'
    && typeof settings.ambient === 'boolean'
    && ['full', 'reduced'].includes(settings.animations ?? '')
    && ['normal', 'large'].includes(settings.fontScale ?? '');
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      updateSetting: (key, value) => set({ [key]: value } as Pick<SettingsState, typeof key>),
      resetSettings: () => set(defaults),
    }),
    {
      name: 'ai-lab-settings',
      storage: createVersionedStorage('ai-lab-settings', validSettings, () => defaults),
      partialize: ({ phosphor, scanlines, sound, ambient, animations, fontScale }) => ({ phosphor, scanlines, sound, ambient, animations, fontScale }),
    },
  ),
);
