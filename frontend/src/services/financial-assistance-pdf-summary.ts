import { ApplicationType, FinancialAssistanceFormData, PersonForm } from '@interfaces/financial-assistance';
import { swedishMonthName } from '@utils/swedish-month';

/**
 * Builds the human-readable application summary that the backend renders to the attached PDF.
 * The frontend owns the form questions and their Swedish labels, so the question/answer text is
 * assembled here; the backend only lays it out.
 *
 * Structure mirrors the official sammanställning exactly — six numbered groups in wizard order:
 *   1. Personuppgifter (person identity + contact, civilstånd, barn) — persons at the top
 *   2. Boendesituation
 *   3. Utgifter (ansökningsperiod + norm + kostnader)
 *   4. Inkomster och tillgångar
 *   5. Planering
 *   6. Utbetalning och försäkran (utbetalning per person + vistelse + försäkran)
 * Empty rows/sections/groups are omitted.
 */

export interface ApplicationPdfRow {
  label: string;
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
  /** Person sections — lets the backend attach the right person (name in heading). */
  role?: 'APPLICANT' | 'CO_APPLICANT';
  /** When true, the backend prepends this person's personnummer + folkbokföringsadress (Citizen). */
  identity?: boolean;
}
export interface ApplicationPdfGroup {
  heading: string;
  sections: ApplicationPdfSection[];
}
export interface ApplicationPdfDocument {
  title: string;
  subtitle?: string;
  groups: ApplicationPdfGroup[];
}

type Translate = (key: string, options?: Record<string, unknown>) => string;
type RawRow = [label: string, value: string | null | undefined, info?: string | null];

const fa = (key: string): string => `financial-assistance:${key}`;

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

