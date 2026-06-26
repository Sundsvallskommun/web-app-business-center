/**
 * Builds the `X-Sent-By` header that identifies the caller to caremanagement. A citizen/applicant
 * is identified by their partyId (type=partyId); caremanagement derives the "caller's side" from
 * this header and rejects requests without it (400).
 *
 * The dept44 Identifier parser is strict about the format `<value>; type=<type>` — note the space
 * after the semicolon (it shows that exact shape in its 400: `<uuid>; type=partyId`). Some endpoints
 * (e.g. eligibility) accept the spaceless form, but the errand-create endpoint rejects it as
 * malformed, so we always emit the documented spaced format.
 */
export const sentByPartyId = (partyId: string): Record<string, string> => ({ 'X-Sent-By': `${partyId}; type=partyId` });
