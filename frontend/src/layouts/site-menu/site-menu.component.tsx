import { Button, Icon, MenuBar, Select } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../contexts/app.context';
import { MyPagesMode } from '../../interfaces/app';
import { BusinessEngagement, OrganisationInfo } from '../../interfaces/organisation-info';
import { useApi, useApiService } from '../../services/api-service';
import { BusinessEngagementData } from '../../services/organisation-service';
import { getMyPagesModeRoute } from '../../utils/pagesModeRoute';

export const SiteMenu = () => {
  const { myPagesMode } = useAppContext();
  const router = useRouter();
  const queryClient = useApiService((s) => s.queryClient);
  const { data: businessEngagements } = useApi<BusinessEngagementData, Error, BusinessEngagement[]>({
    url: '/businessengagements',
    method: 'get',
    dataHandler: (data?: BusinessEngagementData) => data?.engagements ?? [],
  });
  const { data: representingEntity } = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'get',
  });
  const representingMutation = useApi<OrganisationInfo>({
    url: '/representing',
    method: 'post',
  });

  const switchMyPagesMode = (newMode: MyPagesMode) => {
    router.push(
      `${window.location.toString().replace(getMyPagesModeRoute(myPagesMode) || '', getMyPagesModeRoute(newMode) || '')}`
    );
  };

  const handleRepresentingChange = async (organizationNumber) => {
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
    } else {
    }
  };

  return (
    <nav aria-label="Site menu" className="flex items-center">
      <ul className="flex items-center gap-24">
        <li>
          <Button
            className="text-gray-900"
            showBackground={false}
            variant="tertiary"
            leftIcon={<Icon name="headphones" />}
          >
            Kontakta oss
          </Button>
        </li>
        <li>
          <Button
            className="text-gray-900"
            onClick={() => router.push('/logout')}
            showBackground={false}
            variant="tertiary"
            leftIcon={<Icon name="log-out" />}
          >
            Logga ut
          </Button>
        </li>
        {myPagesMode === MyPagesMode.BUSINESS && (
          <li>
            <label className="text-label-medium flex items-center gap-sm">
              <span className="whitespace-nowrap">Du företräder</span>
              <Select onSelectValue={handleRepresentingChange} value={representingEntity?.organizationNumber}>
                {businessEngagements?.map((engagement) => (
                  <Select.Option key={`${engagement.organizationNumber}`} value={engagement.organizationNumber}>
                    {engagement.organizationName}
                  </Select.Option>
                ))}
              </Select>
            </label>
          </li>
        )}
        <li>
          <MenuBar showBackground current={myPagesMode}>
            <MenuBar.Item menuIndex={MyPagesMode.PRIVATE}>
              <Button onClick={() => switchMyPagesMode(MyPagesMode.PRIVATE)}>Privat</Button>
            </MenuBar.Item>
            <MenuBar.Item menuIndex={MyPagesMode.BUSINESS}>
              <Button onClick={() => switchMyPagesMode(MyPagesMode.BUSINESS)}>Företag</Button>
            </MenuBar.Item>
          </MenuBar>
        </li>
      </ul>
    </nav>
  );
};
