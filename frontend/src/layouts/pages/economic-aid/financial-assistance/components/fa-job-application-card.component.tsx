import { FinancialAssistanceFormData, PersonRole } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const PERSON_ROLES: PersonRole[] = ['APPLICANT', 'CO_APPLICANT'];

interface FaJobApplicationCardProps {
  index: number;
  showPerson: boolean;
  onRemove: () => void;
}

/** One submitted job application / sökt jobb (errand_fa_job_application). */
export const FaJobApplicationCard: React.FC<FaJobApplicationCardProps> = ({ index, showPerson, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  return (
    <Card data-cy={`fa-job-application-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">
          {t('financial-assistance:planning.jobApplication.heading', { number: index + 1 })}
        </h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-job-application-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:planning.remove')}
        </Button>
      </header>

      {showPerson ? (
        <FormControl className="w-full max-w-[20rem]">
          <FormLabel htmlFor={`fa-job-application-${index}-person`}>
            {t('financial-assistance:planning.personLabel')}
          </FormLabel>
          <Select
            id={`fa-job-application-${index}-person`}
            className="w-full"
            value={watch(`jobApplications.${index}.person` as const) || ''}
            onSelectValue={(next) =>
              setValue(`jobApplications.${index}.person` as const, (next as PersonRole | '') || '', {
                shouldDirty: true,
              })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {PERSON_ROLES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:recipient.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-job-application-${index}-date`}>
            {t('financial-assistance:planning.jobApplication.dateLabel')}
          </FormLabel>
          <Input
            id={`fa-job-application-${index}-date`}
            type="date"
            {...register(`jobApplications.${index}.applicationDate` as const)}
          />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-job-application-${index}-title`}>
            {t('financial-assistance:planning.jobApplication.jobTitleLabel')}
          </FormLabel>
          <Input id={`fa-job-application-${index}-title`} {...register(`jobApplications.${index}.jobTitle` as const)} />
        </FormControl>
      </div>

      <FormControl className="w-full">
        <FormLabel htmlFor={`fa-job-application-${index}-employer`}>
          {t('financial-assistance:planning.jobApplication.employerLabel')}
        </FormLabel>
        <Input
          id={`fa-job-application-${index}-employer`}
          {...register(`jobApplications.${index}.employerAndPlace` as const)}
        />
      </FormControl>
    </Card>
  );
};
