/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CompletionData {
  /** @format date */
  bankIdIssueDate?: string;
  /** @minLength 1 */
  signature: string;
  ocspResponse?: string;
  risk?: string;
  user: User;
  device: Device;
  stepUp?: StepUp;
}

/** CreateMandate model */
export interface CreateMandate {
  grantorDetails: GrantorDetails;
  granteeDetails: GranteeDetails;
  /** @format date */
  activeFrom: string;
  /** @format date */
  inactiveAfter?: string;
  signingInfo?: SigningInfo;
}

export interface Device {
  /** @minLength 1 */
  ipAddress: string;
  uhi?: string;
}

/** GranteeDetails model */
export interface GranteeDetails {
  partyId: string;
}

/** GrantorDetails model */
export interface GrantorDetails {
  name?: string;
  grantorPartyId: string;
  signatoryPartyId: string;
}

/** SigningInfo model */
export interface SigningInfo {
  /** @minLength 1 */
  orderRef: string;
  /** @minLength 1 */
  externalTransactionId: string;
  /** @minLength 1 */
  status: string;
  completionData: CompletionData;
}

export interface StepUp {
  mrtd?: boolean;
}

export interface User {
  /** @minLength 1 */
  personalNumber: string;
  name?: string;
  /** @minLength 1 */
  givenName: string;
  /** @minLength 1 */
  surname: string;
}

/** SearchMandateParameters model */
export interface SearchMandateParameters {
  /** @format int32 @min 1 @default 1 */
  page?: number;
  /** @format int32 @min 1 */
  limit?: number;
  grantorPartyId?: string;
  granteePartyId?: string;
  signatoryPartyId?: string;
  statuses?: string[];
}

export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** MandateDetails model */
export interface MandateDetails {
  id?: string;
  grantorDetails?: GrantorDetails;
  granteeDetails?: GranteeDetails;
  municipalityId?: string;
  namespace?: string;
  /** @format date-time */
  created?: string;
  /** @format date-time */
  updated?: string;
  /** @format date */
  activeFrom?: string;
  /** @format date */
  inactiveAfter?: string;
  status?: string;
  signingInfo?: SigningInfo;
  whitelisted?: boolean;
}

/** Paginated response containing a list of mandate details */
export interface Mandates {
  mandateDetailsList?: MandateDetails[];
  _meta?: PagingAndSortingMetaData;
}

/** PagingAndSortingMetaData model */
export interface PagingAndSortingMetaData {
  /** @format int32 */
  page?: number;
  /** @format int32 */
  limit?: number;
  /** @format int32 */
  count?: number;
  /** @format int64 */
  totalRecords?: number;
  /** @format int32 */
  totalPages?: number;
  sortBy?: string[];
  sortDirection?: Direction;
}
