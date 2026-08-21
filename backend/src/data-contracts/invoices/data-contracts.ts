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

/** The sort order direction */
export enum Direction {
  ASC = "ASC",
  DESC = "DESC",
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

export interface Address {
  /** Street-address */
  street?: string;
  /** Post-code */
  postcode?: string;
  /** City */
  city?: string;
  /** Care-of */
  careOf?: string;
}

/** Invoice model */
export interface Invoice {
  /**
   * Due date
   * @format date
   */
  dueDate?: string;
  /** Invoice-amount including VAT and rounding */
  totalAmount?: number;
  /** Invoice-amount including VAT */
  amountVatIncluded?: number;
  /** Invoice-amount excluding VAT */
  amountVatExcluded?: number;
  /** Amount which VAT is applied on */
  vatEligibleAmount?: number;
  /** Equalization to integer */
  rounding?: number;
  /** VAT */
  vat?: number;
  /** Is VAT reversed */
  reversedVat?: boolean;
  /** Is invoice-pdf available */
  pdfAvailable?: boolean;
  /** Currency */
  currency?: string;
  /**
   * Invoice-date
   * @format date
   */
  invoiceDate?: string;
  /**
   * Invoice from-date
   * @format date
   */
  fromDate?: string;
  /**
   * Invoice to-date
   * @format date
   */
  toDate?: string;
  /** Invoice-number */
  invoiceNumber?: string;
  /** Status of invoice */
  invoiceStatus?: InvoiceInvoiceStatusEnum;
  /** OCR-number */
  ocrNumber?: string;
  /** Organization number of the creditor */
  organizationNumber?: string;
  /** Invoice-name */
  invoiceName?: string;
  /** Type of invoice */
  invoiceType?: InvoiceInvoiceTypeEnum;
  /**
   * Invoice-description
   * @uniqueItems true
   */
  invoiceDescriptions?: string[];
  /** Invoice-address */
  invoiceAddress?: Address;
  /**
   * Facility-id
   * @uniqueItems true
   */
  facilityIds?: string[];
  /** Invoice origin (invoices originates from either commercial or public activities) */
  invoiceOrigin?: InvoiceInvoiceOriginEnum;
}

/** InvoicesResponse model */
export interface InvoicesResponse {
  invoices?: Invoice[];
  /** Metadata model */
  _meta?: MetaData;
}

/** Metadata model */
export interface MetaData {
  /**
   * Current page
   * @format int32
   */
  page?: number;
  /**
   * Displayed objects per page
   * @format int32
   */
  limit?: number;
  /**
   * Displayed objects on current page
   * @format int32
   */
  count?: number;
  /**
   * Total amount of hits based on provided search parameters
   * @format int64
   */
  totalRecords?: number;
  /**
   * Total amount of pages based on provided search parameters
   * @format int32
   */
  totalPages?: number;
}

export interface PdfInvoice {
  /** File-name */
  fileName?: string;
  /**
   * Base64-encoded contents of file
   * @format byte
   */
  file?: Blob;
}

/** Invoice-detail */
export interface InvoiceDetail {
  /** Amount */
  amount?: number;
  /** Invoice-amount excluding VAT */
  amountVatExcluded?: number;
  /** VAT */
  vat?: number;
  /** VAT-rate in percent */
  vatRate?: number;
  /** Quantity of product */
  quantity?: number;
  /** Unit in quantity */
  unit?: string;
  /** Unit-price */
  unitPrice?: number;
  /** Description of detail */
  description?: string;
  /** Product code */
  productCode?: string;
  /** Product name */
  productName?: string;
  /**
   * Invoice-detail from-date
   * @format date
   */
  fromDate?: string;
  /**
   * Invoice-detail to-date
   * @format date
   */
  toDate?: string;
  /** Facility id */
  facilityId?: string;
  /** Administration */
  administration?: string;
}

export interface InvoiceDetailsResponse {
  details?: InvoiceDetail[];
}

/** Customer invoice model */
export interface CustomerInvoice {
  /** Customer number */
  customerNumber?: string;
  /** Customer type */
  customerType?: CustomerInvoiceCustomerTypeEnum;
  /** List of facility ids */
  facilityIds?: string[];
  /** Invoice number */
  invoiceNumber?: string;
  /**
   * Invoice id
   * @format int64
   */
  invoiceId?: number;
  /**
   * Joint invoice id
   * @format int64
   */
  jointInvoiceId?: number;
  /**
   * Invoice date
   * @format date
   */
  invoiceDate?: string;
  /** Invoice name */
  invoiceName?: string;
  /** Type of invoice */
  invoiceType?: CustomerInvoiceInvoiceTypeEnum;
  /** Invoice description */
  invoiceDescription?: string;
  /** Status of invoice */
  invoiceStatus?: CustomerInvoiceInvoiceStatusEnum;
  /** OCR number */
  ocrNumber?: string;
  /**
   * Due date
   * @format date
   */
  dueDate?: string;
  /**
   * Invoice period start
   * @format date
   */
  periodFrom?: string;
  /**
   * Invoice period end
   * @format date
   */
  periodTo?: string;
  /** Total amount */
  totalAmount?: number;
  /** Amount included VAT */
  amountVatIncluded?: number;
  /** Amount excluded VAT */
  amountVatExcluded?: number;
  /** Amount eligible for VAT */
  vatEligibleAmount?: number;
  /** Rounding */
  rounding?: number;
  /** Organization group */
  organizationGroup?: string;
  /** Organization number of invoice issuer */
  organizationNumber?: string;
  /** Administration */
  administration?: string;
  /** Street */
  street?: string;
  /** Postal code */
  postCode?: string;
  /** City */
  city?: string;
  /** Care of address */
  careOf?: string;
  /** Invoice reference */
  invoiceReference?: string;
  /** Is pdf-version of invoice available */
  pdfAvailable?: boolean;
  details?: InvoiceDetail[];
}

/** CustomerInvoicesResponse model */
export interface CustomerInvoicesResponse {
  invoices?: CustomerInvoice[];
  /** Metadata model */
  _meta?: MetaData;
}

/** Status of invoice */
export enum InvoiceInvoiceStatusEnum {
  PAID = "PAID",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  DEBT_COLLECTION = "DEBT_COLLECTION",
  PAID_TOO_MUCH = "PAID_TOO_MUCH",
  REMINDER = "REMINDER",
  VOID = "VOID",
  CREDITED = "CREDITED",
  WRITTEN_OFF = "WRITTEN_OFF",
  UNKNOWN = "UNKNOWN",
}

/** Type of invoice */
export enum InvoiceInvoiceTypeEnum {
  INVOICE = "INVOICE",
  CREDIT_INVOICE = "CREDIT_INVOICE",
  START_INVOICE = "START_INVOICE",
  FINAL_INVOICE = "FINAL_INVOICE",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SELF_INVOICE = "SELF_INVOICE",
  REMINDER = "REMINDER",
  CONSOLIDATED_INVOICE = "CONSOLIDATED_INVOICE",
  INTERNAL_INVOICE = "INTERNAL_INVOICE",
  OFFSET_INVOICE = "OFFSET_INVOICE",
  UNKNOWN = "UNKNOWN",
}

/** Invoice origin (invoices originates from either commercial or public activities) */
export enum InvoiceInvoiceOriginEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** Customer type */
export enum CustomerInvoiceCustomerTypeEnum {
  ENTERPRISE = "ENTERPRISE",
  PRIVATE = "PRIVATE",
}

/** Type of invoice */
export enum CustomerInvoiceInvoiceTypeEnum {
  INVOICE = "INVOICE",
  CREDIT_INVOICE = "CREDIT_INVOICE",
  START_INVOICE = "START_INVOICE",
  FINAL_INVOICE = "FINAL_INVOICE",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SELF_INVOICE = "SELF_INVOICE",
  REMINDER = "REMINDER",
  CONSOLIDATED_INVOICE = "CONSOLIDATED_INVOICE",
  INTERNAL_INVOICE = "INTERNAL_INVOICE",
  OFFSET_INVOICE = "OFFSET_INVOICE",
  UNKNOWN = "UNKNOWN",
}

/** Status of invoice */
export enum CustomerInvoiceInvoiceStatusEnum {
  PAID = "PAID",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  DEBT_COLLECTION = "DEBT_COLLECTION",
  PAID_TOO_MUCH = "PAID_TOO_MUCH",
  REMINDER = "REMINDER",
  VOID = "VOID",
  CREDITED = "CREDITED",
  WRITTEN_OFF = "WRITTEN_OFF",
  UNKNOWN = "UNKNOWN",
}

/** Invoice type */
export enum GetInvoicesParamsInvoiceTypeEnum {
  INVOICE = "INVOICE",
  CREDIT_INVOICE = "CREDIT_INVOICE",
  START_INVOICE = "START_INVOICE",
  FINAL_INVOICE = "FINAL_INVOICE",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SELF_INVOICE = "SELF_INVOICE",
  REMINDER = "REMINDER",
  CONSOLIDATED_INVOICE = "CONSOLIDATED_INVOICE",
  INTERNAL_INVOICE = "INTERNAL_INVOICE",
  OFFSET_INVOICE = "OFFSET_INVOICE",
  UNKNOWN = "UNKNOWN",
}

/** Invoice status */
export enum GetInvoicesParamsInvoiceStatusEnum {
  PAID = "PAID",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  DEBT_COLLECTION = "DEBT_COLLECTION",
  PAID_TOO_MUCH = "PAID_TOO_MUCH",
  REMINDER = "REMINDER",
  VOID = "VOID",
  CREDITED = "CREDITED",
  WRITTEN_OFF = "WRITTEN_OFF",
  UNKNOWN = "UNKNOWN",
}

/**
 * Invoice origin (invoices originates from either commercial or public activities)
 * @example "COMMERCIAL"
 */
export enum GetInvoicesParamsInvoiceOriginEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** @example "COMMERCIAL" */
export enum GetInvoicesParamsEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** InvoiceType filter parameter */
export enum GetPdfInvoiceParamsInvoiceTypeEnum {
  INVOICE = "INVOICE",
  CREDIT_INVOICE = "CREDIT_INVOICE",
  START_INVOICE = "START_INVOICE",
  FINAL_INVOICE = "FINAL_INVOICE",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SELF_INVOICE = "SELF_INVOICE",
  REMINDER = "REMINDER",
  CONSOLIDATED_INVOICE = "CONSOLIDATED_INVOICE",
  INTERNAL_INVOICE = "INTERNAL_INVOICE",
  OFFSET_INVOICE = "OFFSET_INVOICE",
  UNKNOWN = "UNKNOWN",
}

/**
 * Invoice origin (invoices originates from either commercial or public activities)
 * @example "COMMERCIAL"
 */
export enum GetPdfInvoiceParamsInvoiceOriginEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** @example "COMMERCIAL" */
export enum GetPdfInvoiceParamsEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** InvoiceType filter parameter */
export enum DownloadInvoicePdfParamsInvoiceTypeEnum {
  INVOICE = "INVOICE",
  CREDIT_INVOICE = "CREDIT_INVOICE",
  START_INVOICE = "START_INVOICE",
  FINAL_INVOICE = "FINAL_INVOICE",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SELF_INVOICE = "SELF_INVOICE",
  REMINDER = "REMINDER",
  CONSOLIDATED_INVOICE = "CONSOLIDATED_INVOICE",
  INTERNAL_INVOICE = "INTERNAL_INVOICE",
  OFFSET_INVOICE = "OFFSET_INVOICE",
  UNKNOWN = "UNKNOWN",
}

/**
 * Invoice origin (invoices originates from either commercial or public activities)
 * @example "COMMERCIAL"
 */
export enum DownloadInvoicePdfParamsInvoiceOriginEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** @example "COMMERCIAL" */
export enum DownloadInvoicePdfParamsEnum {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** Invoice type */
export enum GetPublicAdministrationInvoicesParamsInvoiceTypeEnum {
  INVOICE = "INVOICE",
  CREDIT_INVOICE = "CREDIT_INVOICE",
  START_INVOICE = "START_INVOICE",
  FINAL_INVOICE = "FINAL_INVOICE",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SELF_INVOICE = "SELF_INVOICE",
  REMINDER = "REMINDER",
  CONSOLIDATED_INVOICE = "CONSOLIDATED_INVOICE",
  INTERNAL_INVOICE = "INTERNAL_INVOICE",
  OFFSET_INVOICE = "OFFSET_INVOICE",
  UNKNOWN = "UNKNOWN",
}

/** Invoice status */
export enum GetPublicAdministrationInvoicesParamsInvoiceStatusEnum {
  PAID = "PAID",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  DEBT_COLLECTION = "DEBT_COLLECTION",
  PAID_TOO_MUCH = "PAID_TOO_MUCH",
  REMINDER = "REMINDER",
  VOID = "VOID",
  CREDITED = "CREDITED",
  WRITTEN_OFF = "WRITTEN_OFF",
  UNKNOWN = "UNKNOWN",
}

/** Invoice status filter */
export enum GetInvoicesForCustomerParamsStatusEnum {
  PAID = "PAID",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  DEBT_COLLECTION = "DEBT_COLLECTION",
  PAID_TOO_MUCH = "PAID_TOO_MUCH",
  REMINDER = "REMINDER",
  VOID = "VOID",
  CREDITED = "CREDITED",
  WRITTEN_OFF = "WRITTEN_OFF",
  UNKNOWN = "UNKNOWN",
}
