'use client';

import { Header, useThemeQueries } from '@sk-web-gui/react';
import { appName } from '@utils/app-name';
import { useTranslation } from 'react-i18next';
import { AnnouncementBanner } from './annoncement-banner';
import { Layout } from './layout.component';
import { MobileMenu } from './mobile-menu/mobile-menu.component';
import { SiteMenu } from './site-menu/site-menu.component';
import { AlertBanner } from './alert-banner.component';

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation('layout');

  return (
    <Layout title={`${appName()}`}>
      <Header
        wrapperClasses="py-16 [&_.sk-header-mobilemenu]:md:block [&_.sk-header-mobilemenu]:desktop:hidden "
        title={appName()}
        subtitle={t('layout:subtitle')}
        mobileMenu={<MobileMenu />}
      >
        {isMinDesktop && <SiteMenu />}
      </Header>
      <AlertBanner />
      <AnnouncementBanner />

      {children}
    </Layout>
  );
};
