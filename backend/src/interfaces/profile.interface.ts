import { Profile as SamlProfile } from 'passport-saml';
import { User } from './users.interface';

export interface Profile extends SamlProfile {
  citizenIdentifier: string;
  givenName: string;
  surname: string;
  username: string;
  attributes: { [key: string]: any };
}

/** VerifiedCallback from 'passport-saml' */
export type ProfileCallback = (err: Error | null, user?: User, info?: Record<string, unknown>) => void;
