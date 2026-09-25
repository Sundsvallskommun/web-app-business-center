import {
  ApplicationType,
  AssetForm,
  FinancialAssistanceFormData,
  PeriodChoice,
  PersonForm,
  PersonRole,
  PlanningForm,
} from '@interfaces/financial-assistance';
import {
  incomeAssetLabelSuffix,
  interpreterQuestionLabel,
  planningInfoText,
  requiredDocumentLabel,
  requiredDocumentsHeading,
  sickLeaveLevelLabel,
} from '@services/financial-assistance-labels';
import { asksNeedsAttachments, getRequiredDocuments } from '@services/financial-assistance-required-documents';
import { asksWorkHistory, planningRole } from '@services/financial-assistance-work-history';
import { formatPeriodChoiceLabel } from '@utils/financial-assistance-period-choice';
import { swedishMonthName } from '@utils/swedish-month';

const PERIOD_CHOICES: PeriodChoice[] = ['CURRENT_MONTH', 'NEXT_MONTH', 'OTHER_BENEFIT'];
const NORM_TYPE_ORDER = ['NATIONAL_NORM', 'OTHER_NORM'] as const;

/**
 * Builds the human-readable application summary that the backend renders to the attached PDF.
 * The frontend owns the form questions and their Swedish labels, so the question/answer text is
 * assembled here; the backend only lays it out.
 *
 * Structure mirrors the form — five numbered groups in wizard order:
 *   1. Personuppgifter (civilstånd, per person identity + contact details, barn, boende)
 *   2. Kostnader (ansökningsperiod + norm + kostnader)
 *   3. Inkomster och tillgångar
 *   4. Planering (per person)
 *   5. Utbetalning och försäkran (utbetalning per person + bilagor + vistelse + försäkran)
 * Empty rows/sections/groups are omitted.
 */

