import { BusinessEngagement, BusinessInformation, OrganisationInfo } from '../interfaces/organisation-info';
import { ApiResponse, apiService } from './api-service';

interface BusinessEngagementResponse {
  engagements: {
    organizationName: string;
    organizationNumber: string;
    organizationId: string;
  }[];
  statusDescriptions: {
    [key: string]: string;
  };
  status: string;
}

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

// export const handleBusEngResponse: (res: ApiResponse<BusinessEngagementResponse>) => BusinessEngagement[] = (res) =>
//   res.data.engagements.map((e) => ({
//     organizationName: e.organizationName,
//     organizationNumber: e.organizationNumber,
//   })) || [];

// export const getBusinessEngagements: () => Promise<BusinessEngagementData> = () =>
//   apiService
//     .get<ApiResponse<BusinessEngagementResponse>>('businessengagements')
//     .then((res) => ({ engagements: handleBusEngResponse(res.data) }))
//     .catch((e) => ({ engagements: [], error: e.response?.status ?? 'UNKNOWN ERROR' }));

// export const handleSetRepresentingResponse: (res: ApiResponse<OrganisationInfoResponse>) => OrganisationInfo = (
//   res
// ) => ({
//   orgName: res.data.organizationName,
//   orgNumber: res.data.organizationNumber,
//   information: res.data.information,
// });

// export const getRepresenting: () => Promise<OrganisationInfo> = () =>
//   apiService
//     .get<ApiResponse<OrganisationInfoResponse>>('representing')
//     .then((res) => handleSetRepresentingResponse(res.data))
//     .catch((e) => emptyOrganisationInfo);

// export const setRepresenting: (organizationNumber: string) => Promise<OrganisationInfo> = (
//   organizationNumber: string
// ) =>
//   apiService
//     .post<ApiResponse<OrganisationInfoResponse>>('representing', { organizationNumber })
//     .then((res) => handleSetRepresentingResponse(res.data))
//     .catch((e) => emptyOrganisationInfo);
