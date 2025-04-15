import { MessageResponse } from '@data-contracts/case-data/data-contracts';

export const messageIsViewed = (message: MessageResponse) => {
  return message.viewed !== undefined && message.viewed === true;
};
