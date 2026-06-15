import {
  AttachmentResponse,
  CaseStatusResponse,
  FrontendMessageResponse as GeneratedMessageResponse,
} from '@data-contracts/backend/data-contracts';
import { statusCodes } from './status-codes';

// The message direction is generated as an inline union on the backend contract;
// derive it here so it stays in sync without re-importing the (locally redefined) type.
type MessageResponseDirectionEnum = GeneratedMessageResponse['direction'];

export interface ICaseStatusResponse extends Omit<CaseStatusResponse, 'status'> {
  status: { code: statusCodes; color: 'neutral' | 'info' | 'warning' | 'error'; label: string };
}

export interface CasesData {
  cases: ICaseStatusResponse[];
  labels: { label: string; screenReaderOnly: boolean; sortable: boolean; shownForStatus: statusCodes }[];
}
export interface FrontendMessageResponse {
  conversationId: string;
  messageId: string;
  direction: MessageResponseDirectionEnum;
  message: string;
  sent: string;
  sender: string;
  attachments: AttachmentResponse[];
}
