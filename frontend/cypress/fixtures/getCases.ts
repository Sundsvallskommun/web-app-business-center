import { CaseResponse } from '@interfaces/case';
import { ApiResponse } from '@services/api-service';

export const getCases: ApiResponse<CaseResponse[]> = {
  data: [
    {
      caseType: 'caseTypeInskickat',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Inskickat',
      lastStatusChange: '2024-08-30T12:00:00Z',
      firstSubmitted: '2024-08-25T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeTilldelat för handläggning',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Tilldelat för handläggning',
      lastStatusChange: '2024-08-29T11:45:00Z',
      firstSubmitted: '2024-08-25T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeUnder behandling',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Under behandling',
      lastStatusChange: '2024-08-28T09:20:00Z',
      firstSubmitted: '2024-08-25T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeKomplettering behövs',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Komplettering behövs',
      lastStatusChange: '2024-08-27T14:15:00Z',
      firstSubmitted: '2024-08-25T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypePåminnelse om komplettering',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Påminnelse om komplettering',
      lastStatusChange: '2024-08-26T16:10:00Z',
      firstSubmitted: '2024-08-25T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeKomplettering inkommen, behandling fortsätter',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Komplettering inkommen, behandling fortsätter',
      lastStatusChange: '2024-08-25T10:30:00Z',
      firstSubmitted: '2024-08-25T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeBeslut finns, se separat information',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Beslut finns, se separat information',
      lastStatusChange: '2024-08-24T12:00:00Z',
      firstSubmitted: '2024-08-20T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeVäntar på komplettering',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Väntar på komplettering',
      lastStatusChange: '2024-08-23T09:45:00Z',
      firstSubmitted: '2024-08-20T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeKompletterad',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Kompletterad',
      lastStatusChange: '2024-08-22T13:00:00Z',
      firstSubmitted: '2024-08-20T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeKlart',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Klart',
      lastStatusChange: '2024-08-21T15:30:00Z',
      firstSubmitted: '2024-08-15T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeAvslutat',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Avslutat',
      lastStatusChange: '2024-08-20T14:45:00Z',
      firstSubmitted: '2024-08-15T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeÄrendet arkiveras',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Ärendet arkiveras',
      lastStatusChange: '2024-08-19T11:15:00Z',
      firstSubmitted: '2024-08-15T08:30:00Z',
      isOpenEErrand: true,
    },
    {
      caseType: 'caseTypeSparat ärende',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Sparat ärende',
      lastStatusChange: '2024-08-18T17:30:00Z',
      firstSubmitted: '2024-08-15T08:30:00Z',
      isOpenEErrand: true,
    },
  ],
  message: 'success',
};
