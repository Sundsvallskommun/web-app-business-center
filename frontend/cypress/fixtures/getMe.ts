import { FeedbackLifespan, User } from '@interfaces/user';
import { ApiResponse } from '@services/api-service';

export const getMe: ApiResponse<User> = {
  data: {
    name: 'Mel Eli',
    userSettings: {
      feedbackLifespan: FeedbackLifespan.oneMonth,
      readNotificationsClearedDate: '2023-01-01',
    },
  },
  message: 'success',
};
