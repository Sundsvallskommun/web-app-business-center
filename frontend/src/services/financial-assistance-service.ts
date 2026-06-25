import {
  ApplicationType,
  AssetForm,
  ChildForm,
  CostForm,
  FinancialAssistanceFormData,
  IncomeForm,
  JobApplicationForm,
  PendingBenefitForm,
  PeriodChoice,
  PersonForm,
  PlannedActivityForm,
  PlanningForm,
} from '@interfaces/financial-assistance';

/**
 * Drops blank values (`''`, `null`, `undefined`) from an object so the caremanagement
 * payload never carries unset enum/text fields — the server validates enums with @OneOf
 * and would reject a blank string. Booleans (`false`) and `0` are intentionally kept.
 */
const compact = (record: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

const hasFields = (record: Record<string, unknown>): boolean => Object.keys(record).length > 0;

interface Period {
  periodMonth: number;
  periodYear: number;
}

/** Derives the application period (month/year) from a NEW application's month choice. */
const derivePeriod = (choice: 'CURRENT_MONTH' | 'NEXT_MONTH'): Period => {
  const now = new Date();
  let periodMonth = now.getMonth() + 1;
  let periodYear = now.getFullYear();
  if (choice === 'NEXT_MONTH') {
    periodMonth += 1;
    if (periodMonth > 12) {
      periodMonth = 1;
      periodYear += 1;
    }
  }
  return { periodMonth, periodYear };
};

// Prioritetsordning för det enkla periodChoice kontraktet bär (hela flervalet fångas i PDF + snapshot).
const PERIOD_PRIORITY: PeriodChoice[] = ['CURRENT_MONTH', 'NEXT_MONTH', 'OTHER_BENEFIT'];

/**
 * Builds and assigns the period fields onto `data`. Nyansökan tillåter flerval ("Vad avser
 * ansökan?"); kontraktet bär ett enkelt periodChoice + månad, så vi skickar det främsta valet
 * (Denna > Nästa > Annat bistånd) och härleder månaden därifrån. Hela urvalet visas i PDF/snapshot.
 */
const assignPeriod = (
  data: Record<string, unknown>,
  form: FinancialAssistanceFormData,
  type: ApplicationType
): void => {
  if (type !== 'NEW') {
    Object.assign(data, compact({ periodMonth: form.periodMonth, periodYear: form.periodYear }));
    return;
  }
  const primary = PERIOD_PRIORITY.find((choice) => form.periodChoices.includes(choice));
  if (!primary) return;
  Object.assign(
    data,
    compact({
      periodChoice: primary,
      ...(primary === 'OTHER_BENEFIT' ? {} : derivePeriod(primary)),
      // "Annat bistånd" kan vara valt vid sidan av en månad — skicka fritexten när det ingår i urvalet.
      otherBenefitDescription: form.periodChoices.includes('OTHER_BENEFIT') ? form.otherBenefitDescription.trim() : '',
    })
  );
};

/** Assigns a yes/no gate flag and, when true, its non-empty list onto `data`. */
const assignGatedList = (
  data: Record<string, unknown>,
  gateKey: string,
  gate: boolean | null,
  listKey: string,
  items: Record<string, unknown>[]
): void => {
  if (gate == null) return;
  data[gateKey] = gate;
  if (gate === true) {
    const built = items.filter(hasFields);
    if (built.length > 0) data[listKey] = built;
  }
};

const buildChild = (child: ChildForm): Record<string, unknown> =>
  compact({
    // partyId för prefyllda barn; annars personnummer som backend slår upp till partyId.
    partyId: child.partyId,
    personalNumber: child.personalNumber.trim(),
    firstName: child.firstName.trim(),
    lastName: child.lastName.trim(),
    schoolName: child.schoolName.trim(),
    residenceExtent: child.residenceExtent,
    // Antal dagar samlas bara in när boendet är "Annat".
    daysInHome: child.residenceExtent === 'OTHER' ? child.daysInHome : null,
  });

const buildCost = (cost: CostForm): Record<string, unknown> =>
  compact({
    costType: cost.costType,
    appliedAmount: cost.appliedAmount,
    otherSubType: cost.costType === 'OTHER' ? cost.otherSubType : '',
    // "Vad avser kostnaden" visas/skickas bara för övrigt bistånd.
    specification: cost.costType === 'OTHER' ? cost.specification.trim() : '',
  });

const buildIncome = (income: IncomeForm): Record<string, unknown> =>
  compact({
    incomeType: income.incomeType,
    amount: income.amount,
    incomeDate: income.incomeDate.trim(),
    recipient: income.recipient,
  });

const buildPendingBenefit = (benefit: PendingBenefitForm): Record<string, unknown> =>
  compact({ benefitName: benefit.benefitName.trim(), applicantName: benefit.applicantName.trim() });

const buildAsset = (asset: AssetForm): Record<string, unknown> =>
  compact({
    assetCategory: asset.assetCategory,
    // Beskrivning + värde för bankmedel/sparande och övrig tillgång.
    ...(asset.assetCategory === 'BANK_SAVINGS' || asset.assetCategory === 'OTHER'
      ? { description: asset.description.trim(), value: asset.value }
      : {}),
    // Fastighet/företag: inga beskrivnings-/värdefält.
    ...(asset.assetCategory === 'REAL_ESTATE'
      ? { propertyType: asset.propertyType, purchaseYear: asset.purchaseYear, purchasePrice: asset.purchasePrice }
      : {}),
    ...(asset.assetCategory === 'COMPANY'
      ? { companyName: asset.companyName.trim(), companyAssetSum: asset.companyAssetSum }
      : {}),
    // Fordon: inköpspris + värde, ingen beskrivning. Regnr ej tvingande.
    ...(asset.assetCategory === 'VEHICLE'
      ? {
          vehicleType: asset.vehicleType,
          registrationNumber: asset.registrationNumber.trim(),
          purchaseDate: asset.purchaseDate.trim(),
          purchasePrice: asset.purchasePrice,
          value: asset.value,
        }
      : {}),
    // Övrigt (konst, smycken m.m.): fritext "ange vad" + värde.
    ...(asset.assetCategory === 'OTHER'
      ? { description: asset.description.trim(), value: asset.value }
      : {}),
  });

const buildPlanning = (planning: PlanningForm): Record<string, unknown> =>
  compact({
    person: planning.person,
    planningType: planning.planningType,
    ...(planning.planningType === 'WORK'
      ? {
          workExtent: planning.workExtent,
          // Heltid behöver ingen beskrivning; deltid ska ange omfattning.
          ...(planning.workExtent === 'PART' ? { workDescription: planning.workDescription.trim() } : {}),
        }
      : {}),
    // Sjukskrivning: bara grad (från/till har tagits bort).
    ...(planning.planningType === 'SICK_LEAVE' ? { sickLeaveLevel: planning.sickLeaveLevel } : {}),
    ...(planning.planningType === 'SFI' ? { sfiStudyPath: planning.sfiStudyPath, sfiCourse: planning.sfiCourse } : {}),
    ...(planning.planningType === 'OTHER' ? { otherDescription: planning.otherDescription.trim() } : {}),
  });

const buildPlannedActivity = (activity: PlannedActivityForm): Record<string, unknown> =>
  compact({
    person: activity.person,
    activity: activity.activity.trim(),
    periodFrom: activity.periodFrom.trim(),
    periodTo: activity.periodTo.trim(),
  });

const buildJobApplication = (application: JobApplicationForm): Record<string, unknown> =>
  compact({
    person: application.person,
    applicationDate: application.applicationDate.trim(),
    jobTitle: application.jobTitle.trim(),
    employerAndPlace: application.employerAndPlace.trim(),
  });

/**
 * Kontaktuppgifter + notisval för en person. Fälten lagras på formulärnivå (sökande resp.
 * medsökande) och fästs här på rätt person så de sparas på stakeholdern i caremanagement.
 * Notis-flaggorna (boolean) behålls alltid; tomma e-post/telefon rensas av compact().
 */
const personContact = (person: PersonForm, form: FinancialAssistanceFormData): Record<string, unknown> =>
  person.role === 'CO_APPLICANT'
    ? {
        email: form.coApplicantEmail.trim(),
        phone: form.coApplicantPhone.trim(),
        notifyByEmail: form.coNotifyByEmail,
        notifyBySms: form.coNotifyBySms,
      }
    : {
        email: form.contactEmail.trim(),
        phone: form.contactPhone.trim(),
        notifyByEmail: form.notifyByEmail,
        notifyBySms: form.notifyBySms,
      };

const buildPerson = (
  person: PersonForm,
  type: ApplicationType,
  form: FinancialAssistanceFormData
): Record<string, unknown> => {
  const contact = personContact(person, form);

  // Renewal/supplementary: "samma konto som föregående" → skicka bara flaggan, inga kontouppgifter.
  if (type !== 'NEW' && person.paymentSameAsPrevious === true) {
    return compact({
      role: person.role,
      personalNumber: person.personalNumber.trim(),
      paymentSameAsPrevious: true,
      ...contact,
    });
  }

  return compact({
    role: person.role,
    personalNumber: person.personalNumber.trim(),
    paymentMethod: person.paymentMethod,
    clearingNumber: person.clearingNumber.trim(),
    accountNumber: person.accountNumber.trim(),
    otherPaymentDescription: person.paymentMethod === 'OTHER' ? person.otherPaymentDescription.trim() : '',
    ...(type === 'NEW'
      ? {
          needsInterpreter: person.needsInterpreter,
          interpreterLanguage: person.needsInterpreter === true ? person.interpreterLanguage.trim() : '',
          hadWorkLast12Months: person.hadWorkLast12Months,
          hadWorkDescription: person.hadWorkLast12Months === true ? person.hadWorkDescription.trim() : '',
        }
      : { paymentSameAsPrevious: person.paymentSameAsPrevious }),
    ...contact,
  });
};

/**
 * Builds the caremanagement `data` payload from the form, omitting empty/unset values.
 * `applicationType` is NOT sent — the server derives it from the slug. Field/section
 * inclusion follows the per-type matrix (supplementary is the minimal application).
 */
export const buildFinancialAssistanceData = (
  form: FinancialAssistanceFormData,
  applicationType: ApplicationType
): Record<string, unknown> => {
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const isNew = applicationType === 'NEW';

  // Norm är flerval för ny- och tilläggsansökan (återansökan har enkelval). Kontraktet bär ett
  // enkelt normType, så vi skickar det första valda (hela urvalet + specifikationer fångas i PDF/snapshot).
  const hasMonthPeriod = form.periodChoices.some((choice) => choice === 'CURRENT_MONTH' || choice === 'NEXT_MONTH');
  const normTypeValue = isNew
    ? hasMonthPeriod
      ? (form.normTypes[0] ?? '')
      : ''
    : isSupplementary
      ? (form.normTypes[0] ?? '')
      : form.normType;

  const data: Record<string, unknown> = compact({
    maritalStatus: form.maritalStatus,
    normType: normTypeValue,
    // Nyansökan steg 3: obligatorisk fritext om försörjning.
    livelihoodDescription: isNew ? form.livelihoodDescription.trim() : '',
    attestation: form.attestation,
    attestedAt: new Date().toISOString(),
    staysInMunicipality: form.staysInMunicipality,
    stayDescription: form.staysInMunicipality === false ? form.stayDescription.trim() : '',
  });

  assignPeriod(data, form, applicationType);

  // Household & housing — not part of the supplementary application.
  if (!isSupplementary) {
    Object.assign(data, compact({ hasChildrenUnder21: form.hasChildrenUnder21 }));
    if (form.hasChildrenUnder21 === true) {
      const children = form.children.map(buildChild).filter(hasFields);
      if (children.length > 0) data.children = children;
    }

    if (applicationType === 'RENEWAL') {
      Object.assign(
        data,
        compact({
          childrenResidenceChanged: form.childrenResidenceChanged,
          childrenResidenceChangeDescription:
            form.childrenResidenceChanged === true ? form.childrenResidenceChangeDescription.trim() : '',
          housingChanged: form.housingChanged,
          housingChangeDescription: form.housingChanged === true ? form.housingChangeDescription.trim() : '',
        })
      );
    }

    // Full boendeform: nyansökan, eller återansökan när boendet ändrats.
    if (applicationType === 'NEW' || form.housingChanged === true) {
      Object.assign(
        data,
        compact({
          housingForm: form.housingForm,
          housingRoomsPlusKitchen: form.housingRoomsPlusKitchen,
          housingDescription: form.housingDescription.trim(),
        })
      );
    }
    // Antal personer i hushållet — i full boendeform och vid återansökan utan boendeförändring.
    Object.assign(data, compact({ housingPersonCount: form.housingPersonCount }));
  }

  // Economy — costs apply to all types; incomes/benefits/assets exclude supplementary.
  const costs = form.costs.map(buildCost).filter(hasFields);
  if (costs.length > 0) data.costs = costs;

  if (!isSupplementary) {
    assignGatedList(data, 'hasIncomes', form.hasIncomes, 'incomes', form.incomes.map(buildIncome));
    assignGatedList(
      data,
      'hasPendingBenefits',
      form.hasPendingBenefits,
      'pendingBenefits',
      form.pendingBenefits.map(buildPendingBenefit)
    );
    assignGatedList(data, 'hasAssets', form.hasAssets, 'assets', form.assets.map(buildAsset));
  }

  // Planning — not part of the supplementary application.
  if (!isSupplementary) {
    const plannings = form.plannings.map(buildPlanning).filter(hasFields);
    if (plannings.length > 0) data.plannings = plannings;

    if (applicationType === 'NEW') {
      const plannedActivities = form.plannedActivities.map(buildPlannedActivity).filter(hasFields);
      if (plannedActivities.length > 0) data.plannedActivities = plannedActivities;
      const jobApplications = form.jobApplications.map(buildJobApplication).filter(hasFields);
      if (jobApplications.length > 0) data.jobApplications = jobApplications;
    }
  }

  // Persons / payment — all application types.
  const persons = form.persons.map((person) => buildPerson(person, applicationType, form)).filter(hasFields);
  if (persons.length > 0) data.persons = persons;

  return data;
};
