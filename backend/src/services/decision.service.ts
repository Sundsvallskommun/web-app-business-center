import { Attachment, Decision, DecisionDecisionTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseDataNamespace } from '@/interfaces/casedata.interface';

export const isFinalDecision = (decision: Decision): boolean => decision.decisionType === DecisionDecisionTypeEnum.FINAL;

interface OwnedDecisionAttachment {
  decision: Decision;
  attachment: Attachment;
  errandId: number;
}

/**
 * Resolve a decision and one of its attachments from the party scoped decision listing.
 * Returns null unless the decision belongs to the representing party, is a FINAL decision
 * (the only kind the UI shows) and the attachment sits on that specific decision - an
 * attachment id belonging to another decision must not be reachable through this one.
 */
export const findOwnedDecisionAttachment = (decisions: Decision[], decisionId: number, attachmentId: number): OwnedDecisionAttachment | null => {
  const decision = decisions.filter(isFinalDecision).find(d => d.id === decisionId);
  const attachment = decision?.attachments?.find(a => a.id === attachmentId);

  if (!decision || !attachment || !decision.errandId) {
    return null;
  }

  return { decision, attachment, errandId: decision.errandId };
};

const knownNamespaces: readonly string[] = Object.values(CaseDataNamespace);

/**
 * The party scoped decision endpoint is not namespaced, so the payload may come back
 * without one. Prefer the decision's own namespace, then the attachment's, and fall back
 * to the namespaces this app serves. Probing is safe since ownership is already verified
 * before any URL is built.
 */
export const resolveDecisionNamespaces = (decision: Decision, attachment: Attachment): string[] => {
  const namespace = decision.namespace ?? attachment.namespace;
  return namespace ? [namespace] : [...knownNamespaces];
};
