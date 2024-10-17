import { statusCodes } from './status-codes';

export interface ICase {
  externalCaseId: string;
  caseId: string;
  subject: {
    caseType: string;
    meta: {
      created: string;
      modified: string;
    };
  };
  department: string;
  validFrom: string;
  validTo: string;
  serviceDate: string;
  status: { code: statusCodes; color: string; label: string };
  lastStatusChange: string;
}

export interface CasesData {
  cases: ICase[];
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

export interface CaseResponse {
  caseType: string;
  externalCaseId: string;
  id: string;
  status: string;
  lastStatusChange: string;
  firstSubmitted: string;
  isOpenEErrand: boolean;
}
