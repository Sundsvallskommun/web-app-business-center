import { BusinessInformation } from './organisation-info';

export enum RepresentingMode {
  PRIVATE,
  BUSINESS,
}

export interface RepresentingEntityDto {
  organizationNumber?: string;
  personNumber?: string;
  mode?: RepresentingMode;
}
export interface RepresentingEntity {
  PRIVATE?: RepresentingPrivateEntity;
  BUSINESS?: RepresentingBusinessEntity;
  mode?: RepresentingMode;
}

export interface RepresentingBusinessEntity {
  organizationName: string;
  organizationNumber: string;
  information: BusinessInformation;
}

export interface RepresentingPrivateEntity {
  name: string;
}
