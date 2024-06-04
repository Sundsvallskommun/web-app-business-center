import { MenuBar } from '@sk-web-gui/react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../contexts/app.context';
import { getMyPagesModeRoute } from '../../utils/pagesModeRoute';
import NextLink from 'next/link';
import { useApi } from '../../services/api-service';
import { OrganisationInfo } from '../../interfaces/organisation-info';

export const BannerMenu: React.FC = () => {
  const { myPagesMode } = useAppContext();
  const pathname = usePathname();

  const { data: representingEntity } = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'get',
  });

  const myPagesRoute = getMyPagesModeRoute(myPagesMode);

  return (
    <div className="w-full bg-vattjom-background-200">
      <div className="max-w-content mx-auto relative overflow-hidden">
        <div className="absolute w-[20rem] text-vattjom-surface-accent">
          {/** S-logo */}
          <svg viewBox="0 0 202 269" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M40.5143 34.4125C40.5143 34.4125 32.1436 49.113 46.8761 53.1222C65.6265 57.7997 85.7163 60.8066 104.467 68.1568C109.824 70.1614 104.132 75.173 100.449 74.8389C67.9703 65.8181 37.166 54.7927 0 56.4633C8.37073 66.4863 20.7594 80.1845 23.438 93.8827C36.4964 83.5255 56.5862 77.8458 72.3231 86.1983L53.5727 92.8804C24.1077 103.906 4.01795 134.977 1.00449 165.046C-1.67415 198.457 16.0718 227.524 45.5368 242.558C80.6939 261.268 137.28 253.249 153.352 290.669C157.035 299.69 157.035 317.397 149.334 328.088C135.941 345.128 116.855 350.139 94.4219 347.466C94.4219 347.466 67.9703 343.791 52.5682 332.098C29.7998 315.058 23.438 292.339 20.4246 266.948H7.03141C10.3797 299.021 7.03141 331.429 2.67863 361.833L14.0628 363.169C14.0628 363.169 17.0763 355.151 20.4246 350.473C23.1032 347.8 27.456 347.132 30.8043 349.471C70.3141 376.533 134.601 376.533 171.767 351.475C197.214 332.766 206.59 304.367 198.889 274.632C181.812 214.828 113.507 221.51 68.9748 200.795C54.2423 195.116 39.175 180.749 39.175 163.376C38.8402 145.334 46.2064 130.968 60.9389 120.611C66.9659 116.936 73.3276 116.268 73.3276 116.268C61.2738 128.629 53.9075 142.996 55.9165 161.037C57.5906 175.738 70.3142 189.77 84.377 194.113C98.105 197.788 110.494 192.443 120.873 184.424L119.534 178.076C113.507 179.747 105.806 179.747 99.7791 178.076C87.3904 173.733 82.7028 161.371 84.0422 149.01C85.0466 143.664 89.3994 139.989 95.4263 141.659C125.896 154.355 120.204 194.782 148.999 208.814C158.709 212.155 167.415 209.148 173.442 204.805C188.509 194.113 193.866 180.415 197.884 163.376C189.848 172.397 182.482 182.42 170.428 184.424C164.401 185.761 161.388 184.424 158.039 179.413C146.32 160.703 142.637 129.632 114.846 126.625C109.489 126.625 108.15 126.291 98.105 127.627C105.136 121.947 113.507 116.268 122.882 115.933C136.61 115.599 151.008 124.954 156.365 134.309C159.044 139.655 158.374 148.007 154.356 153.019L160.718 157.696C171.098 144.332 193.531 127.293 193.197 115.933C191.522 93.8827 158.039 80.5186 138.284 72.8343C138.284 72.8343 141.633 64.1476 139.959 57.7997C136.276 49.113 127.905 47.7766 120.204 45.4379C105.806 41.4287 82.7028 39.424 71.9883 30.0692C61.2738 20.7143 66.2962 10.6913 68.9748 0C41.8537 30.7374 40.5143 34.4125 40.5143 34.4125ZM127.235 80.8527C130.583 82.5232 133.932 85.8642 135.606 89.2053L105.471 84.1937C111.498 79.8504 120.204 76.5094 127.235 80.8527Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="max-w-main-content z-10 relative mx-auto pt-[6rem] flex flex-col items-start">
          <span className="text-gray-700 text-h3 font-header">Mina sidor</span>
          <span className="text-display-2-md text-vattjom-surface-primary">{representingEntity?.organizationName}</span>
          <MenuBar className="mt-48 self-stretch">
            <MenuBar.Item className="flex items-center justify-center grow" current={pathname.includes('/oversikt')}>
              <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/oversikt`}>
                Översikt
              </NextLink>
            </MenuBar.Item>
            <MenuBar.Item className="flex items-center justify-center grow" current={pathname.includes('/arenden')}>
              <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/arenden`}>
                Ärenden
              </NextLink>
            </MenuBar.Item>
            <MenuBar.Item className="flex items-center justify-center grow" current={pathname.includes('/fakturor')}>
              <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/fakturor`}>
                Fakturor
              </NextLink>
            </MenuBar.Item>
            <MenuBar.Item className="flex items-center justify-center grow" current={pathname.includes('/profil')}>
              <NextLink className="w-full flex items-center justify-center" href={`${myPagesRoute}/profil`}>
                Profil och inställningar
              </NextLink>
            </MenuBar.Item>
          </MenuBar>
        </div>
      </div>
    </div>
  );
};
