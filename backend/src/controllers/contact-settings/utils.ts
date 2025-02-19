import { ContactSettingChannel } from '../../interfaces/contact-settings';
import { RepresentingEntity } from '../../interfaces/representing.interface';

const emptyEmailSettings = {
  email: null,
  email_disabled: false,
};
const emptyPhoneSettings = {
  phone: null,
  phone_disabled: false,
};

export const getEmailSettingsFromChannels = (contactChannels: ContactSettingChannel[]) => {
  const channel = contactChannels?.find(x => x.contactMethod === 'EMAIL');
  if (channel) {
    return {
      email: channel.destination,
      email_disabled: channel.disabled,
    };
  } else {
    return emptyEmailSettings;
  }
};

export const getPhoneSettingsFromChannels = (contactChannels: ContactSettingChannel[]) => {
  const channel = contactChannels?.find(x => x.contactMethod === 'SMS');
  if (channel) {
    return {
      phone: channel.destination,
      phone_disabled: channel.disabled,
    };
  } else {
    return emptyPhoneSettings;
  }
};

export const getBusinessAddress = (representing: RepresentingEntity) => {
  return representing?.BUSINESS?.information?.companyLocation ?? null;
};

export const getBusinessName = (representing: RepresentingEntity) => {
  return representing?.BUSINESS?.organizationName ?? null;
};
