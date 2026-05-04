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

/** Type of invoice */
export enum InvoiceType {
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
export enum InvoiceStatus {
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
export enum InvoiceOrigin {
  COMMERCIAL = "COMMERCIAL",
  PUBLIC_ADMINISTRATION = "PUBLIC_ADMINISTRATION",
}

/** Invoice request parameters model */
export interface InvoicesParameters {
  /**
   * Page number
   * @format int32
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Result size per page
   * @format int32
   * @min 1
   * @max 1000
   * @default 100
   */
  limit?: number;
  /**
   * @minItems 1
   * @uniqueItems true
   */
  partyId: string[];
  facilityId?: string[];
  /** Invoice number */
  invoiceNumber?: string;
  /**
   * Earliest invoice date. Format is YYYY-MM-DD.
   * @format date
   */
  invoiceDateFrom?: string;
  /**
   * Latest invoice date. Format is YYYY-MM-DD.
   * @format date
   */
  invoiceDateTo?: string;
  /** invoice name */
  invoiceName?: string;
  /** Invoice type */
  invoiceType?: InvoiceType;
  /** Invoice status */
  invoiceStatus?: InvoiceStatus;
  /** Ocr number */
  ocrNumber?: string;
  /**
   * Earliest due date. Format is YYYY-MM-DD.
   * @format date
   */
  dueDateFrom?: string;
  /**
   * Latest due date. Format is YYYY-MM-DD.
   * @format date
   */
  dueDateTo?: string;
  /** Creditor organization number */
  organizationNumber?: string;
  /** Organization group */
  organizationGroup?: string;
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
  /**
   * Invoice-amount including VAT and rounding
   * @format float
   */
  totalAmount?: number;
  /**
   * Invoice-amount including VAT
   * @format float
   */
  amountVatIncluded?: number;
  /**
   * Invoice-amount excluding VAT
   * @format float
   */
  amountVatExcluded?: number;
  /**
   * Amount which VAT is applied on
   * @format float
   */
  vatEligibleAmount?: number;
  /**
   * Equalization to integer
   * @format float
   */
  rounding?: number;
  /**
   * VAT
   * @format float
   */
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
  invoiceStatus?: InvoiceStatus;
  /** OCR-number */
  ocrNumber?: string;
  /** Organization number of the creditor */
  organizationNumber?: string;
  /** Invoice-name */
  invoiceName?: string;
  /** Type of invoice */
  invoiceType?: InvoiceType;
  /** Invoice-description */
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

export interface Problem {
  /** @format uri */
  instance?: string;
  /** @format uri */
  type?: string;
  parameters?: Record<string, any>;
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
  parameters?: Record<string, any>;
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
  cause?: any;
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
  parameters?: Record<string, any>;
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

export interface PdfInvoice {
  /** File-name */
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
   */
  amount?: number;
  /**
   * Invoice-amount excluding VAT
   * @format float
   */
  amountVatExcluded?: number;
  /**
   * VAT
   * @format float
   */
  vat?: number;
  /**
   * VAT-rate in percent
   * @format float
   */
  vatRate?: number;
  /**
   * Quantity of product
   * @format float
   */
  quantity?: number;
  /** Unit in quantity */
  unit?: string;
  /**
   * Unit-price
   * @format float
   */
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
}

export interface InvoiceDetailsResponse {
  details?: InvoiceDetail[];
}
