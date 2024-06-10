import { FeedbackLifespan, User } from '@interfaces/user';
import dayjs from 'dayjs';
import { CasesData, ICase } from '../interfaces/case';
import { ApiResponse, apiService } from './api-service';
export interface NotificationAlert {
  id: string;
  label: string;
  caseId: string;
  caseType: string;
  date: string;
  alertType: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationResponse {
  caseId: string;
}

interface NotificationsResponse {
  readNotifications: NotificationResponse[];
}

export const hasCaseBeenChanged: (user: User, _case: ICase) => boolean = (user, _case) => {
  const settings = user.userSettings;
  const lookBack =
    settings?.feedbackLifespan === FeedbackLifespan.oneMonth
      ? 30
      : settings?.feedbackLifespan === FeedbackLifespan.twoWeeks
        ? 14
        : 1000;
  const cutOffDate = dayjs().subtract(lookBack, 'day');
  return (
    dayjs(_case.lastStatusChange).isAfter(dayjs(settings.readNotificationsClearedDate)) &&
    dayjs(_case.lastStatusChange).isAfter(cutOffDate)
  );
};

export const getNotifications: (user: User, cases: CasesData) => Promise<ICase[]> = async (user, cases) => {
  /* Get an array of already clicked notifications from database */
  const res = await getReadNotifications();
  /* Make an array with just the caseId's */
  const readNotifications = res.readNotifications.map((x) => x.caseId);
  /* At last filter by clicked notifications and user settings */
  return cases.cases.filter((c: ICase) => hasCaseBeenChanged(user, c) && !readNotifications.includes(c.caseId));
};

export const getReadNotifications: () => Promise<NotificationsResponse> = () => {
  return apiService
    .get<ApiResponse<NotificationResponse[]>>('notifications/read')
    .then((res) => Promise.resolve({ readNotifications: res.data.data }))
    .catch((e) => ({ readNotifications: [], error: e.response?.status ?? 'UNKNOWN ERROR' }) as NotificationsResponse);
};

export const setReadNotification: (notification: NotificationResponse) => Promise<boolean> = (notification) => {
  return apiService
    .post('notifications/read', notification)
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

export const clearNotifications: () => Promise<boolean> = () => {
  return apiService
    .delete('notifications/read/all')
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};
