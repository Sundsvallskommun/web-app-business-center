import { FrontendMessageResponse } from '@interfaces/case';
import dayjs from 'dayjs';

// Display name for a message's sender: handläggare on OUTBOUND, "Jag" for the
// logged-in citizen's own messages, otherwise the raw sender name.
export const senderLabel = (
  message: Pick<FrontendMessageResponse, 'direction' | 'sender'>,
  userName?: string
): string => {
  if (message.direction === 'OUTBOUND') {
    return `${message.sender} (Handläggare)`;
  }
  return userName && userName === message.sender ? 'Jag' : message.sender;
};

// Short text shown when quoting/replying to a message; falls back when attachment-only.
export const messagePreview = (message: Pick<FrontendMessageResponse, 'message'>): string =>
  message.message?.trim() || 'Bifogad fil';

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
