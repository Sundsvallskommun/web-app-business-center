import { EconomicAidApplicationV1 } from '@interfaces/economic-aid';
import { RadioButton } from '@sk-web-gui/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

const cardClass = (checked: boolean): string =>
  [
    'flex items-start gap-16 p-20 rounded-12 cursor-pointer border-2 transition',
    'hover:border-vattjom-surface-primary',
    checked ? 'border-vattjom-surface-primary bg-vattjom-background-100' : 'border-divider bg-background-content',
  ].join(' ');

/**
 * Visar de ansökningar caremanagement föreslår (typeSlugs) och låter sökanden
 * välja en. Valet skrivs till `chosenTypeSlug` — då tar financial-assistance-
 * formuläret över (se economic-aid-application).
 */
export const StepFormular: React.FC<StepProps> = ({ onBack }) => {
  const { t } = useTranslation('economic-aid');
  const { watch, setValue } = useFormContext<EconomicAidApplicationV1>();
  const eligibility = watch('eligibility');
  const suggestions = eligibility?.suggestions ?? [];

  const recommended = suggestions.find((suggestion) => suggestion.recommended) ?? suggestions[0];
  const [selected, setSelected] = useState<string>(recommended?.typeSlug ?? '');

  const start = () => {
    if (!selected) return;
    setValue('chosenTypeSlug', selected, { shouldDirty: true });
  };

  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-formular-heading"
      data-cy="economic-aid-step-formular"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-formular-heading">{t('economic-aid:formular.heading')}</h2>
      </header>

      {eligibility?.message && <p className="text-content">{eligibility.message}</p>}

      {suggestions.length > 0 ? (
        <>
          <p className="text-content">{t('economic-aid:formular.intro')}</p>
          <div role="radiogroup" aria-labelledby="economic-aid-step-formular-heading" className="flex flex-col gap-16">
            {suggestions.map((suggestion) => {
              const checked = selected === suggestion.typeSlug;
              const inputId = `economic-aid-suggestion-${suggestion.typeSlug}`;
              return (
                <label key={suggestion.typeSlug} htmlFor={inputId} className={cardClass(checked)} data-cy={inputId}>
                  <RadioButton
                    size="md"
                    name="economic-aid-suggestion"
                    id={inputId}
                    checked={checked}
                    onChange={() => setSelected(suggestion.typeSlug)}
                    aria-labelledby={`${inputId}-label`}
                  />
                  <span id={`${inputId}-label`} className="font-bold">
                    {suggestion.label}
                  </span>
                </label>
              );
            })}
          </div>

          <StepNavigation
            onBack={onBack}
            onNext={start}
            forwardDisabled={!selected}
            forwardLabel={t('economic-aid:formular.start')}
          />
        </>
      ) : (
        <>
          <p className="text-content">{t('economic-aid:formular.empty')}</p>
          <StepNavigation onBack={onBack} />
        </>
      )}
    </section>
  );
};
