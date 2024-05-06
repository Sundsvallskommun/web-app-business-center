export interface Case {
  caseType: string;
  serviceName: string;
  id: string;
  status: string;
  lastStatusChange: string;
  firstSubmitted: string;
  isOpenEErrand: boolean;
}

export interface CasePdf {
  externalCaseId: string;
  base64: string;
}
