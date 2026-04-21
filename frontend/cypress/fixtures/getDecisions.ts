import { ClientDecision } from '@services/decision-service';
import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const getDecisions: (representingMode?: RepresentingMode) => ApiResponse<ClientDecision[]> = (
  representingMode = representingModeDefault
) => ({
  data: [
    {
      id: 1,
      decisionType: 'FINAL',
      decisionOutcome: 'APPROVAL',
      description: `Parkeringstillstånd beviljat-${RepresentingMode[representingMode]}`,
      decidedAt: '2024-01-15T10:30:00Z',
      validFrom: '2024-01-15T00:00:00Z',
      validTo: '2026-01-15T00:00:00Z',
      created: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      decisionType: 'FINAL',
      decisionOutcome: 'REJECTION',
      description: `Ansökan avslagen-${RepresentingMode[representingMode]}`,
      decidedAt: '2024-02-20T14:00:00Z',
      validFrom: '2024-02-20T00:00:00Z',
      validTo: undefined,
      created: '2024-02-20T14:00:00Z',
    },
  ],
  message: 'success',
});
