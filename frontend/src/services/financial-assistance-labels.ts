import { ApplicationType, PersonRole, PlanningType, SickLeaveLevel } from '@interfaces/financial-assistance';
import { RequiredDocument } from '@services/financial-assistance-required-documents';

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

/**
 * Lead-in above the documents to attach. Names both persons ("Följande behöver bifogas för Anna och
 * Bo:") once both names are known. Shared by the form and the PDF summary.
 */
export const requiredDocumentsHeading = (
  t: Translate,
  applicantName?: string | null,
  coApplicantName?: string | null
): string =>
  applicantName && coApplicantName
    ? t(fa('attachments.requiredHeadingNamed'), { applicant: applicantName, coApplicant: coApplicantName })
    : t(fa('attachments.requiredHeading'));

/**
 * A document to attach. One that concerns a single person (e.g. läkarintyg) names that person when
 * applying together, with the role name as fallback. Shared by the form and the PDF summary.
 */
export const requiredDocumentLabel = (
  t: Translate,
  document: RequiredDocument,
  isCohabiting: boolean,
  personName?: string | null
): string =>
  document.role && isCohabiting
    ? t(fa(`attachments.docs.${document.id}Named`), {
        name: personName ?? t(fa(`recipient.${document.role}`)).toLowerCase(),
      })
    : t(fa(`attachments.docs.${document.id}`));

/** Question-label key suffix: återansökan asks about incomes/assets "sedan senaste ansökan". */
export const incomeAssetLabelSuffix = (applicationType: ApplicationType): string =>
  applicationType === 'RENEWAL' ? 'Renewal' : '';
