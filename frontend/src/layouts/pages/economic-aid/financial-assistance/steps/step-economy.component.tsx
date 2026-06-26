import { FinancialAssistanceFormData, NormType, PeriodChoice } from '@interfaces/financial-assistance';
import { swedishMonthName } from '@utils/swedish-month';
import { Checkbox, FormControl, FormLabel, RadioButton } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../../components/step-navigation.component';
import { FaCostSelector } from '../components/fa-cost-selector.component';
import { FaNormBoxes } from '../components/fa-norm-boxes.component';
import { FaStepProps } from './fa-step-registry';

// "Annat bistånd" är borttaget som periodval på nyansökan — det behovet täcks av kostnaden
// "Övrigt bistånd", så vi har bara en "Övrigt"-ingång. Här erbjuds därför bara månadsvalen.
const PERIOD_CHOICES: PeriodChoice[] = ['CURRENT_MONTH', 'NEXT_MONTH'];
const NORM_TYPES: NormType[] = ['NATIONAL_NORM', 'OTHER_NORM'];

/** Lägger till/tar bort ett värde ur en flervalslista. */
const toggle = <T,>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

/** Norm-valet som enkel radioknapp (åter- och tilläggsansökan), med infotext per alternativ. */
const NormChoiceSingle: React.FC<{ label: string }> = ({ label }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const normType = watch('normType');
  return (
    <FormControl data-cy="fa-norm-type">
      <FormLabel className="font-bold">{label}</FormLabel>
      <div className="flex flex-col gap-12">
        {NORM_TYPES.map((type) => (
          <div key={type} className="flex flex-col">
            <RadioButton
              size="sm"
              name="fa-norm-type"
              id={`fa-norm-type-${type}`}
              data-cy={`fa-norm-type-${type}`}
              checked={normType === type}
              onChange={() => {}}
              onClick={() => setValue('normType', type, { shouldDirty: true })}
            >
              {t(`financial-assistance:normType.${type}`)}
            </RadioButton>
            <span className="text-small text-dark-secondary ml-32">{t(`financial-assistance:normInfo.${type}`)}</span>
          </div>
        ))}
      </div>
    </FormControl>
  );
};

/** Norm-flerval (nyansökan) — Riksnorm / Annan norm med infotext, minst ett krävs. */
const NormChoiceMulti: React.FC<{ label: string }> = ({ label }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const normTypes = watch('normTypes');
  return (
    <FormControl data-cy="fa-norm-type">
      <FormLabel className="font-bold">{label}</FormLabel>
      <div className="flex flex-col gap-12">
        {NORM_TYPES.map((type) => (
          <div key={type} className="flex flex-col">
            <Checkbox
              checked={normTypes.includes(type)}
              data-cy={`fa-norm-type-${type}`}
              onChange={() => setValue('normTypes', toggle(normTypes, type), { shouldDirty: true })}
            >
              {t(`financial-assistance:normType.${type}`)}
            </Checkbox>
            <span className="text-small text-dark-secondary ml-32">{t(`financial-assistance:normInfo.${type}`)}</span>
          </div>
        ))}
      </div>
    </FormControl>
  );
};

