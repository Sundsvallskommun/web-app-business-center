import { apiService } from './api-service';

interface FeedbackModal {
  body: string;
}

export const sendFeedback: (feedback: FeedbackModal) => Promise<boolean> = (feedback) => {
  return apiService
    .post('feedback', feedback)
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};
