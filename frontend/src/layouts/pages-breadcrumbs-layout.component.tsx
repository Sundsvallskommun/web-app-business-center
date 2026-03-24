import { cx, useThemeQueries } from '@sk-web-gui/react';
import { BannerMenu } from './banner-menu/banner-menu.component';
import MainLayout from './main-layout.component';
import { usePathname } from 'next/navigation';

export const PagesBreadcrumbsLayout = ({
  children,
  breadcrumbs = undefined,
}: {
  children: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) => {
  const { isMinDesktop } = useThemeQueries();
  const pathname = usePathname();
  return (
    <>
      {pathname.includes('/oversikt') || isMinDesktop ? <BannerMenu /> : null}
      {breadcrumbs && (
        <div className="max-w-main-content w-full mt-24 desktop:mb-24 px-20 desktop:px-0">{breadcrumbs}</div>
      )}
      <MainLayout className={cx(breadcrumbs && 'mt-60')}>{children}</MainLayout>
    </>
  );
};
