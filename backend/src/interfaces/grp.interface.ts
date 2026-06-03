export enum GrpSubjectIdentifierType {
  Tin = 'TIN',
  Email = 'EMAIL',
}
export interface GrpSubjectIdentifier {
  value: string;
  type: GrpSubjectIdentifierType;
}

export enum GrpUserMessageFormat {
  Plaintext = 'PLAIN_TEXT',
  Markdown = 'MARKDOWN',
  Html = 'HTML',
}

export interface GrpUserMessage {
  nonVisible?: string;
  visible: string;
  format: GrpUserMessageFormat;
}

export interface GrpInitiateBody {
  subjectIdentifier?: GrpSubjectIdentifier;
  userMessage: GrpUserMessage;
}

export interface GrpInitiateParameters {
  serviceId: string;
  provider: string;
  displayName: string;
  requestType?: 'AUTH' | 'SIGN';
  transactionId: string;
  endUserInfo: string;
  orgIdIssuer?: string;
  callInitiator?: 'USER' | 'RP';
  flowType?: 'PHONE';
}

export interface GrpInitiateResponse {
  refId: string;
  autoStartToken: string;
  qrStartToken: string;
  qrStartSecret: string;
  transactionId: string;
}

export interface GrpCollectRequest {
  refId: string;
  transactionId: string;
}

export enum GrpStatus {
  Complete = 'COMPLETE',
  Failed = 'FAILED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
}

export interface GrpProgressStatus {
  status: GrpStatus;
  substatus: string | null;
  message: string;
}

export enum GrpValidationSignatureFormat {
  xmldsig = 'xmldsig',
  pkcs7 = 'pkcs7',
  jws = 'jws',
}

export interface GrpValidationInfo {
  signature: string;
  signatureFormat: GrpValidationSignatureFormat;
  ocspResponse?: string;
}

export interface GrpUserInfo {
  subjectIdentifier: GrpSubjectIdentifier;
  displayName?: string;
  givenName: string;
  sn: string;
  tin: string;
  ipAddress: string;
}

export interface GrpCollectResponse {
  progressStatus: GrpProgressStatus;
  attributes?: Record<string, string> | null;
  userInfo?: GrpUserInfo | null;
  validationInfo?: GrpValidationInfo | null;
  transactionId: string;
}

export interface GrpCancelRequest {
  refId: string;
  transactionId: string;
}

export interface GrpCancelResponse {
  status: Pick<GrpProgressStatus, 'status'>;
  transactionId: string;
}

export type GrpInitiateResponseWithStartTime = GrpInitiateResponse & { startTime: number };

export interface QrCode {
  qrCode?: string;
}

export interface GrpCollectResponseWithRef extends GrpCollectResponse {
  refId: string;
}
