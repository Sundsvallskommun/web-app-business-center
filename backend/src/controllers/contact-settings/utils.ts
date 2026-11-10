import { CitizenAddress } from '@/data-contracts/citizen/data-contracts';
import { Address } from '@/interfaces/business-engagement';
import { ContactSettingAddress, ContactSettingChannel } from '@interfaces/contact-settings';
import { RepresentingEntity } from '@interfaces/representing.interface';

/** Trimmed value, or undefined when it is missing or blank. */
const present = (value?: string | null): string | undefined => value?.trim() || undefined;

const citizenStreet = (address: CitizenAddress): string | undefined =>
  present(address.address) ?? present([address.addressArea, address.addressNumber, address.addressLetter].map(present).filter(Boolean).join(' '));

export const mapCitizenAddress = (address: CitizenAddress | null | undefined): ContactSettingAddress | null => {
  if (!address?.city) return null;
  return {
    careOf: present(address.co),
    street: citizenStreet(address),
    apartmentNumber: present(address.appartmentNumber),
    postcode: present(address.postalCode),
    city: present(address.city),
  };
};

export const mapBusinessAddress = (address: Address | null | undefined): ContactSettingAddress => ({
  careOf: present(address?.careOf),
  street: present(address?.street),
  postcode: present(address?.postcode),
  city: present(address?.city),
});

const emptyEmailSettings = {
  email: null,
  email_disabled: true,
};
const emptyPhoneSettings = {
  phone: null,
  phone_disabled: true,
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
