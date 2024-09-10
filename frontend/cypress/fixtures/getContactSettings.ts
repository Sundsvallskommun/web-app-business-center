import { RepresentingMode } from '@interfaces/app';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const getContactSettings: (representingMode: RepresentingMode) => ApiResponse<ClientContactSetting> = (
  representingMode = representingModeDefault
) => ({
  data: {
    name: `name-${RepresentingMode[representingMode]}`,
    email: 'test@example.com',
    phone: '+46701740605',
    address: {
      street: 'street',
      postcode: 'postcode',
      city: 'city',
    },
    notifications: {
      email_disabled: false,
      phone_disabled: false,
    },
  },
  message: 'success',
});
