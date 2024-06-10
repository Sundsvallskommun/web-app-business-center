'use client';

import { MenuBar, Button, Select, Icon, cx } from '@sk-web-gui/react';
import { MyPagesMode } from '../../interfaces/app';
import { BusinessEngagement, OrganisationInfo } from '../../interfaces/organisation-info';
import { useApiService, useApi } from '../../services/api-service';
import { BusinessEngagementData } from '../../services/organisation-service';
import { getMyPagesModeRoute } from '../../utils/pagesModeRoute';
import { useAppContext } from '../../contexts/app.context';
import { useRouter } from 'next/navigation';
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
    const pathname = `${window.location.pathname.toString().replace(getMyPagesModeRoute(myPagesMode) || '', getMyPagesModeRoute(newMode) || '')}`;
    router.push(`${window.location.origin}${pathname}`);
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
    <label className={cx('text-label-medium flex items-center gap-sm', windowSize.lg ? 'flex-row' : 'flex-col')}>
      <span className="whitespace-nowrap">Du företräder</span>
      <Select className="max-w-full" onSelectValue={setEngagement} value={representingEntity?.organizationNumber}>
        {businessEngagements?.map((engagement) => (
          <Select.Option key={`${engagement.organizationNumber}`} value={engagement.organizationNumber}>
            {engagement.organizationName}
          </Select.Option>
        ))}
      </Select>
    </label>
  );
};

export const useSiteMenuItems = () => {
  const router = useRouter();

  return [
    <Button className="text-gray-900" showBackground={false} variant="tertiary" leftIcon={<Icon name="headphones" />}>
      Kontakta oss
    </Button>,
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
