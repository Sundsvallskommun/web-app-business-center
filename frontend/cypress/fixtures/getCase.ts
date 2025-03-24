import { RepresentingMode } from '@interfaces/app';
import { CaseResponse } from '@interfaces/case';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getCases } from './getCases';

export const getCase: (representingMode?: RepresentingMode, externalCaseId?: string) => ApiResponse<CaseResponse> = (
  representingMode = representingModeDefault,
  externalCaseId = 'externalCaseId-0'
) => ({
  data:
    getCases(representingMode).data.find((x) => x.externalCaseId === externalCaseId) ||
    getCases(representingMode).data[0],
  message: 'success',
});
