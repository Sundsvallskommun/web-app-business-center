import { ApplicationType, FinancialAssistanceFormData, PaymentMethod, PersonRole } from '@interfaces/financial-assistance';
import { Card, FormControl, FormLabel, Input, RadioButton, Select } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const PAYMENT_METHODS: PaymentMethod[] = ['BANK_ACCOUNT', 'OTHER'];

interface FaPersonPaymentCardProps {
  index: number;
  role: PersonRole;
  applicationType: ApplicationType;
}

/** Payment + (for NEW) interpreter/work details for one person (errand_fa_person). */
export const FaPersonPaymentCard: React.FC<FaPersonPaymentCardProps> = ({ index, role, applicationType }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const paymentMethod = watch(`persons.${index}.paymentMethod` as const);
  const needsInterpreter = watch(`persons.${index}.needsInterpreter` as const);
  const hadWork = watch(`persons.${index}.hadWorkLast12Months` as const);
  const sameAsPrevious = watch(`persons.${index}.paymentSameAsPrevious` as const);
  const isNew = applicationType === 'NEW';

  const setBool = (
    field: 'needsInterpreter' | 'hadWorkLast12Months' | 'paymentSameAsPrevious',
    value: boolean,
  ) => setValue(`persons.${index}.${field}` as const, value, { shouldDirty: true });

  const yesNo = (
    field: 'needsInterpreter' | 'hadWorkLast12Months' | 'paymentSameAsPrevious',
    current: boolean | null,
    label: string,
    cy: string,
  ) => (
    <FormControl data-cy={cy}>
      <FormLabel className="font-bold">{label}</FormLabel>
      <RadioButton.Group inline>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-yes`}
          checked={current === true}
          onChange={() => {}}
          onClick={() => setBool(field, true)}
        >
          {t('financial-assistance:common.yes')}
        </RadioButton>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-no`}
          checked={current === false}
          onChange={() => {}}
          onClick={() => setBool(field, false)}
        >
          {t('financial-assistance:common.no')}
        </RadioButton>
      </RadioButton.Group>
    </FormControl>
  );

  return (
    <Card data-cy={`fa-person-${index}`} className="flex flex-col gap-16 p-24">
      <h4 className="text-h5-md font-bold">{t(`financial-assistance:recipient.${role}`)}</h4>

      <FormControl className="w-full max-w-[24rem]">
        <FormLabel htmlFor={`fa-person-${index}-payment-method`}>
          {t('financial-assistance:payment.methodLabel')}
        </FormLabel>
        <Select
          id={`fa-person-${index}-payment-method`}
          className="w-full"
          value={paymentMethod || ''}
          onSelectValue={(next) =>
            setValue(`persons.${index}.paymentMethod` as const, (next as PaymentMethod | '') || '', {
              shouldDirty: true,
            })
          }
        >
          <Select.Option value="" disabled>
            {t('financial-assistance:economy.select')}
          </Select.Option>
          {PAYMENT_METHODS.map((value) => (
            <Select.Option key={value} value={value}>
              {t(`financial-assistance:paymentMethod.${value}`)}
            </Select.Option>
          ))}
        </Select>
      </FormControl>

      {paymentMethod === 'BANK_ACCOUNT' ? (
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-person-${index}-clearing`}>
              {t('financial-assistance:payment.clearingLabel')}
            </FormLabel>
            <Input id={`fa-person-${index}-clearing`} {...register(`persons.${index}.clearingNumber` as const)} />
          </FormControl>
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-person-${index}-account`}>
              {t('financial-assistance:payment.accountLabel')}
            </FormLabel>
            <Input id={`fa-person-${index}-account`} {...register(`persons.${index}.accountNumber` as const)} />
          </FormControl>
        </div>
      ) : null}

      {paymentMethod === 'OTHER' ? (
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-person-${index}-other-payment`}>
            {t('financial-assistance:payment.otherDescriptionLabel')}
          </FormLabel>
          <Input
            id={`fa-person-${index}-other-payment`}
            {...register(`persons.${index}.otherPaymentDescription` as const)}
          />
        </FormControl>
      ) : null}

      {!isNew
        ? yesNo(
            'paymentSameAsPrevious',
            sameAsPrevious,
            t('financial-assistance:payment.sameAsPreviousLabel'),
            `fa-person-${index}-same-as-previous`,
          )
        : null}

      {isNew ? (
        <>
          {yesNo(
            'needsInterpreter',
            needsInterpreter,
            t('financial-assistance:payment.needsInterpreterLabel'),
            `fa-person-${index}-needs-interpreter`,
          )}
          {needsInterpreter === true ? (
            <FormControl className="w-full max-w-[24rem]">
              <FormLabel htmlFor={`fa-person-${index}-interpreter-language`}>
                {t('financial-assistance:payment.interpreterLanguageLabel')}
              </FormLabel>
              <Input
                id={`fa-person-${index}-interpreter-language`}
                {...register(`persons.${index}.interpreterLanguage` as const)}
              />
            </FormControl>
          ) : null}

          {yesNo(
            'hadWorkLast12Months',
            hadWork,
            t('financial-assistance:payment.hadWorkLabel'),
            `fa-person-${index}-had-work`,
          )}
          {hadWork === true ? (
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-person-${index}-had-work-description`}>
                {t('financial-assistance:payment.hadWorkDescriptionLabel')}
              </FormLabel>
              <Input
                id={`fa-person-${index}-had-work-description`}
                {...register(`persons.${index}.hadWorkDescription` as const)}
              />
            </FormControl>
          ) : null}
        </>
      ) : null}
    </Card>
  );
};
