// Stable test values referenced across more than one test or fixture.
// Scenario-specific scaffolding (varying grantor IDs, throwaway org numbers,
// sample addresses) stays inline at the call site.

// IMPORTANT
// The value below is a test person number from Skatteverket, it is not a real person number
export const mockPersonNumber = '199001012385';
export const TEST_USER_PARTY_ID = 'test-party-id';
export const TEST_REPRESENTING_PARTY_ID = 'party-123';
export const TEST_LEGAL_ENTITY_GUID = 'abc-123-guid';
// The value below is an invalid test person number for testing validation, it is not a real person number
export const mockInvalidPersonNumber = '199001012386';
// The value below is a non existing test person number for testing validation, it is not a real person number
export const mockNonexistentPersonNumber = '199909092380';
// The value below is an organization number for testing validation, it is not a organization number
export const mockOrganizationNumber = '556026-9986';
export const mockInvalidOrganizationNumber = '556026-9987';
// The value below is a test email, it is not a real email
export const mockEmail = 'a@example.com';
// The value below is a test email, it is not a real email
export const mockRecipientEmail = ' mail@example.com';
// The value below is a test phone number from Post- och telestyrelsen, it is not a real phone number
export const mockPhoneNumber = '0701740635';
// The value below is a test phone number from Post- och telestyrelsen, it is not a real phone number
export const mockPhoneNumberCountryCode = '+46701740635';
// The value below is a test username, it is not a real username
export const mockAdUsername = 'abc01abc';
