import { BusinessEngagement, BusinessInformation, OrganisationInfo } from '../interfaces/organisation-info';

export interface BusinessEngagementData {
  engagements: BusinessEngagement[];
  error?: boolean;
}

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
