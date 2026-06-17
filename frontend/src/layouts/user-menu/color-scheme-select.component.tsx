'use client';

import { ColorSchemeMode, RadioButton } from '@sk-web-gui/react';
import { useLocalStorage } from '@utils/use-localstorage.hook';
import { Monitor, Moon, Sun } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface ColorSchemeOption {
  value: ColorSchemeMode;
  label: string;
  icon: ReactNode;
}

/**
 * Shared colour scheme state and the three selectable options (light/dark/system). The chosen value
 * is persisted in localStorage and fed to the GuiProvider in the app layout, so the whole app
 * re-themes. Used by both the desktop user menu (one menu row per option) and the mobile menu.
 */
export const useColorSchemeOptions = () => {
  const { t } = useTranslation('common');
  const colorScheme = useLocalStorage((state) => state.colorScheme);
  const setColorScheme = useLocalStorage((state) => state.setColorScheme);

  const options: ColorSchemeOption[] = [
    { value: ColorSchemeMode.Light, label: t('common:colorScheme.light'), icon: <Sun /> },
    { value: ColorSchemeMode.Dark, label: t('common:colorScheme.dark'), icon: <Moon /> },
    { value: ColorSchemeMode.System, label: t('common:colorScheme.system'), icon: <Monitor /> },
  ];

  return { colorScheme, setColorScheme, options };
};

/**
 * Self-contained colour scheme selector block. Used in the mobile menu modal, where it can render at
 * its natural height. The desktop user menu renders the same options as individual menu rows instead
 * (see user-menu.component), because popup menu items are fixed-height.
 */
export const ColorSchemeSelect = () => {
  const { t } = useTranslation('common');
  const { colorScheme, setColorScheme, options } = useColorSchemeOptions();

  return (
    <fieldset className="flex flex-col gap-8 w-full border-0 p-0 m-0">
      <legend className="text-small font-bold mb-8">{t('common:colorScheme.title')}</legend>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          name="color-scheme"
          value={option.value}
          checked={colorScheme === option.value}
          onChange={() => setColorScheme(option.value)}
        >
          <span className="inline-flex items-center gap-8">
            {option.icon}
            {option.label}
          </span>
        </RadioButton>
      ))}
    </fieldset>
  );
};
