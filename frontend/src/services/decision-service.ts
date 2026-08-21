import { ApiResponse, apiService } from './api-service';

export interface ClientDecisionAttachment {
  id: number;
  name: string;
  mimeType?: string;
  extension?: string;
}

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
  attachments?: ClientDecisionAttachment[];
}

// The decision payload no longer carries the file content, so it is fetched per
// attachment. Returns null on failure so the caller can show an error instead of
// downloading an empty file.
export const getDecisionAttachment: (decisionId: number, attachmentId: number) => Promise<string | null> = (decisionId, attachmentId) =>
  apiService
    .get<ApiResponse<string>>(`/decisions/${decisionId}/attachments/${attachmentId}`)
    .then((res) => res.data.data)
    .catch(() => null);

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
