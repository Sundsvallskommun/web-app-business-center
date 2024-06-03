import { FeedbackLifespan, User } from '@interfaces/user';
import dayjs from 'dayjs';
import { ApiResponse, apiService } from './api-service';

export const emptyUser: User = {
  name: '',
  userSettings: {
    feedbackLifespan: FeedbackLifespan.oneMonth,
    readNotificationsClearedDate: dayjs().toISOString(),
  },
};

const emptyUserResponse: ApiResponse<User> = {
  data: emptyUser,
  message: 'none',
};

export interface UserMetaResponse {
  lastLoginTime?: string;
}

const mockUserMeta: UserMetaResponse = {
  lastLoginTime: dayjs().subtract(180, 'day').toISOString(),
};

// TODO Return actual data when available in api
export const getUserMeta: () => Promise<UserMetaResponse> = () => Promise.resolve(mockUserMeta);

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

export const saveUserSettings: (settings: any) => Promise<boolean> = (settings) => {
  return apiService
    .patch('settings', settings)
    .then(() => Promise.resolve(true))
    .catch((e) => {
      return Promise.resolve(false);
    });
};
