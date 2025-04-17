import { AttachmentResponse, MessageResponseDirectionEnum } from '@/data-contracts/case-data/data-contracts';

export interface CaseMessage {
  message: string;
  files?: File[];
}

export interface FrontendMessageResponse {
  messageId: string;
  direction: MessageResponseDirectionEnum;
  message: string;
  sent: string;
  sender: string;
  attachments: AttachmentResponse[];
}
