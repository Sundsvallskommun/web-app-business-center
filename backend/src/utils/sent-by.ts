/**
 * Builds the `X-Sent-By` header that identifies the caller to caremanagement. A citizen/applicant
 * is identified by their partyId (type=partyId); caremanagement derives the "caller's side" from
 * this header and rejects requests without it (400). Format matches the rest of the codebase
 * (see case.controller / feedback.controller).
 */
export const sentByPartyId = (partyId: string): Record<string, string> => ({ 'X-Sent-By': `${partyId};type=partyId` });
