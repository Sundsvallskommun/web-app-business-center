import { MenuBar, cx } from '@sk-web-gui/react';
import { usePathname } from 'next/navigation';
import { OrganisationInfo } from '../../interfaces/organisation-info';
import { useApi } from '../../services/api-service';
import { useBannerMenuItems } from './banner-menu-items';
import { useWindowSize } from '../../utils/use-window-size.hook';
import { SLogo } from '../../components/logos/s-logo.component';

export const BannerMenu: React.FC = () => {
  const pathname = usePathname();
  const bannerMenuItems = useBannerMenuItems();
  const windowSize = useWindowSize();

  const { data: representingEntity } = useApi<OrganisationInfo>({
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
            {representingEntity?.organizationName}
          </span>
          {windowSize.lg && (
            <MenuBar className="self-stretch">
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
