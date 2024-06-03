import { Header } from '@sk-web-gui/react';
import { Layout } from './layout.component';
import { SiteMenu } from './site-menu/site-menu.component';
import NextLink from 'next/link';

export const DefaultLayout = ({ children }) => {
  return (
    <Layout title="Mina sidor">
      <Header
        wrapperClasses="py-16"
        title={`Mina sidor`}
        subtitle="Sundsvalls Kommun"
        LogoLinkWrapperComponent={<NextLink href={'/'} legacyBehavior passHref />}
      >
        <SiteMenu />
      </Header>
      {children}
    </Layout>
  );
};
