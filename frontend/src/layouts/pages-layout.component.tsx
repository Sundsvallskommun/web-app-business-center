import FullscreenMainSpinner from '@components/spinner/fullscreen-main-spinner.component';
import { Suspense } from 'react';
import { BannerMenu } from './banner-menu/banner-menu.component';
import MainLayout from './main-layout.component';

export const PagesLayout = ({ children }) => {
  return (
    <Suspense fallback={<FullscreenMainSpinner />}>
      <BannerMenu />
      <MainLayout>{children}</MainLayout>
    </Suspense>
  );
};
