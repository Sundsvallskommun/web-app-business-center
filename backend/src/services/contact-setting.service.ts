import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from './api.service';
import { ClientContactSetting } from '@/responses/contactsettings.response';
import { ContactSetting, ContactSettingChannel } from '@/interfaces/contact-settings';
import { ContactMethod } from '@/data-contracts/contactsettings/data-contracts';
import { getEmailSettingsFromChannels, getPhoneSettingsFromChannels } from '@/controllers/contact-settings/utils';

export const getContactSettingChannels = (userData: ClientContactSetting) => {
  const emailSettings: ContactSettingChannel = {
    contactMethod: ContactMethod.EMAIL,
    destination: userData.email ?? '',
    disabled: !userData.notifications.email_enabled,
    alias: 'default',
  };
  const phoneSettings: ContactSettingChannel = {
    contactMethod: ContactMethod.SMS,
    destination: userData.phone ?? '',
    disabled: !userData.notifications.phone_enabled,
    alias: 'default',
  };
  return [...(userData.email ? [emailSettings] : []), ...(userData.phone ? [phoneSettings] : [])];
};

export const makeClientContactSetting = (contactSetting: ContactSetting): ClientContactSetting => {
  const emailSettings = getEmailSettingsFromChannels(contactSetting?.contactChannels);
  const phoneSettings = getPhoneSettingsFromChannels(contactSetting?.contactChannels);

  const clientContactSetting: ClientContactSetting = {
    id: contactSetting?.id,
    // name is declared as User['name'] (string) in the response but is intentionally null here
    name: null as unknown as ClientContactSetting['name'],
    address: null,
    email: emailSettings.email,
    phone: phoneSettings.phone,
    virtual: contactSetting?.virtual ?? false,
    alias: contactSetting?.alias ?? 'default',
    notifications: {
      email_enabled: !emailSettings.email_disabled,
      phone_enabled: !phoneSettings.phone_disabled,
    },
    decicionsAndDocuments: {
      digitalInbox: true,
      myPages: true,
      snailmail: false,
    },
    modified: contactSetting?.modified,
  };

  return clientContactSetting;
};

const defaultApi = new ApiService();

/**
 * Fetch all contact settings that belong to a given party.
 * The upstream API filters by `partyId`, so the result only ever contains the
 * represented party's own settings.
 */
const fetchContactSettings = async (
  partyId: string,
  user: RequestWithUser['user'],
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<ContactSetting[]> => {
  const apiBase = getApiBase('contactsettings');
  const url = `${apiBase}/${MUNICIPALITY_ID}/settings`;
  const params = { partyId, page: 1, limit: 100 };

  const res = await api.get<ContactSetting[]>({ url, params }, user);
  return res.data ?? [];
};

/**
 * Verify that a contact setting belongs to the represented party before it is
 * edited or deleted.
 *
 * The setting id comes from the client. Without this check a logged-in user could
 * swap the id and modify/remove another party's contact setting (IDOR). We load the
 * party's own settings and confirm the id is among them. Fails closed: any lookup
 * error resolves to "not owned".
 */
export const contactSettingBelongsToParty = async (
  partyId: string,
  contactSettingId: string,
  user: RequestWithUser['user'],
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<boolean> => {
  try {
    const settings = await fetchContactSettings(partyId, user, api);
    return settings.some(setting => setting.id === contactSettingId && setting.partyId === partyId);
  } catch (error) {
    console.error('Error verifying contact setting ownership:', error);
    return false;
  }
};

export const deleteContactSetting = async (
  contactSettingId: string,
  req: RequestWithUser,
  api: Pick<ApiService, 'delete'> = defaultApi,
): Promise<boolean> => {
  const apiBase = getApiBase('contactsettings');
  if (!contactSettingId) {
    throw new HttpException(400, 'Bad Request');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/settings/${contactSettingId}`;
  await api.delete<boolean>({ url }, req.user).catch(error => {
    console.error('Error deleting contact setting:', error);
    return false;
  });

  return true;
};
