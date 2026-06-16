import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { FormControl, FormLabel, Input } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FaPlannedActivityFieldsProps {
  index: number;
}

/** Inline-fält för en planerad aktivitet / AF-planering (errand_fa_planned_activity). */
export const FaPlannedActivityFields: React.FC<FaPlannedActivityFieldsProps> = ({ index }) => {
  const { t } = useTranslation('financial-assistance');
  const { register } = useFormContext<FinancialAssistanceFormData>();
  const fieldId = `fa-planned-activity-${index}`;

  return (
    <>
      <FormControl className="w-full">
        <FormLabel htmlFor={`${fieldId}-activity`}>{t('financial-assistance:planning.activity.activityLabel')}</FormLabel>
        <Input id={`${fieldId}-activity`} {...register(`plannedActivities.${index}.activity` as const)} />
      </FormControl>
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-from`}>{t('financial-assistance:planning.activity.fromLabel')}</FormLabel>
          <Input id={`${fieldId}-from`} type="date" {...register(`plannedActivities.${index}.periodFrom` as const)} />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-to`}>{t('financial-assistance:planning.activity.toLabel')}</FormLabel>
          <Input id={`${fieldId}-to`} type="date" {...register(`plannedActivities.${index}.periodTo` as const)} />
        </FormControl>
      </div>
    </>
  );
};
