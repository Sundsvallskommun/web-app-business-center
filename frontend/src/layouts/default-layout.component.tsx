'use client';

import { Header, useThemeQueries } from '@sk-web-gui/react';
import { Layout } from './layout.component';
import { SiteMenu } from './site-menu/site-menu.component';
import NextLink from 'next/link';
import { MobileMenu } from './mobile-menu/mobile-menu.component';

export const DefaultLayout = ({ children }) => {
  const { isMinDesktop } = useThemeQueries();

  return (
    <Layout title="Mina sidor">
      <Header
        wrapperClasses="py-16 [&_.sk-header-mobilemenu]:md:block [&_.sk-header-mobilemenu]:desktop:hidden"
        title={`Mina sidor`}
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
