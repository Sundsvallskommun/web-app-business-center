export enum FeedbackLifespan {
  'untilRemoved' = 'untilRemoved',
  'twoWeeks' = 'twoWeeks',
  'oneMonth' = 'oneMonth',
}
export interface OverviewFormModel {
  feedbackLifespan: FeedbackLifespan;
}

export const defaultOverviewsSettings: OverviewFormModel = {
  feedbackLifespan: FeedbackLifespan.oneMonth,
};
export interface User {
  name: string;
}
