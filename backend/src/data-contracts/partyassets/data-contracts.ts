/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Status model */
export enum Status {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  BLOCKED = "BLOCKED",
  TEMPORARY = "TEMPORARY",
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
  title?: string;
  detail?: string;
  status?: StatusType;
}

export interface StatusType {
  /** @format int32 */
  statusCode?: number;
  reasonPhrase?: string;
}

export interface ConstraintViolationProblem {
  cause?: ThrowableProblem;
  stackTrace?: {
    classLoaderName?: string;
    moduleName?: string;
    moduleVersion?: string;
    methodName?: string;
    fileName?: string;
    /** @format int32 */
    lineNumber?: number;
    className?: string;
    nativeMethod?: boolean;
  }[];
  /** @format uri */
  type?: string;
  status?: StatusType;
  violations?: Violation[];
  title?: string;
  message?: string;
  /** @format uri */
  instance?: string;
  parameters?: Record<string, object>;
  detail?: string;
  suppressed?: {
    stackTrace?: {
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      /** @format int32 */
      lineNumber?: number;
      className?: string;
      nativeMethod?: boolean;
    }[];
    message?: string;
    localizedMessage?: string;
  }[];
  localizedMessage?: string;
}

export interface ThrowableProblem {
  cause?: ThrowableProblem;
  stackTrace?: {
    classLoaderName?: string;
    moduleName?: string;
    moduleVersion?: string;
    methodName?: string;
    fileName?: string;
    /** @format int32 */
    lineNumber?: number;
    className?: string;
    nativeMethod?: boolean;
  }[];
  message?: string;
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
  title?: string;
  detail?: string;
  status?: StatusType;
  suppressed?: {
    stackTrace?: {
      classLoaderName?: string;
      moduleName?: string;
      moduleVersion?: string;
      methodName?: string;
      fileName?: string;
      /** @format int32 */
      lineNumber?: number;
      className?: string;
      nativeMethod?: boolean;
    }[];
    message?: string;
    localizedMessage?: string;
  }[];
  localizedMessage?: string;
}

export interface Violation {
  field?: string;
  message?: string;
}

export interface AssetCreateRequest {
  /**
   * Asset id
   * @minLength 1
   * @example "PRH-123456789"
   */
  assetId: string;
  /**
   * Source of origin for the asset
   * @example "CASEDATA"
   */
  origin?: string;
  /**
   * PartyId
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  partyId: string;
  /**
   * Case reference ids
   * @example ["123e4567-e89b-12d3-a456-426614174000"]
   */
  caseReferenceIds?: string[];
  /**
   * Asset type
   * @minLength 1
   * @example "PERMIT"
   */
  type: string;
  /**
   * Issued date
   * @format date
   * @example "2021-01-01"
   */
  issued: string;
  /**
   * Valid to date
   * @format date
   * @example "2021-12-31"
   */
  validTo?: string;
  /** Status model */
  status: Status;
  /**
   * Status reason
   * @example "Status reason"
   */
  statusReason?: string;
  /**
   * Asset description
   * @example "Asset description"
   */
  description?: string;
  /**
   * Additional parameters
   * @example {"foo":"bar"}
   */
  additionalParameters?: Record<string, string>;
}

export interface AssetUpdateRequest {
  /**
   * Case reference ids
   * @example ["123e4567-e89b-12d3-a456-426614174000"]
   */
  caseReferenceIds?: string[];
  /**
   * Valid to date
   * @format date
   * @example "2021-12-31"
   */
  validTo?: string;
  /** Status model */
  status?: Status;
  /**
   * Status reason
   * @example "Status reason"
   */
  statusReason?: string;
  /**
   * Additional parameters
   * @example {"foo":"bar"}
   */
  additionalParameters?: Record<string, string>;
}

export interface Asset {
  /**
   * Unique id of asset
   * @example "1c8f38a6-b492-4037-b7dc-de5bc6c629f0"
   */
  id?: string;
  /**
   * External asset id
   * @example "PRH-123456789"
   */
  assetId?: string;
  /**
   * Source of origin for the asset
   * @example "CASEDATA"
   */
  origin?: string;
  /**
   * PartyId
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  partyId?: string;
  /**
   * Case reference ids
   * @example ["945576d3-6e92-4118-ba33-53582d338ad3"]
   */
  caseReferenceIds?: string[];
  /**
   * Asset type
   * @example "PERMIT"
   */
  type?: string;
  /**
   * Issued date
   * @format date
   * @example "2021-01-01"
   */
  issued?: string;
  /**
   * Valid to date
   * @format date
   * @example "2021-12-31"
   */
  validTo?: string;
  /** Status model */
  status?: Status;
  /**
   * Status reason
   * @example "Status reason"
   */
  statusReason?: string;
  /**
   * Asset description
   * @example "Asset description"
   */
  description?: string;
  /**
   * Additional parameters
   * @example {"foo":"bar"}
   */
  additionalParameters?: Record<string, string>;
}
