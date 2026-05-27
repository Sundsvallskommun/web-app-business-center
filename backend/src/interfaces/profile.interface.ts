import { Profile as SamlProfile } from '@node-saml/passport-saml';

export interface Profile extends SamlProfile {
  citizenIdentifier: string;
  firstname: string;
  Surname: string;
  attributes: { [key: string]: any };
}
