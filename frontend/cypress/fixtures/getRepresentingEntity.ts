import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';

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

export const getRepresentingEntity: (options?: RepresentingEntity) => ApiResponse<RepresentingEntity> = (
  options = {
    BUSINESS: representingBusinessDefault,
    PRIVATE: representingPrivateDefault,
    mode: RepresentingMode.PRIVATE,
  }
) => ({
  data: {
    BUSINESS: options.BUSINESS,
    PRIVATE: options.PRIVATE,
    mode: options.mode,
  },
  message: '',
});
