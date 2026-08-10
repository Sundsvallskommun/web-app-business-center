// Stable test values referenced across more than one test or fixture.
// Scenario-specific scaffolding (varying grantor IDs, throwaway org numbers,
// sample addresses) stays inline at the call site.

// IMPORTANT
// The value below is a test person number from Skatteverket, it is not a real person number
export const mockPersonNumber = '199001012385';
export const TEST_USER_PARTY_ID = 'test-party-id';
export const TEST_REPRESENTING_PARTY_ID = 'party-123';
// A citizen being looked up by partyId (citizen.service).
export const TEST_CITIZEN_PARTY_ID = 'party-1';
// An organization's partyId, e.g. the grantor/represented org (mandate.service).
export const TEST_ORG_PARTY_ID = 'org-1';
// A counterparty (a different citizen) in conversation/message tests (case.service).
export const TEST_OTHER_PARTY_ID = 'party-other';
export const TEST_LEGAL_ENTITY_GUID = 'abc-123-guid';
// The value below is an organization number for testing validation, it is not a organization number
export const mockOrganizationNumber = '556026-9986';
