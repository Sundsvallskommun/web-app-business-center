import { RepresentingEntity } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getBusinessEngagements } from './getBusinessEngagements';
import { getMe } from './getMe';

export const getBusinessRepresentFromEngagements = (index: number = 0) => ({
  organizationName: getBusinessEngagements.data[index].organizationName ?? 'organizationName',
  organizationNumber: getBusinessEngagements.data[index].organizationNumber ?? 'organizationNumber',
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
});

export const getPrivateRepresentFromGetMe = () => ({
  name: getMe.data.name ?? 'name',
});

export const getRepresentingEntity: (options?: RepresentingEntity) => ApiResponse<RepresentingEntity> = (options) => ({
  data: {
    BUSINESS: options?.BUSINESS || getBusinessRepresentFromEngagements(),
    PRIVATE: options?.PRIVATE || getPrivateRepresentFromGetMe(),
    mode: options?.mode ?? representingModeDefault,
  },
  message: '',
});
