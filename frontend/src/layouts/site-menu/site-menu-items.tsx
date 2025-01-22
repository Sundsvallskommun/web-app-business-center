'use client';

import { useCombinedBusinessEngagements } from '@services/organisation-service';
import { Button, Icon, MenuBar, PopupMenu, Select, cx, useThemeQueries } from '@sk-web-gui/react';
import { ArrowRight, ChevronDownCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/app.context';
import { RepresentingEntity, RepresentingEntityDto, RepresentingMode } from '../../interfaces/app';
import { useApi, useApiService } from '../../services/api-service';
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
  const { engagements } = useCombinedBusinessEngagements();
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
              rightIcon={<Icon icon={<ChevronDownCircle />} />}
            >
              Byt organisation
            </PopupMenu.Button>
            <PopupMenu.Panel className="z-50">
              <PopupMenu.Items>
                {engagements?.map((engagement, index) => (
                  <PopupMenu.Item key={`${index}`}>
                    <Button
                      rightIcon={<Icon icon={<ArrowRight />} />}
                      onClick={() => setEngagement(engagement.organizationNumber)}
                    >
                      <span className="font-bold">{engagement.organizationName}</span>
                      {engagement.isRepresentative ? <span className="ml-[.5em]">(ombud)</span> : null}
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
              {engagements?.map((engagement, index) => (
                <Select.Option key={`${index}`} value={engagement.organizationNumber}>
                  <span className="font-bold">{engagement.organizationName}</span>
                  {engagement.isRepresentative ? <span className="ml-[.5em]">(ombud)</span> : null}
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
      leftIcon={<Icon icon={<LogOut />} />}
    >
      Logga ut
    </Button>,
  ];
};
