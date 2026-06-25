import { FinancialAssistanceFormData, emptyPendingBenefit } from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, RadioButton, Textarea } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaAssetSelector } from '../components/fa-asset-selector.component';
import { FaIncomeSelector } from '../components/fa-income-selector.component';
import { FaPendingBenefitCard } from '../components/fa-pending-benefit-card.component';
import { FaStepProps } from './fa-step-registry';

type GateField = 'hasIncomes' | 'hasPendingBenefits' | 'hasAssets';

/** Grupp 3 — inkomster, väntande ersättningar och tillgångar (ej tilläggsansökan). */
export const StepIncome: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const isNew = applicationType === 'NEW';
  const showRecipient = watch('maritalStatus') === 'COHABITING';
  const ni = showRecipient ? { context: 'ni' } : undefined;
  const livelihoodDescription = watch('livelihoodDescription');

  // Nyansökan: obligatorisk fritext om försörjning innan man går vidare.
  const forwardDisabled = isNew && livelihoodDescription.trim() === '';

  const pendingBenefits = useFieldArray({ control, name: 'pendingBenefits' });

  const hasIncomes = watch('hasIncomes');
  const hasPendingBenefits = watch('hasPendingBenefits');
  const hasAssets = watch('hasAssets');
  const incomes = watch('incomes');
  const assets = watch('assets');

  // Inkomster/tillgångar väljs via rutorna (FaIncomeSelector/FaAssetSelector) — ingen auto-rad.
  // På "Nej" rensas tidigare ifyllda poster.
  useEffect(() => {
    if (hasIncomes === false && incomes.length > 0) setValue('incomes', [], { shouldDirty: true });
  }, [hasIncomes, incomes, setValue]);

  useEffect(() => {
    if (hasAssets === false && assets.length > 0) setValue('assets', [], { shouldDirty: true });
  }, [hasAssets, assets, setValue]);

  useEffect(() => {
    if (hasPendingBenefits === true && pendingBenefits.fields.length === 0)
      pendingBenefits.append(emptyPendingBenefit(), { shouldFocus: false });
    else if (hasPendingBenefits === false && pendingBenefits.fields.length > 0)
      setValue('pendingBenefits', [], { shouldDirty: true });
  }, [hasPendingBenefits, pendingBenefits, setValue]);

  const renderGate = (field: GateField, value: boolean | null, label: string, info: string, cy: string) => (
    <FormControl data-cy={cy}>
      <FormLabel className="font-bold">{label}</FormLabel>
      <p className="text-small text-dark-secondary mb-8">{info}</p>
      <RadioButton.Group inline>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-yes`}
          checked={value === true}
          onChange={() => {}}
          onClick={() => setValue(field, true, { shouldDirty: true })}
        >
          {t('financial-assistance:common.yes')}
        </RadioButton>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-no`}
          checked={value === false}
          onChange={() => {}}
          onClick={() => setValue(field, false, { shouldDirty: true })}
        >
          {t('financial-assistance:common.no')}
        </RadioButton>
      </RadioButton.Group>
    </FormControl>
  );

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-income">
      <header className="text-content">
        <h2>{t('financial-assistance:income.heading')}</h2>
      </header>

      {/* Nyansökan: obligatorisk fritext om anledning + försörjning de senaste månaderna. */}
      {isNew ? (
        <FormControl data-cy="fa-livelihood" className="w-full">
          <FormLabel className="font-bold">{t('financial-assistance:income.livelihoodLabel')}</FormLabel>
          <Textarea
            className="w-full min-h-96"
            data-cy="fa-livelihood-description"
            value={livelihoodDescription}
            onChange={(event) => setValue('livelihoodDescription', event.target.value, { shouldDirty: true })}
          />
        </FormControl>
      ) : null}

      <section className="flex flex-col gap-16" data-cy="fa-incomes">
        {renderGate(
          'hasIncomes',
          hasIncomes,
          t('financial-assistance:economy.hasIncomesLabel', ni),
          t('financial-assistance:income.incomesInfo', ni),
          'fa-has-incomes',
        )}
        {hasIncomes === true ? <FaIncomeSelector showRecipient={showRecipient} /> : null}
      </section>

      <section className="flex flex-col gap-16" data-cy="fa-pending-benefits">
        {renderGate(
          'hasPendingBenefits',
          hasPendingBenefits,
          t('financial-assistance:economy.hasPendingBenefitsLabel', ni),
          t('financial-assistance:income.pendingBenefitsInfo', ni),
          'fa-has-pending-benefits',
        )}
        {hasPendingBenefits === true ? (
          <>
            {pendingBenefits.fields.map((field, index) => (
              <FaPendingBenefitCard key={field.id} index={index} onRemove={() => pendingBenefits.remove(index)} />
            ))}
            <div>
              <Button
                variant="link"
                size="sm"
                data-cy="fa-pending-benefit-add"
                onClick={() => pendingBenefits.append(emptyPendingBenefit())}
                leftIcon={<Icon icon={<Plus />} />}
              >
                {t('financial-assistance:economy.addPendingBenefit')}
              </Button>
            </div>
          </>
        ) : null}
      </section>

      <section className="flex flex-col gap-16" data-cy="fa-assets">
        {renderGate(
          'hasAssets',
          hasAssets,
          t('financial-assistance:economy.hasAssetsLabel', ni),
          t('financial-assistance:income.assetsInfo'),
          'fa-has-assets',
        )}
        {hasAssets === true ? <FaAssetSelector /> : null}
      </section>

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={forwardDisabled} />
    </section>
  );
};
