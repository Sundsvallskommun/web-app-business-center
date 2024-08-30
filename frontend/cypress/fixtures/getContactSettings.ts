import { ClientContactSetting } from '@interfaces/contactsettings';
import { ApiResponse } from '@services/api-service';
import { getMe } from 'cypress/fixtures/getMe';

export const getContactSettings: ApiResponse<ClientContactSetting> = {
  data: {
    name: getMe.data.name,
    email: 'test@example.com',
    phone: '+46701740605',
    address: {
      street: 'street',
      postcode: 'postcode',
      city: 'city',
    },
  },
  message: 'success',
};
