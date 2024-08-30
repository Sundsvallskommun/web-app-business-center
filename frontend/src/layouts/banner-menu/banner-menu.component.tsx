'use client';

import { MenuBar, cx, useThemeQueries } from '@sk-web-gui/react';
import { usePathname } from 'next/navigation';
import { SLogo } from '../../components/logos/s-logo.component';
import { RepresentingEntity, RepresentingMode } from '../../interfaces/app';
import { useApi } from '../../services/api-service';
import { useBannerMenuItems } from './banner-menu-items';

export const BannerMenu: React.FC = () => {
  const pathname = usePathname();
  const bannerMenuItems = useBannerMenuItems();
  const { isMinDesktop } = useThemeQueries();

  const { data: representingEntity } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });

  return (
    <div className="w-full bg-vattjom-background-200">
      <div className="max-w-content mx-auto relative overflow-hidden">
        <div className="absolute w-[20rem] text-vattjom-surface-accent">
          <SLogo />
        </div>

        <div className="max-w-main-content z-10 relative mx-auto pl-20 lg:pl-0 pt-[6rem] pl- flex flex-col items-start">
          <span className="text-gray-700 text-h3 font-header">Mina sidor</span>
          <span className={cx('text-display-3-sm lg:text-display-2-md text-vattjom-surface-primary xs:mb-32 lg:mb-48')}>
            {representingEntity?.mode === RepresentingMode.BUSINESS
              ? representingEntity?.BUSINESS?.organizationName
              : representingEntity?.PRIVATE?.name}
          </span>
          {isMinDesktop && (
            <MenuBar
              className="self-stretch"
              aria-label={`Undersidor ${representingEntity?.mode === RepresentingMode.BUSINESS ? 'företag' : 'privat'}`}
            >
              {bannerMenuItems.map((item, index) => (
                <MenuBar.Item
                  key={`${index}`}
                  className="flex items-center justify-center grow"
                  current={pathname.includes(item.props.href)}
                >
                  {item}
                </MenuBar.Item>
              ))}
            </MenuBar>
          )}
        </div>
      </div>
    </div>
  );
};
