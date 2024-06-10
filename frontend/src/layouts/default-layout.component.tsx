import { Header } from '@sk-web-gui/react';
import { Layout } from './layout.component';
import { SiteMenu } from './site-menu/site-menu.component';
import NextLink from 'next/link';
import { MobileMenu } from './mobile-menu/mobile-menu.component';
import { useWindowSize } from '../utils/use-window-size.hook';

export const DefaultLayout = ({ children }) => {
  const windowSize = useWindowSize();
  return (
    <Layout title="Mina sidor">
      <Header
        wrapperClasses="py-16"
        title={`Mina sidor`}
        subtitle="Sundsvalls Kommun"
        LogoLinkWrapperComponent={<NextLink href={'/'} legacyBehavior passHref />}
        mobileMenu={<MobileMenu />}
      >
        {windowSize.lg && <SiteMenu />}
      </Header>
      {children}
    </Layout>
  );
};
