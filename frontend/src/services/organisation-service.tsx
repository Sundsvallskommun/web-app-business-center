import { BusinessEngagement } from '../interfaces/organisation-info';
import { useApi } from '@services/api-service';

export const useCombinedBusinessEngagements = () => {
  const { data: businessEngagements, isLoading: businessEngagementsIsLoading } = useApi<BusinessEngagement[]>({
    url: '/businessengagements',
    method: 'get',
  });

  return {
    engagements: businessEngagements?.map((x) => ({ ...x, isRepresentative: false })) ?? [],
    engagementsIsLoading: businessEngagementsIsLoading,
  };
};
