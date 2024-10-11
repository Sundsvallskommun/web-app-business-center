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

export interface CaseStatusResponse {
  id?: string;
  externalCaseId?: string;
  caseType?: string;
  status?: string;
  firstSubmitted?: string;
  lastStatusChange?: string;
  openEErrand?: boolean;
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

export interface CasePdfResponse {
  externalCaseId?: string;
  base64?: string;
}

export interface OepStatusResponse {
  key?: string;
  value?: string;
}
