import { AttachmentResponse, MessageResponseDirectionEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';

// A case as this backend serves it: the casestatus payload plus the permissions
// the frontend would otherwise have to derive on its own.
export type CaseStatusResponseWithPermissions = CaseStatusResponse & { messagesAllowed: boolean };

export interface CaseMessage {
  message: string;
  files?: File[];
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
}
