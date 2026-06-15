import { FinancialAssistanceFormData, PersonRole } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const PERSON_ROLES: PersonRole[] = ['APPLICANT', 'CO_APPLICANT'];

interface FaPlannedActivityCardProps {
  index: number;
  showPerson: boolean;
  onRemove: () => void;
}

/** One planned activity towards self-sufficiency / AF-planering (errand_fa_planned_activity). */
export const FaPlannedActivityCard: React.FC<FaPlannedActivityCardProps> = ({ index, showPerson, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  return (
    <Card data-cy={`fa-planned-activity-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">
          {t('financial-assistance:planning.activity.heading', { number: index + 1 })}
        </h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-planned-activity-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:planning.remove')}
        </Button>
      </header>

      {showPerson ? (
        <FormControl className="w-full max-w-[20rem]">
          <FormLabel htmlFor={`fa-planned-activity-${index}-person`}>
            {t('financial-assistance:planning.personLabel')}
          </FormLabel>
          <Select
            id={`fa-planned-activity-${index}-person`}
            className="w-full"
            value={watch(`plannedActivities.${index}.person` as const) || ''}
            onSelectValue={(next) =>
              setValue(`plannedActivities.${index}.person` as const, (next as PersonRole | '') || '', {
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

      <FormControl className="w-full">
        <FormLabel htmlFor={`fa-planned-activity-${index}-activity`}>
          {t('financial-assistance:planning.activity.activityLabel')}
        </FormLabel>
        <Input id={`fa-planned-activity-${index}-activity`} {...register(`plannedActivities.${index}.activity` as const)} />
      </FormControl>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-planned-activity-${index}-from`}>
            {t('financial-assistance:planning.activity.fromLabel')}
          </FormLabel>
          <Input
            id={`fa-planned-activity-${index}-from`}
            type="date"
            {...register(`plannedActivities.${index}.periodFrom` as const)}
          />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-planned-activity-${index}-to`}>
            {t('financial-assistance:planning.activity.toLabel')}
          </FormLabel>
          <Input
            id={`fa-planned-activity-${index}-to`}
            type="date"
            {...register(`plannedActivities.${index}.periodTo` as const)}
          />
        </FormControl>
      </div>
    </Card>
  );
};
