import { ApplicantProfile } from '@interfaces/economic-aid';
import {
  FinancialAssistanceFormData,
  PersonRole,
  emptyJobApplication,
  emptyPlannedActivity,
  emptyPlanning,
} from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { Button, Divider, Icon } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaJobApplicationCard } from '../components/fa-job-application-card.component';
import { FaPlannedActivityCard } from '../components/fa-planned-activity-card.component';
import { FaPlanningCard } from '../components/fa-planning-card.component';
import { FaStepProps } from './fa-step-registry';

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
 * Grupp 4 — planering. Allt delas upp per person: "Din planering" (sökande) och, om det finns en
 * medsökande, en egen sektion med medsökandes namn som rubrik. Varje sektion innehåller planering
 * och — vid nyansökan — planerade aktiviteter och sökta jobb. Vem posten avser avgörs av sektionen
 * och sparas på person-fältet i API:t (ingen "Avser"-väljare i korten).
 */
export const StepPlanning: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const showPerson = watch('maritalStatus') === 'COHABITING';
  const isNew = applicationType === 'NEW';

  // Sökandens namn till sektionsrubriken ("Vilken planering har <namn>?").
  const applicantProfile = useApi<ApplicantProfile>({ url: '/economic-aid/applicant-profile', method: 'get' });
  const applicantName = [applicantProfile.data?.fornamn, applicantProfile.data?.efternamn]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Medsökandes namn till sektionsrubriken. Hämtas på personnumret (samma uppslag som
  // kontaktsektionen) — bara när det finns en medsökande.
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
      <Button variant="link" size="sm" data-cy={cy} onClick={onClick} leftIcon={<Icon icon={<Plus />} />}>
        {label}
      </Button>
    </div>
  );

  // Aktiviteter och sökta jobb är bara aktuella för en arbetssökande — visas när personen har
  // minst en planering med typen "Arbetssökande" (JOBSEEKING).
  const personIsJobseeking = (person: PersonRole): boolean =>
    entriesForPerson(plannings.fields, watchedPlannings, person).some(
      ({ index }) => watchedPlannings?.[index]?.planningType === 'JOBSEEKING',
    );

  // Rensar aktiviteter/sökta jobb för en person som inte längre är arbetssökande (eller när det
  // inte är en nyansökan) så att dolda poster aldrig följer med vid inskick.
  useEffect(() => {
    const isKept = (entryPerson: PersonRole | '') =>
      isNew && personIsJobseeking((entryPerson || 'APPLICANT') as PersonRole);

    const prunedActivities = (watchedActivities ?? []).filter((activity) => isKept(activity.person));
    if (prunedActivities.length !== (watchedActivities ?? []).length) {
      setValue('plannedActivities', prunedActivities, { shouldDirty: true });
    }
    const prunedJobs = (watchedJobApplications ?? []).filter((job) => isKept(job.person));
    if (prunedJobs.length !== (watchedJobApplications ?? []).length) {
      setValue('jobApplications', prunedJobs, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPlannings, watchedActivities, watchedJobApplications, isNew]);

  // En komplett planeringssektion för en person: planering och — vid nyansökan och arbetssökande —
  // planerade aktiviteter och sökta jobb.
  const renderPersonSection = (person: PersonRole, heading: string) => (
    <section className="flex flex-col gap-24" data-cy={`fa-planning-section-${person}`}>
      <div className="text-content flex flex-col gap-8">
        <h3 className="text-h4-md font-bold">{heading}</h3>
        <p className="text-small text-dark-secondary">{t('financial-assistance:planning.planningIntro')}</p>
      </div>

      <div className="flex flex-col gap-16" data-cy={`fa-plannings-${person}`}>
        {entriesForPerson(plannings.fields, watchedPlannings, person).map(({ id, index }) => (
          <FaPlanningCard key={id} index={index} onRemove={() => plannings.remove(index)} />
        ))}
        {addButton(`fa-planning-add-${person}`, t('financial-assistance:planning.addPlanning'), () =>
          plannings.append({ ...emptyPlanning(), person }),
        )}
      </div>

      {isNew && personIsJobseeking(person) ? (
        <>
          <div className="flex flex-col gap-16" data-cy={`fa-planned-activities-${person}`}>
            <h4 className="text-h4-md font-bold">{t('financial-assistance:planning.activitiesHeading')}</h4>
            {entriesForPerson(activities.fields, watchedActivities, person).map(({ id, index }) => (
              <FaPlannedActivityCard key={id} index={index} onRemove={() => activities.remove(index)} />
            ))}
            {addButton(`fa-planned-activity-add-${person}`, t('financial-assistance:planning.addActivity'), () =>
              activities.append({ ...emptyPlannedActivity(), person }),
            )}
          </div>

          <div className="flex flex-col gap-16" data-cy={`fa-job-applications-${person}`}>
            <h4 className="text-h4-md font-bold">{t('financial-assistance:planning.jobApplicationsHeading')}</h4>
            {entriesForPerson(jobApplications.fields, watchedJobApplications, person).map(({ id, index }) => (
              <FaJobApplicationCard key={id} index={index} onRemove={() => jobApplications.remove(index)} />
            ))}
            {addButton(`fa-job-application-add-${person}`, t('financial-assistance:planning.addJobApplication'), () =>
              jobApplications.append({ ...emptyJobApplication(), person }),
            )}
          </div>
        </>
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

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};
