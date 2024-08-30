import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';

const businessDefault = {
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

const privateDefault = {
  name: 'name',
};

export const getRepresentingEntity: (options?: RepresentingEntity) => ApiResponse<RepresentingEntity> = (
  options = { BUSINESS: businessDefault, PRIVATE: privateDefault, mode: RepresentingMode.PRIVATE }
) => ({
  data: {
    BUSINESS: options.BUSINESS,
    PRIVATE: options.PRIVATE,
    mode: options.mode,
  },
  message: '',
});
