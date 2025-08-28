import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { CasesData, ICaseStatusResponse } from '../interfaces/case';
import { statusCodes } from '../interfaces/status-codes';
import { ApiResponse, apiService } from './api-service';

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
  Klart: { code: statusCodes.Approved, color: 'success' },
  Avslutat: { code: statusCodes.Approved, color: 'success' },
  'Ärendet arkiveras': { code: statusCodes.Rejected, color: 'success' },
  'Sparat ärende': { code: statusCodes.Rejected, color: 'success' },
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

const getRelevantDate = (c: ICaseStatusResponse): number | null => {
  const d = c.lastStatusChange ?? c.firstSubmitted;
  return d ? Date.parse(d) : null;
};

export const sortCasesByDate = (a: ICaseStatusResponse, b: ICaseStatusResponse): number => {
  const ta = getRelevantDate(a);
  const tb = getRelevantDate(b);

  if (ta === null && tb === null) return 0;
  if (ta === null) return 1;
  if (tb === null) return -1;

  return tb - ta;
};

export const getOngoing: (cs: CasesData) => CasesData = (cs) => ({
  ...cs,
  labels: ongoingCasesLabels,
  cases: cs.cases.filter((c) => c.status.code === statusCodes.Ongoing).sort(sortCasesByDate),
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
  cases: cs.cases
    .filter((c) => c.status.code === statusCodes.Rejected || c.status.code === statusCodes.Approved)
    .sort(sortCasesByDate),
});

export const getCasesInNeedOfData: (cs: CasesData) => CasesData = (cs) => ({
  ...cs,
  labels: ongoingCasesLabels,
  cases: cs.cases.filter((c) =>
    ['Väntar på komplettering', 'Påminnelse om komplettering', 'Komplettering behövs'].includes(c.status.label)
  ),
});

export const getCasePdf: (caseId: string) => Promise<string> = (caseId) =>
  apiService
    .get<ApiResponse<string>>(`cases/${caseId}/pdf`)
    .then((res) => res.data.data)
    .catch(() => '');

export const getCaseMessageAttachment: (url: string) => Promise<string> = (url) =>
  apiService
    .get<ApiResponse<string>>(url)
    .then((res) => res.data.data)
    .catch(() => '');
