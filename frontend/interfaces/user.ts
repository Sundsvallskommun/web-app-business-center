import { FeedbackLifespan } from '@services/settings-service';

export interface User {
  name: string;
  userSettings: {
    feedbackLifespan: FeedbackLifespan;
    readNotificationsClearedDate: string;
  };
}