/** Grupp "Ansökan" — ansökningsperiod, norm och kostnader (alla ansökningstyper). */
export const StepEconomy: React.FC<FaStepProps> = ({ applicationType, onBack, onNext }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const isNew = applicationType === 'NEW';
  const isSupplementary = applicationType === 'SUPPLEMENTARY';
  const ni = watch('maritalStatus') === 'COHABITING' ? { context: 'ni' } : undefined;
  const periodChoices = watch('periodChoices');
  const normTypes = watch('normTypes');
  const periodMonth = watch('periodMonth');
  const periodYear = watch('periodYear');

  // "Denna/Nästa månad" visar månadens namn; beräknas från dagens datum (samma logik som derivePeriod).
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const periodChoiceLabel = (choice: PeriodChoice): string => {
    const base = t(`financial-assistance:periodChoice.${choice}`);
    if (choice === 'CURRENT_MONTH') return `${base} (${swedishMonthName(currentMonth)})`;
    if (choice === 'NEXT_MONTH') return `${base} (${swedishMonthName(nextMonth)})`;
    return base;
  };

  // Norm-frågan visas bara när ansökan avser denna och/eller nästa månad.
  const showNorm = periodChoices.includes('CURRENT_MONTH') || periodChoices.includes('NEXT_MONTH');

  // Tilläggsansökan: man måste ange minst en utgift (en kostnad eller en norm) för att kunna ansöka.
  const costs = watch('costs');
  const supplementaryMissingExpense =
    isSupplementary && costs.filter((cost) => cost.costType).length === 0 && normTypes.length === 0;

  // Obligatoriskt: nyansökan kräver minst en period (+ norm när den visas);
  // tilläggsansökan kräver minst en utgift.
  const forwardDisabled =
    (isNew && (periodChoices.length === 0 || (showNorm && normTypes.length === 0))) ||
    supplementaryMissingExpense;

  return (
    <section className="flex flex-col gap-32" data-cy="fa-step-economy">
      <header className="text-content">
        <h2>{t('financial-assistance:economy.heading')}</h2>
      </header>

      {/* Vad avser ansökan? — nyansökan: flerval. Åter-/tilläggsansökan: fast period (läsbar). */}
      {isNew ? (
        <FormControl data-cy="fa-period-choice">
          <FormLabel className="font-bold">{t('financial-assistance:periodNorm.periodChoiceLabel')}</FormLabel>
          <div className="flex flex-col gap-12">
            {PERIOD_CHOICES.map((choice) => (
              <Checkbox
                key={choice}
                checked={periodChoices.includes(choice)}
                id={`fa-period-choice-${choice}`}
                data-cy={`fa-period-choice-${choice}`}
                onChange={() => setValue('periodChoices', toggle(periodChoices, choice), { shouldDirty: true })}
              >
                {periodChoiceLabel(choice)}
              </Checkbox>
            ))}
          </div>
        </FormControl>
      ) : (
        <div className="text-content">
          <p className="font-bold">{t('financial-assistance:periodNorm.periodLabel')}</p>
          <p>
            {periodMonth && periodYear
              ? t('financial-assistance:periodNorm.periodValue', {
                  month: swedishMonthName(periodMonth),
                  year: periodYear,
                })
              : '—'}
          </p>
        </div>
      )}

      {/* Norm — nyansökan: flerval, visas bara vid denna/nästa månad. Åter-: enkelval. Tilläggs-: i "Övrigt". */}
      {isNew ? (
        showNorm ? <NormChoiceMulti label={t('financial-assistance:periodNorm.normTypeLabel', ni)} /> : null
      ) : !isSupplementary ? (
        <NormChoiceSingle label={t('financial-assistance:periodNorm.normTypeLabel', ni)} />
      ) : null}

      {/* Kostnader — markera en eller flera (rutor med checkboxar) */}
      <section className="flex flex-col gap-16" data-cy="fa-costs">
        <div className="text-content flex flex-col gap-4">
          <h3 className="text-h4-md font-bold">
            {t(isSupplementary ? 'financial-assistance:economy.costsHeadingSupplementary' : 'financial-assistance:economy.costsHeading', ni)}
          </h3>
          {/* "Sök endast …"-texten finns bara på nyansökan. Återansökan visar enbart "Inte
              obligatoriskt …"; tilläggsansökan visar ingen hjälptext (minst en utgift krävs ändå). */}
          {isSupplementary ? null : (
            <p className="text-small text-dark-secondary">
              {t(isNew ? 'financial-assistance:economy.costsInfo' : 'financial-assistance:economy.costsInfoRenewal')}
            </p>
          )}
        </div>
        {/* Tilläggsansökan: norm-boxarna (Riksnorm/Annan norm) renderas inuti kostnadernas "Övrigt"
            så att det bara finns en "Övrigt"-rubrik. */}
        <FaCostSelector otherExtra={isSupplementary ? <FaNormBoxes /> : undefined} />
      </section>

      <StepNavigation onBack={onBack} onNext={onNext} forwardDisabled={forwardDisabled} />
    </section>
  );
};
