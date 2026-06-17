import { AttachmentResponse, MessageResponseDirectionEnum } from '@/data-contracts/case-data/data-contracts';

export interface CaseMessage {
  message: string;
  files?: File[];
  // Id of the message this one replies to. Only honoured by systems that support
  // threading (caremanagement, case-data, supportmanagement); ignored otherwise.
  inReplyToId?: string;
}

export type MessageWithConversationId<T> = T & { conversationId: string };

export interface FrontendMessageResponse {
  conversationId: string;
  messageId: string;
  direction: MessageResponseDirectionEnum;
  message: string;
  sent: string;
  sender: string;
  attachments: AttachmentResponse[];
  // Present when the message is a reply; points at the quoted message's id.
  inReplyToId?: string;
}