const compactSections = (sections: (ApplicationPdfSection | null)[]): ApplicationPdfSection[] =>
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
  // The form switches question wording du→ni when there is a co-applicant; mirror it (i18next falls
  // back to the base key when no `_ni` variant exists, so routing question labels through q is safe).
  const niCtx = isCohabiting ? { context: 'ni' } : undefined;
  const q = (key: string): string => t(fa(key), niCtx);
  const infoArray = (key: string): string => {
    const value = t(fa(key), { returnObjects: true }) as unknown;
    if (Array.isArray(value)) return value.filter((part): part is string => typeof part === 'string').join('\n\n');
    return typeof value === 'string' ? value : '';
  };
  const yesNo = (value: boolean | null): string => (value == null ? '' : t(fa(`common.${value ? 'yes' : 'no'}`)));

  /** A section that is dropped when it has no rows (and no standalone info). */
  const section = (
    heading: string | undefined,
    rawRows: RawRow[],
    extra?: { info?: string; role?: 'APPLICANT' | 'CO_APPLICANT'; identity?: boolean; keepEmpty?: boolean },
  ): ApplicationPdfSection | null => {
    const rows = toRows(rawRows);
    const info = extra?.info?.trim();
    if (!rows.length && !info && !extra?.keepEmpty) return null;
    return {
      ...(heading ? { heading } : {}),
      rows,
      ...(info ? { info } : {}),
      ...(extra?.role ? { role: extra.role } : {}),
      ...(extra?.identity ? { identity: true } : {}),
    };
  };

  const group = (heading: string, sections: (ApplicationPdfSection | null)[]): ApplicationPdfGroup | null => {
    const kept = compactSections(sections);
    return kept.length ? { heading, sections: kept } : null;
  };

  // ── 1. Personuppgifter ──────────────────────────────────────────────────────────────────────
  // Per-person contact section. Identity (personnummer + folkbokföringsadress, name in heading) is
  // added by the backend from Citizen; here only the entered contact fields + notisval.
  const contactSection = (person: PersonForm): ApplicationPdfSection => {
    const isCo = person.role === 'CO_APPLICANT';
    const contact = isCo
      ? { email: form.coApplicantEmail, phone: form.coApplicantPhone, byEmail: form.coNotifyByEmail, bySms: form.coNotifyBySms }
      : { email: form.contactEmail, phone: form.contactPhone, byEmail: form.notifyByEmail, bySms: form.notifyBySms };
    const notify = joinParts([
      contact.byEmail && t(fa('personuppgifter.notifyEmail')),
      contact.bySms && t(fa('personuppgifter.notifySms')),
    ]);
    return {
      heading: t(fa(`recipient.${person.role}`)),
      role: person.role,
      identity: true,
      rows: toRows([
        [t(fa('personuppgifter.phoneLabel')), contact.phone],
        [t(fa('personuppgifter.emailLabel')), contact.email],
        [
          t(fa(isCo ? 'personuppgifter.notifyLabelCoApplicant' : 'personuppgifter.notifyLabel')),
          notify,
          t(fa('personuppgifter.notifyInfo')),
        ],
      ]),
    };
  };

  const householdSection = section(undefined, [
    [t(fa('periodNorm.maritalStatusLabel')), form.civilstandChoice ? t(fa(`civilstand.${form.civilstandChoice}`)) : ''],
    ...(!isSupplementary
      ? ([[q('householdHousing.hasChildrenLabel'), yesNo(form.hasChildrenUnder21), q('householdHousing.hasChildrenInfo')]] as RawRow[])
      : []),
  ]);

  const childrenSections = isSupplementary
    ? []
    : form.children.map((child, index) =>
        section(t(fa('child.heading'), { number: index + 1 }), [
          ['Namn', joinParts([child.firstName, child.lastName])],
          [t(fa('child.personalNumber')), child.personalNumber],
          [t(fa('child.schoolName')), child.schoolName],
          [t(fa('child.residenceExtent')), child.residenceExtent ? t(fa(`residenceExtent.${child.residenceExtent}`)) : ''],
          [t(fa('child.daysInHome')), child.daysInHome != null ? String(child.daysInHome) : ''],
        ]),
      );

  const personalGroup = group('1. ' + t(fa('personuppgifter.heading')), [
    ...form.persons.map(contactSection),
    householdSection,
    ...childrenSections,
  ]);

  // ── 2. Boendesituation ──────────────────────────────────────────────────────────────────────
  const housingFormLabel = isRenewal ? q('householdHousing.housingFormLabelChanged') : q('householdHousing.housingFormLabel');
  const housingSection = isSupplementary
    ? null
    : section(undefined, [
        [q('householdHousing.childrenChangedLabel'), yesNo(form.childrenResidenceChanged)],
        [t(fa('householdHousing.changeDescriptionPlaceholder')), form.childrenResidenceChangeDescription],
        [q('householdHousing.housingChangedLabel'), yesNo(form.housingChanged)],
        [t(fa('householdHousing.changeDescriptionPlaceholder')), form.housingChangeDescription],
        [housingFormLabel, form.housingForm ? t(fa(`housingForm.${form.housingForm}`)) : ''],
        [t(fa('householdHousing.personCountLabel')), form.housingPersonCount != null ? String(form.housingPersonCount) : ''],
        [t(fa('householdHousing.roomsLabel')), form.housingRoomsPlusKitchen != null ? String(form.housingRoomsPlusKitchen) : ''],
        [t(fa('householdHousing.housingDescriptionLabel')), form.housingDescription],
      ]);
  const housingGroup = group('2. Boendesituation', [housingSection]);

  // ── 3. Utgifter (ansökningsperiod + norm + kostnader) ──────────────────────────────────────────
  const period =
    form.periodMonth && form.periodYear
      ? t(fa('periodNorm.periodValue'), { month: swedishMonthName(form.periodMonth), year: form.periodYear })
      : form.periodChoice
        ? t(fa(`periodChoice.${form.periodChoice}`))
        : '';
  const periodNormSection = section(undefined, [
    [t(fa('periodNorm.periodLabel')), period],
    [
      q('periodNorm.normTypeLabel'),
      form.normType ? t(fa(`normType.${form.normType}`)) : '',
      form.normType ? t(fa(`normInfo.${form.normType}`)) : undefined,
    ],
    [t(fa('periodNorm.otherBenefitPlaceholder')), form.otherBenefitDescription],
  ]);
  const costsSection = section(
    q('economy.costsHeading'),
    form.costs
      .filter((cost) => cost.costType)
      .map((cost): RawRow => {
        const base = t(fa(`costType.${cost.costType}`));
        const label =
          cost.costType === 'OTHER' && cost.otherSubType ? `${base} – ${t(fa(`costOtherSubType.${cost.otherSubType}`))}` : base;
        return [label, joinParts([kr(cost.appliedAmount), cost.specification, cost.recipientOrPeriod]), t(fa(`costInfo.${cost.costType}`))];
      }),
  );
  const expensesGroup = group('3. Utgifter', [periodNormSection, costsSection]);

  // ── 4. Inkomster och tillgångar ─────────────────────────────────────────────────────────────
  const incomesSection = isSupplementary
    ? null
    : section(t(fa('economy.incomesHeading')), [
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
    : section(t(fa('economy.pendingBenefitsHeading')), [
        [q('economy.hasPendingBenefitsLabel'), yesNo(form.hasPendingBenefits), q('income.pendingBenefitsInfo')],
        ...form.pendingBenefits.map((benefit): RawRow => [benefit.benefitName, benefit.applicantName]),
      ]);
  const assetsSection = isSupplementary
    ? null
    : section(t(fa('economy.assetsHeading')), [
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
  const incomeGroup = group('4. ' + t(fa('groups.income')), [incomesSection, pendingBenefitsSection, assetsSection]);

  // ── 5. Planering ────────────────────────────────────────────────────────────────────────────
  const planningInfoKey: Record<string, string> = { JOBSEEKING: 'jobseeking', SICK_LEAVE: 'sickLeave', SFI: 'sfi' };
  const planningSection = isSupplementary
    ? null
    : section(undefined, [
        ...form.plannings
          .filter((planning) => planning.planningType)
          .map(
            (planning): RawRow => [
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
              planningInfoKey[planning.planningType] ? t(fa(`planning.info.${planningInfoKey[planning.planningType]}`)) : undefined,
            ],
          ),
        ...(isNew
          ? form.plannedActivities.map(
              (activity): RawRow => [
                t(fa('planning.activity.activityLabel')),
                joinParts([activity.person && t(fa(`recipient.${activity.person}`)), activity.activity, activity.periodFrom, activity.periodTo]),
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
      ]);
  const planningGroup = group('5. ' + t(fa('planning.heading')), [planningSection]);

  // ── 6. Utbetalning och försäkran ────────────────────────────────────────────────────────────
  // Per-person payment section (no identity rows — those live in group 1).
  const paymentSection = (person: PersonForm): ApplicationPdfSection | null => {
    const methodAnswer = person.paymentMethod ? t(fa(`paymentMethod.${person.paymentMethod}`)) : '';
    const showPayoutMethod = isNew || person.paymentSameAsPrevious === false;
    return section(
      t(fa(`recipient.${person.role}`)),
      [
        ...(!isNew ? ([[t(fa('payment.sameAsPreviousLabel')), yesNo(person.paymentSameAsPrevious)]] as RawRow[]) : []),
        ...(showPayoutMethod ? ([[q('payment.payoutQuestion'), methodAnswer]] as RawRow[]) : []),
        [t(fa('payment.clearingLabel')), person.clearingNumber],
        [t(fa('payment.accountLabel')), person.accountNumber],
        [t(fa('payment.otherDescriptionLabel')), person.otherPaymentDescription],
        ...(isNew
          ? ([
              [t(fa('payment.needsInterpreterLabel')), yesNo(person.needsInterpreter)],
              [t(fa('payment.interpreterLanguageLabel')), person.interpreterLanguage],
              [t(fa('payment.hadWorkLabel')), yesNo(person.hadWorkLast12Months)],
              [t(fa('payment.hadWorkDescriptionLabel')), person.hadWorkDescription],
            ] as RawRow[])
          : []),
      ],
      { role: person.role },
    );
  };
  const staysSection = section(t(fa('review.staysHeading')), [
    [q('review.staysInfo'), yesNo(form.staysInMunicipality)],
    [t(fa('review.stayDescriptionPlaceholder')), form.stayDescription],
  ]);
  const attestationSection = section(
    t(fa('review.attestationHeading')),
    [[t(fa('review.attestation')), form.attestation ? '✓' : '']],
    { info: infoArray('review.attestationInfo') },
  );
  const paymentGroup = group('6. ' + t(fa('payment.heading')), [
    ...form.persons.map(paymentSection),
    staysSection,
    attestationSection,
  ]);

  const groups = [personalGroup, housingGroup, expensesGroup, incomeGroup, planningGroup, paymentGroup].filter(
    (g): g is ApplicationPdfGroup => g !== null,
  );

  return {
    title: t(fa('header.title')),
    subtitle: t(fa(`type.${applicationType}`)),
    groups,
  };
};
