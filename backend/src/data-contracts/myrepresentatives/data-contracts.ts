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

/** Mandate Template information. Contains details about mandate templates. */
export interface MandateTemplate {
  /**
   * Code for the specific template
   * @example "bf1a690b-33d6-4a3e-b407-e7346fa1c97c"
   */
  code?: string;
  /**
   * Title for the specific template
   * @example "Fullmakt för att göra och hantera anmälan"
   */
  title?: string;
  /**
   * Description for the specific template
   * @example "Behörigheten ger fullmaktshavaren rätt att upprätta anmälan, ta del av eget utrymme och ändra uppgifter gällande åtgärden samt på annat sätt företräda byggherren i åtgärder enligt 6 kap. 5 § plan- och byggförordningen (2011:338). Behörigheten omfattar även rätt att upprätta, se och ändra uppgifter gällande start- och slutbesked enligt 10 kap. 3 och 4 §§ plan- och bygglagen (2010:900)."
   */
  description?: string;
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
  status?: StatusType;
  title?: string;
  detail?: string;
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
  status?: StatusType;
  title?: string;
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

export interface Violation {
  field?: string;
  message?: string;
}

/** Mandate information model. */
export interface Mandate {
  /** Base response information for the issuer of mandates / authorities */
  mandateIssuer?: ResponseIssuer;
  mandateAcquirers?: ResponseAcquirer[];
  /**
   * If the issuer is an organization or private person
   * @example "ORGANIZATION"
   */
  mandateRole?: MandateMandateRoleEnum;
  /**
   * Date when the mandate was issued
   * @format date-time
   */
  issuedDate?: string;
  /**
   * Map of UUIDs to lists of permissions.
   * @example {"3bfb975d-c2a9-4f16-b8e5-11c22a318fad":[{"code":"db0023d9-3d19-482f-b43c-47e0073484a2"}]}
   */
  permissions?: Record<string, Permission[]>;
}

/** Mandate response model */
export interface MandatesResponse {
  mandates?: Mandate[];
  /** Metadata model */
  _meta?: MetaData;
}

/** Metadata model */
export interface MetaData {
  /**
   * Current page
   * @format int32
   * @example 5
   */
  page?: number;
  /**
   * Displayed objects per page
   * @format int32
   * @example 20
   */
  limit?: number;
  /**
   * Total amount of hits based on provided search parameters
   * @format int64
   * @example 98
   */
  totalRecords?: number;
  /**
   * Total amount of pages based on provided search parameters
   * @format int32
   * @example 23
   */
  totalPages?: number;
}

/**
 * Map of UUIDs to lists of permissions.
 * @example {"3bfb975d-c2a9-4f16-b8e5-11c22a318fad":[{"code":"db0023d9-3d19-482f-b43c-47e0073484a2"}]}
 */
export interface Permission {
  /**
   * Code for the specific permission
   * @example "bf1a690b-33d6-4a3e-b407-e7346fa1c97c"
   */
  code?: string;
  /**
   * Description for the specific permission
   * @example "Fullmakt för att hantera ansökan om strandskyddsdispens"
   */
  description?: string;
}

/** Base response information for the acquirer of mandates / authorities */
export interface ResponseAcquirer {
  /**
   * PartyId for the sole trader or organization
   * @example "fb2f0290-3820-11ed-a261-0242ac120002"
   */
  partyId?: string;
  /**
   * Type, private person (pnr) or sole trader / organization (orgnr)
   * @example "pnr"
   */
  type?: string;
  /** Name of company / person */
  name?: string;
  /** LegalId for person, sole trader or organization */
  legalId?: string;
}

/** Base response information for the issuer of mandates / authorities */
export interface ResponseIssuer {
  /**
   * PartyId for the sole trader or organization
   * @example "fb2f0290-3820-11ed-a261-0242ac120002"
   */
  partyId?: string;
  /** Type, private person (pnr) or sole trader / organization (orgnr) */
  type?: string;
  /** Name of company / person */
  name?: string;
  /** LegalId for person, sole trader or organization */
  legalId?: string;
}

/** Simple representation of the JSON Web Key Set (JWKS). */
export interface Jwks {
  keys?: Record<string, object>[];
}

/** Mandate response model */
export interface AuthoritiesResponse {
  authorities?: Authority[];
  /** Metadata model */
  _meta?: MetaData;
}

/** Authority information model. */
export interface Authority {
  /** Base response information for the issuer of mandates / authorities */
  authorityIssuer?: ResponseIssuer;
  authorityAcquirers?: ResponseAcquirer[];
  /**
   * If the issuer is an organization or private person
   * @example "ORGANIZATION"
   */
  authorityRole?: AuthorityAuthorityRoleEnum;
  /**
   * Reference number intended as a reference between client and third party
   * @example "MOF1234567890"
   */
  referenceNumber?: string;
  /**
   * Status of the authority
   * @example "ACTIVE"
   */
  status?: AuthorityStatusEnum;
  /**
   * Unique ID for the authority
   * @example "bf31188a-bfbb-4f23-a60a-89c75d009b53"
   */
  id?: string;
  /** What the authority represents */
  description?: string;
  /**
   * Date when the authority was issued
   * @format date-time
   */
  issuedDate?: string;
  /**
   * Date from when the authority is valid
   * @format date
   */
  validFrom?: string;
  /**
   * Date to when the authority ceased to be valid
   * @format date
   */
  validTo?: string;
}

/**
 * If the issuer is an organization or private person
 * @example "ORGANIZATION"
 */
export enum MandateMandateRoleEnum {
  PRIVATE = 'PRIVATE',
  ORGANIZATION = 'ORGANIZATION',
}

/**
 * If the issuer is an organization or private person
 * @example "ORGANIZATION"
 */
export enum AuthorityAuthorityRoleEnum {
  PRIVATE = 'PRIVATE',
  ORGANIZATION = 'ORGANIZATION',
}

/**
 * Status of the authority
 * @example "ACTIVE"
 */
export enum AuthorityStatusEnum {
  ACTUAL = 'ACTUAL',
  VALID = 'VALID',
  HISTORICAL = 'HISTORICAL',
}

/**
 * Type, private person (pnr) or sole trader / organization (orgnr)
 * @example "pnr"
 */
export enum GetMandatesParamsMandateIssuerTypeEnum {
  Pnr = 'pnr',
  Orgnr = 'orgnr',
}

/**
 * Type, private person (pnr) or sole trader / organization (orgnr)
 * @example "pnr"
 */
export enum GetMandatesParamsMandateAcquirerTypeEnum {
  Pnr = 'pnr',
  Orgnr = 'orgnr',
}

/**
 * Type, private person (pnr) or sole trader / organization (orgnr)
 * @example "pnr"
 */
export enum GetAuthoritiesParamsAuthorityIssuerTypeEnum {
  Pnr = 'pnr',
  Orgnr = 'orgnr',
}

/**
 * Type, private person (pnr) or sole trader / organization (orgnr)
 * @example "pnr"
 */
export enum GetAuthoritiesParamsAuthorityAcquirerTypeEnum {
  Pnr = 'pnr',
  Orgnr = 'orgnr',
}
