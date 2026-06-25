import { ApplicationType, FinancialAssistanceFormData, PersonForm } from '@interfaces/financial-assistance';
import { swedishMonthName } from '@utils/swedish-month';
import { ApplicantIdentities } from '@services/financial-assistance-pdf-summary';

/**
 * Builds the immutable, re-renderable FormSnapshot of the financial-assistance application — a
 * self-describing JSON capture of the form exactly as the applicant saw and answered it (every
 * section, field label, help/info text, option label and answer, each carrying its own display
 * text). Submitted as the `formSnapshot` multipart part on create; Draken re-renders it "as it was".
 *
 * Mirrors the caremanagement FormSnapshot* contract. Only the client knows the rendered texts, so
 * Mina sidor owns building this.
 */

export const FORM_SNAPSHOT_SCHEMA_VERSION = '1.0';
export const FORM_DEFINITION_VERSION = 'financial-assistance-form@1';

type InputType =
  | 'RADIO'
  | 'CHECKBOX'
  | 'SELECT'
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'DATE'
  | 'BOOLEAN_TOGGLE'
  | 'REPEATING_GROUP'
  | 'STATIC';

export interface FormSnapshotAnswer {
  code?: string;
  value?: string;
  display?: string;
}
export interface FormSnapshotOption {
  code: string;
  label: string;
  selected: boolean;
}
export interface FormSnapshotField {
  name?: string;
  label: string;
  inputType: InputType;
  helpText?: string;
  infoTexts?: string[];
  options?: FormSnapshotOption[];
  answer?: FormSnapshotAnswer;
  items?: FormSnapshotField[][];
  required?: boolean;
  visible?: boolean;
}
export interface FormSnapshotSection {
  id?: string;
  title?: string;
  description?: string;
  visible?: boolean;
  fields: FormSnapshotField[];
}
export interface FormSnapshotAttestation {
  label?: string;
  answer?: FormSnapshotAnswer;
}
export interface FormSnapshot {
  schemaVersion: string;
  formDefinitionVersion?: string;
  typeSlug?: string;
  locale?: string;
  capturedAt?: string;
  title?: string;
  sections: FormSnapshotSection[];
  attestation?: FormSnapshotAttestation;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

// Option-code catalogues (machine values), in render order — labels resolved from i18n.
const PERIOD_CHOICES = ['CURRENT_MONTH', 'NEXT_MONTH', 'OTHER_BENEFIT'];
const NORM_TYPES = ['NATIONAL_NORM', 'OTHER_NORM'];
const HOUSING_FORMS = ['NO_HOUSING_OR_INSTITUTION', 'RENTAL', 'SUBLET', 'LODGER', 'CONDOMINIUM', 'OWNED_HOUSE', 'RENTED_HOUSE', 'LIVING_WITH_PARENTS'];
const RESIDENCE_EXTENTS = ['FULL_TIME', 'HALF_TIME', 'OTHER'];
const COST_OTHER_SUBTYPES = ['OTHER', 'MUNICIPAL_FEES', 'ACUTE_DENTAL'];
const RECIPIENTS = ['APPLICANT', 'CO_APPLICANT'];
const PROPERTY_TYPES = ['CONDOMINIUM', 'HOUSE', 'PROPERTY', 'HOLIDAY_HOME'];
const VEHICLE_TYPES = ['CAR', 'BOAT', 'MOTORCYCLE', 'CARAVAN', 'MOPED', 'SNOWMOBILE', 'OTHER'];
const PAYMENT_METHODS = ['BANK_ACCOUNT', 'OTHER'];
const WORK_EXTENTS = ['FULL', 'PART'];

export const buildFormSnapshot = (
  form: FinancialAssistanceFormData,
  applicationType: ApplicationType,
  t: Translate,
  options?: { typeSlug?: string; capturedAt?: string; identities?: ApplicantIdentities },
): FormSnapshot => {
  const fa = (key: string): string => `financial-assistance:${key}`;
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const isNew = applicationType === 'NEW';
  const isRenewal = applicationType === 'RENEWAL';
  const isCohabiting = form.maritalStatus === 'COHABITING';
  const niCtx = isCohabiting ? { context: 'ni' } : undefined;
  const q = (key: string): string => t(fa(key), niCtx);
  const identities = options?.identities ?? {};

  // ── answer/option/field helpers ─────────────────────────────────────────────────────────────
  const opt = (codes: string[], labelKey: string, selected: string | ''): FormSnapshotOption[] =>
    codes.map((code) => ({ code, label: t(fa(`${labelKey}.${code}`)), selected: code === selected }));

  const yesNoOptions = (value: boolean | null): FormSnapshotOption[] => [
    { code: 'true', label: t(fa('common.yes')), selected: value === true },
    { code: 'false', label: t(fa('common.no')), selected: value === false },
  ];

  // We only emit fields that were actually rendered to the applicant, so each is visible by default.
  // caremanagement defaults a missing `visible` to false, which would hide everything on re-render.
  const field = (f: FormSnapshotField): FormSnapshotField => ({ visible: true, ...f });

  const radio = (name: string, label: string, value: boolean | null, extra?: { helpText?: string; infoTexts?: string[] }): FormSnapshotField =>
    field({
      name,
      label,
      inputType: 'RADIO',
      options: yesNoOptions(value),
      ...(value != null ? { answer: { code: String(value), value: String(value), display: t(fa(`common.${value ? 'yes' : 'no'}`)) } } : {}),
      ...extra,
    });

  const choice = (
    name: string,
    label: string,
    inputType: InputType,
    codes: string[],
    labelKey: string,
    selected: string | '',
    extra?: { helpText?: string; infoTexts?: string[] },
  ): FormSnapshotField =>
    field({
      name,
      label,
      inputType,
      options: opt(codes, labelKey, selected),
      ...(selected ? { answer: { code: selected, value: selected, display: t(fa(`${labelKey}.${selected}`)) } } : {}),
      ...extra,
    });

  const textField = (name: string, label: string, value: string, inputType: InputType = 'TEXT'): FormSnapshotField =>
    field({ name, label, inputType, ...(value && value.trim() ? { answer: { value: value.trim(), display: value.trim() } } : {}) });

  const numberField = (name: string, label: string, value: number | null): FormSnapshotField =>
    field({ name, label, inputType: 'NUMBER', ...(value != null ? { answer: { value: String(value), display: String(value) } } : {}) });

  const staticField = (name: string, label: string, value: string): FormSnapshotField =>
    field({ name, label, inputType: 'STATIC', ...(value && value.trim() ? { answer: { value: value.trim(), display: value.trim() } } : {}) });

  // ── 1. Personuppgifter ──────────────────────────────────────────────────────────────────────
  const personContactItem = (person: PersonForm): FormSnapshotField[] => {
    const isCo = person.role === 'CO_APPLICANT';
    const identity = identities[person.role];
    const contact = isCo
      ? { email: form.coApplicantEmail, phone: form.coApplicantPhone, byEmail: form.coNotifyByEmail, bySms: form.coNotifyBySms }
      : { email: form.contactEmail, phone: form.contactPhone, byEmail: form.notifyByEmail, bySms: form.notifyBySms };
    return [
      staticField('role', t(fa(`recipient.${person.role}`)), t(fa(`recipient.${person.role}`))),
      ...(identity ? [staticField('name', t(fa('personuppgifter.nameLabel')), identity.name)] : []),
      ...(identity ? [staticField('personnummer', t(fa('personuppgifter.personnummerLabel')), identity.personnummer)] : []),
      ...(identity ? [staticField('folkbokforingsadress', t(fa('personuppgifter.addressLabel')), identity.folkbokforing)] : []),
      field({
        name: 'notify',
        label: t(fa(isCo ? 'personuppgifter.notifyLabelCoApplicant' : 'personuppgifter.notifyLabel')),
        inputType: 'CHECKBOX',
        helpText: t(fa('personuppgifter.notifyInfo')),
        options: [
          { code: 'EMAIL', label: t(fa('personuppgifter.notifyEmail')), selected: !!contact.byEmail },
          { code: 'SMS', label: t(fa('personuppgifter.notifySms')), selected: !!contact.bySms },
        ],
      }),
      textField('email', t(fa('personuppgifter.emailLabel')), contact.email),
      textField('phone', t(fa('personuppgifter.phoneLabel')), contact.phone),
      // Tolk-frågan ställs på personuppgifter (nyansökan).
      ...(isNew
        ? [
            radio('needsInterpreter', t(fa('personuppgifter.needsInterpreterLabel')), person.needsInterpreter),
            textField('interpreterLanguage', t(fa('personuppgifter.interpreterLanguageLabel')), person.interpreterLanguage),
          ]
        : []),
    ];
  };

  const personalFields: FormSnapshotField[] = [
    choice('civilstand', t(fa('periodNorm.maritalStatusLabel')), 'RADIO', ['gift', 'sambo', 'ensamstaende'], 'civilstand', form.civilstandChoice),
    field({ name: 'persons', label: t(fa('personuppgifter.heading')), inputType: 'REPEATING_GROUP', items: form.persons.map(personContactItem) }),
  ];
  if (!isSupplementary) {
    personalFields.push(
      radio('hasChildrenUnder21', q('householdHousing.hasChildrenLabel'), form.hasChildrenUnder21, { helpText: q('householdHousing.hasChildrenInfo') }),
      field({
        name: 'children',
        label: t(fa('householdHousing.heading')),
        inputType: 'REPEATING_GROUP',
        items: form.children.map((child) => [
          textField('firstName', t(fa('child.firstName')), child.firstName),
          textField('lastName', t(fa('child.lastName')), child.lastName),
          textField('personalNumber', t(fa('child.personalNumber')), child.personalNumber),
          textField('schoolName', t(fa('child.schoolName')), child.schoolName),
          choice('residenceExtent', t(fa('child.residenceExtent')), 'SELECT', RESIDENCE_EXTENTS, 'residenceExtent', child.residenceExtent),
          numberField('daysInHome', t(fa('child.daysInHome')), child.daysInHome),
        ]),
      }),
    );
    if (isRenewal) {
      personalFields.push(
        radio('childrenResidenceChanged', q('householdHousing.childrenChangedLabel'), form.childrenResidenceChanged),
        textField('childrenResidenceChangeDescription', t(fa('householdHousing.changeDescriptionPlaceholder')), form.childrenResidenceChangeDescription, 'TEXTAREA'),
        radio('housingChanged', q('householdHousing.housingChangedLabel'), form.housingChanged),
        textField('housingChangeDescription', t(fa('householdHousing.changeDescriptionPlaceholder')), form.housingChangeDescription, 'TEXTAREA'),
      );
    }
    personalFields.push(
      choice(
        'housingForm',
        isRenewal ? q('householdHousing.housingFormLabelChanged') : q('householdHousing.housingFormLabel'),
        'SELECT',
        HOUSING_FORMS,
        'housingForm',
        form.housingForm,
      ),
      numberField('housingPersonCount', t(fa('householdHousing.personCountLabel')), form.housingPersonCount),
      numberField('housingRoomsPlusKitchen', t(fa('householdHousing.roomsLabel')), form.housingRoomsPlusKitchen),
      textField('housingDescription', t(fa('householdHousing.housingDescriptionLabel')), form.housingDescription, 'TEXTAREA'),
    );
  }

  // ── 2. Kostnader ────────────────────────────────────────────────────────────────────────────
  const period =
    form.periodMonth && form.periodYear
      ? t(fa('periodNorm.periodValue'), { month: swedishMonthName(form.periodMonth), year: form.periodYear })
      : '';
  // "Denna/Nästa månad" visar månadens namn (samma logik som formuläret).
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const periodChoiceLabel = (code: string): string => {
    const base = t(fa(`periodChoice.${code}`));
    if (code === 'CURRENT_MONTH') return `${base} (${swedishMonthName(currentMonth)})`;
    if (code === 'NEXT_MONTH') return `${base} (${swedishMonthName(nextMonth)})`;
    return base;
  };
  const selectedPeriods = form.periodChoices as string[];
  const selectedNorms = form.normTypes as string[];
  const hasMonthPeriod = selectedPeriods.includes('CURRENT_MONTH') || selectedPeriods.includes('NEXT_MONTH');
  // NEW: "Vad avser ansökan?" som flerval. Renewal/supplementary: prefilled month (read-only).
  const periodField: FormSnapshotField = isNew
    ? field({
        name: 'periodChoices',
        label: q('periodNorm.periodChoiceLabel'),
        inputType: 'CHECKBOX',
        options: PERIOD_CHOICES.map((code) => ({ code, label: periodChoiceLabel(code), selected: selectedPeriods.includes(code) })),
      })
    : staticField('period', t(fa('periodNorm.periodLabel')), period);
  // NEW: norm är flerval och visas bara vid denna/nästa månad. Renewal/supplementary: enkelval.
  const normMultiField = field({
    name: 'normTypes',
    label: q('periodNorm.normTypeLabel'),
    inputType: 'CHECKBOX',
    options: NORM_TYPES.map((code) => ({ code, label: t(fa(`normType.${code}`)), selected: selectedNorms.includes(code) })),
    infoTexts: NORM_TYPES.filter((code) => selectedNorms.includes(code)).map((code) => t(fa(`normInfo.${code}`))),
  });
  const normSingleField = choice(
    'normType',
    isSupplementary ? t(fa('economy.normLabel')) : q('periodNorm.normTypeLabel'),
    'RADIO',
    NORM_TYPES,
    'normType',
    form.normType,
    { infoTexts: form.normType ? [t(fa(`normInfo.${form.normType}`))] : undefined },
  );
  const costsField = field({
    name: 'costs',
    label: t(fa(isSupplementary ? 'economy.costsHeadingSupplementary' : 'economy.costsHeading'), niCtx),
    inputType: 'REPEATING_GROUP',
    items: form.costs
      .filter((cost) => cost.costType)
      .map((cost) => [
        staticField('costType', t(fa('economy.cost.typeLabel')), t(fa(`costType.${cost.costType}`))),
        ...(cost.costType === 'OTHER'
          ? [choice('otherSubType', t(fa('economy.cost.subTypeLabel')), 'SELECT', COST_OTHER_SUBTYPES, 'costOtherSubType', cost.otherSubType)]
          : []),
        ...(cost.costType === 'OTHER' ? [textField('specification', t(fa('economy.cost.specificationLabel')), cost.specification)] : []),
        numberField('appliedAmount', t(fa('economy.cost.amountLabel')), cost.appliedAmount),
      ]),
  });
  const economyFields: FormSnapshotField[] = isNew
    ? [
        periodField,
        ...(selectedPeriods.includes('OTHER_BENEFIT')
          ? [textField('otherBenefitDescription', t(fa('periodNorm.otherBenefitPlaceholder')), form.otherBenefitDescription, 'TEXTAREA')]
          : []),
        ...(hasMonthPeriod ? [normMultiField] : []),
        costsField,
      ]
    : isSupplementary
      ? [periodField, costsField, normSingleField, textField('normSpecification', t(fa('economy.normSpecificationLabel')), form.normSpecification, 'TEXTAREA')]
      : [periodField, normSingleField, costsField];

  // ── 3. Inkomster och tillgångar ─────────────────────────────────────────────────────────────
  const assetItem = (asset: FinancialAssistanceFormData['assets'][number]): FormSnapshotField[] => {
    const base = [staticField('assetCategory', t(fa('economy.asset.categoryLabel')), t(fa(`assetCategory.${asset.assetCategory}`)))];
    switch (asset.assetCategory) {
      case 'BANK_SAVINGS':
        return [...base, textField('description', t(fa('economy.asset.descriptionLabel')), asset.description), numberField('value', t(fa('economy.asset.valueLabel')), asset.value)];
      case 'OTHER':
        return [...base, textField('description', t(fa('economy.asset.whatLabel')), asset.description), numberField('value', t(fa('economy.asset.valueLabel')), asset.value)];
      case 'REAL_ESTATE':
        return [
          ...base,
          choice('propertyType', t(fa('economy.asset.propertyTypeLabel')), 'SELECT', PROPERTY_TYPES, 'propertyType', asset.propertyType),
          numberField('purchaseYear', t(fa('economy.asset.purchaseYearLabel')), asset.purchaseYear),
          numberField('purchasePrice', t(fa('economy.asset.purchasePriceLabel')), asset.purchasePrice),
        ];
      case 'COMPANY':
        return [...base, textField('companyName', t(fa('economy.asset.companyNameLabel')), asset.companyName), numberField('companyAssetSum', t(fa('economy.asset.companyAssetSumLabel')), asset.companyAssetSum)];
      case 'VEHICLE':
        return [
          ...base,
          choice('vehicleType', t(fa('economy.asset.vehicleTypeLabel')), 'SELECT', VEHICLE_TYPES, 'vehicleType', asset.vehicleType),
          textField('registrationNumber', t(fa('economy.asset.registrationNumberLabel')), asset.registrationNumber),
          textField('purchaseDate', t(fa('economy.asset.purchaseDateLabel')), asset.purchaseDate, 'DATE'),
          numberField('purchasePrice', t(fa('economy.asset.purchasePriceLabel')), asset.purchasePrice),
          numberField('value', t(fa('economy.asset.valueLabel')), asset.value),
        ];
      default:
        return base;
    }
  };
  const incomeFields: FormSnapshotField[] = isSupplementary
    ? []
    : [
        // Nyansökan: obligatorisk fritext om försörjning, först i gruppen.
        ...(isNew ? [textField('livelihoodDescription', t(fa('income.livelihoodLabel')), form.livelihoodDescription, 'TEXTAREA')] : []),
        radio('hasIncomes', q('economy.hasIncomesLabel'), form.hasIncomes, { helpText: q('income.incomesInfo') }),
        field({
          name: 'incomes',
          label: t(fa('economy.incomesHeading')),
          inputType: 'REPEATING_GROUP',
          items: form.incomes
            .filter((income) => income.incomeType)
            .map((income) => [
              staticField('incomeType', t(fa('economy.income.typeLabel')), t(fa(`incomeType.${income.incomeType}`))),
              numberField('amount', t(fa('economy.income.amountLabel')), income.amount),
              textField('incomeDate', t(fa('economy.income.dateLabel')), income.incomeDate, 'DATE'),
              ...(isCohabiting ? [choice('recipient', t(fa('economy.recipientLabel')), 'SELECT', RECIPIENTS, 'recipient', income.recipient)] : []),
            ]),
        }),
        radio('hasPendingBenefits', q('economy.hasPendingBenefitsLabel'), form.hasPendingBenefits, { helpText: q('income.pendingBenefitsInfo') }),
        field({
          name: 'pendingBenefits',
          label: t(fa('economy.pendingBenefitsHeading')),
          inputType: 'REPEATING_GROUP',
          items: form.pendingBenefits.map((benefit) => [
            textField('benefitName', t(fa('economy.pendingBenefit.benefitNameLabel')), benefit.benefitName),
            textField('applicantName', t(fa('economy.pendingBenefit.applicantNameLabel')), benefit.applicantName),
          ]),
        }),
        radio('hasAssets', q('economy.hasAssetsLabel'), form.hasAssets, { helpText: t(fa('income.assetsInfo')) }),
        field({
          name: 'assets',
          label: t(fa('economy.assetsHeading')),
          inputType: 'REPEATING_GROUP',
          items: form.assets.filter((asset) => asset.assetCategory).map(assetItem),
        }),
      ];

  // ── 4. Planering ────────────────────────────────────────────────────────────────────────────
  const planningInfoKey: Record<string, string> = { JOBSEEKING: 'jobseeking', SICK_LEAVE: 'sickLeave', SFI: 'sfi' };
  const planningTypeFields = (planning: FinancialAssistanceFormData['plannings'][number]): FormSnapshotField[] => {
    switch (planning.planningType) {
      case 'WORK':
        return [
          choice('workExtent', t(fa('planning.workExtentLabel')), 'SELECT', WORK_EXTENTS, 'workExtent', planning.workExtent),
          textField('workDescription', t(fa('planning.workDescriptionLabel')), planning.workDescription),
        ];
      case 'SICK_LEAVE':
        return [textField('sickLeaveLevel', t(fa('planning.sickLeaveLevelLabel')), planning.sickLeaveLevel ? `${planning.sickLeaveLevel}%` : '')];
      case 'SFI':
        return [
          textField('sfiStudyPath', t(fa('planning.sfiStudyPathLabel')), planning.sfiStudyPath),
          textField('sfiCourse', t(fa('planning.sfiCourseLabel')), planning.sfiCourse),
        ];
      case 'OTHER':
        return [textField('otherDescription', t(fa('planning.otherDescriptionLabel')), planning.otherDescription)];
      default:
        return [];
    }
  };
  const recipientField = (person: string): FormSnapshotField[] =>
    isCohabiting && person ? [choice('person', t(fa('economy.recipientLabel')), 'SELECT', RECIPIENTS, 'recipient', person)] : [];
  const planningFields: FormSnapshotField[] = isSupplementary
    ? []
    : [
        field({ name: 'planningsIntro', label: t(fa('planning.planningsHeading')), inputType: 'STATIC', infoTexts: [t(fa('planning.planningIntro'))] }),
        field({
          name: 'plannings',
          label: t(fa('planning.planningsHeading')),
          inputType: 'REPEATING_GROUP',
          items: form.plannings
            .filter((planning) => planning.planningType)
            .map((planning) => [
              staticField('planningType', t(fa('planning.typeLabel')), t(fa(`planningType.${planning.planningType}`))),
              ...recipientField(planning.person),
              ...planningTypeFields(planning),
              ...(planningInfoKey[planning.planningType]
                ? [field({ name: 'info', label: t(fa(`planningType.${planning.planningType}`)), inputType: 'STATIC', infoTexts: [t(fa(`planning.info.${planningInfoKey[planning.planningType]}`))] })]
                : []),
            ]),
        }),
        ...(isNew
          ? [
              field({
                name: 'plannedActivities',
                label: t(fa('planning.activitiesHeading')),
                inputType: 'REPEATING_GROUP',
                items: form.plannedActivities.map((activity) => [
                  ...recipientField(activity.person),
                  textField('activity', t(fa('planning.activity.activityLabel')), activity.activity),
                  textField('periodFrom', t(fa('planning.activity.fromLabel')), activity.periodFrom, 'DATE'),
                  textField('periodTo', t(fa('planning.activity.toLabel')), activity.periodTo, 'DATE'),
                ]),
              }),
              field({
                name: 'jobApplications',
                label: t(fa('planning.jobApplicationsHeading')),
                inputType: 'REPEATING_GROUP',
                items: form.jobApplications.map((application) => [
                  ...recipientField(application.person),
                  textField('jobTitle', t(fa('planning.jobApplication.jobTitleLabel')), application.jobTitle),
                  textField('employerAndPlace', t(fa('planning.jobApplication.employerLabel')), application.employerAndPlace),
                  textField('applicationDate', t(fa('planning.jobApplication.dateLabel')), application.applicationDate, 'DATE'),
                ]),
              }),
            ]
          : []),
        // Arbete senaste 12 mån — frågan ställs (nyansökan) för den som inte valt "Arbete" som planering.
        ...(isNew
          ? form.persons
              .filter(
                (person) =>
                  !form.plannings.some(
                    (planning) =>
                      (planning.person === 'CO_APPLICANT' ? 'CO_APPLICANT' : 'APPLICANT') === person.role &&
                      planning.planningType === 'WORK',
                  ),
              )
              .flatMap((person) => {
                const suffix = isCohabiting ? ` – ${t(fa(`recipient.${person.role}`))}` : '';
                return [
                  radio('hadWorkLast12Months', `${t(fa('planning.hadWorkLabel'))}${suffix}`, person.hadWorkLast12Months),
                  textField('hadWorkDescription', `${t(fa('planning.hadWorkDescriptionLabel'))}${suffix}`, person.hadWorkDescription),
                ];
              })
          : []),
      ];

  // ── 5. Utbetalning och försäkran ────────────────────────────────────────────────────────────
  const paymentItem = (person: PersonForm): FormSnapshotField[] => {
    const identity = identities[person.role];
    const showMethod = isNew || person.paymentSameAsPrevious === false;
    return [
      // Inget "Sökande" — bara namnet, och bara när det finns en medsökande (för att skilja personerna åt).
      ...(isCohabiting && identity ? [staticField('name', t(fa('personuppgifter.nameLabel')), identity.name)] : []),
      ...(!isNew ? [radio('paymentSameAsPrevious', t(fa('payment.sameAsPreviousLabel')), person.paymentSameAsPrevious)] : []),
      ...(showMethod ? [choice('paymentMethod', q('payment.payoutQuestion'), 'SELECT', PAYMENT_METHODS, 'paymentMethod', person.paymentMethod)] : []),
      textField('clearingNumber', t(fa('payment.clearingLabel')), person.clearingNumber),
      textField('accountNumber', t(fa('payment.accountLabel')), person.accountNumber),
      ...(person.paymentMethod === 'OTHER' ? [textField('otherPaymentDescription', t(fa('payment.otherDescriptionLabel')), person.otherPaymentDescription)] : []),
    ];
  };
  const paymentFields: FormSnapshotField[] = [
    field({ name: 'persons', label: q('payment.payoutQuestion'), inputType: 'REPEATING_GROUP', items: form.persons.map(paymentItem) }),
  ];
  if (!isSupplementary) {
    paymentFields.push(
      radio('staysInMunicipality', q('review.staysInfo'), form.staysInMunicipality),
      textField('stayDescription', t(fa('review.stayDescriptionPlaceholder')), form.stayDescription, 'TEXTAREA'),
    );
  }

  // A field counts as "shown" only when the applicant actually saw/answered it — an answer, a
  // selected option (radio/checkbox), nested items (repeating group) or info text. Empty optional
  // fields (blank text, unselected choice, empty repeating group) are dropped so the snapshot
  // mirrors the attached PDF, which likewise omits blank rows.
  const hasAnswer = (answer?: FormSnapshotAnswer): boolean =>
    !!answer && ((answer.display ?? '').trim() !== '' || (answer.value ?? '').trim() !== '' || (answer.code ?? '').trim() !== '');
  const fieldShown = (f: FormSnapshotField): boolean =>
    hasAnswer(f.answer) ||
    (f.options?.some((option) => option.selected) ?? false) ||
    (f.items?.length ?? 0) > 0 ||
    (f.infoTexts?.length ?? 0) > 0;
  // Recurse into repeating-group items, dropping each item's blank fields and then items left empty.
  const keepShownFields = (fields: FormSnapshotField[]): FormSnapshotField[] =>
    fields
      .map((f) => (f.items ? { ...f, items: f.items.map(keepShownFields).filter((item) => item.length > 0) } : f))
      .filter(fieldShown);

  const sections: FormSnapshotSection[] = [
    { id: 'household-housing', title: t(fa('groups.household-housing')), visible: true, fields: personalFields },
    { id: 'economy', title: t(fa('groups.economy')), visible: true, fields: economyFields },
    ...(incomeFields.length ? [{ id: 'income', title: t(fa('groups.income')), visible: true, fields: incomeFields }] : []),
    ...(planningFields.length ? [{ id: 'planning', title: t(fa('groups.planning')), visible: true, fields: planningFields }] : []),
    { id: 'payment', title: t(fa('groups.payment')), visible: true, fields: paymentFields },
  ]
    .map((section) => ({ ...section, fields: keepShownFields(section.fields) }))
    .filter((section) => section.fields.length > 0);

  return {
    schemaVersion: FORM_SNAPSHOT_SCHEMA_VERSION,
    formDefinitionVersion: FORM_DEFINITION_VERSION,
    ...(options?.typeSlug ? { typeSlug: options.typeSlug } : {}),
    locale: 'sv',
    ...(options?.capturedAt ? { capturedAt: options.capturedAt } : {}),
    title: t(fa('header.title')),
    sections,
    attestation: {
      label: t(fa('review.attestation')),
      answer: { value: String(form.attestation), display: t(fa(`common.${form.attestation ? 'yes' : 'no'}`)) },
    },
  };
};
