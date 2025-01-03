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

/**
 * Invoice origin (invoices originates from either commercial or public activities)
 * @example "COMMERCIAL"
 */
export enum InvoiceOrigin {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

/**
 * Status of invoice
 * @example "PAID"
 */
export enum InvoiceStatus {
  PAID = 'PAID',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  DEBT_COLLECTION = 'DEBT_COLLECTION',
  PAID_TOO_MUCH = 'PAID_TOO_MUCH',
  REMINDER = 'REMINDER',
  VOID = 'VOID',
  CREDITED = 'CREDITED',
  WRITTEN_OFF = 'WRITTEN_OFF',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Type of invoice
 * @example "INVOICE"
 */
export enum InvoiceType {
  INVOICE = 'INVOICE',
  CREDIT_INVOICE = 'CREDIT_INVOICE',
  START_INVOICE = 'START_INVOICE',
  FINAL_INVOICE = 'FINAL_INVOICE',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
  SELF_INVOICE = 'SELF_INVOICE',
  REMINDER = 'REMINDER',
  CONSOLIDATED_INVOICE = 'CONSOLIDATED_INVOICE',
  INTERNAL_INVOICE = 'INTERNAL_INVOICE',
  OFFSET_INVOICE = 'OFFSET_INVOICE',
  UNKNOWN = 'UNKNOWN',
}

/** Invoice request parameters model */
export interface InvoicesParameters {
  /**
   * Page number
   * @format int32
   * @min 1
   * @default 1
   * @example 1
   */
  page?: number;
  /**
   * Result size per page
   * @format int32
   * @min 1
   * @max 1000
   * @default 100
   * @example 100
   */
  limit?: number;
  /**
   * @minItems 1
   * @uniqueItems true
   */
  partyId: string[];
  facilityId?: string[];
  /**
   * Invoice number
   * @example "767915994"
   */
  invoiceNumber?: string;
  /**
   * Earliest invoice date. Format is YYYY-MM-DD.
   * @format date
   * @example "2022-01-01"
   */
  invoiceDateFrom?: string;
  /**
   * Latest invoice date. Format is YYYY-MM-DD.
   * @format date
   * @example "2022-01-31"
   */
  invoiceDateTo?: string;
  /**
   * invoice name
   * @example "765801493.pdf"
   */
  invoiceName?: string;
  /** Type of invoice */
  invoiceType?: InvoiceType;
  /** Status of invoice */
  invoiceStatus?: InvoiceStatus;
  /**
   * Ocr number
   * @example "767915994"
   */
  ocrNumber?: string;
  /**
   * Earliest due date. Format is YYYY-MM-DD.
   * @format date
   * @example "2022-01-01"
   */
  dueDateFrom?: string;
  /**
   * Latest due date. Format is YYYY-MM-DD.
   * @format date
   * @example "2022-01-31"
   */
  dueDateTo?: string;
  /**
   * Creditor organization number
   * @example "5564786647"
   */
  organizationNumber?: string;
  /**
   * Organization group
   * @example "stadsbacken"
   */
  organizationGroup?: string;
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

/** Invoice-address */
export interface Address {
  /**
   * Street-address
   * @example "Storgatan 1"
   */
  street?: string;
  /**
   * Post-code
   * @example "11122"
   */
  postcode?: string;
  /**
   * City
   * @example "Sundsvall"
   */
  city?: string;
  /**
   * Care-of
   * @example "Kalle"
   */
  careOf?: string;
}

/** Invoice model */
export interface Invoice {
  /**
   * Due date
   * @format date
   * @example "2022-02-28"
   */
  dueDate?: string;
  /**
   * Invoice-amount including VAT and rounding
   * @format float
   * @example 814
   */
  totalAmount?: number;
  /**
   * Invoice-amount including VAT
   * @format float
   * @example 813.5
   */
  amountVatIncluded?: number;
  /**
   * Invoice-amount excluding VAT
   * @format float
   * @example 651.2
   */
  amountVatExcluded?: number;
  /**
   * Amount which VAT is applied on
   * @format float
   * @example 651.2
   */
  vatEligibleAmount?: number;
  /**
   * Equalization to integer
   * @format float
   * @example 0.5
   */
  rounding?: number;
  /**
   * VAT
   * @format float
   * @example 162.8
   */
  vat?: number;
  /**
   * Is VAT reversed
   * @example false
   */
  reversedVat?: boolean;
  /**
   * Is invoice-pdf available
   * @example false
   */
  pdfAvailable?: boolean;
  /**
   * Currency
   * @example "SEK"
   */
  currency?: string;
  /**
   * Invoice-date
   * @format date
   * @example "2022-01-15"
   */
  invoiceDate?: string;
  /**
   * Invoice from-date
   * @format date
   * @example "2022-01-01"
   */
  fromDate?: string;
  /**
   * Invoice to-date
   * @format date
   * @example "2022-01-31"
   */
  toDate?: string;
  /**
   * Invoice-number
   * @example "999"
   */
  invoiceNumber?: string;
  /** Status of invoice */
  invoiceStatus?: InvoiceStatus;
  /**
   * OCR-number
   * @example "96758235"
   */
  ocrNumber?: string;
  /**
   * Organization number of the creditor
   * @example "5565027223"
   */
  organizationNumber?: string;
  /**
   * Invoice-name
   * @example "faktura-999.pdf"
   */
  invoiceName?: string;
  /** Type of invoice */
  invoiceType?: InvoiceType;
  /**
   * Invoice-description
   * @example "Fjärrvärme"
   */
  invoiceDescription?: string;
  /** Invoice-address */
  invoiceAddress?: Address;
  /** Facility-id */
  facilityId?: string;
  /** Invoice origin (invoices originates from either commercial or public activities) */
  invoiceOrigin?: InvoiceOrigin;
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
   * Displayed objects on current page
   * @format int32
   * @example 13
   */
  count?: number;
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

export interface PdfInvoice {
  /**
   * File-name
   * @example "faktura-999.pdf"
   */
  fileName?: string;
  /**
   * Base64-encoded contents of file
   * @format byte
   */
  file?: string;
}

/** Invoice-detail */
export interface InvoiceDetail {
  /**
   * Amount
   * @format float
   * @example 814
   */
  amount?: number;
  /**
   * Invoice-amount excluding VAT
   * @format float
   * @example 651.2
   */
  amountVatExcluded?: number;
  /**
   * VAT
   * @format float
   * @example 162.8
   */
  vat?: number;
  /**
   * VAT-rate in percent
   * @format float
   * @example 25
   */
  vatRate?: number;
  /**
   * Quantity of product
   * @format float
   * @example 3.45
   */
  quantity?: number;
  /**
   * Unit in quantity
   * @example "kWh"
   */
  unit?: string;
  /**
   * Unit-price
   * @format float
   * @example 271.3
   */
  unitPrice?: number;
  /**
   * Description of detail
   * @example "Förbrukning el"
   */
  description?: string;
  /**
   * Product code
   * @example "999"
   */
  productCode?: string;
  /**
   * Product name
   * @example "Elförbrukning"
   */
  productName?: string;
  /**
   * Invoice-detail from-date
   * @format date
   * @example "2022-01-01"
   */
  fromDate?: string;
  /**
   * Invoice-detail to-date
   * @format date
   * @example "2022-01-31"
   */
  toDate?: string;
}

export interface InvoiceDetailsResponse {
  details?: InvoiceDetail[];
}
