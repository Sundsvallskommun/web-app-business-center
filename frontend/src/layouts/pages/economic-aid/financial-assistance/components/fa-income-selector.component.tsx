import { FinancialAssistanceFormData, IncomeType, Recipient, emptyIncome } from '@interfaces/financial-assistance';
import { Button, Checkbox, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { Plus, X } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { numberFieldOptions, selectableBoxClass } from './fa-form-helpers';

const INCOME_TYPES: IncomeType[] = [
  'SALARY',
  'SWISH_DEPOSITS',
  'OCCUPATIONAL_PENSION_INSURANCE',
  'CHILD_SUPPORT',
  'RENT_SHARE_FROM_CHILD',
  'FINANCIAL_AID_OTHER_MUNICIPALITY',
  'OTHER_INCOME',
];
const RECIPIENTS: Recipient[] = ['APPLICANT', 'CO_APPLICANT'];

interface FaIncomeSelectorProps {
  /** Gift/sambo: visa "Avser" (vem inkomsten gäller) per rad. */
  showRecipient: boolean;
}

/**
 * Inkomstväljare — markera en eller flera inkomsttyper (errand_fa_income). Varje typ är en ruta
 * med checkbox; ikryssad ruta expanderar och visar belopp, datum och (vid gift/sambo) "Avser".
 * En typ kan ha flera rader ("Lägg till ny rad"). Varje rad blir en post i `incomes`.
 */
export const FaIncomeSelector: React.FC<FaIncomeSelectorProps> = ({ showRecipient }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'incomes' });
  const incomes = watch('incomes');

  const indicesOf = (type: IncomeType): number[] =>
    incomes.reduce<number[]>((acc, income, index) => (income.incomeType === type ? [...acc, index] : acc), []);

  return (
    <div className="flex flex-col gap-12" data-cy="fa-income-selector">
      {INCOME_TYPES.map((type) => {
        const indices = indicesOf(type);
        const checked = indices.length > 0;
        const label = t(`financial-assistance:incomeType.${type}`);
        const toggle = () => (checked ? remove(indices) : append({ ...emptyIncome(), incomeType: type }));

        return (
          <div key={type} className={selectableBoxClass(checked)} data-cy={`fa-income-box-${type}`}>
            <Checkbox checked={checked} onChange={toggle} data-cy={`fa-income-toggle-${type}`}>
              <span className="font-bold">{label}</span>
            </Checkbox>

            {checked ? (
              <div className="flex flex-col gap-16 mt-12 ml-32">
                {indices.map((index, rowNumber) => {
                  const fieldId = `fa-income-${type}-${index}`;
                  return (
                    <div
                      key={fields[index]?.id ?? index}
                      className={`flex flex-col gap-12 ${rowNumber > 0 ? 'border-t border-divider pt-12' : ''}`}
                      data-cy={`fa-income-row-${type}-${rowNumber}`}
                    >
                      {indices.length > 1 ? (
                        <div className="flex justify-end">
                          <Button
                            variant="link"
                            size="sm"
                            color="error"
                            onClick={() => remove(index)}
                            leftIcon={<Icon icon={<X />} />}
                          >
                            {t('financial-assistance:economy.remove')}
                          </Button>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
                        <FormControl className="w-full">
                          <FormLabel htmlFor={`${fieldId}-amount`}>
                            {t('financial-assistance:economy.income.amountLabel')}
                          </FormLabel>
                          <Input
                            id={`${fieldId}-amount`}
                            type="number"
                            min={0}
                            {...register(`incomes.${index}.amount` as const, numberFieldOptions)}
                          />
                        </FormControl>
                        <FormControl className="w-full">
                          <FormLabel htmlFor={`${fieldId}-date`}>
                            {t('financial-assistance:economy.income.dateLabel')}
                          </FormLabel>
                          <Input id={`${fieldId}-date`} type="date" {...register(`incomes.${index}.incomeDate` as const)} />
                        </FormControl>
                      </div>

                      {showRecipient ? (
                        <FormControl className="w-full max-w-[28rem]">
                          <FormLabel htmlFor={`${fieldId}-recipient`}>
                            {t('financial-assistance:economy.recipientLabel')}
                          </FormLabel>
                          <Select
                            id={`${fieldId}-recipient`}
                            className="w-full"
                            value={watch(`incomes.${index}.recipient` as const) || ''}
                            onSelectValue={(next) =>
                              setValue(`incomes.${index}.recipient` as const, (next as Recipient | '') || '', {
                                shouldDirty: true,
                              })
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
                  );
                })}

                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    data-cy={`fa-income-add-row-${type}`}
                    onClick={() => append({ ...emptyIncome(), incomeType: type })}
                    leftIcon={<Icon icon={<Plus />} />}
                  >
                    {t('financial-assistance:economy.addRow')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
