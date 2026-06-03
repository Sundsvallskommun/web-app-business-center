'use client';

import { Link } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/app.context';
import { UserMenu } from '../user-menu/user-menu.component';
import { MyPagesBusinessSwitch, MyPagesToggle } from './site-menu-items';

export const SiteMenu = () => {
  const { isRepresentingModeBusiness } = useAppContext();
  const { t } = useTranslation('common');

  return (
    <nav aria-label="Site menu" className="flex items-center">
      <ul className="flex items-center gap-24">
        {isRepresentingModeBusiness && (
          <li>
            <MyPagesBusinessSwitch />
          </li>
        )}
        <li>
          <MyPagesToggle />
        </li>
        <li>
          <Link
            href={'https://e-tjanster.sundsvall.se/'}
            variant="tertiary"
            external={true}
            strong={true}
            className="ml-10"
          >
            {t('common:eServices')}
          </Link>
        </li>
        <li>
          <UserMenu />
        </li>
      </ul>
    </nav>
  );
};
