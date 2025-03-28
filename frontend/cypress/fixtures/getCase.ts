import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getCases } from './getCases';
import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';

export const getCase: (
  representingMode?: RepresentingMode,
  externalCaseId?: string
) => ApiResponse<CaseStatusResponse> = (
  representingMode = representingModeDefault,
  externalCaseId = 'externalCaseId-0'
) => ({
  data:
    getCases(representingMode).data.find((x) => x.externalCaseId === externalCaseId) ||
    getCases(representingMode).data[0],
  message: 'success',
});
