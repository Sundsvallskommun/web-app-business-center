'use client';

import { Button, Icon, MenuBar, PopupMenu, cx } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/app.context';
import { MyPagesMode } from '../../interfaces/app';
import { BusinessEngagement, OrganisationInfo } from '../../interfaces/organisation-info';
import { useApi, useApiService } from '../../services/api-service';
import { BusinessEngagementData } from '../../services/organisation-service';
import { appURL } from '../../utils/app-url';
import { newMyPagesModePathname } from '../../utils/pagesModeRoute';
import { useWindowSize } from '../../utils/use-window-size.hook';

export const useRepresentingSwitch = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const representingMutation = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'post',
  });

  const setRepresenting = async (organizationNumber) => {
    const res = await representingMutation.mutateAsync({ organizationNumber });
    if (!res.error) {
      queryClient.invalidateQueries({
        queryKey: ['/cases'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['/invoices'],
        refetchType: 'all',
      });
    }
  };

  return { setRepresenting };
};

export const MyPagesToggle = () => {
  const { myPagesMode } = useAppContext();
  const router = useRouter();

  const switchMyPagesMode = (newMode: MyPagesMode) => {
    const pathname = newMyPagesModePathname(newMode);
    router.push(`${appURL()}${pathname}`);
  };

  return (
    <MenuBar showBackground current={myPagesMode}>
      <MenuBar.Item menuIndex={MyPagesMode.PRIVATE}>
        <Button onClick={() => switchMyPagesMode(MyPagesMode.PRIVATE)}>Privat</Button>
      </MenuBar.Item>
      <MenuBar.Item menuIndex={MyPagesMode.BUSINESS}>
        <Button onClick={() => switchMyPagesMode(MyPagesMode.BUSINESS)}>Företag</Button>
      </MenuBar.Item>
    </MenuBar>
  );
};

export const MyPagesBusinessSwitch: React.FC<{ closeCallback?: () => void }> = ({ closeCallback }) => {
  const { setRepresenting } = useRepresentingSwitch();
  const { data: businessEngagements } = useApi<BusinessEngagementData, Error, BusinessEngagement[]>({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });
  const { data: representingEntity } = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'get',
  });
  const windowSize = useWindowSize();

  const setEngagement = (value) => {
    setRepresenting(value);
    closeCallback && closeCallback();
  };

  return (
    <label
      className={cx('text-label-medium flex items-center gap-sm relative', windowSize.lg ? 'flex-row' : 'flex-col')}
    >
      <span className="whitespace-nowrap">Du företräder</span>
      <div className="relative">
        <PopupMenu type="menu">
          <PopupMenu.Button
            variant="secondary"
            className="bg-transparent"
            aria-label={`${representingEntity?.organizationName}, Välj företag`}
            rightIcon={<Icon name="chevron-down" />}
          >
            {representingEntity?.organizationName}
          </PopupMenu.Button>
          <PopupMenu.Panel autoAlign autoPosition className="z-50">
            <PopupMenu.Items>
              {businessEngagements?.map((engagement, index) => (
                <PopupMenu.Item key={`${index}`}>
                  <Button
                    rightIcon={<Icon name="arrow-right" />}
                    onClick={() => setEngagement(engagement.organizationNumber)}
                  >
                    {engagement.organizationName}
                  </Button>
                </PopupMenu.Item>
              ))}
            </PopupMenu.Items>
          </PopupMenu.Panel>
        </PopupMenu>
      </div>
    </label>
  );
};

export const useSiteMenuItems = () => {
  const router = useRouter();

  return [
    <Button
      className="text-gray-900"
      onClick={() => router.push('/logout')}
      showBackground={false}
      variant="tertiary"
      leftIcon={<Icon name="log-out" />}
    >
      Logga ut
    </Button>,
  ];
};
