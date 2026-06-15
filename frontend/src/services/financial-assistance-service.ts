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
    Object.entries(record).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );

const hasFields = (record: Record<string, unknown>): boolean => Object.keys(record).length > 0;

interface Period {
  periodMonth: number;
  periodYear: number;
}

/** Derives the application period from a NEW application's periodChoice. */
const derivePeriod = (choice: PeriodChoice): Period => {
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

/** Builds and assigns the period fields onto `data` for the given application type. */
const assignPeriod = (data: Record<string, unknown>, form: FinancialAssistanceFormData, type: ApplicationType): void => {
  if (type !== 'NEW') {
    Object.assign(data, compact({ periodMonth: form.periodMonth, periodYear: form.periodYear }));
    return;
  }
  if (!form.periodChoice) return;
  Object.assign(
    data,
    compact({
      periodChoice: form.periodChoice,
      ...derivePeriod(form.periodChoice),
      otherBenefitDescription: form.periodChoice === 'OTHER_BENEFIT' ? form.otherBenefitDescription.trim() : '',
    }),
  );
};

/** Assigns a yes/no gate flag and, when true, its non-empty list onto `data`. */
const assignGatedList = (
  data: Record<string, unknown>,
  gateKey: string,
  gate: boolean | null,
  listKey: string,
  items: Record<string, unknown>[],
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
    firstName: child.firstName.trim(),
    lastName: child.lastName.trim(),
    personalNumber: child.personalNumber.trim(),
    schoolName: child.schoolName.trim(),
    residenceExtent: child.residenceExtent,
    daysInHome: child.daysInHome,
  });

const buildCost = (cost: CostForm): Record<string, unknown> =>
  compact({
    costType: cost.costType,
    appliedAmount: cost.appliedAmount,
    otherSubType: cost.costType === 'OTHER' ? cost.otherSubType : '',
    specification: cost.specification.trim(),
    recipientOrPeriod: cost.recipientOrPeriod.trim(),
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
    description: asset.description.trim(),
    value: asset.value,
    ...(asset.assetCategory === 'REAL_ESTATE'
      ? { propertyType: asset.propertyType, purchaseYear: asset.purchaseYear, purchasePrice: asset.purchasePrice }
      : {}),
    ...(asset.assetCategory === 'COMPANY'
      ? { companyName: asset.companyName.trim(), companyAssetSum: asset.companyAssetSum }
      : {}),
    ...(asset.assetCategory === 'VEHICLE'
      ? {
          vehicleType: asset.vehicleType,
          registrationNumber: asset.registrationNumber.trim(),
          purchaseDate: asset.purchaseDate.trim(),
        }
      : {}),
  });

const buildPlanning = (planning: PlanningForm): Record<string, unknown> =>
  compact({
    person: planning.person,
    planningType: planning.planningType,
    ...(planning.planningType === 'WORK'
      ? { workExtent: planning.workExtent, workDescription: planning.workDescription.trim() }
      : {}),
    ...(planning.planningType === 'SICK_LEAVE'
      ? { sickLeaveLevel: planning.sickLeaveLevel, sickFrom: planning.sickFrom.trim(), sickTo: planning.sickTo.trim() }
      : {}),
    ...(planning.planningType === 'SFI'
      ? { sfiStudyPath: planning.sfiStudyPath, sfiCourse: planning.sfiCourse }
      : {}),
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

const buildPerson = (person: PersonForm, type: ApplicationType): Record<string, unknown> =>
  compact({
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
  });

/**
 * Builds the caremanagement `data` payload from the form, omitting empty/unset values.
 * `applicationType` is NOT sent — the server derives it from the slug. Field/section
 * inclusion follows the per-type matrix (supplementary is the minimal application).
 */
export const buildFinancialAssistanceData = (
  form: FinancialAssistanceFormData,
  applicationType: ApplicationType,
): Record<string, unknown> => {
  const isSupplementary = applicationType === 'SUPPLEMENTARY';

  const data: Record<string, unknown> = compact({
    maritalStatus: form.maritalStatus,
    normType: form.normType,
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
        }),
      );
    }

    // Housing details: always for NEW; for RENEWAL only when housing changed.
    if (applicationType === 'NEW' || form.housingChanged === true) {
      Object.assign(
        data,
        compact({
          housingForm: form.housingForm,
          housingAdultsCount: form.housingAdultsCount,
          housingChildrenCount: form.housingChildrenCount,
          housingRoomsPlusKitchen: form.housingRoomsPlusKitchen,
          housingDescription: form.housingDescription.trim(),
        }),
      );
    }
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
      form.pendingBenefits.map(buildPendingBenefit),
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
  const persons = form.persons.map((person) => buildPerson(person, applicationType)).filter(hasFields);
  if (persons.length > 0) data.persons = persons;

  return data;
};
