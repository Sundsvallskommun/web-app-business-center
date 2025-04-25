import { Asset, Status } from '@data-contracts/partyassets/data-contracts';
import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const getAssets: (representingMode?: RepresentingMode) => ApiResponse<Asset[]> = (
  representingMode = representingModeDefault
) => ({
  data: [
    {
      assetId: 'assetId-0',
      caseReferenceIds: ['case-0'],
      description: `Parkeringstillstånd för funktionshindrad-${RepresentingMode[representingMode]}`,
      issued: '2021-01-01',
      origin: 'CASEDATA',
      status: Status.ACTIVE,
      type: 'PERMIT',
      validTo: '2025-12-31',
    },
  ],
  message: 'success',
});
