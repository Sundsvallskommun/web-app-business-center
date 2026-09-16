import { ApplicationType, PersonRole, PlanningType, SickLeaveLevel } from '@interfaces/financial-assistance';

type Translate = (key: string, options?: Record<string, unknown>) => string;

const fa = (key: string): string => `financial-assistance:${key}`;

/**
 * "Behöver du tolk?" — ensam sökande tilltalas med du; ansöker man tillsammans används personens
 * namn ("Behöver Anna Andersson tolk?"), med rollnamn som reserv innan namnet är känt.
 * Shared by the form, the PDF summary and the form snapshot.
 */
export const interpreterQuestionLabel = (
  t: Translate,
  isCohabiting: boolean,
  role: PersonRole,
  name?: string | null
): string => {
  if (!isCohabiting) return t(fa('personuppgifter.needsInterpreterLabel'));
  if (name) return t(fa('personuppgifter.needsInterpreterLabelNamed'), { name });
  return t(
    fa(
      role === 'CO_APPLICANT'
        ? 'personuppgifter.needsInterpreterLabelCoApplicant'
        : 'personuppgifter.needsInterpreterLabel'
    )
  );
};

/** Info text shown for a planning type, if any. Återansökan asks to attach the medical certificate. */
export const planningInfoText = (
  t: Translate,
  planningType: PlanningType | '',
  applicationType: ApplicationType
): string | undefined => {
  switch (planningType) {
    case 'JOBSEEKING':
      return t(fa('planning.info.jobseeking'));
    case 'SICK_LEAVE':
      return t(fa(applicationType === 'RENEWAL' ? 'planning.info.sickLeaveRenewal' : 'planning.info.sickLeave'));
    case 'SFI':
      return t(fa('planning.info.sfi'));
    case 'OTHER':
      return t(fa('planning.info.other'));
    default:
      return undefined;
  }
};

/** Sjukskrivningsgrad as shown in the form, e.g. "Deltid 75%"; empty when unset. */
export const sickLeaveLevelLabel = (t: Translate, level: SickLeaveLevel | ''): string =>
  level ? t(fa(`sickLeaveLevel.${level}`)) : '';

/** Question-label key suffix: återansökan asks about incomes/assets "sedan senaste ansökan". */
export const incomeAssetLabelSuffix = (applicationType: ApplicationType): string =>
  applicationType === 'RENEWAL' ? 'Renewal' : '';
