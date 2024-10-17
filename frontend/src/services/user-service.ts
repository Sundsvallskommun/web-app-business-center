import { User } from '@interfaces/user';
import { ApiResponse, apiService } from './api-service';

const handleSetUserResponse: (res: ApiResponse<User>) => User = (res) => ({
  name: res.data.name,
  userSettings: {
    feedbackLifespan: res.data.userSettings.feedbackLifespan,
    readNotificationsClearedDate: res.data.userSettings.readNotificationsClearedDate,
  },
});

export const getMe: () => Promise<User> = () => {
  return apiService
    .get<ApiResponse<User>>('me')
    .then((res) => handleSetUserResponse(res.data))
    .catch(() => Promise.reject('No user found'));
};
