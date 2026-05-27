'use client';

import FullscreenMainSpinner from '@components/spinner/fullscreen-main-spinner.component';
import { Suspense } from 'react';
import { BannerMenu } from './banner-menu/banner-menu.component';
import MainLayout from './main-layout.component';
import { usePathname } from 'next/navigation';
import { useThemeQueries } from '@sk-web-gui/react';

export const PagesLayout = ({ children }: { children: React.ReactNode }) => {
  const { isMinDesktop } = useThemeQueries();
  const pathname = usePathname();
  return (
    <Suspense fallback={<FullscreenMainSpinner />}>
      {pathname.includes('/oversikt') || isMinDesktop ? <BannerMenu /> : null}
      <MainLayout>{children}</MainLayout>
    </Suspense>
  );
};
