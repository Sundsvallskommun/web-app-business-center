import { ApplicantProfile } from '@interfaces/economic-aid';
import {
  FinancialAssistanceFormData,
  PersonRole,
  PlanningType,
  emptyJobApplication,
  emptyPlannedActivity,
  emptyPlanning,
} from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { Button, Checkbox, Divider, Icon } from '@sk-web-gui/react';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaJobApplicationFields } from '../components/fa-job-application-fields.component';
import { FaPlannedActivityFields } from '../components/fa-planned-activity-fields.component';
import { FaPlanningFields } from '../components/fa-planning-fields.component';
import { FaWorkHistoryQuestion } from '../components/fa-work-history-question.component';
import { selectableBoxClass } from '../components/fa-form-helpers';
import { FaStepProps } from './fa-step-registry';

const PLANNING_TYPES: PlanningType[] = ['WORK', 'JOBSEEKING', 'SICK_LEAVE', 'SFI', 'OTHER'];

/** Plockar ut posternas index för en given person. Sökanden fångar även poster utan satt person. */
const entriesForPerson = (
  fields: { id: string }[],
  watched: Array<{ person: PersonRole | '' }> | undefined,
  person: PersonRole,
): { id: string; index: number }[] =>
  fields
    .map((field, index) => ({ id: field.id, index }))
    .filter(({ index }) => {
      const value = watched?.[index]?.person ?? '';
      return person === 'CO_APPLICANT' ? value === 'CO_APPLICANT' : value !== 'CO_APPLICANT';
    });

/**
 * Grupp 4 — planering. Per person ("Vilken planering har <namn>?") väljs en eller flera
 * planeringstyper som rutor med checkbox; ikryssad ruta expanderar och visar typens fält. Under
 * "Arbetssökande" visas (vid nyansökan) planerade aktiviteter och sökta jobb, var och en med
 * "Lägg till ny rad". Vem posten avser sparas på person-fältet i API:t.
 */
