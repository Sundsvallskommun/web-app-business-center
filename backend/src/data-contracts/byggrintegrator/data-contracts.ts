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

export interface Weight {
  value?: string;
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
  causeAsProblem?: ThrowableProblem;
}

export interface Violation {
  field?: string;
  message?: string;
}

export interface KeyValue {
  /** The key of the key-value pair */
  key?: string;
  /** The value of the key-value pair */
  value?: string;
}

/** Decision on a ByggR errand */
export interface Decision {
  /**
   * ByggR event id of the decision
   * @format int32
   */
  id?: number;
  /** Decision number */
  decisionNumber?: string;
  /** Heading of the decision */
  heading?: string;
  /**
   * Date of the decision
   * @format date
   */
  decisionDate?: string;
  /** Outcome code of the decision */
  outcome?: string;
  /** Whether the decision is the main decision of the errand */
  mainDecision?: boolean;
  /** Instance type of the decision */
  instanceType?: string;
  /**
   * Date until the decision is valid
   * @format date
   */
  validUntil?: string;
  /** Documents classified as decision documents */
  documents?: DecisionDocument[];
}

/** Decision document on a ByggR errand */
export interface DecisionDocument {
  /** ByggR document id */
  id?: string;
  /** File name of the document */
  name?: string;
  /** Description of the document */
  description?: string;
  /** ByggR document type code */
  type?: string;
  /** Description of the document type */
  typeDescription?: string;
  /**
   * Date of the document
   * @format date
   */
  documentDate?: string;
  /** Url for downloading the document. The url is valid for a limited time */
  url?: string;
}

/** Decisions with decision documents for a ByggR errand */
export interface ErrandDecisions {
  /** ByggR case number (diary number) that the decisions belong to */
  caseNumber?: string;
  /** Description of the errand */
  description?: string;
  /** Property designation of the errand */
  propertyDesignation?: string;
  /** Decisions on the errand, newest first */
  decisions?: Decision[];
}
