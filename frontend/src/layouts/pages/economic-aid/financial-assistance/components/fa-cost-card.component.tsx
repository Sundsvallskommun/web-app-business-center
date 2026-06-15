import { CostOtherSubType, CostType, FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { numberFieldOptions } from './fa-form-helpers';

const COST_TYPES: CostType[] = [
  'RENT',
  'ELECTRICITY',
  'HOME_INSURANCE',
  'INTERNET',
  'UNEMPLOYMENT_FUND',
  'UNION_FEE',
  'TRAVEL_APPROVED',
  'TRAVEL_MEDICAL_TRANSPORT',
  'MEDICAL_CARE',
  'MEDICINE',
  'OTHER',
];
const COST_OTHER_SUBTYPES: CostOtherSubType[] = ['OTHER', 'MUNICIPAL_FEES', 'ACUTE_DENTAL'];

interface FaCostCardProps {
  index: number;
  showRecipientOrPeriod: boolean;
  onRemove: () => void;
}

/** One applied-for cost (errand_fa_cost). */
export const FaCostCard: React.FC<FaCostCardProps> = ({ index, showRecipientOrPeriod, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const costType = watch(`costs.${index}.costType` as const);

  return (
    <Card data-cy={`fa-cost-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">{t('financial-assistance:economy.cost.heading', { number: index + 1 })}</h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-cost-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:economy.remove')}
        </Button>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-cost-${index}-type`}>{t('financial-assistance:economy.cost.typeLabel')}</FormLabel>
          <Select
            id={`fa-cost-${index}-type`}
            className="w-full"
            value={costType || ''}
            onSelectValue={(next) =>
              setValue(`costs.${index}.costType` as const, (next as CostType | '') || '', { shouldDirty: true })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {COST_TYPES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:costType.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>

        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-cost-${index}-amount`}>{t('financial-assistance:economy.cost.amountLabel')}</FormLabel>
          <Input
            id={`fa-cost-${index}-amount`}
            type="number"
            min={0}
            {...register(`costs.${index}.appliedAmount` as const, numberFieldOptions)}
          />
        </FormControl>
      </div>

      {costType === 'OTHER' ? (
        <FormControl className="w-full max-w-[28rem]">
          <FormLabel htmlFor={`fa-cost-${index}-subtype`}>
            {t('financial-assistance:economy.cost.subTypeLabel')}
          </FormLabel>
          <Select
            id={`fa-cost-${index}-subtype`}
            className="w-full"
            value={watch(`costs.${index}.otherSubType` as const) || ''}
            onSelectValue={(next) =>
              setValue(`costs.${index}.otherSubType` as const, (next as CostOtherSubType | '') || '', {
                shouldDirty: true,
              })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {COST_OTHER_SUBTYPES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:costOtherSubType.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <FormControl className="w-full">
        <FormLabel htmlFor={`fa-cost-${index}-specification`}>
          {t('financial-assistance:economy.cost.specificationLabel')}
        </FormLabel>
        <Input id={`fa-cost-${index}-specification`} {...register(`costs.${index}.specification` as const)} />
      </FormControl>

      {showRecipientOrPeriod ? (
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-cost-${index}-recipient-period`}>
            {t('financial-assistance:economy.cost.recipientOrPeriodLabel')}
          </FormLabel>
          <Input
            id={`fa-cost-${index}-recipient-period`}
            {...register(`costs.${index}.recipientOrPeriod` as const)}
          />
        </FormControl>
      ) : null}
    </Card>
  );
};
