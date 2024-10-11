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

/** ContactChannel model */
export interface ContactChannel {
  /** ContactMethod model */
  contactMethod: ContactMethod;
  /**
   * Alias for the destination
   * @example "Private phone"
   */
  alias: string;
  /**
   * Point of destination
   * @example "+46701234567"
   */
  destination: string;
  /**
   * Signal if channel should be used or not when sending message
   * @default false
   * @example true
   */
  disabled?: boolean;
}

/** ContactMethod model */
export enum ContactMethod {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

/** ContactSettingCreateRequest model */
export interface ContactSettingCreateRequest {
  /**
   * ID of the person or organization to whom the contact setting applies. Set to null when creating a 'virtual' contact setting.
   * @example "15aee472-46ab-4f03-9605-68bd64ebc73f"
   */
  partyId: string;
  /**
   * ID of the contact setting that created this instance. Mandatory for virtual contact settings.
   * @example "9ca9425e-42cf-4145-a9e7-d77e1ea9e5b0"
   */
  createdById: string;
  /**
   * Alias for this contact setting
   * @example "My contact-settings"
   */
  alias?: string;
  /** List of contact channels connected to this contact setting */
  contactChannels?: ContactChannel[];
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, object>;
  status?: StatusType;
  detail?: string;
  title?: string;
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
  detail?: string;
  title?: string;
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

/** DelegateCreateRequest model */
export interface DelegateCreateRequest {
  /**
   * Contact setting ID of the delegate principal (owner)
   * @example "0d64c132-3aea-11ec-8d3d-0242ac130003"
   */
  principalId: string;
  /**
   * Contact setting ID of the delegate agent
   * @example "4a758ca4-6df5-43f4-a7ce-612f51f9da09"
   */
  agentId: string;
  /** Filters used by this delegate */
  filters: Filter[];
}

/** Filter model */
export interface Filter {
  /**
   * ID of the filter
   * @example "5d8403b1-1bf0-4cb1-b39e-c7c504d501a1"
   */
  id?: string;
  /**
   * The filter alias
   * @example "My filter for delegating messages to a friend"
   */
  alias?: string;
  /**
   * The channel that created this filter.
   * @example "Sundsvalls Energi"
   */
  channel?: string;
  /**
   * Timestamp when filter was created
   * @format date-time
   * @example "2020-08-31T01:30:00+02:00"
   */
  created?: string;
  /**
   * Timestamp when filter was last modified
   * @format date-time
   * @example "2020-08-31T01:30:00+02:00"
   */
  modified?: string;
  /**
   * The filter rules.
   * If more than one rule exists, there will be an implicit AND-condition between the rules.
   * I.e. all rules must evaluate to true in order to pass the filter.
   */
  rules: Rule[];
}

/**
 * Operator model
 * @example "EQUALS"
 */
export enum Operator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
}

/**
 * Rule model.
 *
 * Here are some rule examples.
 *
 * A rule that mathches everything. The MATCH_ALL_RULE:
 * {
 * "attributeName": "*",
 * "operator": "EQUALS",
 * "attributeValue": "*"
 * }
 *
 * A rule that matches a single attribute:
 * {
 * "attributeName": "someAttributeName",
 * "operator": "EQUALS",
 * "attributeValue": "theValue"
 * }
 *
 * A rule that matches everything but a single attribute (i.e. a negation of the rule above):
 * {
 * "attributeName": "someAttributeName",
 * "operator": "NOT_EQUALS",
 * "attributeValue": "theValue"
 * }
 */
export interface Rule {
  /**
   * The attribute name to apply the filter rule on
   * @example "facilityId"
   */
  attributeName: string;
  /** Operator model */
  operator: Operator;
  /**
   * The attribute value to apply the filter rule on
   * @example "12345678"
   */
  attributeValue: string;
}

/** ContactSettingUpdateRequest model */
export interface ContactSettingUpdateRequest {
  /**
   * Alias for this contact setting
   * @example "My contact-setting"
   */
  alias?: string;
  /** List of contact channels connected to this contact setting */
  contactChannels?: ContactChannel[];
}

/** ContactSetting model */
export interface ContactSetting {
  /**
   * ID of the contact setting
   * @example "0d64c132-3aea-11ec-8d3d-0242ac130003"
   */
  id?: string;
  /**
   * ID of the person or organization to which the contact setting applies
   * @example "15aee472-46ab-4f03-9605-68bd64ebc73f"
   */
  partyId?: string;
  /**
   * Municipality ID
   * @example "2281"
   */
  municipalityId?: string;
  /**
   * ID of the contact setting that created this instance. Applicable for virtual contact settings.
   * @example "9ca9425e-42cf-4145-a9e7-d77e1ea9e5b0"
   */
  createdById?: string;
  /**
   * Alias for the person or organization to which the contact setting applies
   * @example "My contact-settings"
   */
  alias?: string;
  /**
   * Shows if the contact setting is virtual or not. A virtual instance doesn't have a partyId (i.e. doesn't have a direct relation to a real person/organization)
   * @example false
   */
  virtual?: boolean;
  /** List of contact channels connected to this contact setting */
  contactChannels?: ContactChannel[];
  /**
   * Timestamp when contact setting was created
   * @format date-time
   * @example "2020-08-31T01:30:00+02:00"
   */
  created?: string;
  /**
   * Timestamp when contact setting was last modified
   * @format date-time
   * @example "2020-08-31T01:30:00+02:00"
   */
  modified?: string;
}

export interface MultiValueMapStringString {
  all?: Record<string, string>;
  empty?: boolean;
  [key: string]: any;
}

/** FindDelegatesParameters model */
export interface FindDelegatesParameters {
  /**
   * Agent contact setting ID
   * @example "15aee472-46ab-4f03-9605-68bd64ebc73f"
   */
  agentId?: string;
  /**
   * Principal contact setting ID
   * @example "15aee472-46ab-4f03-9605-68bd64ebc73f"
   */
  principalId?: string;
}

/** Delegate model */
export interface Delegate {
  /**
   * ID of the delegate
   * @example "0d64c132-3aea-11ec-8d3d-0242ac130003"
   */
  id?: string;
  /**
   * Contact setting ID of the delegate principal (owner)
   * @example "0d64c132-3aea-11ec-8d3d-0242ac130003"
   */
  principalId?: string;
  /**
   * Contact setting ID of the delegate agent (performer)
   * @example "0d64c132-3aea-11ec-8d3d-0242ac130003"
   */
  agentId?: string;
  /**
   * Timestamp when delegate was created
   * @format date-time
   * @example "2020-08-31T01:30:00+02:00"
   */
  created?: string;
  /**
   * Timestamp when delegate was last modified
   * @format date-time
   * @example "2020-08-31T01:30:00+02:00"
   */
  modified?: string;
  /**
   * The delegate filters.
   * If more than one filter exists, there will be an implicit OR-condition between the filters.
   * I.e. at least one filter must evaluate to true in order to delegate anything.
   * At least one filter must exist on a delegate. If everything should be delegated, a MATCH_ALL_RULE can be used (see: Rule-model)
   */
  filters?: Filter[];
}
