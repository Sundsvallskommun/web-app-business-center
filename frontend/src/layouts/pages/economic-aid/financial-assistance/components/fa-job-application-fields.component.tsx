import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { FormControl, FormLabel, Input } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FaJobApplicationFieldsProps {
  index: number;
}

/** Inline-fält för ett sökt jobb (errand_fa_job_application). */
export const FaJobApplicationFields: React.FC<FaJobApplicationFieldsProps> = ({ index }) => {
  const { t } = useTranslation('financial-assistance');
  const { register } = useFormContext<FinancialAssistanceFormData>();
  const fieldId = `fa-job-application-${index}`;

  return (
    <>
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-date`}>{t('financial-assistance:planning.jobApplication.dateLabel')}</FormLabel>
          <Input id={`${fieldId}-date`} type="date" {...register(`jobApplications.${index}.applicationDate` as const)} />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-title`}>
            {t('financial-assistance:planning.jobApplication.jobTitleLabel')}
          </FormLabel>
          <Input id={`${fieldId}-title`} {...register(`jobApplications.${index}.jobTitle` as const)} />
        </FormControl>
      </div>
      <FormControl className="w-full">
        <FormLabel htmlFor={`${fieldId}-employer`}>
          {t('financial-assistance:planning.jobApplication.employerLabel')}
        </FormLabel>
        <Input id={`${fieldId}-employer`} {...register(`jobApplications.${index}.employerAndPlace` as const)} />
      </FormControl>
    </>
  );
};
