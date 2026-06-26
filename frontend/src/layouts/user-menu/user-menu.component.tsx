import { Button, Divider, Icon, PopupMenu, RadioButton } from '@sk-web-gui/react';
import { ArrowRight, ChevronDown, LogOut, User2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { RepresentingMode } from '../../interfaces/app';
import { titleCase } from '../../utils/title-caser';
import { useAppContext } from '../../contexts/app.context';
import { useColorSchemeOptions } from './color-scheme-select.component';

export const UserMenu = () => {
  const { t } = useTranslation('common');

  const router = useRouter();
  const { representingMode, representingName: representingLabel } = useAppContext();
  const { colorScheme, setColorScheme, options: colorSchemeOptions } = useColorSchemeOptions();

  return (
    <div className="flex" data-cy="user-menu">
      <div className="relative">
        <PopupMenu align="end">
          <PopupMenu.Button
            variant="ghost"
            className="!w-full !max-w-max !min-w-min"
            size="md"
            iconButton
            rounded
            showBackground={false}
          >
            <div className="flex gap-12 items-center">
              <div className="flex items-center justify-center rounded-[1000px] min-w-[40px] h-[40px] bg-vattjom-background-200">
                <Icon icon={<User2 />} />
              </div>
              <span>
                {representingMode === RepresentingMode.PRIVATE ? titleCase(representingLabel) : representingLabel}
              </span>
              <Icon icon={<ChevronDown />} />
            </div>
          </PopupMenu.Button>
          <PopupMenu.Panel className="w-[300px] z-50">
            <PopupMenu.Items>
              <PopupMenu.Item>
                <Button
                  className="!justify-between"
                  onClick={() => {
                    router.push('profil');
                  }}
                  data-cy="user-menu-profile-button"
                >
                  {t('common:profile')}
                  <Icon icon={<ArrowRight />} />
                </Button>
              </PopupMenu.Item>
              <Divider />
              <div className="px-8 pt-4 pb-2 text-small font-bold" data-cy="user-menu-color-scheme">
                {t('common:colorScheme.title')}
              </div>
              {colorSchemeOptions.map((option) => (
                <PopupMenu.Item key={option.value} closeOnClick={false}>
                  <RadioButton
                    name="color-scheme"
                    value={option.value}
                    checked={colorScheme === option.value}
                    onClick={() => setColorScheme(option.value)}
                    onChange={() => setColorScheme(option.value)}
                  >
                    <span className="inline-flex items-center gap-12">
                      {option.icon}
                      {option.label}
                    </span>
                  </RadioButton>
                </PopupMenu.Item>
              ))}
              <Divider />
              <PopupMenu.Item>
                <Button
                  leftIcon={<Icon icon={<LogOut />} />}
                  onClick={() => router.push('/logout')}
                  data-cy="user-menu-logout-button"
                >
                  {t('common:logout.logout')}
                </Button>
              </PopupMenu.Item>
            </PopupMenu.Items>
          </PopupMenu.Panel>
        </PopupMenu>
      </div>
    </div>
  );
};
