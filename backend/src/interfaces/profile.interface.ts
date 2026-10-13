import { Profile as SamlProfile } from '@node-saml/passport-saml';

export interface Profile extends SamlProfile {
  citizenIdentifier: string;
  givenName: string;
  surname: string;
  Surname: string;
  attributes: { [key: string]: any };
}
