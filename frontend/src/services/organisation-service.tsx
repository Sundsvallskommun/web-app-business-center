import { Engagement } from '@data-contracts/businessengagements/data-contracts';
import { BusinessInformation, OrganisationInfo } from '../interfaces/organisation-info';
import { useEffect, useState } from 'react';
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

interface BusinessToRepresent extends Engagement {
  isRepresentative: boolean;
}

const combineAllBusinessToRepresent = (businessEngagements?: Engagement[], businessRepresentatives?: Engagement[]) =>
  (businessEngagements?.map((x) => ({ ...x, isRepresentative: false })) ?? []).concat(
    businessRepresentatives?.map((x) => ({ ...x, isRepresentative: true })) ?? []
  );

export const useCombinedBusinessEngagements = () => {
  const { data: businessEngagements, isLoading: businessEngagementsIsLoading } = useApi<Engagement[]>({
    url: '/businessengagements',
    method: 'get',
  });
  // MyRepresentatives api currently disabled
  // const { data: businessRepresentatives, isLoading: businessRepresentativesIsLoading } = useApi<Engagement[]>({
  //   url: '/myrepresentatives',
  //   method: 'get',
  // });

  const [engagements, setEngagements] = useState<BusinessToRepresent[]>(
    combineAllBusinessToRepresent(businessEngagements)
  );

  useEffect(() => {
    setEngagements(combineAllBusinessToRepresent(businessEngagements));
  }, [businessEngagements]);
  return {
    engagements: engagements,
    engagementsIsLoading: businessEngagementsIsLoading,
  };
};
