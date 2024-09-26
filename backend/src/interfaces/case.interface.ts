export interface Case {
  id: string;
  externalCaseId: string;
  caseType: string;
  status: string;
  firstSubmitted: string;
  lastStatusChange: string;
  openEErrand: boolean;
}

export interface CasePdf {
  externalCaseId: string;
  base64: string;
}
