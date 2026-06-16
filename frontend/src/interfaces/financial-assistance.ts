/**
 * Domain model for the caremanagement `financial-assistance` type module.
 *
 * One superset form shared by three typeSlugs. The slug is the discriminator;
 * the server derives `applicationType` from it (we never send applicationType).
 * Field/section visibility is gated per applicationType — see FA_GROUPS_BY_TYPE.
 *
 * Mirrors the generated caremanagement contract (FinancialAssistanceData and its
 * nested types). Enum string values match the contract exactly so the POST passes
 * the server's @OneOf validation.
 */

export const FINANCIAL_ASSISTANCE_SLUGS = [
  'financial-assistance-new',
  'financial-assistance-renewal',
  'financial-assistance-supplementary',
] as const;
export type FinancialAssistanceSlug = (typeof FINANCIAL_ASSISTANCE_SLUGS)[number];

export type ApplicationType = 'NEW' | 'RENEWAL' | 'SUPPLEMENTARY';

export const isFinancialAssistanceSlug = (value: string): value is FinancialAssistanceSlug =>
  (FINANCIAL_ASSISTANCE_SLUGS as readonly string[]).includes(value);

/** The slug is authoritative — server derives applicationType from it; we use it for visibility. */
export const applicationTypeFromSlug = (slug: FinancialAssistanceSlug): ApplicationType => {
  if (slug === 'financial-assistance-renewal') return 'RENEWAL';
  if (slug === 'financial-assistance-supplementary') return 'SUPPLEMENTARY';
  return 'NEW';
};

// --- Enums (string values match the contract) ---
export type MaritalStatus = 'SINGLE' | 'COHABITING';
export type PeriodChoice = 'CURRENT_MONTH' | 'NEXT_MONTH' | 'OTHER_BENEFIT';
export type NormType = 'RIKSNORM' | 'OTHER_NORM';
export type HousingForm =
  | 'NO_HOUSING_OR_INSTITUTION'
  | 'RENTAL'
  | 'SUBLET'
  | 'LODGER'
  | 'CONDOMINIUM'
  | 'OWNED_HOUSE'
  | 'RENTED_HOUSE'
  | 'LIVING_WITH_PARENTS';
export type CostType =
  | 'RENT'
  | 'ELECTRICITY'
  | 'HOME_INSURANCE'
  | 'INTERNET'
  | 'UNEMPLOYMENT_FUND'
  | 'UNION_FEE'
  | 'TRAVEL_APPROVED'
  | 'TRAVEL_MEDICAL_TRANSPORT'
  | 'MEDICAL_CARE'
  | 'MEDICINE'
  | 'OTHER';
export type CostOtherSubType = 'OTHER' | 'MUNICIPAL_FEES' | 'ACUTE_DENTAL';
export type IncomeType =
  | 'OTHER_INCOME'
  | 'FINANCIAL_AID_OTHER_MUNICIPALITY'
  | 'SALARY'
  | 'SWISH_DEPOSITS'
  | 'OCCUPATIONAL_PENSION_INSURANCE'
  | 'CHILD_SUPPORT'
  | 'RENT_SHARE_FROM_CHILD';
export type Recipient = 'APPLICANT' | 'CO_APPLICANT';
export type AssetCategory = 'BANK_SAVINGS' | 'REAL_ESTATE' | 'COMPANY' | 'VEHICLE';
export type PropertyType = 'BOSTADSRATT' | 'VILLA' | 'FASTIGHET' | 'FRITIDSHUS';
export type VehicleType = 'BIL' | 'BAT' | 'MC' | 'HUSVAGN' | 'MOPED' | 'SNOSKOTER';
export type ResidenceExtent = 'FULL_TIME' | 'HALF_TIME' | 'OTHER';
export type PersonRole = 'APPLICANT' | 'CO_APPLICANT';
export type PaymentMethod = 'BANK_ACCOUNT' | 'OTHER';
export type PlanningType = 'WORK' | 'JOBSEEKING' | 'SICK_LEAVE' | 'SFI' | 'OTHER';
export type WorkExtent = 'FULL' | 'PART';
export type SickLeaveLevel = '100' | '75' | '50' | '25';
export type SfiStudyPath = '1' | '2' | '3';
export type SfiCourse = 'A' | 'B' | 'C' | 'D';

