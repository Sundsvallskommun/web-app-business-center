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

export interface CaseMessageDto {
  message: string;
  files?: any[];
}

export interface FeedbackDto {
  body: string;
}

export interface CreateReadNotificationsDto {
  caseId: string;
}

export interface RepresentsDto {
  organizationNumber?: string;
  personNumber?: string;
  mode?: "PRIVATE" | "BUSINESS" | 0 | 1;
}

export interface ContactSettingChannel {
  contactMethod: string;
  destination: string;
  disabled?: boolean;
  alias: string;
}

export interface Meta {
  page?: number;
  limit?: number;
  count?: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface ContactSetting {
  id: string;
  partyId: string;
  contactChannels: ContactSettingChannel[];
  created: string;
  modified: string;
  virtual: boolean;
  alias: string;
  municipalityId: string;
}

export interface UpdateContactSettingsDto {
  id: string;
  contactChannels: ContactSettingChannel[];
}

export interface ClientContactSettingNotifications {
  email_enabled: boolean;
  phone_enabled: boolean;
}

export interface ClientContactSettingDecicionsAndDocuments {
  digitalInbox: boolean;
  myPages: boolean;
  snailmail: boolean;
}

export interface ClientContactSettingAddress {
  street?: string;
  postcode?: string;
  city?: string;
}

export interface ClientContactSetting {
  id?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: ClientContactSettingAddress[] | null;
  notifications?: ClientContactSettingNotifications[];
  decicionsAndDocuments?: ClientContactSettingDecicionsAndDocuments[];
  modified?: string;
}

export interface RepresentingPrivateEntity {
  name: string;
  personNumber?: string;
  information?: Information;
}

export interface RepresentingBusinessEntity {
  organizationName: string;
  organizationNumber: string;
  isAuthorizedSignatory?: boolean;
  information: Information;
  whitelisted?: boolean;
}

export interface Information {
  address: ClientContactSettingAddress;
}

export interface RepresentingEntity {
  BUSINESS?: RepresentingBusinessEntity;
  PRIVATE?: RepresentingPrivateEntity;
  mode: "PRIVATE" | "BUSINESS" | 0 | 1;
}

export interface ClientRepresentingApiResponse {
  data: RepresentingEntity;
  message: string;
}

export interface PatchUserSettingsDto {
  feedbackLifespan: "untilRemoved" | "oneMonth" | "twoWeeks";
}

export interface Grantor {
  name?: string;
  grantorPartyId: string;
  signatoryPartyId: string;
}

export interface Grantee {
  partyId: string;
}

export interface MandatePart {
  name: string;
  personNumber?: string;
}

export interface CompletionDataUser {
  personalNumber: string;
  name?: string;
  givenName: string;
  surname: string;
}

export interface CompletionDataDevice {
  ipAddress: string;
  uhi?: string;
}

export interface CompletionData {
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  bankIdIssueDate?: string;
  signature: string;
  ocspResponse?: string;
  risk?: string;
  user: CompletionDataUser;
  device: CompletionDataDevice;
}

export interface SigningInfo {
  orderRef: string;
  externalTransactionId?: string;
  status: "COMPLETE" | "FAILED" | "CANCELLED" | "PENDING";
  completionData: CompletionData;
}

export interface MandateDefaults {
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
  whitelisted?: boolean;
}

export interface Mandate {
  grantorDetails?: Grantor;
  granteeDetails?: Grantee;
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
  whitelisted?: boolean;
}

export interface MandatePopulated {
  grantee: MandatePart;
  grantor: MandatePart;
  id: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  created?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  updated?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
  whitelisted?: boolean;
}

export interface MandatesApiResponse {
  data: Mandate[];
  message: string;
  page?: number;
  limit?: number;
  count?: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface MandateApiResponse {
  data: Mandate;
  message: string;
}

export interface PopulatedMandatesApiResponse {
  data: MandatePopulated[];
  message: string;
  page?: number;
  limit?: number;
  count?: number;
  totalRecords?: number;
  totalPages?: number;
}

export interface SignMandateDetails {
  granteeId: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
}

export interface MandateDto {
  grantorDetails: Grantor;
  granteeDetails: Grantee;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  activeFrom: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  inactiveAfter?: string;
  signingInfo: SigningInfo;
}

export interface MandatePaginationDto {
  page?: number;
  limit?: number;
}

export interface CreateMandateDto {
  transactionId: string;
}

export interface SignDto {
  visible: string;
  format: "PLAIN_TEXT" | "MARKDOWN" | "HTML";
  details?: object;
}

export interface SignMandateDto {
  visible: string;
  format: "PLAIN_TEXT" | "MARKDOWN" | "HTML";
  mandate: SignMandateDetails;
}

export interface Sign {
  transactionId: string;
  autoStartToken: string;
  qrCode?: string;
}

export interface SubjectIdentifier {
  value: string;
  type: "TIN" | "EMAIL";
}

export interface User {
  subjectIdentifier: SubjectIdentifier;
  displayName?: string;
  givenName: string;
  sn: string;
  tin: string;
  ipAddress: string;
}

export interface Status {
  status: "COMPLETE" | "FAILED" | "CANCELLED" | "PENDING";
  substatus: string | null;
  message: string;
}

export interface ValidationInfo {
  signature: string;
  signatureFormat: "xmldsig" | "pkcs7" | "jws";
  ocspResponse?: string;
}

export interface SignCollect {
  progressStatus: Status;
  attributes?: object;
  userInfo?: User;
  validationInfo?: ValidationInfo;
  transactionId: string;
  qrCode?: string;
}

export interface SignApiResponse {
  data: Sign;
  message: string;
}

export interface SignCollectApiResponse {
  data: SignCollect;
  message: string;
}

export interface Citizen {
  personId: string;
  givenname: string;
  lastname: string;
}

export interface CitizenApiResponse {
  data: Citizen;
  message: string;
}

export interface CitizenLookupDto {
  /**
   * @minLength 12
   * @maxLength 12
   */
  personnumber: string;
}
