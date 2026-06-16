import { FinancialAssistanceFormData, HousingForm } from '@interfaces/financial-assistance';

/**
 * Bilagor som ska bifogas per vald boendeform. Varje id mappar mot en etikett under
 * `financial-assistance:attachments.docs.<id>`. Boendeformer utan krav saknas i mappen.
 * Detta är endast informativt — inskick valideras inte mot listan.
 */
const HOUSING_FORM_DOCUMENTS: Partial<Record<HousingForm, string[]>> = {
  RENTAL: ['rentalContract', 'rentalInvoice'],
  SUBLET: ['subletContract', 'originalRentalInvoice', 'subletApproval'],
  LODGER: ['lodgerContract', 'originalRentalInvoice', 'previousRentProof'],
  CONDOMINIUM: ['purchaseContract', 'feeInvoice', 'interestStatements', 'marketValue'],
  OWNED_HOUSE: ['purchaseContract', 'heatingCosts', 'interestStatements', 'waterSewage', 'wasteCollection', 'marketValue'],
  RENTED_HOUSE: ['rentalContract', 'rentalInvoice'],
};

/**
 * Returns the ids of documents the applicant must attach based on the choices made.
 * Each id maps to a locale label under `financial-assistance:attachments.docs.<id>`.
 *
 * NOTE: seeded with the clear-cut conditional rules from the förslag-documents. The full
 * per-applicationType rule set (incl. the nyansökan base documents) should be filled in here.
 */
export const getRequiredDocuments = (form: FinancialAssistanceFormData): string[] => {
  const documents: string[] = [];

  // Boendeform → boenderelaterade underlag (hyreskontrakt, avier, lånespecifikationer m.m.).
  if (form.housingForm) {
    documents.push(...(HOUSING_FORM_DOCUMENTS[form.housingForm] ?? []));
  }
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
