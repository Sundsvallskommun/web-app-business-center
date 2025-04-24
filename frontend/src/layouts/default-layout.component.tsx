'use client';

import { Header, useThemeQueries } from '@sk-web-gui/react';
import { Layout } from './layout.component';
import { SiteMenu } from './site-menu/site-menu.component';
import NextLink from 'next/link';
import { MobileMenu } from './mobile-menu/mobile-menu.component';
import { appName } from '@utils/app-name';

export const DefaultLayout = ({ children }) => {
  const { isMinDesktop } = useThemeQueries();

  return (
    <Layout title={`${appName()}`}>
      <Header
        wrapperClasses="py-16 [&_.sk-header-mobilemenu]:md:block [&_.sk-header-mobilemenu]:desktop:hidden z-[1] shadow-100"
        title={appName()}
        subtitle="Sundsvalls Kommun"
        LogoLinkWrapperComponent={<NextLink href={'/'} legacyBehavior passHref />}
        mobileMenu={<MobileMenu />}
      >
        {isMinDesktop && <SiteMenu />}
      </Header>
      {children}
    </Layout>
  );
};
