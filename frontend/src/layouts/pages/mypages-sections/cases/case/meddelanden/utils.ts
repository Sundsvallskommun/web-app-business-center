import { FrontendMessageResponse } from '@interfaces/case';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

// Display name for a message's sender: handläggare on OUTBOUND, "Jag" for the
// logged-in citizen's own messages, otherwise the raw sender name.
export const senderLabel = (
  message: Pick<FrontendMessageResponse, 'direction' | 'sender'>,
  userName: string | undefined,
  t: TFunction
): string => {
  if (message.direction === 'OUTBOUND') {
    return t('cases:messages.senderHandlaggare', { name: message.sender });
  }
  return userName && userName === message.sender ? t('cases:messages.you') : message.sender;
};

// Short text shown when quoting/replying to a message; falls back when attachment-only.
export const messagePreview = (message: Pick<FrontendMessageResponse, 'message'>, t: TFunction): string =>
  message.message?.trim() || t('cases:messages.attachmentFallback');

// Section header shown above the first message of each day in the thread
// (mirrors drakel's conversation UI): today/yesterday in Swedish, else the date.
export const formatDateDivider = (sent: string | undefined, t: TFunction): string => {
  if (!sent) {
    return t('cases:messages.dateUnknown');
  }
  const date = dayjs(sent);
  if (date.isSame(dayjs(), 'day')) {
    return t('cases:messages.dateToday');
  }
  if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
    return t('cases:messages.dateYesterday');
  }
  return date.format('YYYY-MM-DD');
};
