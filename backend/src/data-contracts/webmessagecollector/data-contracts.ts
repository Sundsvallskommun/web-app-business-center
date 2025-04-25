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

/**
 * List of attachments for the message
 * @example "attachment1, attachment2"
 */
export interface MessageAttachment {
  /**
   * The Id for the attachment
   * @format int32
   * @example 1
   */
  attachmentId?: number;
  /**
   * The name of the file
   * @example "file.txt"
   */
  name?: string;
  /**
   * The extension of the file
   * @example "txt"
   */
  extension?: string;
  /**
   * The mime type of the file
   * @example "text/plain"
   */
  mimeType?: string;
}

export interface MessageDTO {
  /**
   * The webMessageCollector Id for the message
   * @format int32
   * @example 1
   */
  id?: number;
  /**
   * If the message is inbound or outbound from the perspective of case-data/e-service.
   * @example "INBOUND"
   */
  direction?: MessageDtoDirectionEnum;
  /**
   * The municipality id
   * @example "2281"
   */
  municipalityId?: string;
  /**
   * What E-service the message was found in
   * @example "501"
   */
  familyId?: string;
  /**
   * The external caseID
   * @example "caa230c6-abb4-4592-ad9a-34e263c2787b"
   */
  externalCaseId?: string;
  /**
   * The message
   * @example "Hello World"
   */
  message?: string;
  /**
   * The unique messageId from openE for the message
   * @example "12"
   */
  messageId?: string;
  /**
   * Time and date the message was sent
   * @example "2023-02-23 17:26:23"
   */
  sent?: string;
  /**
   * Username for the poster
   * @example "te01st"
   */
  username?: string;
  /**
   * Firstname of the poster
   * @example "Test"
   */
  firstName?: string;
  /**
   * Lastname of the poster
   * @example "Testsson"
   */
  lastName?: string;
  /**
   * Email for the poster
   * @example "test@sundsvall.se"
   */
  email?: string;
  /**
   * The userId for the poster
   * @example "123"
   */
  userId?: string;
  attachments?: MessageAttachment[];
  /**
   * The instance of the message
   * @example "external"
   */
  instance?: string;
}

/**
 * If the message is inbound or outbound from the perspective of case-data/e-service.
 * @example "INBOUND"
 */
export enum MessageDtoDirectionEnum {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}
