import {
  FinancialAssistanceFormData,
  PersonRole,
  emptyJobApplication,
  emptyPlannedActivity,
  emptyPlanning,
} from '@interfaces/financial-assistance';
import { Button, Icon } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaJobApplicationCard } from '../components/fa-job-application-card.component';
import { FaPlannedActivityCard } from '../components/fa-planned-activity-card.component';
import { FaPlanningCard } from '../components/fa-planning-card.component';
import { FaStepProps } from './fa-step-registry';

/** Grupp 4 — planering. Per person; AF-planering och sökta jobb endast nyansökan. */
export const StepPlanning: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch } = useFormContext<FinancialAssistanceFormData>();

  const showPerson = watch('maritalStatus') === 'COHABITING';
  const isNew = applicationType === 'NEW';
  // For a single applicant the person is always the applicant — preset it so the field is omitted from the UI.
  const defaultPerson = (): PersonRole | '' => (showPerson ? '' : 'APPLICANT');

  const plannings = useFieldArray({ control, name: 'plannings' });
  const activities = useFieldArray({ control, name: 'plannedActivities' });
  const jobApplications = useFieldArray({ control, name: 'jobApplications' });

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-planning">
      <header className="text-content">
        <h2>{t('financial-assistance:planning.heading')}</h2>
      </header>

      <section className="flex flex-col gap-16" data-cy="fa-plannings">
        <h3 className="text-h4-md font-bold">{t('financial-assistance:planning.planningsHeading')}</h3>
        {plannings.fields.map((field, index) => (
          <FaPlanningCard key={field.id} index={index} showPerson={showPerson} onRemove={() => plannings.remove(index)} />
        ))}
        <div>
          <Button
            variant="link"
            size="sm"
            data-cy="fa-planning-add"
            onClick={() => plannings.append({ ...emptyPlanning(), person: defaultPerson() })}
            leftIcon={<Icon icon={<Plus />} />}
          >
            {t('financial-assistance:planning.addPlanning')}
          </Button>
        </div>
      </section>

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