// --- Nested item shapes (form-level; amounts/counts as numbers, '' = unset for enums/text) ---
export interface ChildForm {
  personalNumber: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  residenceExtent: ResidenceExtent | '';
  daysInHome: number | null;
}

export interface CostForm {
  costType: CostType | '';
  appliedAmount: number | null;
  otherSubType: CostOtherSubType | '';
  specification: string;
  recipientOrPeriod: string;
}

export interface IncomeForm {
  incomeType: IncomeType | '';
  amount: number | null;
  incomeDate: string;
  recipient: Recipient | '';
}

export interface PendingBenefitForm {
  benefitName: string;
  applicantName: string;
}

export interface AssetForm {
  assetCategory: AssetCategory | '';
  description: string;
  value: number | null;
  propertyType: PropertyType | '';
  purchaseYear: number | null;
  purchasePrice: number | null;
  companyName: string;
  companyAssetSum: number | null;
  vehicleType: VehicleType | '';
  registrationNumber: string;
  purchaseDate: string;
}

export interface PlanningForm {
  person: PersonRole | '';
  planningType: PlanningType | '';
  workExtent: WorkExtent | '';
  workDescription: string;
  sickLeaveLevel: SickLeaveLevel | '';
  sickFrom: string;
  sickTo: string;
  sfiStudyPath: SfiStudyPath | '';
  sfiCourse: SfiCourse | '';
  otherDescription: string;
}

export interface PlannedActivityForm {
  person: PersonRole | '';
  activity: string;
  periodFrom: string;
  periodTo: string;
}

export interface JobApplicationForm {
  person: PersonRole | '';
  applicationDate: string;
  jobTitle: string;
  employerAndPlace: string;
}

export interface PersonForm {
  role: PersonRole;
  personalNumber: string;
  needsInterpreter: boolean | null;
  interpreterLanguage: string;
  hadWorkLast12Months: boolean | null;
  hadWorkDescription: string;
  paymentMethod: PaymentMethod | '';
  clearingNumber: string;
  accountNumber: string;
  otherPaymentDescription: string;
  paymentSameAsPrevious: boolean | null;
}

/** The full superset the wizard edits. Sections are gated per applicationType. */
export interface FinancialAssistanceFormData {
  maritalStatus: MaritalStatus;
  periodMonth: number | null;
  periodYear: number | null;
  periodChoice: PeriodChoice | '';
  normType: NormType | '';
  otherBenefitDescription: string;
  livelihoodDescription: string;
  hasChildrenUnder21: boolean | null;
  children: ChildForm[];
  childrenResidenceChanged: boolean | null;
  childrenResidenceChangeDescription: string;
  housingForm: HousingForm | '';
  housingAdultsCount: number | null;
  housingChildrenCount: number | null;
  housingRoomsPlusKitchen: number | null;
  housingDescription: string;
  housingChanged: boolean | null;
  housingChangeDescription: string;
  hasIncomes: boolean | null;
  incomes: IncomeForm[];
  hasPendingBenefits: boolean | null;
  pendingBenefits: PendingBenefitForm[];
  hasAssets: boolean | null;
  assets: AssetForm[];
  costs: CostForm[];
  plannings: PlanningForm[];
  plannedActivities: PlannedActivityForm[];
  jobApplications: JobApplicationForm[];
  persons: PersonForm[];
  staysInMunicipality: boolean | null;
  stayDescription: string;
  attestation: boolean;
  /** Kontaktuppgifter — förifylls från contactsettings men kan redigeras. */
  contactEmail: string;
  contactPhone: string;
  /** Vilka kanaler den sökande vill ha notiser till (minst en krävs). */
  notifyByEmail: boolean;
  notifyBySms: boolean;
}

export interface FinancialAssistancePrefill {
  maritalStatus: MaritalStatus;
  periodMonth: number | null;
  periodYear: number | null;
  applicantPersonalNumber: string;
  coApplicantPersonalNumber: string;
}

