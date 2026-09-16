import {
  ApplicationType,
  AssetCategory,
  CostForm,
  CostType,
  FinancialAssistanceFormData,
  HousingForm,
  PersonRole,
} from '@interfaces/financial-assistance';

/**
 * A document the applicant must attach. `id` maps to a label under
 * `financial-assistance:attachments.docs.<id>`; `role` is set for documents that concern one person
 * (the label then names that person when applying together).
 */
export interface RequiredDocument {
  id: string;
  role?: PersonRole;
}

/** Underlag per vald boendeform. Boendeformer utan krav saknas i mappen. */
const HOUSING_FORM_DOCUMENTS: Partial<Record<HousingForm, string[]>> = {
  RENTAL: ['rentalContract', 'rentalInvoice'],
  SUBLET: ['subletContract', 'originalRentalInvoice', 'subletApproval'],
  LODGER: ['lodgerContract', 'originalRentalInvoice', 'previousRentProof'],
  CONDOMINIUM: ['condominiumPurchaseContract', 'interestStatements', 'feeInvoice', 'marketValue'],
  OWNED_HOUSE: [
    'housePurchaseContract',
    'heatingCosts',
    'interestStatements',
    'waterSewage',
    'wasteCollection',
    'marketValue',
  ],
  RENTED_HOUSE: ['rentalContract', 'rentalInvoice'],
};

/** Underlag per sökt kostnad (nyansökan). "Övrigt bistånd" styrs av undertypen, se costDocument. */
const COST_DOCUMENTS: Record<Exclude<CostType, 'OTHER'>, string> = {
  RENT: 'rentInvoice',
  ELECTRICITY: 'electricityInvoice',
  HOME_INSURANCE: 'homeInsuranceLetter',
  INTERNET: 'internetInvoice',
  UNEMPLOYMENT_FUND: 'unemploymentFundInvoice',
  UNION_FEE: 'unionFeeInvoice',
  TRAVEL_APPROVED: 'travelReceipt',
  TRAVEL_MEDICAL_TRANSPORT: 'travelReceipt',
  MEDICAL_CARE: 'medicalCareInvoice',
  MEDICINE: 'medicineInvoice',
};

const OTHER_COST_DOCUMENTS = {
  OTHER: 'otherCostProof',
  MUNICIPAL_FEES: 'municipalFeeInvoice',
  ACUTE_DENTAL: 'acuteDental',
} as const;

/** Underlag per vald tillgångskategori. */
const ASSET_DOCUMENTS: Record<AssetCategory, string[]> = {
  BANK_SAVINGS: ['bankSavingsValue'],
  REAL_ESTATE: ['realEstatePurchaseContract', 'realEstateMarketValue', 'realEstateMortgage'],
  COMPANY: ['companyFinances'],
  VEHICLE: ['vehicleReceipt', 'vehicleValuation', 'vehicleLoan'],
  OTHER: ['otherAssetValue'],
};

const costDocument = (cost: CostForm): string | undefined => {
  if (!cost.costType) return undefined;
  if (cost.costType !== 'OTHER') return COST_DOCUMENTS[cost.costType];
  return cost.otherSubType ? OTHER_COST_DOCUMENTS[cost.otherSubType] : undefined;
};

const housingDocuments = (form: FinancialAssistanceFormData): string[] =>
  form.housingForm ? (HOUSING_FORM_DOCUMENTS[form.housingForm] ?? []) : [];

const assetDocuments = (form: FinancialAssistanceFormData): string[] =>
  form.hasAssets === true
    ? form.assets.flatMap((asset) => (asset.assetCategory ? ASSET_DOCUMENTS[asset.assetCategory] : []))
    : [];

/** Removes repeated documents (e.g. two vehicles, or both travel costs) keeping the first occurrence. */
const uniqueDocuments = (documents: RequiredDocument[]): RequiredDocument[] =>
  documents.filter(
    (document, index) =>
      documents.findIndex((other) => other.id === document.id && other.role === document.role) === index
  );

const asDocuments = (ids: string[]): RequiredDocument[] => ids.map((id) => ({ id }));

/**
 * Documents the applicant must attach based on the answers, per application type (from the
 * förslag-documents). Informative only — submission is not validated against the list.
 *
 * - Nyansökan: boendeform, sökta kostnader och tillgångar. (Generella underlag och planeringsunderlag
 *   visas som fast information i bilagedelen, oberoende av svaren.)
 * - Återansökan: boendeform bara om boendet förändrats, akut tandvård, tillgångar man inte informerat
 *   om tidigare och läkarintyg per sjukskriven person.
 * - Tilläggsansökan: inga automatiska underlag.
 */
export const getRequiredDocuments = (
  form: FinancialAssistanceFormData,
  applicationType: ApplicationType
): RequiredDocument[] => {
  if (applicationType === 'NEW') {
    return uniqueDocuments([
      ...asDocuments(housingDocuments(form)),
      ...asDocuments(form.costs.map(costDocument).filter((id): id is string => !!id)),
      ...asDocuments(assetDocuments(form)),
    ]);
  }

  if (applicationType === 'RENEWAL') {
    const sickRoles = form.plannings
      .filter((planning) => planning.planningType === 'SICK_LEAVE')
      .map((planning): PersonRole => (planning.person === 'CO_APPLICANT' ? 'CO_APPLICANT' : 'APPLICANT'));
    return uniqueDocuments([
      ...(form.housingChanged === true ? asDocuments(housingDocuments(form)) : []),
      ...(form.costs.some((cost) => cost.costType === 'OTHER' && cost.otherSubType === 'ACUTE_DENTAL')
        ? asDocuments(['acuteDental'])
        : []),
      ...asDocuments(assetDocuments(form)),
      ...sickRoles.map((role) => ({ id: 'sickCertificate', role })),
    ]);
  }

  return [];
};
