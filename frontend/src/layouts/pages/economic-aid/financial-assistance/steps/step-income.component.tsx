import {
  FinancialAssistanceFormData,
  emptyAsset,
  emptyIncome,
  emptyPendingBenefit,
} from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, RadioButton } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaAssetCard } from '../components/fa-asset-card.component';
import { FaIncomeCard } from '../components/fa-income-card.component';
import { FaPendingBenefitCard } from '../components/fa-pending-benefit-card.component';
import { FaStepProps } from './fa-step-registry';

type GateField = 'hasIncomes' | 'hasPendingBenefits' | 'hasAssets';

/** Grupp 3 — inkomster, väntande ersättningar och tillgångar (ej tilläggsansökan). */
export const StepIncome: React.FC<FaStepProps> = ({ onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const showRecipient = watch('maritalStatus') === 'COHABITING';
  const ni = showRecipient ? { context: 'ni' } : undefined;

  const incomes = useFieldArray({ control, name: 'incomes' });
  const pendingBenefits = useFieldArray({ control, name: 'pendingBenefits' });
  const assets = useFieldArray({ control, name: 'assets' });

  const hasIncomes = watch('hasIncomes');
  const hasPendingBenefits = watch('hasPendingBenefits');
  const hasAssets = watch('hasAssets');

  useEffect(() => {
    if (hasIncomes === true && incomes.fields.length === 0) incomes.append(emptyIncome(), { shouldFocus: false });
    else if (hasIncomes === false && incomes.fields.length > 0) setValue('incomes', [], { shouldDirty: true });
  }, [hasIncomes, incomes, setValue]);

  useEffect(() => {
    if (hasPendingBenefits === true && pendingBenefits.fields.length === 0)
      pendingBenefits.append(emptyPendingBenefit(), { shouldFocus: false });
    else if (hasPendingBenefits === false && pendingBenefits.fields.length > 0)
      setValue('pendingBenefits', [], { shouldDirty: true });
  }, [hasPendingBenefits, pendingBenefits, setValue]);

  useEffect(() => {
    if (hasAssets === true && assets.fields.length === 0) assets.append(emptyAsset(), { shouldFocus: false });
    else if (hasAssets === false && assets.fields.length > 0) setValue('assets', [], { shouldDirty: true });
  }, [hasAssets, assets, setValue]);

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

      <section className="flex flex-col gap-16" data-cy="fa-incomes">
        {renderGate(
          'hasIncomes',
          hasIncomes,
          t('financial-assistance:economy.hasIncomesLabel', ni),
          t('financial-assistance:income.incomesInfo', ni),
          'fa-has-incomes',
        )}
        {hasIncomes === true ? (
          <>
            {incomes.fields.map((field, index) => (
              <FaIncomeCard
                key={field.id}
                index={index}
                showRecipient={showRecipient}
                onRemove={() => incomes.remove(index)}
              />
            ))}
            <div>
              <Button
                variant="link"
                size="sm"
                data-cy="fa-income-add"
                onClick={() => incomes.append(emptyIncome())}
                leftIcon={<Icon icon={<Plus />} />}
              >
                {t('financial-assistance:economy.addIncome')}
              </Button>
            </div>
          </>
        ) : null}
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
        {hasAssets === true ? (
          <>
            {assets.fields.map((field, index) => (
              <FaAssetCard key={field.id} index={index} onRemove={() => assets.remove(index)} />
            ))}
            <div>
              <Button
                variant="link"
                size="sm"
                data-cy="fa-asset-add"
                onClick={() => assets.append(emptyAsset())}
                leftIcon={<Icon icon={<Plus />} />}
              >
                {t('financial-assistance:economy.addAsset')}
              </Button>
            </div>
          </>
        ) : null}
      </section>

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};
