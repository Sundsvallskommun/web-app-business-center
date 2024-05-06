import {
  handleContactResponse,
  makeContactSettingsUpdateModel,
  getContactSettings,
  newContactSettings,
  saveContactSettings,
} from '@services/settings-service';
const axios = require('axios');
jest.mock('axios');

const mockApiSettingsResponse = {
  data: [
    {
      id: 'id',
      partyId: 'partyId',
      contactChannels: [
        {
          contactMethod: 'SMS',
          destination: 'destination',
          sendFeedback: true,
          alias: 'alias',
        },
        {
          contactMethod: 'EMAIL',
          destination: 'destination',
          sendFeedback: false,
          alias: 'alias',
        },
      ],
      created: 'created',
      modified: 'modified',
    },
  ],
  message: 'success',
};

const handledMockSettingss = {
  id: 'id',
  contacts: [
    {
      alias: 'alias',
      contactMethods: {
        SMS: [
          {
            contactMethod: 'SMS',
            destination: 'destination',
            sendFeedback: true,
            alias: 'alias',
          },
        ],
        EMAIL: [
          {
            contactMethod: 'EMAIL',
            destination: 'destination',
            sendFeedback: false,
            alias: 'alias',
          },
        ],
      },
    },
  ],
};

const contactSettingsUpdateModel = {
  id: 'id',
  contactChannels: [
    {
      contactMethod: 'SMS',
      destination: 'destination',
      sendFeedback: true,
      alias: 'alias',
    },
    {
      contactMethod: 'EMAIL',
      destination: 'destination',
      sendFeedback: false,
      alias: 'alias',
    },
  ],
};

const feedBackData = {
  settings: handledMockSettingss,
};

const defaultFeedbackSettings = {
  id: '',
  contacts: [],
};

const GetFeedbackSettingsResponse404 = {
  settings: defaultFeedbackSettings,
  error: '404',
};

const GetBusinessResponseUnknownError = {
  settings: defaultFeedbackSettings,
  error: 'UNKNOWN ERROR',
};

describe('Settings service', () => {
  it('converts api response properly', () => {
    expect(handleContactResponse(mockApiSettingsResponse)).toEqual(handledMockSettingss);
  });
  it('makeContactSettingsUpdateModel', () => {
    expect(makeContactSettingsUpdateModel(handledMockSettingss)).toEqual(contactSettingsUpdateModel);
  });

  it('getContactSettings Success', async () => {
    axios.get.mockResolvedValue({ data: mockApiSettingsResponse });
    const res = await getContactSettings();
    expect(res).toEqual(feedBackData);
  });

  it('getContactSettings 404', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => ({}));
    axios.get.mockImplementation(() => {
      return Promise.reject({ response: { status: '404', data: { message: 'NOK' } }, config: { url: '' } });
    });
    const res = await getContactSettings();
    expect(res).toEqual(GetFeedbackSettingsResponse404);
  });

  it('getContactSettings Fail', async () => {
    axios.get.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await getContactSettings();
    expect(res).toEqual(GetBusinessResponseUnknownError);
  });

  it('newContactSettings Success', async () => {
    axios.post.mockResolvedValue(true);
    const res = await newContactSettings(handledMockSettingss);
    expect(res).toEqual(true);
  });

  it('newContactSettings Fail', async () => {
    axios.post.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await newContactSettings(handledMockSettingss);
    expect(res).toEqual(false);
  });

  it('saveContactSettings Success', async () => {
    axios.patch.mockResolvedValue(true);
    const res = await saveContactSettings(handledMockSettingss);
    expect(res).toEqual(true);
  });

  it('saveFeedbackSettings Fail', async () => {
    axios.patch.mockImplementation(() => {
      return Promise.reject({ error: { response: { status: '', data: { message: 'NOK' } } } });
    });
    const res = await saveContactSettings(handledMockSettingss);
    expect(res).toEqual(false);
  });
});
