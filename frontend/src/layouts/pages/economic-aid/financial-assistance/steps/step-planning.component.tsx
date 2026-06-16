import { ApplicantProfile } from '@interfaces/economic-aid';
import {
  FinancialAssistanceFormData,
  PersonRole,
  emptyJobApplication,
  emptyPlannedActivity,
  emptyPlanning,
} from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { Button, Icon } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaJobApplicationCard } from '../components/fa-job-application-card.component';
import { FaPlannedActivityCard } from '../components/fa-planned-activity-card.component';
import { FaPlanningCard } from '../components/fa-planning-card.component';
import { FaStepProps } from './fa-step-registry';

/**
 * Grupp 4 — planering. Planeringen delas upp per person: "Din planering" (sökande) och
 * medsökandes egna sektion (rubriken är medsökandes namn). Personen avgörs av sektionen och
 * sparas på respektive planering (person-fältet i API:t) — ingen "Avser"-väljare i korten.
 * AF-planering och sökta jobb endast vid nyansökan.
 */
export const StepPlanning: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch } = useFormContext<FinancialAssistanceFormData>();

  const showPerson = watch('maritalStatus') === 'COHABITING';
  const isNew = applicationType === 'NEW';
  // For a single applicant the person is always the applicant — preset it so the field is omitted from the UI.
  const defaultPerson = (): PersonRole | '' => (showPerson ? '' : 'APPLICANT');

  // Medsökandes namn till sektionsrubriken ("<namn>s planering"). Hämtas på personnumret
  // (samma uppslag som kontaktsektionen) — bara när det finns en medsökande.
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
  const watchedPlannings = watch('plannings');
  const activities = useFieldArray({ control, name: 'plannedActivities' });
  const jobApplications = useFieldArray({ control, name: 'jobApplications' });

  // Renderar planeringskorten för en person. Personfältet döljs i korten — gruppen avgör vem
  // planeringen avser och sätts på person-fältet vid "Lägg till".
  const renderPlanningGroup = (person: PersonRole, heading: string) => {
    const entries = plannings.fields
      .map((field, index) => ({ field, index }))
      .filter(({ index }) => {
        // Sökandegruppen fångar även poster utan satt person (t.ex. äldre utkast).
        const value = watchedPlannings?.[index]?.person ?? '';
        return person === 'CO_APPLICANT' ? value === 'CO_APPLICANT' : value !== 'CO_APPLICANT';
      });
    return (
      <section className="flex flex-col gap-16" data-cy={`fa-plannings-${person}`}>
        <h3 className="text-h4-md font-bold">{heading}</h3>
        {entries.map(({ field, index }) => (
          <FaPlanningCard key={field.id} index={index} onRemove={() => plannings.remove(index)} />
        ))}
        <div>
          <Button
            variant="link"
            size="sm"
            data-cy={`fa-planning-add-${person}`}
            onClick={() => plannings.append({ ...emptyPlanning(), person })}
            leftIcon={<Icon icon={<Plus />} />}
          >
            {t('financial-assistance:planning.addPlanning')}
          </Button>
        </div>
      </section>
    );
  };

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-planning">
      <header className="text-content">
        <h2>{t('financial-assistance:planning.heading')}</h2>
      </header>

      {renderPlanningGroup('APPLICANT', t('financial-assistance:planning.planningsHeading'))}
      {showPerson
        ? renderPlanningGroup(
            'CO_APPLICANT',
            coApplicantName
              ? t('financial-assistance:planning.personPlanning', { name: coApplicantName })
              : t('financial-assistance:planning.coApplicantPlanning'),
          )
        : null}

      {isNew ? (
        <>
          <section className="flex flex-col gap-16" data-cy="fa-planned-activities">
            <h3 className="text-h4-md font-bold">{t('financial-assistance:planning.activitiesHeading')}</h3>
            {activities.fields.map((field, index) => (
              <FaPlannedActivityCard
                key={field.id}
                index={index}
                showPerson={showPerson}
                onRemove={() => activities.remove(index)}
              />
            ))}
            <div>
              <Button
                variant="link"
                size="sm"
                data-cy="fa-planned-activity-add"
                onClick={() => activities.append({ ...emptyPlannedActivity(), person: defaultPerson() })}
                leftIcon={<Icon icon={<Plus />} />}
              >
                {t('financial-assistance:planning.addActivity')}
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-16" data-cy="fa-job-applications">
            <h3 className="text-h4-md font-bold">{t('financial-assistance:planning.jobApplicationsHeading')}</h3>
            {jobApplications.fields.map((field, index) => (
              <FaJobApplicationCard
                key={field.id}
                index={index}
                showPerson={showPerson}
                onRemove={() => jobApplications.remove(index)}
              />
            ))}
            <div>
              <Button
                variant="link"
                size="sm"
                data-cy="fa-job-application-add"
                onClick={() => jobApplications.append({ ...emptyJobApplication(), person: defaultPerson() })}
                leftIcon={<Icon icon={<Plus />} />}
              >
                {t('financial-assistance:planning.addJobApplication')}
              </Button>
            </div>
          </section>
        </>
      ) : null}

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};
