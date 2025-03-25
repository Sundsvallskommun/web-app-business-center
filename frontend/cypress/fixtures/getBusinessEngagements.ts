import { Engagement } from '@data-contracts/businessengagements/data-contracts';
import { ApiResponse } from '@services/api-service';

export const getBusinessEngagements: ApiResponse<Engagement[]> = {
  data: [
    {
      organizationName: 'Styrbjörns båtar',
      organizationNumber: '2021005448',
    },
  ],
  message: 'success',
};
