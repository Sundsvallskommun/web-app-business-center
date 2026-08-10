export enum FeedbackLifespan {
  'untilRemoved' = 'untilRemoved',
  'twoWeeks' = 'twoWeeks',
  'oneMonth' = 'oneMonth',
}
export interface User {
  name: string;
  userSettings: {
    feedbackLifespan: FeedbackLifespan;
    readNotificationsClearedDate: string;
  };
}
