/**
 * Returns the identifier to use for a case in URLs.
 *
 * We prefer the human-readable ärendenummer (errandNumber) so that case URLs
 * are recognizable and shareable. OpenE cases (and any case lacking an
 * errandNumber) fall back to the internal caseId. The backend resolves a case
 * by either value, so both forms work and old caseId links keep working.
 */
export const getCaseReference = (item: { errandNumber?: string; caseId?: string }): string =>
  item.errandNumber?.trim() || item.caseId || '';
