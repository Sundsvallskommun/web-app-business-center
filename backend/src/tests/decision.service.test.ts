import { Decision, DecisionDecisionTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseDataNamespace } from '@/interfaces/casedata.interface';
import { findOwnedDecisionAttachment, isFinalDecision, resolveDecisionNamespaces, toClientDecision } from '@/services/decision.service';

const mockDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1,
  errandId: 10,
  errandNumber: 'PRH-2026-000001',
  decisionType: DecisionDecisionTypeEnum.FINAL,
  namespace: CaseDataNamespace.SBK_PARKING_PERMIT,
  attachments: [{ id: 100, name: 'beslut.pdf', mimeType: 'application/pdf', extension: 'pdf' }],
  ...overrides,
});

describe('decision.service', () => {
  describe('isFinalDecision', () => {
    it('accepts final decisions and rejects proposed ones', () => {
      expect(isFinalDecision(mockDecision())).toBe(true);
      expect(isFinalDecision(mockDecision({ decisionType: DecisionDecisionTypeEnum.PROPOSED }))).toBe(false);
    });
  });

  describe('toClientDecision', () => {
    it('maps attachment metadata needed to name and open a download', () => {
      const result = toClientDecision(mockDecision());

      expect(result.attachments).toEqual([{ id: 100, name: 'beslut.pdf', mimeType: 'application/pdf', extension: 'pdf' }]);
    });

    it('drops attachments that cannot be downloaded or named', () => {
      const decision = mockDecision({
        attachments: [{ id: 100, name: 'beslut.pdf' }, { id: 101 }, { name: 'utan-id.pdf' }],
      });

      expect(toClientDecision(decision).attachments).toEqual([{ id: 100, name: 'beslut.pdf', mimeType: undefined, extension: undefined }]);
    });

    it('never exposes file content or the internal namespace to the client', () => {
      const result = toClientDecision(mockDecision());

      expect(result).not.toHaveProperty('namespace');
      expect(result.attachments?.[0]).not.toHaveProperty('file');
    });
  });

  describe('findOwnedDecisionAttachment', () => {
    const ownDecision = mockDecision();
    const otherDecision = mockDecision({ id: 2, errandId: 20, attachments: [{ id: 200, name: 'annat-beslut.pdf' }] });
    const decisions = [ownDecision, otherDecision];

    it('resolves the decision, attachment and errand id for an owned pair', () => {
      const result = findOwnedDecisionAttachment(decisions, 1, 100);

      expect(result).toEqual({ decision: ownDecision, attachment: ownDecision.attachments?.[0], errandId: 10 });
    });

    it('rejects an attachment id belonging to another decision', () => {
      expect(findOwnedDecisionAttachment(decisions, 1, 200)).toBeNull();
    });

    it('rejects a decision the party does not have', () => {
      expect(findOwnedDecisionAttachment(decisions, 999, 100)).toBeNull();
    });

    it('rejects decisions that are not final, since they are never shown', () => {
      const proposed = [mockDecision({ decisionType: DecisionDecisionTypeEnum.PROPOSED })];

      expect(findOwnedDecisionAttachment(proposed, 1, 100)).toBeNull();
    });

    it('rejects decisions without an errand id, since no upstream url can be built', () => {
      const withoutErrand = [mockDecision({ errandId: undefined })];

      expect(findOwnedDecisionAttachment(withoutErrand, 1, 100)).toBeNull();
    });
  });

  describe('resolveDecisionNamespaces', () => {
    it('prefers the namespace of the decision', () => {
      const decision = mockDecision({ namespace: CaseDataNamespace.SBK_MEX });

      expect(resolveDecisionNamespaces(decision, { namespace: CaseDataNamespace.CONTACTSUNDSVALL })).toEqual([CaseDataNamespace.SBK_MEX]);
    });

    it('falls back to the namespace of the attachment', () => {
      const decision = mockDecision({ namespace: undefined });

      expect(resolveDecisionNamespaces(decision, { namespace: CaseDataNamespace.CONTACTSUNDSVALL })).toEqual([CaseDataNamespace.CONTACTSUNDSVALL]);
    });

    it('falls back to every namespace this app serves when neither carries one', () => {
      const decision = mockDecision({ namespace: undefined });

      expect(resolveDecisionNamespaces(decision, {})).toEqual(Object.values(CaseDataNamespace));
    });
  });
});