export interface ApplicationPdfRow {
  label: string;
  value: string;
  /** The form's help text for this question, when it has one. */
  info?: string;
}
/** A bulleted list, e.g. the documents the applicant needs to attach. */
export interface ApplicationPdfList {
  /** Optional lead-in above the list (e.g. "Följande behöver bifogas:"). */
  heading?: string;
  items: string[];
}
export interface ApplicationPdfSection {
  /** Optional sub-heading within a group (e.g. "Sökande", "Vilka kostnader söker du bistånd för?"). */
  heading?: string;
  rows: ApplicationPdfRow[];
  /** The form's help text for this section, when it has one. */
  info?: string;
  /** Bulleted lists shown after the help text, before the rows. */
  lists?: ApplicationPdfList[];
  /** A highlighted note box shown after the rows (e.g. the tip about the message function). */
  note?: string;
  /** Draws a divider line after the section, like the dividers in the form. */
  divider?: boolean;
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

/** Citizen-derived identity for a person, shown at the top of their section. */
export interface PersonIdentity {
  /** Förnamn efternamn. */
  name: string;
  personnummer: string;
  /** Formatted folkbokföringsadress, e.g. "Storgatan 1, 852 30 Sundsvall". */
  folkbokforing: string;
}
/**
 * Person identities by role. Supplied for the on-screen preview (fetched from the citizen profiles);
 * omitted for the submit payload, where the backend adds the authoritative identity from Citizen.
 */
export type ApplicantIdentities = Partial<Record<'APPLICANT' | 'CO_APPLICANT', PersonIdentity>>;

/**
 * Stands in for a person's name in the submit payload (e.g. "Vilken planering har %APPLICANT_NAME%?").
 * The backend owns person identity and replaces it with the name from Citizen.
 */
export const personNamePlaceholder = (role: PersonRole): string => `%${role}_NAME%`;

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

/** Draws a divider after the last of the sections — closes a person's block, like in the form. */
const withDividerAfter = (sections: ApplicationPdfSection[]): ApplicationPdfSection[] =>
  sections.map((section, index) => (index === sections.length - 1 ? { ...section, divider: true } : section));

export const buildApplicationPdfSummary = (
  form: FinancialAssistanceFormData,
  applicationType: ApplicationType,
  t: Translate,
  identities?: ApplicantIdentities,
): ApplicationPdfDocument => {
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const isNew = applicationType === 'NEW';
  const isRenewal = applicationType === 'RENEWAL';
  const isCohabiting = form.maritalStatus === 'COHABITING';
  // The form switches question wording du→ni when there is a co-applicant; mirror it (i18next falls
  // back to the base key when no `_ni` variant exists, so routing question labels through q is safe).
  const niCtx = isCohabiting ? { context: 'ni' } : undefined;
  const q = (key: string): string => t(fa(key), niCtx);
  /** A translation that is a list of paragraphs or items (e.g. the försäkran texts, the documents to attach). */
  const textList = (key: string): string[] => {
    const value = t(fa(key), { returnObjects: true, ...niCtx }) as unknown;
    return Array.isArray(value) ? value.filter((part): part is string => typeof part === 'string') : [];
  };
  const yesNo = (value: boolean | null): string => (value == null ? '' : t(fa(`common.${value ? 'yes' : 'no'}`)));

  // The preview passes identities and shows the real name (undefined while it is loading). The submit
  // payload carries a placeholder that the backend replaces with the name from Citizen.
  const personName = (role: PersonRole): string | undefined =>
    identities ? identities[role]?.name || undefined : personNamePlaceholder(role);

  /** A section that is dropped when it has no rows (and no standalone info, lists or note). */
  const section = (
    heading: string | undefined,
    rawRows: RawRow[],
    extra?: {
      info?: string;
      lists?: ApplicationPdfList[];
      note?: string;
      role?: 'APPLICANT' | 'CO_APPLICANT';
      identity?: boolean;
      keepEmpty?: boolean;
    },
  ): ApplicationPdfSection | null => {
    const rows = toRows(rawRows);
    const info = extra?.info?.trim();
    const lists = (extra?.lists ?? []).filter((list) => list.items.length > 0);
    const note = extra?.note?.trim();
    if (!rows.length && !info && !lists.length && !note && !extra?.keepEmpty) return null;
    return {
      ...(heading ? { heading } : {}),
      rows,
      ...(info ? { info } : {}),
      ...(lists.length ? { lists } : {}),
      ...(note ? { note } : {}),
      ...(extra?.role ? { role: extra.role } : {}),
      ...(extra?.identity ? { identity: true } : {}),
    };
  };

  const group = (heading: string, sections: (ApplicationPdfSection | null)[]): ApplicationPdfGroup | null => {
    const kept = compactSections(sections);
    return kept.length ? { heading, sections: kept } : null;
  };

  // ── 1. Personuppgifter ──────────────────────────────────────────────────────────────────────
  // Civilstånd first, as in the form.
  const civilstandSection = section(undefined, [
    [t(fa('periodNorm.maritalStatusLabel')), form.civilstandChoice ? t(fa(`civilstand.${form.civilstandChoice}`)) : ''],
  ]);

  // Per person: identity + notisval, "Dina kontaktuppgifter" and (nyansökan) the interpreter question,
  // closed by a divider as in the form. Identity (namn, personnummer, folkbokföringsadress) is added
  // by the backend from Citizen; the preview supplies it itself.
  const personSections = (person: PersonForm): ApplicationPdfSection[] => {
    const isCo = person.role === 'CO_APPLICANT';
    const contact = isCo
      ? { email: form.coApplicantEmail, phone: form.coApplicantPhone, byEmail: form.coNotifyByEmail, bySms: form.coNotifyBySms }
      : { email: form.contactEmail, phone: form.contactPhone, byEmail: form.notifyByEmail, bySms: form.notifyBySms };
    const notify = joinParts([
      contact.byEmail && t(fa('personuppgifter.notifyEmail')),
      contact.bySms && t(fa('personuppgifter.notifySms')),
    ]);
    const identity = identities?.[person.role];
    const identitySection: ApplicationPdfSection = {
      heading: t(fa(`recipient.${person.role}`)),
      role: person.role,
      identity: true,
      rows: toRows([
        ...(identity
          ? ([
              [t(fa('personuppgifter.nameLabel')), identity.name],
              [t(fa('personuppgifter.personnummerLabel')), identity.personnummer],
              [t(fa('personuppgifter.addressLabel')), identity.folkbokforing],
            ] as RawRow[])
          : []),
        [
          t(fa(isCo ? 'personuppgifter.notifyLabelCoApplicant' : 'personuppgifter.notifyLabel')),
          notify,
          t(fa('personuppgifter.notifyInfo')),
        ],
      ]),
    };
    // As in the form, a contact detail is shown only when its notification channel is chosen ("—" when empty).
    const contactDetailsSection =
      contact.byEmail || contact.bySms
        ? section(
            t(fa('personuppgifter.contactHeading')),
            [
              [t(fa('personuppgifter.phoneLabel')), contact.bySms ? contact.phone || '—' : ''],
              [t(fa('personuppgifter.emailLabel')), contact.byEmail ? contact.email || '—' : ''],
            ],
            { info: t(fa('personuppgifter.contactInfo')) },
          )
        : null;
    // Tolk-frågan ställs på personuppgifter (nyansökan).
    const interpreterSection = isNew
      ? section(undefined, [
          [interpreterQuestionLabel(t, isCohabiting, person.role, personName(person.role)), yesNo(person.needsInterpreter)],
          [t(fa('personuppgifter.interpreterLanguageLabel')), person.interpreterLanguage],
        ])
      : null;
    return withDividerAfter(compactSections([identitySection, contactDetailsSection, interpreterSection]));
  };

  const hasChildrenSection = isSupplementary
    ? null
    : section(undefined, [[q('householdHousing.hasChildrenLabel'), yesNo(form.hasChildrenUnder21), q('householdHousing.hasChildrenInfo')]]);

  const childrenSections = isSupplementary
    ? []
    : form.children.map((child, index) =>
        section(t(fa('child.heading'), { number: index + 1 }), [
          [t(fa('personuppgifter.nameLabel')), [child.firstName, child.lastName].map((part) => part.trim()).filter(Boolean).join(' ')],
          [t(fa('child.personalNumber')), child.personalNumber],
          [t(fa('child.schoolName')), child.schoolName],
          [t(fa('child.residenceExtent')), child.residenceExtent ? t(fa(`residenceExtent.${child.residenceExtent}`)) : ''],
          [t(fa('child.daysInHome')), child.daysInHome != null ? String(child.daysInHome) : ''],
        ]),
      );

  // Boende ligger i personuppgiftssteget i formuläret — samla det under Personuppgifter (inte en
  // egen Boendesituation-grupp).
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

  // ── 1. Personuppgifter (civilstånd, personer, barn, boende) ──────────────────────────────────
  const personalGroup = group('1. ' + t(fa('groups.household-housing')), [
    civilstandSection,
    ...form.persons.flatMap(personSections),
    hasChildrenSection,
    ...childrenSections,
    housingSection,
  ]);

  // ── 2. Kostnader (ansökningsperiod + norm + kostnader) ─────────────────────────────────────────
  // Nyansökan: "Vad avser ansökan?" är flerval (denna/nästa månad och/eller annat bistånd) och norm
  // (flerval) visas bara vid denna/nästa månad. Åter-/tilläggsansökan: fast period + enkel norm.
  const periodChoiceLabel = (choice: PeriodChoice): string => formatPeriodChoiceLabel(choice, t(fa(`periodChoice.${choice}`)));
  const renewalPeriod =
    form.periodMonth && form.periodYear
      ? t(fa('periodNorm.periodValue'), { month: swedishMonthName(form.periodMonth), year: form.periodYear })
      : '';
  const periodNormRows: RawRow[] = isNew
    ? [
        [
          q('periodNorm.periodChoiceLabel'),
          PERIOD_CHOICES.filter((choice) => form.periodChoices.includes(choice)).map(periodChoiceLabel).join(', '),
        ],
        [q('periodNorm.otherBenefitPlaceholder'), form.periodChoices.includes('OTHER_BENEFIT') ? form.otherBenefitDescription : ''],
        ...(form.periodChoices.some((choice) => choice === 'CURRENT_MONTH' || choice === 'NEXT_MONTH')
          ? form.normTypes.map(
              (normType): RawRow => [q('periodNorm.normTypeLabel'), t(fa(`normType.${normType}`)), t(fa(`normInfo.${normType}`))],
            )
          : []),
      ]
    : [
        [t(fa('periodNorm.periodLabel')), renewalPeriod],
        ...(!isSupplementary
          ? ([
              [
                q('periodNorm.normTypeLabel'),
                form.normType ? t(fa(`normType.${form.normType}`)) : '',
                form.normType ? t(fa(`normInfo.${form.normType}`)) : undefined,
              ],
            ] as RawRow[])
          : []),
      ];
  const periodNormSection = section(undefined, periodNormRows);
  const appliedCosts = form.costs.filter((cost) => cost.costType);
  // "Övrigt bistånd" can be applied for several times, but — as in the form — its help text is shown once.
  const firstOtherCostIndex = appliedCosts.findIndex((cost) => cost.costType === 'OTHER');
  const costsSection = section(
    t(fa(isSupplementary ? 'economy.costsHeadingSupplementary' : 'economy.costsHeading'), niCtx),
    appliedCosts.map((cost, index): RawRow => {
      const base = t(fa(`costType.${cost.costType}`));
      const label =
        cost.costType === 'OTHER' && cost.otherSubType ? `${base} – ${t(fa(`costOtherSubType.${cost.otherSubType}`))}` : base;
      const showInfo = cost.costType !== 'OTHER' || index === firstOtherCostIndex;
      return [label, joinParts([kr(cost.appliedAmount), cost.specification]), showInfo ? t(fa(`costInfo.${cost.costType}`)) : undefined];
    }),
    // Ny- och återansökan: "Sök endast för de utgifter …" under the heading, as in the form.
    { info: !isSupplementary && appliedCosts.length ? t(fa('economy.costsInfo'), niCtx) : undefined },
  );
  // Tilläggsansökan: Riksnorm/Annan norm som utgiftsboxar under "Övrigt" — varje vald norm visas med
  // sin infotext och sin egen specifikation (för vem/vilka och vilken period).
  const otherSection = isSupplementary
    ? section(
        t(fa('economy.otherHeading')),
        NORM_TYPE_ORDER.filter((normType) => form.normTypes.includes(normType)).flatMap((normType): RawRow[] => [
          [t(fa(`normType.${normType}`)), '✓', t(fa(`normInfo.${normType}`))],
          [t(fa('economy.normSpecificationLabel')), form.normSpecifications[normType]],
        ]),
      )
    : null;
  const expensesGroup = group('2. ' + t(fa('groups.economy')), [periodNormSection, costsSection, otherSection]);

  // ── 3. Inkomster och tillgångar ──────────────────────────────────────────────────────────────
  // Varje inkomst/ersättning/tillgång blir en egen sektion med formulärets fältetiketter
  // (Belopp, Datum, Typ av fordon, Registreringsnummer …) i stället för ett ihopslaget värde.
  const assetRows = (asset: AssetForm): RawRow[] => {
    const value = asset.value != null ? String(asset.value) : '';
    const purchasePrice = asset.purchasePrice != null ? String(asset.purchasePrice) : '';
    switch (asset.assetCategory) {
      case 'BANK_SAVINGS':
        return [
          [t(fa('economy.asset.descriptionLabel')), asset.description],
          [t(fa('economy.asset.valueLabel')), value],
        ];
      case 'OTHER':
        return [
          [t(fa('economy.asset.whatLabel')), asset.description],
          [t(fa('economy.asset.valueLabel')), value],
        ];
      case 'REAL_ESTATE':
        return [
          [t(fa('economy.asset.propertyTypeLabel')), asset.propertyType ? t(fa(`propertyType.${asset.propertyType}`)) : ''],
          [t(fa('economy.asset.purchaseYearLabel')), asset.purchaseYear != null ? String(asset.purchaseYear) : ''],
          [t(fa('economy.asset.purchasePriceLabel')), purchasePrice],
        ];
      case 'COMPANY':
        return [
          [t(fa('economy.asset.companyNameLabel')), asset.companyName],
          [t(fa('economy.asset.companyAssetSumLabel')), asset.companyAssetSum != null ? String(asset.companyAssetSum) : ''],
        ];
      case 'VEHICLE':
        return [
          [t(fa('economy.asset.vehicleTypeLabel')), asset.vehicleType ? t(fa(`vehicleType.${asset.vehicleType}`)) : ''],
          [t(fa('economy.asset.registrationNumberLabel')), asset.registrationNumber],
          [t(fa('economy.asset.purchaseDateLabel')), asset.purchaseDate],
          [t(fa('economy.asset.purchasePriceLabel')), purchasePrice],
          [t(fa('economy.asset.valueLabel')), value],
        ];
      default:
        return [];
    }
  };
  const incomeSections: (ApplicationPdfSection | null)[] = isSupplementary
    ? []
    : [
        // Nyansökan: obligatorisk fritext om försörjning, först i gruppen.
        ...(isNew ? [section(undefined, [[t(fa('income.livelihoodLabel')), form.livelihoodDescription]])] : []),
        section(t(fa('economy.incomesHeading')), [[q(`economy.hasIncomesLabel${incomeAssetLabelSuffix(applicationType)}`), yesNo(form.hasIncomes), q('income.incomesInfo')]]),
        ...(form.hasIncomes === true
          ? form.incomes
              .filter((income) => income.incomeType)
              .map((income) =>
                section(t(fa(`incomeType.${income.incomeType}`)), [
                  [t(fa('economy.income.amountLabel')), income.amount != null ? String(income.amount) : ''],
                  [t(fa('economy.income.dateLabel')), income.incomeDate],
                  ...(isCohabiting
                    ? ([[t(fa('economy.recipientLabel')), income.recipient ? t(fa(`recipient.${income.recipient}`)) : '']] as RawRow[])
                    : []),
                ]),
              )
          : []),
        section(t(fa('economy.pendingBenefitsHeading')), [
          [q('economy.hasPendingBenefitsLabel'), yesNo(form.hasPendingBenefits), q('income.pendingBenefitsInfo')],
        ]),
        ...(form.hasPendingBenefits === true
          ? form.pendingBenefits.map((benefit, index) =>
              section(t(fa('economy.pendingBenefit.heading'), { number: index + 1 }), [
                [t(fa('economy.pendingBenefit.benefitNameLabel')), benefit.benefitName],
                [t(fa('economy.pendingBenefit.applicantNameLabel')), benefit.applicantName],
              ]),
            )
          : []),
        section(t(fa('economy.assetsHeading')), [[q(`economy.hasAssetsLabel${incomeAssetLabelSuffix(applicationType)}`), yesNo(form.hasAssets), q('income.assetsInfo')]]),
        ...(form.hasAssets === true
          ? form.assets
              .filter((asset) => asset.assetCategory)
              .map((asset) => section(t(fa(`assetCategory.${asset.assetCategory}`)), assetRows(asset)))
          : []),
      ];
  const incomeGroup = group('3. ' + t(fa('groups.income')), incomeSections);

  // ── 4. Planering — per person, as in the form ("Vilken planering har <namn>?") ───────────────
  // Söker man själv står det "du"; finns en medsökande används namnet, med rollen som reserv.
  const planningHeading = (role: PersonRole): string => {
    const name = isCohabiting ? personName(role) : undefined;
    if (name) return t(fa('planning.personPlanning'), { name });
    return t(fa(role === 'CO_APPLICANT' ? 'planning.coApplicantPlanning' : 'planning.planningsHeading'));
  };
  const planningTypeRows = (planning: PlanningForm): RawRow[] => {
    switch (planning.planningType) {
      case 'WORK':
        return [
          [t(fa('planning.workExtentLabel')), planning.workExtent ? t(fa(`workExtent.${planning.workExtent}`)) : ''],
          [t(fa('planning.workDescriptionLabel')), planning.workDescription],
        ];
      case 'SICK_LEAVE':
        return [
          [t(fa('planning.sickLeaveLevelLabel')), sickLeaveLevelLabel(t, planning.sickLeaveLevel)],
          ...(isNew
            ? ([
                [t(fa('planning.sickFromLabel')), planning.sickLeaveFrom],
                [t(fa('planning.sickToLabel')), planning.sickLeaveTo],
              ] as RawRow[])
            : []),
        ];
      case 'SFI':
        return [
          [t(fa('planning.sfiStudyPathLabel')), planning.sfiStudyPath],
          [t(fa('planning.sfiCourseLabel')), planning.sfiCourse],
        ];
      case 'OTHER':
        return [[t(fa('planning.otherDescriptionLabel')), planning.otherDescription]];
      default:
        return [];
    }
  };
  // One person's planning: heading + intro, the chosen plannings, (nyansökan) activities and sökta jobb,
  // and the work-history question. The heading names the person, so there is no "Avser" row.
  const personPlanningSections = (role: PersonRole): (ApplicationPdfSection | null)[] => {
    const person = form.persons.find((entry) => entry.role === role);
    const activities = isNew ? form.plannedActivities.filter((activity) => planningRole(activity.person) === role) : [];
    const jobApplications = isNew ? form.jobApplications.filter((application) => planningRole(application.person) === role) : [];
    return [
      section(planningHeading(role), [], { info: t(fa('planning.planningIntro')) }),
      ...form.plannings
        .filter((planning) => planning.planningType && planningRole(planning.person) === role)
        .map((planning) =>
          section(t(fa(`planningType.${planning.planningType}`)), planningTypeRows(planning), {
            info: planningInfoText(t, planning.planningType, applicationType),
          }),
        ),
      ...activities.map((activity, index) =>
        section(t(fa('planning.activity.heading'), { number: index + 1 }), [
          [t(fa('planning.activity.activityLabel')), activity.activity],
          [t(fa('planning.activity.fromLabel')), activity.periodFrom],
          [t(fa('planning.activity.toLabel')), activity.periodTo],
        ]),
      ),
      ...jobApplications.map((application, index) =>
        section(t(fa('planning.jobApplication.heading'), { number: index + 1 }), [
          [t(fa('planning.jobApplication.jobTitleLabel')), application.jobTitle],
          [t(fa('planning.jobApplication.employerLabel')), application.employerAndPlace],
          [t(fa('planning.jobApplication.dateLabel')), application.applicationDate],
        ]),
      ),
      // Arbete senaste 12 mån — frågan ställs (nyansökan) för den som valt planering men inte "Arbete".
      isNew && person && asksWorkHistory(form.plannings, role)
        ? section(undefined, [
            [t(fa('planning.hadWorkLabel')), yesNo(person.hadWorkLast12Months)],
            [t(fa('planning.hadWorkDescriptionLabel')), person.hadWorkDescription],
          ])
        : null,
    ];
  };
  const planningRoles: PersonRole[] = isCohabiting ? ['APPLICANT', 'CO_APPLICANT'] : ['APPLICANT'];
  const planningSections = isSupplementary ? [] : planningRoles.flatMap(personPlanningSections);
  const planningGroup = group('4. ' + t(fa('groups.planning')), planningSections);

  // ── 5. Utbetalning och försäkran ────────────────────────────────────────────────────────────
  // "Hur vill du/ni ha eventuellt bistånd utbetalt?" heads the persons' payments, as in the form.
  const payoutSection = section(q('payment.payoutQuestion'), [], {
    info: [
      isCohabiting && t(fa('payment.payoutInfoCohabiting')),
      isCohabiting && isNew && t(fa('payment.payoutAccountInfoCohabiting')),
    ]
      .filter(Boolean)
      .join('\n'),
    keepEmpty: true,
  });
  // Per-person payment section (no identity rows — those live in group 1).
  const paymentSection = (person: PersonForm): ApplicationPdfSection | null => {
    const methodAnswer = person.paymentMethod ? t(fa(`paymentMethod.${person.paymentMethod}`)) : '';
    const showPayoutMethod = isNew || person.paymentSameAsPrevious === false;
    // Återansökan/tillägg med "Nej" på samma konto väljer ett nytt utbetalningssätt (samma etikett som kortet).
    const methodLabel = t(fa(!isNew && person.paymentSameAsPrevious === false ? 'payment.newMethodLabel' : 'payment.methodLabel'));
    const identity = identities?.[person.role];
    // Inget "Sökande" — bara namnet, och bara när det finns en medsökande (för att skilja korten åt).
    // Ensam sökande får ingen rubrik. För submit-payloaden (utan identities) sätter backend namnet
    // på samma villkor.
    const heading = isCohabiting && identity ? identity.name : undefined;
    return section(
      heading,
      [
        ...(!isNew ? ([[t(fa('payment.sameAsPreviousLabel')), yesNo(person.paymentSameAsPrevious)]] as RawRow[]) : []),
        ...(showPayoutMethod ? ([[methodLabel, methodAnswer]] as RawRow[]) : []),
        [t(fa('payment.clearingLabel')), person.clearingNumber],
        [t(fa('payment.accountLabel')), person.accountNumber],
        [t(fa('payment.otherDescriptionLabel')), person.otherPaymentDescription],
      ],
      { role: person.role },
    );
  };
  // Bilagor — the same texts and documents the form shows, based on the answers.
  const requiredDocuments = getRequiredDocuments(form, applicationType);
  const requiredDocumentLabels = requiredDocuments.map((document) =>
    requiredDocumentLabel(t, document, isCohabiting, document.role ? personName(document.role) : null),
  );
  const requiredHeading = isCohabiting
    ? requiredDocumentsHeading(t, personName('APPLICANT'), personName('CO_APPLICANT'))
    : requiredDocumentsHeading(t);
  const attachmentLists: ApplicationPdfList[] = isNew
    ? [
        { heading: requiredHeading, items: textList('attachments.generalDocs') },
        { heading: q('attachments.answersHeading'), items: requiredDocumentLabels },
        { heading: t(fa('attachments.planningHeading')), items: textList('attachments.planningDocs') },
      ]
    : [{ heading: requiredHeading, items: requiredDocumentLabels }];
  const needsAttachmentsAnswer = form.needsAttachments
    ? t(fa(isRenewal ? 'attachments.yesRenewal' : 'attachments.yes'))
    : t(fa('attachments.no'));
  const attachmentsSection = section(
    t(fa('attachments.heading')),
    asksNeedsAttachments(applicationType, requiredDocuments) ? [[q('attachments.needLabel'), needsAttachmentsAnswer]] : [],
    { info: isNew || isRenewal ? q('attachments.intro') : undefined, lists: attachmentLists },
  );

  const staysSection = section(t(fa('review.staysHeading')), [
    [q('review.staysInfo'), yesNo(form.staysInMunicipality)],
    [t(fa('review.stayDescriptionPlaceholder')), form.stayDescription],
  ]);
  const attestationSection = section(
    t(fa('review.attestationHeading')),
    [[q('review.attestation'), form.attestation ? '✓' : '']],
    { info: textList('review.attestationInfo').join('\n\n') },
  );
  // Tipset om meddelandefunktionen — rutan sist i formuläret.
  const messageSection = section(undefined, [], { note: t(fa('review.messageInfo')) });
  const paymentGroup = group('5. ' + t(fa('groups.payment')), [
    payoutSection,
    ...form.persons.map(paymentSection),
    attachmentsSection,
    staysSection,
    attestationSection,
    messageSection,
  ]);

  const groups = [personalGroup, expensesGroup, incomeGroup, planningGroup, paymentGroup].filter(
    (g): g is ApplicationPdfGroup => g !== null,
  );

  return {
    title: t(fa('header.title')),
    subtitle: t(fa(`type.${applicationType}`)),
    groups,
  };
};
