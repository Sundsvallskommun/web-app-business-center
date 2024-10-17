'use client';

import { Button, Icon, MenuBar, PopupMenu, Select, cx, useThemeQueries } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingEntityDto, RepresentingMode } from '../../interfaces/app';
import { BusinessEngagement } from '../../interfaces/organisation-info';
import { useApi, useApiService } from '../../services/api-service';
import { BusinessEngagementData } from '../../services/organisation-service';
import { getRepresentingModeRoute } from '../../utils/representingModeRoute';

export const useRepresentingSwitch = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const representingMutation = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'post',
  });
  const router = useRouter();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ['/cases'],
    });
    queryClient.invalidateQueries({
      queryKey: ['/invoices'],
    });
    queryClient.invalidateQueries({
      queryKey: ['/representing'],
    });
    queryClient.invalidateQueries({
      queryKey: ['/contactsettings'],
    });
  };

  const setRepresenting = async (representingDto: RepresentingEntityDto) => {
    const res = await representingMutation.mutateAsync(representingDto);
    if (!res.error) {
      invalidateQueries();
    } else {
      router.push(`${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/valj-foretag`);
    }
    return res;
  };

  return { setRepresenting, invalidateQueries, representingMutation };
};

export const MyPagesToggle = () => {
  const { representingMode, setRepresentingMode } = useAppContext();

  return (
    <MenuBar showBackground current={representingMode}>
      <MenuBar.Item menuIndex={RepresentingMode.PRIVATE}>
        <Button onClick={() => setRepresentingMode(RepresentingMode.PRIVATE)}>Privat</Button>
      </MenuBar.Item>
      <MenuBar.Item menuIndex={RepresentingMode.BUSINESS}>
        <Button onClick={() => setRepresentingMode(RepresentingMode.BUSINESS)}>Företag</Button>
      </MenuBar.Item>
    </MenuBar>
  );
};

export const MyPagesBusinessSwitch: React.FC<{ submitCallback?: () => void }> = ({ submitCallback }) => {
  const { setRepresenting } = useRepresentingSwitch();
  const { data: businessEngagements } = useApi<BusinessEngagementData, Error, BusinessEngagement[]>({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });
  const { data: representingEntity } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });
  const { isMinDesktop } = useThemeQueries();

  const setEngagement = (value) => {
    setRepresenting({ organizationNumber: value });
    if (submitCallback) submitCallback();
  };

  return (
    <label
      className={cx('text-label-medium flex items-center gap-sm relative', isMinDesktop ? 'flex-row' : 'flex-col')}
    >
      <div className="relative w-full">
        {isMinDesktop ? (
          <PopupMenu type="menu">
            <PopupMenu.Button
              variant="secondary"
              className="bg-transparent"
              aria-label={`Byt organisation, nuvarande: ${representingEntity?.BUSINESS?.organizationName}`}
              rightIcon={<Icon name="chevron-down" />}
            >
              Byt organisation
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
        ) : (
          <>
            <div className="w-full mb-4">Byt företag</div>
            <Select
              value={representingEntity?.BUSINESS?.organizationNumber}
              className="w-full"
              onSelectValue={(organizationNumber) => setEngagement(organizationNumber)}
            >
              {businessEngagements?.map((engagement, index) => (
                <Select.Option key={`${index}`} value={engagement.organizationNumber}>
                  {engagement.organizationName}
                </Select.Option>
              ))}
            </Select>
          </>
        )}
      </div>
    </label>
  );
};

export const useSiteMenuItems = () => {
  const router = useRouter();

  return [
    <Button
      key={`site-menu-items-0`}
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
