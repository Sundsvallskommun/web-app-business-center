import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';

/**
 * Returns the ids of documents the applicant must attach based on the choices made.
 * Each id maps to a locale label under `financial-assistance:attachments.docs.<id>`.
 *
 * NOTE: seeded with the clear-cut conditional rules from the förslag-documents. The full
 * per-applicationType rule set (incl. the nyansökan base documents) should be filled in here.
 */
export const getRequiredDocuments = (form: FinancialAssistanceFormData): string[] => {
  const documents: string[] = [];

  // Sjukskrivning → läkarintyg.
  if (form.plannings.some((planning) => planning.planningType === 'SICK_LEAVE')) {
    documents.push('sickCertificate');
  }
  // Tillgångar → underlag för tillgångar.
  if (form.hasAssets === true) {
    documents.push('assetStatements');
  }
  // Akut tandvård (övrigt bistånd) → faktura/kvitto.
  if (form.costs.some((cost) => cost.costType === 'OTHER' && cost.otherSubType === 'ACUTE_DENTAL')) {
    documents.push('acuteDental');
  }

  return documents;
};
