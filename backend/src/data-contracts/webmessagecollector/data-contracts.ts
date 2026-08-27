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

export interface MessageAttachment {
  /**
   * The Id for the attachment
   * @format int32
   */
  attachmentId?: number;
  /** The name of the file */
  name?: string;
  /** The extension of the file */
  extension?: string;
  /** The mime type of the file */
  mimeType?: string;
}

export interface MessageDTO {
  /**
   * The webMessageCollector Id for the message
   * @format int32
   */
  id?: number;
  /** If the message is inbound or outbound from the perspective of case-data/e-service. */
  direction?: MessageDtoDirectionEnum;
  /** The municipality id */
  municipalityId?: string;
  /** What E-service the message was found in */
  familyId?: string;
  /** The external caseID  */
  externalCaseId?: string;
  /** The message  */
  message?: string;
  /** The unique messageId from openE for the message */
  messageId?: string;
  /** Time and date the message was sent  */
  sent?: string;
  /** Username for the poster */
  username?: string;
  /** Firstname of the poster  */
  firstName?: string;
  /** Lastname of the poster */
  lastName?: string;
  /** Email for the poster */
  email?: string;
  /** The userId for the poster */
  userId?: string;
  attachments?: MessageAttachment[];
  /** The instance of the message */
  instance?: string;
}

/** If the message is inbound or outbound from the perspective of case-data/e-service. */
export enum MessageDtoDirectionEnum {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}
