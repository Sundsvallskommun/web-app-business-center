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

/** Operator model */
export enum Operator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
}

/** ContactMethod model */
export enum ContactMethod {
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  title?: string;
  detail?: string;
  /** @format int32 */
  status?: number;
}

export interface ConstraintViolationProblem {
  /** @format uri */
  type?: string;
  /** @format int32 */
  status?: number;
  violations?: Violation[];
  title?: string;
  /** @format uri */
  instance?: string;
  detail?: string;
  causeAsProblem?: ThrowableProblem;
}

export interface ThrowableProblem {
  /** @format uri */
  type?: string;
  title?: string;
  /** @format int32 */
  status?: number;
  detail?: string;
  /** @format uri */
  instance?: string;
  causeAsProblem?: any;
}

export interface Violation {
  field?: string;
  message?: string;
}

/** ContactChannel model */
export interface ContactChannel {
  /** Method of contact */
  contactMethod: ContactMethod;
  /**
   * Alias for the destination
   * @minLength 1
   */
  alias: string;
  /**
   * Point of destination
   * @minLength 1
   */
  destination: string;
  /**
   * Signal if channel should be used or not when sending message
   * @default false
   */
  disabled?: boolean;
}

/** ContactSettingCreateRequest model */
export interface ContactSettingCreateRequest {
  /** ID of the person or organization to whom the contact setting applies. Set to null when creating a 'virtual' contact setting. */
  partyId?: string;
  /** ID of the contact setting that created this instance. Mandatory for virtual contact settings. */
  createdById?: string;
  /** Alias for this contact setting */
  alias?: string;
  /** List of contact channels connected to this contact setting */
  contactChannels?: ContactChannel[];
}

/** DelegateCreateRequest model */
export interface DelegateCreateRequest {
  /** Contact setting ID of the delegate principal (owner) */
  principalId: string;
  /** Contact setting ID of the delegate agent */
  agentId: string;
  /**
   * Filters used by this delegate
   * @minItems 1
   */
  filters: Filter[];
}

/** Filter model */
export interface Filter {
  /** ID of the filter */
  id?: string;
  /** The filter alias */
  alias?: string;
  /** The channel that created this filter. */
  channel?: string;
  /**
   * Timestamp when filter was created
   * @format date-time
   */
  created?: string;
  /**
   * Timestamp when filter was last modified
   * @format date-time
   */
  modified?: string;
  /**
   * The filter rules.
   * If more than one rule exists, there will be an implicit AND-condition between the rules.
   * I.e. all rules must evaluate to true in order to pass the filter.
   * @minItems 1
   */
  rules: Rule[];
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
   * @minLength 1
   */
  attributeName: string;
  /** The rule operator */
  operator: Operator;
  /**
   * The attribute value to apply the filter rule on
   * @minLength 1
   */
  attributeValue: string;
}

/** ContactSettingUpdateRequest model */
export interface ContactSettingUpdateRequest {
  /** Alias for this contact setting */
  alias?: string;
  /** List of contact channels connected to this contact setting */
  contactChannels?: ContactChannel[];
}

/** ContactSetting model */
export interface ContactSetting {
  /** ID of the contact setting */
  id?: string;
  /** ID of the person or organization to which the contact setting applies */
  partyId?: string;
  /** Municipality ID */
  municipalityId?: string;
  /** ID of the contact setting that created this instance. Applicable for virtual contact settings. */
  createdById?: string;
  /** Alias for the person or organization to which the contact setting applies */
  alias?: string;
  /** Shows if the contact setting is virtual or not. A virtual instance doesn't have a partyId (i.e. doesn't have a direct relation to a real person/organization) */
  virtual?: boolean;
  /** List of contact channels connected to this contact setting */
  contactChannels?: ContactChannel[];
  /**
   * Timestamp when contact setting was created
   * @format date-time
   */
  created?: string;
  /**
   * Timestamp when contact setting was last modified
   * @format date-time
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
  /** Agent contact setting ID */
  agentId?: string;
  /** Principal contact setting ID */
  principalId?: string;
}

/** Delegate model */
export interface Delegate {
  /** ID of the delegate */
  id?: string;
  /** Contact setting ID of the delegate principal (owner) */
  principalId?: string;
  /** Contact setting ID of the delegate agent (performer) */
  agentId?: string;
  /**
   * Timestamp when delegate was created
   * @format date-time
   */
  created?: string;
  /**
   * Timestamp when delegate was last modified
   * @format date-time
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
