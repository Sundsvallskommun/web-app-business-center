import { User } from '@/interfaces/users.interface';
import { mockPersonNumber, TEST_USER_PARTY_ID } from './constants';

export const mockUser: User = {
  username: 'test-user',
  partyId: TEST_USER_PARTY_ID,
  personNumber: mockPersonNumber,
  name: 'Test User',
  givenName: 'Test',
  surname: 'User',
  nameID: 'test-name-id',
  sessionIndex: 'test-session-index',
  nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
};
