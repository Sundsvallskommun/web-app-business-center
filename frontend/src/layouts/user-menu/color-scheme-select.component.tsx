'use client';

import { ColorSchemeMode, RadioButton } from '@sk-web-gui/react';
import { useLocalStorage } from '@utils/use-localstorage.hook';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Light/dark/system colour scheme selector. The chosen mode is persisted in localStorage and fed to
 * the GuiProvider in the app layout, so the whole app re-themes. Rendered in both the desktop user
 * menu and the mobile menu.
 */
export const ColorSchemeSelect = () => {
  const { t } = useTranslation('common');
  const colorScheme = useLocalStorage((state) => state.colorScheme);
  const setColorScheme = useLocalStorage((state) => state.setColorScheme);

  const options = [
    { value: ColorSchemeMode.Light, label: t('common:colorScheme.light'), icon: <Sun /> },
    { value: ColorSchemeMode.Dark, label: t('common:colorScheme.dark'), icon: <Moon /> },
    { value: ColorSchemeMode.System, label: t('common:colorScheme.system'), icon: <Monitor /> },
  ];

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
