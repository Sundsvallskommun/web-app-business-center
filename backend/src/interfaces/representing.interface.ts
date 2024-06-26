import { BusinessInformation } from './business-engagement';

export enum RepresentingMode {
  PRIVATE,
  BUSINESS,
}

export interface RepresentingBusinessEntity {
  partyId: string;
  organizationName: string;
  organizationNumber: string;
  information: BusinessInformation;
}
export type RepresentingBusinessEntityClient = Omit<RepresentingBusinessEntity, 'partyId'>;

export interface RepresentingPrivateEntity {
  partyId: string;
  name: string;
  personNumber: string;
}
export type RepresentingPrivateEntityClient = Omit<RepresentingPrivateEntity, 'partyId' | 'personNumber'>;

export interface RepresentingEntity {
  PRIVATE?: RepresentingPrivateEntity;
  BUSINESS?: RepresentingBusinessEntity;
  mode: RepresentingMode;
}

export interface RepresentingEntityClient {
  PRIVATE?: RepresentingPrivateEntityClient;
  BUSINESS?: RepresentingBusinessEntityClient;
  mode: RepresentingMode;
}
