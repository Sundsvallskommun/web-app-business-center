import {
  ApplicationType,
  FinancialAssistanceFormData,
  PersonForm,
} from '@interfaces/financial-assistance';
import { swedishMonthName } from '@utils/swedish-month';

/**
 * Builds the human-readable application summary that the backend renders to the attached PDF.
 * The frontend owns the form questions and their Swedish labels, so the question/answer text is
 * assembled here; the backend only lays it out.
 *
 * Layout: persons (applicant + co-applicant) first, then all questions/answers in form order,
 * then children as their own section (not tied to a person). Empty answers are omitted.
 */

export interface ApplicationPdfRow {
  label: string;
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
   * For person sections only — lets the backend attach Citizen-derived identity
   * (personnummer + folkbokföringsadress) to the right person. Omitted for other sections.
   */
  role?: 'APPLICANT' | 'CO_APPLICANT';
}
export interface ApplicationPdfDocument {
  title: string;
  subtitle?: string;
  persons: ApplicationPdfSection[];
  sections: ApplicationPdfSection[];
  children: ApplicationPdfSection[];
}

type Translate = (key: string, options?: Record<string, unknown>) => string;
type RawRow = [label: string, value: string | null | undefined, info?: string | null];

const fa = (key: string): string => `financial-assistance:${key}`;

/** Joins non-empty parts with a separator — used to fold several fields into one answer line. */
const joinParts = (parts: (string | null | undefined | false)[]): string =>
  parts.filter((part): part is string => typeof part === 'string' && part.trim() !== '').join(' • ');

const kr = (amount: number | null): string => (amount == null ? '' : `${amount} kr`);

/** Keeps only rows with a non-empty answer; carries the optional help text. */
const toRows = (rawRows: RawRow[]): ApplicationPdfRow[] =>
  rawRows
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(([label, value, info]) => {
      const trimmedInfo = typeof info === 'string' ? info.trim() : '';
      return { label, value: String(value).trim(), ...(trimmedInfo ? { info: trimmedInfo } : {}) };
    });

/** Keeps only rows with a non-empty answer; returns null when the whole section is empty. */
const toSection = (heading: string, rawRows: RawRow[], info?: string): ApplicationPdfSection | null => {
  const rows = toRows(rawRows);
  if (!rows.length) return null;
  const trimmedInfo = typeof info === 'string' ? info.trim() : '';
  return { heading, rows, ...(trimmedInfo ? { info: trimmedInfo } : {}) };
};

const compact = (sections: (ApplicationPdfSection | null)[]): ApplicationPdfSection[] =>
  sections.filter((section): section is ApplicationPdfSection => section !== null);

