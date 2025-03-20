import { RepresentingEntity } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const representingBusinessDefault = {
  organizationName: 'organizationName',
  organizationNumber: 'organizationNumber',
  information: {
    companyLocation: {
      address: {
        city: 'city',
        street: 'street',
        postcode: 'postcode',
        careOf: 'careOf',
      },
    },
  },
};

export const representingPrivateDefault = {
  name: 'name',
};

export const getRepresentingEntity: (options?: RepresentingEntity) => ApiResponse<RepresentingEntity> = (options) => ({
  data: {
    BUSINESS: options?.BUSINESS ?? representingBusinessDefault,
    PRIVATE: options?.PRIVATE ?? representingPrivateDefault,
    mode: options?.mode ?? representingModeDefault,
  },
  message: '',
});
