import {
  handleCaseResponse,
  getOngoing,
  getClosed,
  ongoingCasesLabels,
  closedCasesLabels,
} from '@services/case-service';
const axios = require('axios');
jest.mock('axios');

const { getCases } = jest.requireActual('@services/case-service');

const mockApiCaseResponse = {
  data: [
    {
      caseType: 'caseType',
      externalCaseId: 'externalCaseId',
      id: 'id',
      status: 'Kompletterad',
      lastStatusChange: 'lastStatusChange',
      firstSubmitted: 'firstSubmitted',
      isOpenEErrand: true,
    },
  ],
  message: 'success',
};

const handledMockCase = {
  externalCaseId: 'externalCaseId',
  caseId: 'id',
  subject: {
    caseType: 'caseType',
    meta: {
      created: 'firstSubmitted',
      modified: 'lastStatusChange',
    },
  },
  department: '--',
  validFrom: '--',
  validTo: '--',
  serviceDate: '--',
  status: { code: 2, color: 'info', label: 'Kompletterad' },
  lastStatusChange: 'lastStatusChange',
};

const GetCasesResponseSuccess = {
  cases: [handledMockCase],
  labels: [],
};

const GetCasesResponse404 = {
  cases: [],
  labels: [],
  error: '404',
};

describe('Cases service', () => {
  it('converts api response properly: Kompletterad', () => {
    expect(handleCaseResponse(mockApiCaseResponse)).toEqual([handledMockCase]);
  });

  it('getCases Success', async () => {
    axios.get.mockResolvedValue({ data: mockApiCaseResponse });
    const res = await getCases();
    expect(res).toEqual(GetCasesResponseSuccess);
  });

  it('getCases 404', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockImplementation(() => {
      return Promise.reject({ response: { status: '404', data: { message: 'NOK' } }, config: { url: '' } });
    });
    const res = await getCases();
    expect(res).toEqual(GetCasesResponse404);
  });

  it('getOngoing cases', () => {
    expect(getOngoing(GetCasesResponseSuccess)).toEqual({
      ...GetCasesResponseSuccess,
      labels: ongoingCasesLabels,
      cases: [handledMockCase],
    });
  });

  it('getClosed cases: Based on list of ongoing, should return empty array', () => {
    expect(getClosed(GetCasesResponseSuccess)).toEqual({
      ...GetCasesResponseSuccess,
      labels: closedCasesLabels,
      cases: [],
    });
  });
});
