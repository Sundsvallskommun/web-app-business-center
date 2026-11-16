import { User } from '@interfaces/user';
import { ApiResponse } from '@services/api-service';

export const getMe: ApiResponse<User> = {
  data: {
    name: 'Förnamn Efternamn',
  },
  message: 'success',
};