export const buildApplicationPdfSummary = (
  form: FinancialAssistanceFormData,
  applicationType: ApplicationType,
  t: Translate,
): ApplicationPdfDocument => {
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const isNew = applicationType === 'NEW';
  const isRenewal = applicationType === 'RENEWAL';
  const isCohabiting = form.maritalStatus === 'COHABITING';
  // The form switches question wording du→ni when there is a co-applicant; mirror that here so the
  // PDF shows the exact question the applicant saw. i18next falls back to the base key when no
  // `_ni` variant exists, so routing every question label through this is safe.
  const niCtx = isCohabiting ? { context: 'ni' } : undefined;
  const q = (key: string): string => t(fa(key), niCtx);
  // Some help texts are arrays of paragraphs in i18n (e.g. försäkran) — join them into one block.
  const infoArray = (key: string): string => {
    const value = t(fa(key), { returnObjects: true }) as unknown;
    if (Array.isArray(value)) return value.filter((part): part is string => typeof part === 'string').join('\n\n');
    return typeof value === 'string' ? value : '';
  };
  const yesNo = (value: boolean | null): string => (value == null ? '' : t(fa(`common.${value ? 'yes' : 'no'}`)));

  // --- Persons (applicant + co-applicant) ---
  // Identity (personnummer + folkbokföringsadress) is added by the backend from Citizen via partyId
  // — the applicant's personnummer isn't even in the form. Here we only emit the entered details and
  // tag the section with the role so the backend can attach the right person's identity.
  const buildPerson = (person: PersonForm): ApplicationPdfSection => {
    const isCo = person.role === 'CO_APPLICANT';
    const contact = isCo
      ? { email: form.coApplicantEmail, phone: form.coApplicantPhone, byEmail: form.coNotifyByEmail, bySms: form.coNotifyBySms }
      : { email: form.contactEmail, phone: form.contactPhone, byEmail: form.notifyByEmail, bySms: form.notifyBySms };
    const notify = joinParts([
      contact.byEmail && t(fa('personuppgifter.notifyEmail')),
      contact.bySms && t(fa('personuppgifter.notifySms')),
    ]);
    const payment =
      person.paymentSameAsPrevious === true
        ? t(fa('payment.sameAsPreviousLabel'))
        : person.paymentMethod
          ? t(fa(`paymentMethod.${person.paymentMethod}`))
          : '';

    return {
      heading: t(fa(`recipient.${person.role}`)),
      role: person.role,
      rows: toRows([
        [t(fa('payment.needsInterpreterLabel')), yesNo(person.needsInterpreter)],
        [t(fa('payment.interpreterLanguageLabel')), person.interpreterLanguage],
        [t(fa('payment.hadWorkLabel')), yesNo(person.hadWorkLast12Months)],
        [t(fa('payment.hadWorkDescriptionLabel')), person.hadWorkDescription],
        [t(fa('payment.methodLabel')), payment],
        [t(fa('payment.clearingLabel')), person.clearingNumber],
        [t(fa('payment.accountLabel')), person.accountNumber],
        [t(fa('payment.otherDescriptionLabel')), person.otherPaymentDescription],
        [t(fa('personuppgifter.emailLabel')), contact.email],
        [t(fa('personuppgifter.phoneLabel')), contact.phone],
        [t(fa('personuppgifter.notifyLabel')), notify, t(fa('personuppgifter.notifyInfo'))],
      ]),
    };
  };

  const persons = form.persons.map(buildPerson);

  // --- Period & norm ---
  const period =
    form.periodMonth && form.periodYear
      ? t(fa('periodNorm.periodValue'), { month: swedishMonthName(form.periodMonth), year: form.periodYear })
      : form.periodChoice
        ? t(fa(`periodChoice.${form.periodChoice}`))
        : '';

  const periodNormSection = toSection(t(fa('periodNorm.heading')), [
    [t(fa('periodNorm.maritalStatusLabel')), form.civilstandChoice ? t(fa(`civilstand.${form.civilstandChoice}`)) : ''],
    [t(fa('periodNorm.periodLabel')), period],
    [
      t(fa('periodNorm.normTypeLabel')),
      form.normType ? t(fa(`normType.${form.normType}`)) : '',
      form.normType ? t(fa(`normInfo.${form.normType}`)) : undefined,
    ],
    [t(fa('periodNorm.otherBenefitPlaceholder')), form.otherBenefitDescription],
  ]);

  // --- Household & housing (not supplementary) ---
  const housingFormLabel = isRenewal
    ? q('householdHousing.housingFormLabelChanged')
    : q('householdHousing.housingFormLabel');
  const householdSection = isSupplementary
    ? null
    : toSection(t(fa('householdHousing.heading')), [
        [q('householdHousing.hasChildrenLabel'), yesNo(form.hasChildrenUnder21), q('householdHousing.hasChildrenInfo')],
        [q('householdHousing.childrenChangedLabel'), yesNo(form.childrenResidenceChanged)],
        [t(fa('householdHousing.changeDescriptionPlaceholder')), form.childrenResidenceChangeDescription],
        [q('householdHousing.housingChangedLabel'), yesNo(form.housingChanged)],
        [t(fa('householdHousing.changeDescriptionPlaceholder')), form.housingChangeDescription],
        [housingFormLabel, form.housingForm ? t(fa(`housingForm.${form.housingForm}`)) : ''],
        [t(fa('householdHousing.roomsLabel')), form.housingRoomsPlusKitchen != null ? String(form.housingRoomsPlusKitchen) : ''],
        [t(fa('householdHousing.personCountLabel')), form.housingPersonCount != null ? String(form.housingPersonCount) : ''],
        [t(fa('householdHousing.housingDescriptionLabel')), form.housingDescription],
      ]);

  // --- Costs (all types) ---
  const costRows: RawRow[] = form.costs
    .filter((cost) => cost.costType)
    .map((cost) => {
      const base = t(fa(`costType.${cost.costType}`));
      const label =
        cost.costType === 'OTHER' && cost.otherSubType ? `${base} – ${t(fa(`costOtherSubType.${cost.otherSubType}`))}` : base;
      return [
        label,
        joinParts([kr(cost.appliedAmount), cost.specification, cost.recipientOrPeriod]),
        t(fa(`costInfo.${cost.costType}`)),
      ];
    });
  const costsSection = toSection(q('economy.costsHeading'), costRows);

  // --- Incomes / pending benefits / assets (not supplementary) ---
  const incomesSection = isSupplementary
    ? null
    : toSection(t(fa('economy.incomesHeading')), [
        [q('economy.hasIncomesLabel'), yesNo(form.hasIncomes), q('income.incomesInfo')],
        ...form.incomes
          .filter((income) => income.incomeType)
          .map(
            (income): RawRow => [
              t(fa(`incomeType.${income.incomeType}`)),
              joinParts([kr(income.amount), income.incomeDate, income.recipient && t(fa(`recipient.${income.recipient}`))]),
            ],
          ),
      ]);

  const pendingBenefitsSection = isSupplementary
    ? null
    : toSection(t(fa('economy.pendingBenefitsHeading')), [
        [q('economy.hasPendingBenefitsLabel'), yesNo(form.hasPendingBenefits), q('income.pendingBenefitsInfo')],
        ...form.pendingBenefits.map((benefit): RawRow => [benefit.benefitName, benefit.applicantName]),
      ]);

  const assetsSection = isSupplementary
    ? null
    : toSection(t(fa('economy.assetsHeading')), [
        [q('economy.hasAssetsLabel'), yesNo(form.hasAssets), q('income.assetsInfo')],
        ...form.assets
          .filter((asset) => asset.assetCategory)
          .map(
            (asset): RawRow => [
              t(fa(`assetCategory.${asset.assetCategory}`)),
              joinParts([
                asset.description,
                kr(asset.value),
                asset.propertyType && t(fa(`propertyType.${asset.propertyType}`)),
                asset.purchaseYear != null ? String(asset.purchaseYear) : '',
                asset.purchasePrice != null ? kr(asset.purchasePrice) : '',
                asset.companyName,
                asset.companyAssetSum != null ? kr(asset.companyAssetSum) : '',
                asset.vehicleType && t(fa(`vehicleType.${asset.vehicleType}`)),
                asset.registrationNumber,
                asset.purchaseDate,
              ]),
            ],
          ),
      ]);

  // --- Planning (not supplementary) ---
  const planningRows: RawRow[] = isSupplementary
    ? []
    : [
        ...form.plannings
          .filter((planning) => planning.planningType)
          .map((planning): RawRow => {
            // Planeringstyper med en hjälptext i formuläret (arbete/övrigt saknar).
            const infoKey: Record<string, string> = { JOBSEEKING: 'jobseeking', SICK_LEAVE: 'sickLeave', SFI: 'sfi' };
            return [
              t(fa(`planningType.${planning.planningType}`)),
              joinParts([
                planning.person && t(fa(`recipient.${planning.person}`)),
                planning.workExtent && t(fa(`workExtent.${planning.workExtent}`)),
                planning.workDescription,
                planning.sickLeaveLevel && `${planning.sickLeaveLevel}%`,
                planning.sfiStudyPath,
                planning.sfiCourse,
                planning.otherDescription,
              ]),
              infoKey[planning.planningType]
                ? t(fa(`planning.info.${infoKey[planning.planningType]}`))
                : undefined,
            ];
          }),
        ...(isNew
          ? form.plannedActivities.map(
              (activity): RawRow => [
                t(fa('planning.activity.activityLabel')),
                joinParts([
                  activity.person && t(fa(`recipient.${activity.person}`)),
                  activity.activity,
                  activity.periodFrom,
                  activity.periodTo,
                ]),
              ],
            )
          : []),
        ...(isNew
          ? form.jobApplications.map(
              (application): RawRow => [
                t(fa('planning.jobApplication.jobTitleLabel')),
                joinParts([
                  application.person && t(fa(`recipient.${application.person}`)),
                  application.jobTitle,
                  application.employerAndPlace,
                  application.applicationDate,
                ]),
              ],
            )
          : []),
      ];
  const planningSection = toSection(t(fa('planning.heading')), planningRows);

  // --- Stay & attestation ---
  const reviewSection = toSection(
    t(fa('review.staysHeading')),
    [
      [q('review.staysInfo'), yesNo(form.staysInMunicipality)],
      [t(fa('review.stayDescriptionPlaceholder')), form.stayDescription],
      [t(fa('review.attestationHeading')), form.attestation ? t(fa('common.yes')) : '', t(fa('review.attestation'))],
    ],
    infoArray('review.attestationInfo'),
  );

  const sections = compact([
    periodNormSection,
    householdSection,
    costsSection,
    incomesSection,
    pendingBenefitsSection,
    assetsSection,
    planningSection,
    reviewSection,
  ]);

  // --- Children (own section, not tied to a person) ---
  const children = isSupplementary
    ? []
    : compact(
        form.children.map((child, index) =>
          toSection(t(fa('child.heading'), { number: index + 1 }), [
            ['Namn', joinParts([child.firstName, child.lastName])],
            [t(fa('child.personalNumber')), child.personalNumber],
            [t(fa('child.schoolName')), child.schoolName],
            [t(fa('child.residenceExtent')), child.residenceExtent ? t(fa(`residenceExtent.${child.residenceExtent}`)) : ''],
            [t(fa('child.daysInHome')), child.daysInHome != null ? String(child.daysInHome) : ''],
          ]),
        ),
      );

  return {
    title: t(fa('header.title')),
    subtitle: t(fa(`type.${applicationType}`)),
    persons,
    sections,
    children,
  };
};
