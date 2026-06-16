import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FaJobApplicationCardProps {
  index: number;
  onRemove: () => void;
}

/**
 * One submitted job application / sökt jobb (errand_fa_job_application).
 * Vem jobbansökan avser styrs av personsektionen i steget — ingen personväljare här.
 */
export const FaJobApplicationCard: React.FC<FaJobApplicationCardProps> = ({ index, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register } = useFormContext<FinancialAssistanceFormData>();

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
