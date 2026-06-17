import dayjs from 'dayjs';

// Section header shown above the first message of each day in the thread
// (mirrors drakel's conversation UI): today/yesterday in Swedish, else the date.
export const formatDateDivider = (sent?: string): string => {
  if (!sent) {
    return 'Utan datum';
  }
  const date = dayjs(sent);
  if (date.isSame(dayjs(), 'day')) {
    return 'Idag';
  }
  if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
    return 'Igår';
  }
  return date.format('YYYY-MM-DD');
};

// import { FrontendMessageResponse } from '@interfaces/case';

// TODO: Uncomment when the API supports it
// export const messageIsViewed = (message: FrontendMessageResponse) => {
//   return message.viewed !== undefined && message.viewed === true;
// };
