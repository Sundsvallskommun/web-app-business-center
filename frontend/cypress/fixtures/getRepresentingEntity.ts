import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';

export const getRepresentingEntity: (mode?: RepresentingMode) => ApiResponse<RepresentingEntity> = (mode = 0) => ({
  data: {
    BUSINESS: {
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
    },
    PRIVATE: {
      name: 'name',
    },
    mode: mode,
  },
  message: '',
});
