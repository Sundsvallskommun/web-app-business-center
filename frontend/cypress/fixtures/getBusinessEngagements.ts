import { BusinessEngagement } from '@interfaces/organisation-info';
import { ApiResponse } from '@services/api-service';

export const getBusinessEngagements: ApiResponse<BusinessEngagement[]> = {
  data: [
    {
      organizationName: 'Styrbjörns båtar',
      organizationNumber: '2021005448',
    },
    {
      organizationName: 'Styrbjörns cyklar',
      organizationNumber: '2021005449',
    },
  ],
  message: 'success',
};
