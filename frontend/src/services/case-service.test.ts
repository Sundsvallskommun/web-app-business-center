/// <reference types="jest" />

// tsconfig sets `types: ["cypress"]`, so the global `expect` resolves to Chai's
// Assertion; import Jest's expect explicitly to get Jest matcher typings.
import { expect } from '@jest/globals';

import { CasesData, ICaseStatusResponse } from '../interfaces/case';
import { statusCodes } from '../interfaces/status-codes';
import { caseNeedsComplement, caseNeedsSigning, getCasesRequiringAction } from './case-service';

// api-service pulls in path aliases that are not mapped in jest; it is not needed here.
jest.mock('./api-service', () => ({ apiService: {} }));

const caseWithStatus = (label: string, caseId = label): ICaseStatusResponse =>
  ({
    caseId,
    status: { code: statusCodes.Ongoing, color: 'info', label },
  }) as ICaseStatusResponse;

describe('case-service', () => {
  describe('caseNeedsSigning', () => {
    it('is true for cases waiting for multi-party signing', () => {
      expect(caseNeedsSigning(caseWithStatus('Väntar på flerpartssignering'))).toBe(true);
    });

    it('is false for other statuses', () => {
      expect(caseNeedsSigning(caseWithStatus('Komplettering behövs'))).toBe(false);
      expect(caseNeedsSigning(caseWithStatus('Sparat'))).toBe(false);
    });
  });

  describe('caseNeedsComplement', () => {
    it('is true for complement statuses only', () => {
      expect(caseNeedsComplement(caseWithStatus('Komplettering behövs'))).toBe(true);
      expect(caseNeedsComplement(caseWithStatus('Väntar på komplettering'))).toBe(true);
      expect(caseNeedsComplement(caseWithStatus('Påminnelse om komplettering'))).toBe(true);
      expect(caseNeedsComplement(caseWithStatus('Väntar på flerpartssignering'))).toBe(false);
    });
  });

  describe('getCasesRequiringAction', () => {
    it('keeps complement and signing cases and drops the rest', () => {
      const data: CasesData = {
        labels: [],
        cases: [
          caseWithStatus('Komplettering behövs'),
          caseWithStatus('Väntar på flerpartssignering'),
          caseWithStatus('Sparat'),
          caseWithStatus('Handläggning pågår'),
          caseWithStatus('Avslutat'),
        ],
      };

      const result = getCasesRequiringAction(data);

      expect(result.cases.map((c) => c.caseId)).toEqual(['Komplettering behövs', 'Väntar på flerpartssignering']);
    });
  });
});
