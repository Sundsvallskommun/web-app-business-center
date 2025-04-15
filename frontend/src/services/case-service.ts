import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { CasePdf, CasePdfData, CasesData, ICaseStatusResponse } from '../interfaces/case';
import { statusCodes } from '../interfaces/status-codes';
import { apiService, ApiResponse } from './api-service';

export const emptyCaseList: CasesData = {
  cases: [],
  labels: [],
};

export const ongoingCasesLabels = [
  { label: 'Ärende', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  // { label: 'Ansvarig förvaltning', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Senast ändrat', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Status', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Skapa egen påminnelse', screenReaderOnly: false, sortable: false, shownForStatus: statusCodes.Any },
  { label: 'Ärendeknapp', screenReaderOnly: true, sortable: false, shownForStatus: statusCodes.Any },
];

// getCaseStatus i confluence
export const statusMapCases = {
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
  return Object.keys(statusMapCases).includes(s)
    ? { code: statusMapCases[s].code, color: statusMapCases[s].color, label: s }
    : { code: statusCodes.Ongoing, color: 'neutral', label: s };
};

export const handleCase = (n: CaseStatusResponse): ICaseStatusResponse => ({
  ...n,
  status: mapStatus(n.status || ''),
});

export const handleCaseResponse: (data: CaseStatusResponse[]) => ICaseStatusResponse[] = (data) => data.map(handleCase);

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
  { label: 'Ärende', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Senast ändrat', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Status', screenReaderOnly: false, sortable: true, shownForStatus: statusCodes.Any },
  { label: 'Skapa egen påminnelse', screenReaderOnly: false, sortable: false, shownForStatus: statusCodes.Any },
  { label: 'Ärendeknapp', screenReaderOnly: true, sortable: false, shownForStatus: statusCodes.Any },
];

export const getClosed: (cs: CasesData) => CasesData = (cs) => ({
  ...cs,
  labels: closedCasesLabels,
  cases: cs.cases.filter((c) => c.status.code === statusCodes.Rejected || c.status.code === statusCodes.Approved),
});

export const getCasesInNeedOfData: (cs: CasesData) => CasesData = (cs) => ({
  ...cs,
  labels: ongoingCasesLabels,
  cases: cs.cases.filter((c) =>
    ['Väntar på komplettering', 'Påminnelse om komplettering', 'Komplettering behövs'].includes(c.status.label)
  ),
});

export const getCasePdf: (externalCaseId: string) => Promise<CasePdfData> = (externalCaseId) =>
  apiService
    .get<ApiResponse<CasePdf>>(`casepdf/${externalCaseId}`)
    .then((res) => ({ pdf: res.data.data }))
    .catch(
      (e) => ({ pdf: { externalCaseId: '', base64: '' }, error: e.response?.status ?? 'UNKNOWN ERROR' }) as CasePdfData
    );
export const getCaseMessageAttachment: (url: string) => Promise<string> = (url) =>
  apiService
    .get<ApiResponse<string>>(url)
    .then((res) => res.data.data)
    .catch(() => '');
