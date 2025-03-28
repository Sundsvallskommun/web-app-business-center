import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { statusCodes } from './status-codes';

export interface ICaseStatusResponse extends Omit<CaseStatusResponse, 'status'> {
  status: { code: statusCodes; color: 'neutral' | 'info' | 'warning' | 'error'; label: string };
}

export interface CasesData {
  cases: ICaseStatusResponse[];
  labels: { label: string; screenReaderOnly: boolean; sortable: boolean; shownForStatus: statusCodes }[];
}

export interface CasePdf {
  externalCaseId: string;
  base64: string;
}

export interface CasePdfData {
  pdf: CasePdf;
  error?: boolean;
}
