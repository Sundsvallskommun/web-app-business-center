import { CostOtherSubType, CostType, FinancialAssistanceFormData, emptyCost } from '@interfaces/financial-assistance';
import { Button, Checkbox, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { Plus, X } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { numberFieldOptions } from './fa-form-helpers';

interface CostGroup {
  category: string;
  types: CostType[];
}

// Kostnaderna grupperade som i designen: ruta + checkbox per kostnad. När en kostnad bockas i
// expanderar rutan och visar hjälptext samt beloppsfält. "Övrigt bistånd" kan ha flera rader.
const COST_GROUPS: CostGroup[] = [
  { category: 'boende', types: ['RENT', 'ELECTRICITY', 'HOME_INSURANCE', 'INTERNET'] },
  { category: 'work', types: ['UNEMPLOYMENT_FUND', 'UNION_FEE', 'TRAVEL_APPROVED', 'TRAVEL_MEDICAL_TRANSPORT'] },
  { category: 'health', types: ['MEDICAL_CARE', 'MEDICINE'] },
  { category: 'other', types: ['OTHER'] },
];

const COST_OTHER_SUBTYPES: CostOtherSubType[] = ['OTHER', 'MUNICIPAL_FEES', 'ACUTE_DENTAL'];

const boxClass = (checked: boolean): string =>
  [
    'rounded-12 border-2 p-16 transition',
    checked ? 'border-vattjom-surface-primary bg-vattjom-background-100' : 'border-divider bg-background-content',
  ].join(' ');

interface FaCostSelectorProps {
  /** Tilläggsansökan: visa även "för vem / vilken period" per vald kostnad. */
  showRecipientOrPeriod: boolean;
}

/**
 * Kostnadsväljare — markera en eller flera kostnader (errand_fa_cost). Varje kostnadstyp är en
 * ruta med checkbox; ikryssad ruta expanderar och visar hjälptext + belopp. "Övrigt bistånd" kan
 * läggas till på flera rader (egen undertyp/specifikation/belopp per rad). Varje rad blir en post
 * i `costs`.
 */
export const FaCostSelector: React.FC<FaCostSelectorProps> = ({ showRecipientOrPeriod }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'costs' });
  const costs = watch('costs');

  const indicesOf = (type: CostType): number[] =>
    costs.reduce<number[]>((acc, cost, index) => (cost.costType === type ? [...acc, index] : acc), []);

  const recipientOrPeriodField = (index: number, fieldId: string) =>
    showRecipientOrPeriod ? (
      <FormControl className="w-full">
        <FormLabel htmlFor={`${fieldId}-recipient-period`}>
          {t('financial-assistance:economy.cost.recipientOrPeriodLabel')}
        </FormLabel>
        <Input id={`${fieldId}-recipient-period`} {...register(`costs.${index}.recipientOrPeriod` as const)} />
      </FormControl>
    ) : null;

  // En vanlig kostnadsruta (allt utom "Övrigt bistånd"): en checkbox, en post i `costs`.
  const renderStandardBox = (type: CostType) => {
    const index = indicesOf(type)[0] ?? -1;
    const checked = index >= 0;
    const label = t(`financial-assistance:costType.${type}`);
    const fieldId = `fa-cost-${type}`;

    const toggle = () => (checked ? remove(index) : append({ ...emptyCost(), costType: type }));

    return (
      <div key={type} className={boxClass(checked)} data-cy={`fa-cost-box-${type}`}>
        <Checkbox checked={checked} onChange={toggle} data-cy={`fa-cost-toggle-${type}`}>
          <span className="font-bold">{label}</span>
        </Checkbox>

        {checked ? (
          <div className="flex flex-col gap-12 mt-12 ml-32">
            <p className="text-small text-dark-secondary">{t(`financial-assistance:costInfo.${type}`)}</p>
            <FormControl className="w-full max-w-[28rem]">
              <FormLabel htmlFor={`${fieldId}-amount`}>{t(`financial-assistance:costAmount.${type}`)}</FormLabel>
              <Input
                id={`${fieldId}-amount`}
                type="number"
                min={0}
                {...register(`costs.${index}.appliedAmount` as const, numberFieldOptions)}
              />
            </FormControl>
            {recipientOrPeriodField(index, fieldId)}
          </div>
        ) : null}
      </div>
    );
  };

  // "Övrigt bistånd" — kan ha flera rader, var och en med undertyp, specifikation och belopp.
  const renderOtherBox = () => {
    const indices = indicesOf('OTHER');
    const checked = indices.length > 0;
    const label = t('financial-assistance:costType.OTHER');

    const toggle = () => (checked ? remove(indices) : append({ ...emptyCost(), costType: 'OTHER' }));

    return (
      <div key="OTHER" className={boxClass(checked)} data-cy="fa-cost-box-OTHER">
        <Checkbox checked={checked} onChange={toggle} data-cy="fa-cost-toggle-OTHER">
          <span className="font-bold">{label}</span>
        </Checkbox>

        {checked ? (
          <div className="flex flex-col gap-16 mt-12 ml-32">
            <p className="text-small text-dark-secondary">{t('financial-assistance:costInfo.OTHER')}</p>

            {indices.map((index, rowNumber) => {
              const fieldId = `fa-cost-OTHER-${index}`;
              return (
                <div
                  key={fields[index]?.id ?? index}
                  className={`flex flex-col gap-12 ${rowNumber > 0 ? 'border-t border-divider pt-12' : ''}`}
                  data-cy={`fa-cost-OTHER-row-${rowNumber}`}
                >
                  {indices.length > 1 ? (
                    <div className="flex justify-end">
                      <Button
                        variant="link"
                        size="sm"
                        color="error"
                        data-cy={`fa-cost-OTHER-remove-${rowNumber}`}
                        onClick={() => remove(index)}
                        leftIcon={<Icon icon={<X />} />}
                      >
                        {t('financial-assistance:economy.remove')}
                      </Button>
                    </div>
                  ) : null}

                  <FormControl className="w-full max-w-[28rem]">
                    <FormLabel htmlFor={`${fieldId}-subtype`}>
                      {t('financial-assistance:economy.cost.subTypeLabel')}
                    </FormLabel>
                    <Select
                      id={`${fieldId}-subtype`}
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

                  <FormControl className="w-full">
                    <FormLabel htmlFor={`${fieldId}-specification`}>
                      {t('financial-assistance:economy.cost.specificationLabel')}
                    </FormLabel>
                    <Input id={`${fieldId}-specification`} {...register(`costs.${index}.specification` as const)} />
                  </FormControl>

                  <FormControl className="w-full max-w-[28rem]">
                    <FormLabel htmlFor={`${fieldId}-amount`}>{t('financial-assistance:costAmount.OTHER')}</FormLabel>
                    <Input
                      id={`${fieldId}-amount`}
                      type="number"
                      min={0}
                      {...register(`costs.${index}.appliedAmount` as const, numberFieldOptions)}
                    />
                  </FormControl>

                  {recipientOrPeriodField(index, fieldId)}
                </div>
              );
            })}

            <div>
              <Button
                variant="secondary"
                size="sm"
                data-cy="fa-cost-OTHER-add-row"
                onClick={() => append({ ...emptyCost(), costType: 'OTHER' })}
                leftIcon={<Icon icon={<Plus />} />}
              >
                {t('financial-assistance:economy.addRow')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-24" data-cy="fa-cost-selector">
      {COST_GROUPS.map((group) => (
        <div key={group.category} className="flex flex-col gap-12">
          <p className="text-base font-bold">{t(`financial-assistance:costCategory.${group.category}`)}</p>
          {group.types.map((type) => (type === 'OTHER' ? renderOtherBox() : renderStandardBox(type)))}
        </div>
      ))}
    </div>
  );
};
