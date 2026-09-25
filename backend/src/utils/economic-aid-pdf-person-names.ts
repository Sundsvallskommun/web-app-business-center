import { ApplicationPdfDocument } from '@/interfaces/application-pdf.interface';

type PersonRole = 'APPLICANT' | 'CO_APPLICANT';

/** Matches the name placeholders the client puts in the summary, e.g. "%CO_APPLICANT_NAME%". */
const PERSON_NAME_PLACEHOLDER = /%(APPLICANT|CO_APPLICANT)_NAME%/g;

/** Used when a role has no looked-up name (should not happen — every person's identity is required). */
const ROLE_FALLBACK_NAME: Record<PersonRole, string> = {
  APPLICANT: 'sökande',
  CO_APPLICANT: 'medsökande',
};

/**
 * Replaces the person-name placeholders in every text of the summary (headings, help texts, lists,
 * rows and notes) with the person's name from Citizen. The backend owns person identity, so the client
 * only marks where a name belongs. Mutates in place.
 */
export const fillPersonNamePlaceholders = (summary: ApplicationPdfDocument, nameByRole: Map<string, string>): void => {
  const fill = (text: string): string =>
    text.replace(PERSON_NAME_PLACEHOLDER, (_placeholder, role: PersonRole) => nameByRole.get(role) || ROLE_FALLBACK_NAME[role]);
  const fillOptional = (text: string | undefined): string | undefined => (text === undefined ? undefined : fill(text));

  for (const group of summary.groups ?? []) {
    for (const section of group.sections ?? []) {
      section.heading = fillOptional(section.heading);
      section.info = fillOptional(section.info);
      section.note = fillOptional(section.note);
      for (const list of section.lists ?? []) {
        list.heading = fillOptional(list.heading);
        list.items = list.items.map(fill);
      }
      for (const row of section.rows ?? []) {
        row.label = fill(row.label);
        row.value = fill(row.value);
        row.info = fillOptional(row.info);
      }
    }
  }
};
