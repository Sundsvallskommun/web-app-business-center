import { LocalStorage } from '@interfaces/localstorage';
import { ColorSchemeMode } from '@sk-web-gui/react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Persisted client store for the chosen colour scheme. The value is read by the GuiProvider in the
 * app layout, so changing it re-themes the whole app, and it survives reloads via localStorage.
 */
export const useLocalStorage = create(
  persist<LocalStorage>(
    (set) => ({
      colorScheme: ColorSchemeMode.System,
      setColorScheme: (colorScheme) => set(() => ({ colorScheme })),
    }),
    {
      name: `${process.env.NEXT_PUBLIC_APP_NAME}-store`,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
