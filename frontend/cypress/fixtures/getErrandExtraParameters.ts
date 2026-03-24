import { ApiResponse } from '@services/api-service';

interface ExtraParameter {
  key: string;
  values: string[];
}

interface ErrandByIdResponse {
  extraParameters: ExtraParameter[];
  errandNumber?: string;
}

export const getErrandExtraParameters = (): ApiResponse<ErrandByIdResponse> => ({
  data: {
    extraParameters: [
      { key: 'application.applicant.capacity', values: ['DRIVER'] },
      { key: 'application.applicant.signingAbility', values: ['true'] },
      { key: 'disability.walkingAbility', values: ['true'] },
      { key: 'disability.walkingDistance.beforeRest', values: ['100'] },
      { key: 'disability.walkingDistance.max', values: ['200'] },
      { key: 'disability.duration', values: ['P6M'] },
      { key: 'disability.canBeAloneWhileParking', values: ['true'] },
      { key: 'consent.contact.doctor', values: ['true'] },
      { key: 'consent.view.transportationServiceDetails', values: ['true'] },
      { key: 'application.renewal.changedCircumstances', values: ['Y'] },
      { key: 'application.renewal.medicalConfirmationRequired', values: ['no'] },
    ],
    errandNumber: 'PRH-2024-000001',
  },
  message: 'success',
});
