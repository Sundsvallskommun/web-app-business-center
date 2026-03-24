export interface User extends Record<string, unknown> {
  partyId: string;
  personNumber: string;
  name: string;
  givenName: string;
  surname: string;
  username: string;
  nameID: string;
  sessionIndex: string;
  nameIDFormat: string;
}
