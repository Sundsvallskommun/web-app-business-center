import { User } from './user';

export interface ClientContactSettingNotifications {
  email_enabled: boolean;
  phone_enabled: boolean;
}

export interface ClientContactSettingDecicionsAndDocuments {
  digitalInbox: boolean;
  myPages: boolean;
  snailmail: boolean;
}

export interface ClientContactSettingAddress {
  street: string;
  postcode: string;
  city: string;
}

export interface ClientContactSetting {
  id?: string | null;
  name: User['name'];
  email: string | null;
  phone: string | null;
  address?: ClientContactSettingAddress | null;
  notifications?: ClientContactSettingNotifications | null;
  decicionsAndDocuments?: ClientContactSettingDecicionsAndDocuments | null;
  modified?: string;
}
