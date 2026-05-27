import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { statusCodes } from './status-codes';
import { AttachmentResponse, MessageResponseDirectionEnum } from '@data-contracts/case-data/data-contracts';

export interface ICaseStatusResponse extends Omit<CaseStatusResponse, 'status'> {
  status: {
    code: statusCodes;
    color: 'neutral' | 'info' | 'warning' | 'error' | 'success' | 'tertiary';
    label: string;
  };
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
