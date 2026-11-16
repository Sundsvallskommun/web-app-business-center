import { User } from '@interfaces/user';
import { ApiResponse, apiService } from './api-service';

const handleSetUserResponse: (res: ApiResponse<User>) => User = (res) => ({
  name: res.data.name,
});

export const getMe: () => Promise<User> = () => {
  return apiService
    .get<ApiResponse<User>>('me')
    .then((res) => handleSetUserResponse(res.data))
    .catch((err) => {
      return Promise.reject(err.response?.data?.message);
    });
};
