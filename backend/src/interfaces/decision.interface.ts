// The attachment metadata the client needs to trigger and name a download. Content is
// fetched separately, and `namespace`/`errandId` are deliberately kept server-side so a
// manipulated request cannot point the proxy at another party's errand.
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
