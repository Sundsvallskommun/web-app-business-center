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
    destination: userData.email,
    disabled: !userData.notifications.email_enabled,
    alias: 'default',
  };
  const phoneSettings: ContactSettingChannel = {
    contactMethod: ContactMethod.SMS,
    destination: userData.phone,
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
    name: null,
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

export const deleteContactSetting = async (contactSettingId: string, req: RequestWithUser): Promise<boolean> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('contactsettings');
  if (!contactSettingId) {
    throw new HttpException(400, 'Bad Request');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/settings/${contactSettingId}`;
  await apiService.delete<boolean>({ url }, req.user).catch(error => {
    console.error('Error deleting contact setting:', error);
    return false;
  });

  return true;
};

export const deleteDelegate = async (delegateId: string, req: RequestWithUser): Promise<boolean> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('contactsettings');
  if (!delegateId) {
    throw new HttpException(400, 'Bad Request');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/delegates/${delegateId}`;
  await apiService.delete<boolean>({ url }, req.user).catch(error => {
    console.error('Error deleting delegate:', error);
    return false;
  });

  return true;
};
