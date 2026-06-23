/**
 * Human-readable representation of a submitted application, used to render the sammanställning-PDF
 * attached to the errand. Built on the frontend (which owns the form questions and their Swedish
 * labels) and rendered to HTML/PDF on the backend. Organised as numbered groups (1. Personuppgifter,
 * 2. Boendesituation, …) in wizard order, each with one or more sections.
 */

export interface ApplicationPdfRow {
  /** The question / field label as shown in the form. */
  label: string;
  /** The answer the applicant entered, already formatted for display. */
  value: string;
  /** The form's help text for this question, when it has one. */
  info?: string;
}

export interface ApplicationPdfSection {
  /** Optional sub-heading within a group (e.g. "Sökande", "Vilka kostnader söker du bistånd för?"). */
  heading?: string;
  rows: ApplicationPdfRow[];
  /** The form's help text for this section, when it has one. */
  info?: string;
  /** Person sections — lets the backend attach the right person (name appended to heading). */
  role?: 'APPLICANT' | 'CO_APPLICANT';
  /** When true, the backend prepends this person's personnummer + folkbokföringsadress (Citizen). */
  identity?: boolean;
}

export interface ApplicationPdfGroup {
  /** Numbered group heading, e.g. "1. Personuppgifter". */
  heading: string;
  sections: ApplicationPdfSection[];
}

/** A signer's BankID signature shown at the bottom of the document. Currently mocked. */
export interface ApplicationPdfSignature {
  /** Signer's name (from BankID — currently mocked). */
  name: string;
  /** Signer's personnummer / person-id (from BankID — currently mocked). */
  personnummer: string;
  /** Checksum of the BankID signing response (currently mocked). */
  checksum: string;
  /** Date and time the signature was made (currently mocked — set at submit time). */
  signedAt: string;
}

export interface ApplicationPdfDocument {
  /** Document title (e.g. "Ansökan om ekonomiskt bistånd"). */
  title: string;
  /** Optional sub-line under the title (e.g. application type). */
  subtitle?: string;
  /** Numbered groups in wizard order. */
  groups: ApplicationPdfGroup[];
  /** BankID signatures, rendered at the bottom. Backend-populated and currently mocked. */
  signatures?: ApplicationPdfSignature[];
}
