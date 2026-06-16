import { ApplicationType, FinancialAssistanceFormData, ResidenceExtent } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const RESIDENCE_EXTENTS: ResidenceExtent[] = ['FULL_TIME', 'HALF_TIME', 'OTHER'];

interface FaChildCardProps {
  index: number;
  applicationType: ApplicationType;
  onRemove: () => void;
}

/** One child row in the household section (errand_fa_household_child). */
export const FaChildCard: React.FC<FaChildCardProps> = ({ index, applicationType, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const residenceExtent = watch(`children.${index}.residenceExtent` as const);
  // Skola samlas bara in vid nyansökan; antal dagar bara när "Annat" valts.
  const showSchool = applicationType === 'NEW';
  const showDaysInHome = residenceExtent === 'OTHER';

  return (
    <Card data-cy={`fa-child-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">{t('financial-assistance:child.heading', { number: index + 1 })}</h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-child-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:child.remove')}
        </Button>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-child-${index}-firstName`}>{t('financial-assistance:child.firstName')}</FormLabel>
          <Input id={`fa-child-${index}-firstName`} {...register(`children.${index}.firstName` as const)} />
        </FormControl>

        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-child-${index}-lastName`}>{t('financial-assistance:child.lastName')}</FormLabel>
          <Input id={`fa-child-${index}-lastName`} {...register(`children.${index}.lastName` as const)} />
        </FormControl>
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-child-${index}-personalNumber`}>
            {t('financial-assistance:child.personalNumber')}
          </FormLabel>
          <Input
            id={`fa-child-${index}-personalNumber`}
            placeholder="ÅÅÅÅMMDD-XXXX"
            {...register(`children.${index}.personalNumber` as const)}
          />
        </FormControl>

        {showSchool ? (
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-child-${index}-schoolName`}>{t('financial-assistance:child.schoolName')}</FormLabel>
            <Input id={`fa-child-${index}-schoolName`} {...register(`children.${index}.schoolName` as const)} />
          </FormControl>
        ) : null}
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-child-${index}-residenceExtent`}>
            {t('financial-assistance:child.residenceExtent')}
          </FormLabel>
          <Select
            id={`fa-child-${index}-residenceExtent`}
            className="w-full"
            value={residenceExtent || ''}
            onSelectValue={(next) =>
              setValue(`children.${index}.residenceExtent` as const, (next as ResidenceExtent | '') || '', {
                shouldDirty: true,
              })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:child.select')}
            </Select.Option>
            {RESIDENCE_EXTENTS.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:residenceExtent.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>

        {showDaysInHome ? (
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-child-${index}-daysInHome`}>{t('financial-assistance:child.daysInHome')}</FormLabel>
            <Input
              id={`fa-child-${index}-daysInHome`}
              type="number"
              min={1}
              max={31}
              {...register(`children.${index}.daysInHome` as const, {
                setValueAs: (value) => (value === '' || value === null ? null : Number(value)),
              })}
            />
          </FormControl>
        ) : null}
      </div>
    </Card>
  );
};
