'use client';

import { useAppContext } from '@contexts/app.context';
import { useCombinedBusinessEngagements } from '@services/organisation-service';
import { Button, Icon, NavigationBar, PopupMenu, Select, cx, useThemeQueries } from '@sk-web-gui/react';
import { ArrowRight, ChevronDownCircle } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { RepresentingEntity, RepresentingEntityDto, RepresentingMode } from '../../interfaces/app';
import { useApi, useApiService } from '../../services/api-service';
import { getRepresentingModeRoute, newRepresentingModePathname } from '../../utils/representingModeRoute';
import { toRepresentingLabel } from '@utils/to-representing-label';

export const useRepresentingSwitch = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const representingMutation = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'post',
  });
  const router = useRouter();

  const invalidateQueries = async () => {
    queryClient.invalidateQueries();
  };

  const setRepresenting = async (representingDto: RepresentingEntityDto) => {
    queryClient.cancelQueries();
    try {
      const res = await representingMutation.mutateAsync(representingDto);
      if (!res.error) {
        invalidateQueries();
      } else {
        if (representingDto.mode === RepresentingMode.BUSINESS) {
          router.push(`${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/valj-foretag`);
        }
      }
      return res;
    } catch (err) {
      console.error('Could not set representing mode in backend');
      return { error: err };
    }
  };

  return { setRepresenting, invalidateQueries, representingMutation };
};

export const MyPagesToggle = () => {
  const { representingMode } = useAppContext();
  const { t } = useTranslation('common');
  const pathname = usePathname();

  return (
    <NavigationBar showBackground current={representingMode === 1 ? 0 : 1}>
      <NavigationBar.Item data-cy="representing-business-menu-item" menuIndex={RepresentingMode.BUSINESS}>
        <NextLink href={`${newRepresentingModePathname(RepresentingMode.BUSINESS, pathname)}`}>
          {t('common:organization')}
        </NextLink>
      </NavigationBar.Item>
      <NavigationBar.Item data-cy="representing-private-menu-item" menuIndex={RepresentingMode.PRIVATE}>
        <NextLink href={`${newRepresentingModePathname(RepresentingMode.PRIVATE, pathname)}`}>
          {t('common:private')}
        </NextLink>
      </NavigationBar.Item>
    </NavigationBar>
  );
};

export const MyPagesBusinessSwitch: React.FC<{ submitCallback?: () => void }> = ({ submitCallback }) => {
  const { setRepresentingName } = useAppContext();
  const { setRepresenting } = useRepresentingSwitch();
  const { engagements } = useCombinedBusinessEngagements();
  const { t } = useTranslation('common');
  const { data: representingEntity } = useApi<RepresentingEntity>({
    url: '/representing',
    method: 'get',
  });
  const { isMinDesktop } = useThemeQueries();

  const setEngagement = async (value?: string) => {
    const res = (await setRepresenting({ organizationNumber: value })) as RepresentingEntity;
    setRepresentingName(toRepresentingLabel(res));

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
              aria-label={t('common:switchOrganizationAriaLabel', {
                current: representingEntity?.BUSINESS?.organizationName,
              })}
              rightIcon={<Icon icon={<ChevronDownCircle />} />}
            >
              {t('common:switchOrganization')}
            </PopupMenu.Button>
            <PopupMenu.Panel className="z-50">
              <PopupMenu.Items>
                {engagements?.map((engagement, index) => (
                  <PopupMenu.Item key={`${index}`}>
                    <Button
                      rightIcon={<Icon icon={<ArrowRight />} />}
                      onClick={() => setEngagement(engagement?.organizationNumber as string)}
                    >
                      <span className="font-bold">{engagement.organizationName}</span>
                      {engagement.isRepresentative ? (
                        <span className="ml-[.5em]">{t('common:isRepresentative')}</span>
                      ) : null}
                    </Button>
                  </PopupMenu.Item>
                ))}
              </PopupMenu.Items>
            </PopupMenu.Panel>
          </PopupMenu>
        ) : (
          <>
            <div className="w-full mb-4">{t('common:switchOrganization')}</div>
            <Select
              value={representingEntity?.BUSINESS?.organizationNumber}
              className="w-full"
              onSelectValue={(organizationNumber) => setEngagement(organizationNumber)}
            >
              {engagements?.map((engagement) => (
                <Select.Option
                  key={`${engagement.organizationName}-${engagement.organizationNumber}`}
                  value={engagement.organizationNumber as string}
                >
                  {engagement.organizationName}
                  {engagement.isRepresentative ? ` (ombud)` : null}
                </Select.Option>
              ))}
            </Select>
          </>
        )}
      </div>
    </label>
  );
};

