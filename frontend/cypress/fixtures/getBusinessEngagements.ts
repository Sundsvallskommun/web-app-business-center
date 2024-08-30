import { ApiResponse } from '@services/api-service';
import { BusinessEngagementData } from '@services/organisation-service';

export const getBusinessEngagements: ApiResponse<BusinessEngagementData> = {
  data: {
    engagements: [
      {
        organizationName: 'Styrbjörns båtar',
        organizationNumber: '2021005448',
      },
    ],
  },
  message: 'success',
};
