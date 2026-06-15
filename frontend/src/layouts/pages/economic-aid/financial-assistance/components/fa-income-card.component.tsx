import { FinancialAssistanceFormData, IncomeType, Recipient } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { numberFieldOptions } from './fa-form-helpers';

const INCOME_TYPES: IncomeType[] = [
  'SALARY',
  'OCCUPATIONAL_PENSION_INSURANCE',
  'CHILD_SUPPORT',
  'SWISH_DEPOSITS',
  'RENT_SHARE_FROM_CHILD',
  'FINANCIAL_AID_OTHER_MUNICIPALITY',
  'OTHER_INCOME',
];
const RECIPIENTS: Recipient[] = ['APPLICANT', 'CO_APPLICANT'];

interface FaIncomeCardProps {
  index: number;
  showRecipient: boolean;
  onRemove: () => void;
}

/** One reported income (errand_fa_income). */
export const FaIncomeCard: React.FC<FaIncomeCardProps> = ({ index, showRecipient, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  return (
    <Card data-cy={`fa-income-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">
          {t('financial-assistance:economy.income.heading', { number: index + 1 })}
        </h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-income-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:economy.remove')}
        </Button>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-income-${index}-type`}>{t('financial-assistance:economy.income.typeLabel')}</FormLabel>
          <Select
            id={`fa-income-${index}-type`}
            className="w-full"
            value={watch(`incomes.${index}.incomeType` as const) || ''}
            onSelectValue={(next) =>
              setValue(`incomes.${index}.incomeType` as const, (next as IncomeType | '') || '', { shouldDirty: true })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {INCOME_TYPES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:incomeType.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>

        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-income-${index}-amount`}>
            {t('financial-assistance:economy.income.amountLabel')}
          </FormLabel>
          <Input
            id={`fa-income-${index}-amount`}
            type="number"
            min={0}
            {...register(`incomes.${index}.amount` as const, numberFieldOptions)}
          />
        </FormControl>
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-income-${index}-date`}>{t('financial-assistance:economy.income.dateLabel')}</FormLabel>
          <Input id={`fa-income-${index}-date`} type="date" {...register(`incomes.${index}.incomeDate` as const)} />
        </FormControl>

        {showRecipient ? (
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-income-${index}-recipient`}>
              {t('financial-assistance:economy.recipientLabel')}
            </FormLabel>
            <Select
              id={`fa-income-${index}-recipient`}
              className="w-full"
              value={watch(`incomes.${index}.recipient` as const) || ''}
              onSelectValue={(next) =>
                setValue(`incomes.${index}.recipient` as const, (next as Recipient | '') || '', { shouldDirty: true })
              }
            >
              <Select.Option value="" disabled>
                {t('financial-assistance:economy.select')}
              </Select.Option>
              {RECIPIENTS.map((value) => (
                <Select.Option key={value} value={value}>
                  {t(`financial-assistance:recipient.${value}`)}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </div>
    </Card>
  );
};
