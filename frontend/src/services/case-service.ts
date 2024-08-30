import { CasePdf, CasePdfData, CasesData, ICase } from '../interfaces/case';
import { statusCodes } from '../interfaces/status-codes';
import { apiService, ApiResponse } from './api-service';

interface CaseResponse {
  caseType: string;
  externalCaseId: string;
  id: string;
  status: string;
  lastStatusChange: string;
  firstSubmitted: string;
  isOpenEErrand: boolean;
}

export const emptyCaseList: CasesData = {
  cases: [],
  labels: [],
};

export const ongoingCasesLabels = [
  { label: 'Ärende', screenReaderOnly: false, sortable: true },
  { label: 'Senast ändrat', screenReaderOnly: false, sortable: true },
  { label: 'Status', screenReaderOnly: false, sortable: true },
  { label: 'Skapa egen påminnelse', screenReaderOnly: false, sortable: false },
  { label: 'Ärendeknapp', screenReaderOnly: true, sortable: false },
];

export const statusMap = {
  Inskickat: { code: statusCodes.Ongoing, color: 'info' },
  'Tilldelat för handläggning': { code: statusCodes.Ongoing, color: 'info' },
  'Under behandling': { code: statusCodes.Ongoing, color: 'info' },
  'Komplettering behövs': { code: statusCodes.Ongoing, color: 'warning' },
  'Påminnelse om komplettering': { code: statusCodes.Ongoing, color: 'error' },
  'Komplettering inkommen, behandling fortsätter': {
    code: statusCodes.Ongoing,
    color: 'info',
  },
  'Beslut finns, se separat information': {
    code: statusCodes.Ongoing,
    color: 'info',
  },
  'Väntar på komplettering': { code: statusCodes.Ongoing, color: 'warning' },
  Kompletterad: { code: statusCodes.Ongoing, color: 'info' },
  Klart: { code: statusCodes.Approved, color: 'neutral' },
  Avslutat: { code: statusCodes.Approved, color: 'neutral' },
  'Ärendet arkiveras': { code: statusCodes.Rejected, color: 'neutral' },
  'Sparat ärende': { code: statusCodes.Rejected, color: 'neutral' },
};

export const mapStatus = (s: string) => {
  return Object.keys(statusMap).includes(s)
    ? { code: statusMap[s].code, color: statusMap[s].color, label: s }
    : { code: statusCodes.Ongoing, color: 'neutral', label: s };
};

export const handleCaseResponse: (data: CaseResponse[]) => ICase[] = (data) =>
  data.map((n: CaseResponse) => ({
    externalCaseId: n.externalCaseId,
    caseId: n.id,
    subject: {
      caseType: n.caseType,
      meta: {
        created: n.firstSubmitted,
        modified: n.lastStatusChange,
      },
    },
    department: '--',
    validFrom: '--',
    validTo: '--',
    serviceDate: '--',
    status: mapStatus(n.status),
    lastStatusChange: n.lastStatusChange,
  }));

export const casesHandler = (data) => ({
  cases: handleCaseResponse(data),
  labels: [],
});

export const getOngoing: (cs: CasesData) => CasesData = (cs) => ({
  ...cs,
  labels: ongoingCasesLabels,
  cases: cs.cases.filter((c) => c.status.code === statusCodes.Ongoing),
});

export const closedCasesLabels = [
  { label: 'Ärende', screenReaderOnly: false, sortable: true },
  { label: 'Senast ändrat', screenReaderOnly: false, sortable: true },
  { label: 'Status', screenReaderOnly: false, sortable: true },
  { label: 'Skapa egen påminnelse', screenReaderOnly: false, sortable: false },
  { label: 'Ärendeknapp', screenReaderOnly: true, sortable: false },
];

export const getClosed: (cs: CasesData) => CasesData = (cs) => ({
  ...cs,
  labels: closedCasesLabels,
  cases: cs.cases.filter((c) => c.status.code === statusCodes.Rejected || c.status.code === statusCodes.Approved),
});

export const getCasePdf: (caseId: string) => Promise<CasePdfData> = (caseId) =>
  apiService
    .get<ApiResponse<CasePdf>>(`casepdf/${caseId}`)
    .then((res) => ({ pdf: res.data.data }))
    .catch(
      (e) => ({ pdf: { externalCaseId: '', base64: '' }, error: e.response?.status ?? 'UNKNOWN ERROR' }) as CasePdfData
    );
