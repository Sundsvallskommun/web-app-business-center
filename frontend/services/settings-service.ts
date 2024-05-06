import { ApiResponse, apiService, Data } from './api-service';

export enum FeedbackLifespan {
  'untilRemoved' = 'untilRemoved',
  'twoWeeks' = 'twoWeeks',
  'oneMonth' = 'oneMonth',
}

export interface ContactChannel {
  contactMethod: string;
  destination: string;
  sendFeedback: boolean;
  alias: string;
}

export const defaultChannel: ContactChannel = {
  contactMethod: '',
  destination: '',
  sendFeedback: true,
  alias: '',
};

export type ContactSettingsResponse = Array<{
  id: string;
  partyId: string;
  contactChannels: ContactChannel[];
  created: string;
  modified: string;
}>;

export interface ContactSettingsUpdateModel {
  id: string;
  contactChannels: ContactChannel[];
}

export interface OverviewFormModel {
  feedbackLifespan: FeedbackLifespan;
}

export const defaultOverviewsSettings: OverviewFormModel = {
  feedbackLifespan: FeedbackLifespan.oneMonth,
};

export interface Contact {
  alias: string;
  contactMethods: {
    SMS: ContactChannel[];
    EMAIL: ContactChannel[];
  };
}

export const defaultContact = {
  alias: '',
  contactMethods: {
    SMS: [],
    EMAIL: [],
  },
};

export interface ContactFormModel {
  id: string;
  contacts: Contact[];
}

export interface FeedbackData extends Data {
  settings: ContactFormModel;
}

export const defaultContactSettings: ContactFormModel = {
  id: '',
  contacts: [],
};

export const handleContactResponse: (res: ApiResponse<ContactSettingsResponse>) => ContactFormModel = (res) => ({
  id: res.data[0].id,
  contacts: Object.values(
    res.data.reduce((accumulator, contactSettingsGroup) => {
      contactSettingsGroup.contactChannels.forEach((channel) => {
        if (!accumulator[channel.alias]) {
          accumulator[channel.alias] = {
            alias: channel.alias,
            contactMethods: {
              SMS: [],
              EMAIL: [],
            },
          };
        }
        if (channel['contactMethod'] == 'SMS') {
          accumulator[channel.alias].contactMethods['SMS'].push(channel);
        }
        if (channel['contactMethod'] == 'EMAIL') {
          accumulator[channel.alias].contactMethods['EMAIL'].push(channel);
        }
      });
      return accumulator;
    }, {})
  ),
});

export const getContactSettings: () => Promise<FeedbackData> = () =>
  apiService
    .get<ApiResponse<ContactSettingsResponse>>('contactsettings')
    .then((res) => ({ settings: handleContactResponse(res.data) } as FeedbackData))
    .catch((e) => ({ settings: defaultContactSettings, error: e.response?.status ?? 'UNKNOWN ERROR' } as FeedbackData));

export const makeContactSettingsUpdateModel: (settings: ContactFormModel) => ContactSettingsUpdateModel = (
  settings
) => {
  return {
    id: settings.id,
    contactChannels: [
      ...settings.contacts
        .reduce((acc, curr) => {
          acc.push(curr.contactMethods['SMS']);
          acc.push(curr.contactMethods['EMAIL']);

          return acc;
        }, [])
        .flat(2),
    ],
  };
};

export const newContactSettings: (settings: ContactFormModel) => Promise<boolean> = (settings) => {
  return apiService
    .post('contactsettings', makeContactSettingsUpdateModel(settings))
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};

export const saveContactSettings: (settings: ContactFormModel) => Promise<boolean> = (settings) => {
  return apiService
    .patch('contactsettings', makeContactSettingsUpdateModel(settings))
    .then(() => Promise.resolve(true))
    .catch((e) => Promise.resolve(false));
};
