/**
 * Human-readable representation of a submitted application, used to render the
 * sammanställning-PDF attached to the errand. Built on the frontend (which owns the form
 * questions and their Swedish labels) and rendered to HTML/PDF on the backend.
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
  heading: string;
  rows: ApplicationPdfRow[];
  /** The form's help text for this section, when it has one. */
  info?: string;
  /**
   * Person sections only — lets the backend attach Citizen-derived identity
   * (personnummer + folkbokföringsadress) to the right person.
   */
  role?: 'APPLICANT' | 'CO_APPLICANT';
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
  /** Optional sub-line under the title (e.g. application type / period). */
  subtitle?: string;
  /** Applicant and co-applicant, rendered at the top. */
  persons: ApplicationPdfSection[];
  /** All questions and answers from the application, in form order. */
  sections: ApplicationPdfSection[];
  /** Children, rendered as their own section (not tied to a person). */
  children: ApplicationPdfSection[];
  /** BankID signatures, rendered at the bottom. Backend-populated and currently mocked. */
  signatures?: ApplicationPdfSignature[];
}
