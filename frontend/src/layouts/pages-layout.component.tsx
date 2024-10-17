import { BannerMenu } from './banner-menu/banner-menu.component';
import MainLayout from './main-layout.component';

export const PagesLayout = ({ children }) => {
  return (
    <>
      <BannerMenu />
      <MainLayout>{children}</MainLayout>
    </>
  );
};
