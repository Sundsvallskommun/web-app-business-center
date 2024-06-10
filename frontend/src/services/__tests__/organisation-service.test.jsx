import {
  handleBusEngResponse,
  handleSetRepresentingResponse,
  getBusinessEngagements,
  getRepresenting,
  setRepresenting,
} from '@services/organisation-service';
import { apiService } from '@services/api-service';
const axios = require('axios');
jest.mock('axios');

const mockApiOrganisationResponse = {
  data: {
    engagements: [
      {
        organizationName: 'organizationName',
        organizationNumber: 'organizationNumber',
        organizationId: 'organizationId',
      },
    ],
  },
  message: 'success',
};

const businessEngagement = {
  organizationName: 'organizationName',
  organizationNumber: 'organizationNumber',
};

const handledMockOrganisations = [businessEngagement];

const engagements = {
  engagements: [
    {
      organizationName: 'organizationName',
      organizationNumber: 'organizationNumber',
    },
  ],
};

const representing = {
  orgName: 'organizationName',
  orgNumber: 'organizationNumber',
};

const GetBusinessResponse404 = {
  engagements: [],
  error: '404',
};

describe('Organisations service', () => {
  it('converts api response properly', () => {
    expect(handleBusEngResponse(mockApiOrganisationResponse)).toEqual(handledMockOrganisations);
  });

  it('getBusinessEngagements Success', async () => {
    axios.get.mockResolvedValue({ data: mockApiOrganisationResponse });
    const res = await getBusinessEngagements();
    expect(res).toEqual(engagements);
  });

  it('getBusinessEngagements 404', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({}));
    axios.get.mockImplementation(() => {
      return Promise.reject({ response: { status: '404', data: { message: 'NOK' } }, config: { url: '' } });
    });
    const res = await getBusinessEngagements();
    expect(res).toEqual(GetBusinessResponse404);
  });

  it('set representing', () => {
    expect(handleSetRepresentingResponse({ data: businessEngagement })).toEqual(representing);
  });

  it('getRepresenting Success', async () => {
    axios.get.mockResolvedValue({ data: { data: businessEngagement } });
    const res = await getRepresenting();
    expect(res).toEqual(representing);
  });

  it('getRepresenting Fail', async () => {
    axios.get.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await getRepresenting();
    expect(res).toEqual({
      orgName: '',
      orgNumber: '',
      information: {
        companyLocation: {
          address: {
            city: '',
            street: '',
            postcode: '',
            careOf: '',
          },
        },
      },
    });
  });

  it('setRepresenting Success', async () => {
    axios.post.mockResolvedValue({ data: { data: businessEngagement } });
    const res = await setRepresenting('organizationNumber');
    expect(res).toEqual(representing);
  });

  it('setRepresenting Fail', async () => {
    axios.post.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await setRepresenting();
    expect(res).toEqual({
      orgName: '',
      orgNumber: '',
      information: {
        companyLocation: {
          address: {
            city: '',
            street: '',
            postcode: '',
            careOf: '',
          },
        },
      },
    });
  });
});
