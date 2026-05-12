import { BusinessEngagement, BusinessInformation, OrganisationInfo } from '../interfaces/organisation-info';
import { useApi } from '@services/api-service';

export interface OrganisationInfoResponse {
  organizationName: string;
  organizationNumber: string;
  information: BusinessInformation;
}

export const emptyOrganisationInfo: OrganisationInfo = {
  organizationName: '',
  organizationNumber: '',
  information: {
    companyLocation: {
      address: {
        city: '',
        street: '',
        postcode: '',
        careOf: '',
      },
    },
  },
};

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
