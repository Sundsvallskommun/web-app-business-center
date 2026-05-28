export interface ClientDecision {
  id?: number;
  errandId?: number;
  errandNumber?: string;
  decisionType?: string;
  decisionOutcome?: string;
  description?: string;
  decidedAt?: string;
  validFrom?: string;
  validTo?: string;
  created?: string;
  attachments?: {
    id?: number;
    name?: string;
    file?: string;
  }[];
}

const decisionOutcomeLabels: Record<string, string> = {
  APPROVAL: 'Bifall',
  REJECTION: 'Avslag',
  DISMISSAL: 'Avvisat',
  CANCELLATION: 'Avskrivning',
};

export const getDecisionOutcomeLabel = (outcome?: string): string => {
  if (!outcome) return '';
  return decisionOutcomeLabels[outcome] ?? outcome;
};

export const sortDecisionsByDate = (decisions: ClientDecision[]): ClientDecision[] => {
  return [...decisions].sort((a, b) => {
    const dateA = a.decidedAt ? new Date(a.decidedAt).getTime() : 0;
    const dateB = b.decidedAt ? new Date(b.decidedAt).getTime() : 0;
    return dateB - dateA;
  });
};
