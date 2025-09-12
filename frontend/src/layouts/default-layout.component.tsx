'use client';

import { Header, useThemeQueries } from '@sk-web-gui/react';
import { appName } from '@utils/app-name';
import { AnnouncementBanner } from './annoncement-banner';
import { Layout } from './layout.component';
import { MobileMenu } from './mobile-menu/mobile-menu.component';
import { SiteMenu } from './site-menu/site-menu.component';

export const DefaultLayout = ({ children }) => {
  const { isMinDesktop } = useThemeQueries();

  return (
    <Layout title={`${appName()}`}>
      <Header
        wrapperClasses="py-16 [&_.sk-header-mobilemenu]:md:block [&_.sk-header-mobilemenu]:desktop:hidden "
        title={appName()}
        subtitle="Sundsvalls kommun"
        mobileMenu={<MobileMenu />}
      >
        {isMinDesktop && <SiteMenu />}
      </Header>

      <AnnouncementBanner />

      {children}
    </Layout>
  );
};
