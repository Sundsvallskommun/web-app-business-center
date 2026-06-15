import {
  FinancialAssistanceFormData,
  emptyAsset,
  emptyCost,
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
import { FaCostCard } from '../components/fa-cost-card.component';
import { FaIncomeCard } from '../components/fa-income-card.component';
import { FaPendingBenefitCard } from '../components/fa-pending-benefit-card.component';
import { FaStepProps } from './fa-step-registry';

type GateField = 'hasIncomes' | 'hasPendingBenefits' | 'hasAssets';

/** Grupp 3 — ekonomi. Kostnader (alla typer); inkomster/ersättningar/tillgångar ej tilläggsansökan. */
export const StepEconomy: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const showRecipient = watch('maritalStatus') === 'COHABITING';

  const costs = useFieldArray({ control, name: 'costs' });
  const incomes = useFieldArray({ control, name: 'incomes' });
  const pendingBenefits = useFieldArray({ control, name: 'pendingBenefits' });
  const assets = useFieldArray({ control, name: 'assets' });

  const hasIncomes = watch('hasIncomes');
  const hasPendingBenefits = watch('hasPendingBenefits');
  const hasAssets = watch('hasAssets');

  // Keep at least one row when a gate is "Ja", clear when "Nej".
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

  const renderGate = (field: GateField, value: boolean | null, label: string, cy: string) => (
    <FormControl data-cy={cy}>
      <FormLabel className="font-bold">{label}</FormLabel>
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
    <section className="flex flex-col gap-32" data-cy="fa-step-economy">
      <header className="text-content">
        <h2>{t('financial-assistance:economy.heading')}</h2>
      </header>

      {/* Kostnader — alla ansökningstyper */}
      <section className="flex flex-col gap-16" data-cy="fa-costs">
        <h3 className="text-h4-md font-bold">{t('financial-assistance:economy.costsHeading')}</h3>
        {costs.fields.map((field, index) => (
          <FaCostCard
            key={field.id}
            index={index}
            showRecipientOrPeriod={isSupplementary}
            onRemove={() => costs.remove(index)}
          />
        ))}
        <div>
          <Button
            variant="link"
            size="sm"
            data-cy="fa-cost-add"
            onClick={() => costs.append(emptyCost())}
            leftIcon={<Icon icon={<Plus />} />}
          >
            {t('financial-assistance:economy.addCost')}
          </Button>
        </div>
      </section>

      {/* Inkomster / ersättningar / tillgångar — ej tilläggsansökan */}
      {!isSupplementary ? (
        <>
          <section className="flex flex-col gap-16" data-cy="fa-incomes">
            <h3 className="text-h4-md font-bold">{t('financial-assistance:economy.incomesHeading')}</h3>
            {renderGate('hasIncomes', hasIncomes, t('financial-assistance:economy.hasIncomesLabel'), 'fa-has-incomes')}
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
            <h3 className="text-h4-md font-bold">{t('financial-assistance:economy.pendingBenefitsHeading')}</h3>
            {renderGate(
              'hasPendingBenefits',
              hasPendingBenefits,
              t('financial-assistance:economy.hasPendingBenefitsLabel'),
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
            <h3 className="text-h4-md font-bold">{t('financial-assistance:economy.assetsHeading')}</h3>
            {renderGate('hasAssets', hasAssets, t('financial-assistance:economy.hasAssetsLabel'), 'fa-has-assets')}
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
        </>
      ) : null}

      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};
