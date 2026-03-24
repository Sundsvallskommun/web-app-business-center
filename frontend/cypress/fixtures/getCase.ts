import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getCases } from './getCases';
import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';

export const getCase: (representingMode?: RepresentingMode, caseId?: string) => ApiResponse<CaseStatusResponse> = (
  representingMode = representingModeDefault,
  caseId = 'caseId-0'
) => ({
  data: getCases(representingMode).data.find((x) => x.caseId === caseId) || getCases(representingMode).data[0],
  message: 'success',
});
