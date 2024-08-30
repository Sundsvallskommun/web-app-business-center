import { User } from '@interfaces/user';
import { ApiResponse } from '@services/api-service';

export const getMe: ApiResponse<User> = {
  data: {
    name: 'Mel Eli',
  },
  message: 'success',
};