export const emptyFinancialAssistanceFormData = (
  prefill: FinancialAssistancePrefill,
): FinancialAssistanceFormData => {
  const persons: PersonForm[] = [emptyPerson('APPLICANT', prefill.applicantPersonalNumber)];
  if (prefill.maritalStatus === 'COHABITING') {
    persons.push(emptyPerson('CO_APPLICANT', prefill.coApplicantPersonalNumber));
  }

  return {
    maritalStatus: prefill.maritalStatus,
    periodMonth: prefill.periodMonth,
    periodYear: prefill.periodYear,
    periodChoice: '',
    normType: '',
    otherBenefitDescription: '',
    livelihoodDescription: '',
    hasChildrenUnder21: null,
    children: [],
    childrenResidenceChanged: null,
    childrenResidenceChangeDescription: '',
    housingForm: '',
    housingAdultsCount: null,
    housingChildrenCount: null,
    housingRoomsPlusKitchen: null,
    housingDescription: '',
    housingChanged: null,
    housingChangeDescription: '',
    hasIncomes: null,
    incomes: [],
    hasPendingBenefits: null,
    pendingBenefits: [],
    hasAssets: null,
    assets: [],
    costs: [],
    plannings: [],
    plannedActivities: [],
    jobApplications: [],
    persons,
    staysInMunicipality: null,
    stayDescription: '',
    attestation: false,
    contactEmail: '',
    contactPhone: '',
    notifyByEmail: true,
    notifyBySms: true,
  };
};

export const emptyChild = (): ChildForm => ({
  personalNumber: '',
  firstName: '',
  lastName: '',
  schoolName: '',
  residenceExtent: '',
  daysInHome: null,
});

export const emptyCost = (): CostForm => ({
  costType: '',
  appliedAmount: null,
  otherSubType: '',
  specification: '',
  recipientOrPeriod: '',
});

export const emptyIncome = (): IncomeForm => ({
  incomeType: '',
  amount: null,
  incomeDate: '',
  recipient: '',
});

export const emptyPendingBenefit = (): PendingBenefitForm => ({
  benefitName: '',
  applicantName: '',
});

export const emptyAsset = (): AssetForm => ({
  assetCategory: '',
  description: '',
  value: null,
  propertyType: '',
  purchaseYear: null,
  purchasePrice: null,
  companyName: '',
  companyAssetSum: null,
  vehicleType: '',
  registrationNumber: '',
  purchaseDate: '',
});

export const emptyPlanning = (): PlanningForm => ({
  person: '',
  planningType: '',
  workExtent: '',
  workDescription: '',
  sickLeaveLevel: '',
  sickFrom: '',
  sickTo: '',
  sfiStudyPath: '',
  sfiCourse: '',
  otherDescription: '',
});

export const emptyPlannedActivity = (): PlannedActivityForm => ({
  person: '',
  activity: '',
  periodFrom: '',
  periodTo: '',
});

export const emptyJobApplication = (): JobApplicationForm => ({
  person: '',
  applicationDate: '',
  jobTitle: '',
  employerAndPlace: '',
});

export const emptyPerson = (role: PersonRole, personalNumber: string): PersonForm => ({
  role,
  personalNumber,
  needsInterpreter: null,
  interpreterLanguage: '',
  hadWorkLast12Months: null,
  hadWorkDescription: '',
  paymentMethod: '',
  clearingNumber: '',
  accountNumber: '',
  otherPaymentDescription: '',
  paymentSameAsPrevious: null,
});

// --- Wizard groups, gated per applicationType (from the per-type field matrix) ---
// 'household-housing' now leads with civilstånd + ansökningsperiod; 'economy' leads with norm
// then costs; incomes/benefits/assets are their own 'income' group.
export type FaGroupKey = 'household-housing' | 'economy' | 'income' | 'planning' | 'payment' | 'review';

export const FA_GROUPS_BY_TYPE: Record<ApplicationType, FaGroupKey[]> = {
  NEW: ['household-housing', 'economy', 'income', 'planning', 'payment', 'review'],
  RENEWAL: ['household-housing', 'economy', 'income', 'planning', 'payment', 'review'],
  SUPPLEMENTARY: ['household-housing', 'economy', 'payment', 'review'],
};