export const StepPlanning: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch } = useFormContext<FinancialAssistanceFormData>();

  const showPerson = watch('maritalStatus') === 'COHABITING';
  const isNew = applicationType === 'NEW';

  // Sökandens namn till sektionsrubriken ("Vilken planering har <namn>?").
  const applicantProfile = useApi<ApplicantProfile>({ url: '/economic-aid/applicant-profile', method: 'get' });
  const applicantName = [applicantProfile.data?.fornamn, applicantProfile.data?.efternamn]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Medsökandes namn till sektionsrubriken — bara när det finns en medsökande.
  const coApplicantPnr = watch('persons')?.find((person) => person.role === 'CO_APPLICANT')?.personalNumber ?? '';
  const coApplicantProfile = useApi<ApplicantProfile>({
    url: `/economic-aid/co-applicant-profile?personnummer=${encodeURIComponent(coApplicantPnr)}`,
    method: 'get',
    queryOptions: { enabled: showPerson && coApplicantPnr.trim().length > 0 },
  });
  const coApplicantName = [coApplicantProfile.data?.fornamn, coApplicantProfile.data?.efternamn]
    .filter(Boolean)
    .join(' ')
    .trim();

  const plannings = useFieldArray({ control, name: 'plannings' });
  const activities = useFieldArray({ control, name: 'plannedActivities' });
  const jobApplications = useFieldArray({ control, name: 'jobApplications' });

  const watchedPlannings = watch('plannings');
  const watchedActivities = watch('plannedActivities');
  const watchedJobApplications = watch('jobApplications');

  const addButton = (cy: string, label: string, onClick: () => void) => (
    <div>
      <Button variant="secondary" size="sm" data-cy={cy} onClick={onClick} leftIcon={<Icon icon={<Plus />} />}>
        {label}
      </Button>
    </div>
  );

  // Index för en persons planering av en viss typ (poster utan person räknas som sökandens).
  const planningIndexFor = (person: PersonRole, type: PlanningType): number =>
    (watchedPlannings ?? []).findIndex((planning) => {
      const planningPerson = planning.person === 'CO_APPLICANT' ? 'CO_APPLICANT' : 'APPLICANT';
      return planningPerson === person && planning.planningType === type;
    });

  const personIsJobseeking = (person: PersonRole): boolean => planningIndexFor(person, 'JOBSEEKING') >= 0;
  const personHasWork = (person: PersonRole): boolean => planningIndexFor(person, 'WORK') >= 0;

  // Persons i formuläret (sökande + ev. medsökande) och deras index — för tolk/arbete-frågorna.
  const persons = watch('persons');
  const personIndexOf = (person: PersonRole): number => persons.findIndex((entry) => entry.role === person);
  const personRoles: PersonRole[] = showPerson ? ['APPLICANT', 'CO_APPLICANT'] : ['APPLICANT'];

  // Arbetssökande kräver (nyansökan) minst en ifylld aktivitet och ett sökt jobb per person.
  const jobseekingIncomplete =
    isNew &&
    personRoles.some((person) => {
      if (!personIsJobseeking(person)) return false;
      const acts = entriesForPerson(activities.fields, watchedActivities, person);
      const jobs = entriesForPerson(jobApplications.fields, watchedJobApplications, person);
      const hasActivity = acts.some(({ index }) => (watchedActivities?.[index]?.activity ?? '').trim() !== '');
      const hasJob = jobs.some(({ index }) => (watchedJobApplications?.[index]?.jobTitle ?? '').trim() !== '');
      return !hasActivity || !hasJob;
    });

  // Rensar aktiviteter/sökta jobb för en person som inte längre är arbetssökande (eller när det
  // inte är en nyansökan) så att dolda poster aldrig följer med vid inskick.
  useEffect(() => {
    const isKept = (entryPerson: PersonRole | '') =>
      isNew && personIsJobseeking((entryPerson || 'APPLICANT') as PersonRole);

    const prunedActivities = (watchedActivities ?? []).filter((activity) => isKept(activity.person));
    if (prunedActivities.length !== (watchedActivities ?? []).length) {
      activities.replace(prunedActivities);
    }
    const prunedJobs = (watchedJobApplications ?? []).filter((job) => isKept(job.person));
    if (prunedJobs.length !== (watchedJobApplications ?? []).length) {
      jobApplications.replace(prunedJobs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPlannings, watchedActivities, watchedJobApplications, isNew]);

  // En inline-rad (utan kort-ram) med "Ta bort" överst. Rader efter den första får en avgränsare.
  const renderRows = (
    entries: { id: string; index: number }[],
    renderFields: (index: number) => React.ReactNode,
    onRemove: (index: number) => void,
    cyPrefix: string,
  ) =>
    entries.map(({ id, index }, rowNumber) => (
      <div
        key={id}
        className={`flex flex-col gap-12 ${rowNumber > 0 ? 'border-t border-divider pt-12' : ''}`}
        data-cy={`${cyPrefix}-row-${rowNumber}`}
      >
        <div className="flex justify-end">
          <Button variant="link" size="sm" color="error" onClick={() => onRemove(index)} leftIcon={<Icon icon={<X />} />}>
            {t('financial-assistance:planning.remove')}
          </Button>
        </div>
        {renderFields(index)}
      </div>
    ));

  // Aktiviteter/sökta jobb under "Arbetssökande" — per person, flera inline-rader.
  const renderJobseekingExtras = (person: PersonRole) => (
    <div className="flex flex-col gap-16 mt-4">
      <div className="flex flex-col gap-12" data-cy={`fa-planned-activities-${person}`}>
        <p className="font-bold">{t('financial-assistance:planning.activitiesHeading')}</p>
        {renderRows(
          entriesForPerson(activities.fields, watchedActivities, person),
          (index) => <FaPlannedActivityFields index={index} />,
          (index) => activities.remove(index),
          `fa-planned-activity-${person}`,
        )}
        {addButton(`fa-planned-activity-add-${person}`, t('financial-assistance:planning.addActivity'), () =>
          activities.append({ ...emptyPlannedActivity(), person }),
        )}
      </div>

      <div className="flex flex-col gap-12" data-cy={`fa-job-applications-${person}`}>
        <p className="font-bold">{t('financial-assistance:planning.jobApplicationsHeading')}</p>
        {renderRows(
          entriesForPerson(jobApplications.fields, watchedJobApplications, person),
          (index) => <FaJobApplicationFields index={index} />,
          (index) => jobApplications.remove(index),
          `fa-job-application-${person}`,
        )}
        {addButton(`fa-job-application-add-${person}`, t('financial-assistance:planning.addJobApplication'), () =>
          jobApplications.append({ ...emptyJobApplication(), person }),
        )}
      </div>
    </div>
  );

  // En planeringstyp som en ruta med checkbox. Ikryssad ruta expanderar och visar typens fält.
  const renderPlanningBox = (person: PersonRole, type: PlanningType) => {
    const index = planningIndexFor(person, type);
    const checked = index >= 0;
    const label = t(`financial-assistance:planningType.${type}`);
    const toggle = () => {
      if (checked) {
        plannings.remove(index);
        return;
      }
      plannings.append({ ...emptyPlanning(), person, planningType: type });
      // Arbetssökande: visa direkt en rad för planerad aktivitet och ett sökt jobb (obligatoriska),
      // så användaren inte behöver lägga till dem manuellt.
      if (type === 'JOBSEEKING' && isNew) {
        if (entriesForPerson(activities.fields, watchedActivities, person).length === 0) {
          activities.append({ ...emptyPlannedActivity(), person });
        }
        if (entriesForPerson(jobApplications.fields, watchedJobApplications, person).length === 0) {
          jobApplications.append({ ...emptyJobApplication(), person });
        }
      }
    };

    return (
      <div key={type} className={selectableBoxClass(checked)} data-cy={`fa-planning-box-${person}-${type}`}>
        <Checkbox checked={checked} onChange={toggle} data-cy={`fa-planning-toggle-${person}-${type}`}>
          <span className="font-bold">{label}</span>
        </Checkbox>

        {checked ? (
          <div className="flex flex-col gap-16 mt-12 ml-32">
            <FaPlanningFields index={index} planningType={type} />
            {type === 'JOBSEEKING' && isNew ? renderJobseekingExtras(person) : null}
          </div>
        ) : null}
      </div>
    );
  };

  const renderPersonSection = (person: PersonRole, heading: string) => (
    <section className="flex flex-col gap-16" data-cy={`fa-planning-section-${person}`}>
      <div className="text-content flex flex-col gap-8">
        <h3 className="text-h4-md font-bold">{heading}</h3>
        <p className="text-small text-dark-secondary">{t('financial-assistance:planning.planningIntro')}</p>
      </div>
      <div className="flex flex-col gap-12">{PLANNING_TYPES.map((type) => renderPlanningBox(person, type))}</div>

      {/* Har personen inte valt "Arbete" som planering → fråga om arbete senaste 12 mån (nyansökan). */}
      {isNew && !personHasWork(person) && personIndexOf(person) >= 0 ? (
        <FaWorkHistoryQuestion index={personIndexOf(person)} />
      ) : null}
    </section>
  );

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-planning">
      <header className="text-content">
        <h2>{t('financial-assistance:planning.heading')}</h2>
      </header>

      {renderPersonSection(
        'APPLICANT',
        // Söker man själv står det "du"; finns en medsökande används namnet för att skilja dem åt.
        showPerson && applicantName
          ? t('financial-assistance:planning.personPlanning', { name: applicantName })
          : t('financial-assistance:planning.planningsHeading'),
      )}
      {showPerson ? (
        <>
          <Divider />
          {renderPersonSection(
            'CO_APPLICANT',
            coApplicantName
              ? t('financial-assistance:planning.personPlanning', { name: coApplicantName })
              : t('financial-assistance:planning.coApplicantPlanning'),
          )}
        </>
      ) : null}

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={jobseekingIncomplete} />
    </section>
  );
};
