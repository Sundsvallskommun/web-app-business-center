import { ApplicationKind, EconomicAidApplicationV1 } from '@interfaces/economic-aid';
import { FormControl, FormLabel, RadioButton } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

const KIND_OPTIONS: { value: ApplicationKind; label: string; helper: string }[] = [
  {
    value: 'RETURNING',
    label: 'Ja, jag har en tidigare ansökan',
    helper: 'Vi fyller i dina uppgifter automatiskt där det går.',
  },
  {
    value: 'NEW',
    label: 'Nej, detta är min första ansökan',
    helper: 'Du fyller i alla uppgifter själv.',
  },
];

const cardClass = (checked: boolean): string =>
  [
    'flex items-start gap-16 p-20 rounded-12 cursor-pointer border-2 transition',
    'hover:border-vattjom-surface-primary',
    checked
      ? 'border-vattjom-surface-primary bg-vattjom-background-100'
      : 'border-divider bg-background-content',
  ].join(' ');

export const StepVagval: React.FC<StepProps> = ({ onNext }) => {
  const { watch, setValue } = useFormContext<EconomicAidApplicationV1>();
  const kind = watch('vagval.kind');

  const select = (value: ApplicationKind) => setValue('vagval.kind', value, { shouldDirty: true });

  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-vagval-heading"
      data-cy="economic-aid-step-vagval"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-vagval-heading">Har du ansökt om ekonomiskt bistånd hos oss tidigare?</h2>
        <p>Om du har en tidigare ansökan kan vi fylla i dina uppgifter automatiskt.</p>
      </header>

      <FormControl>
        <FormLabel className="sr-only">Välj typ av ansökan</FormLabel>
        {/*
          RadioButton.Group injicerar `flex flex-row` och en fix label-höjd, vilket
          krockar med en kort-layout. Vi roller-grupperar därför själva och låter
          varje RadioButton bara vara markören — kortets klickbara yta är wrappern.
        */}
        <div role="radiogroup" aria-labelledby="economic-aid-step-vagval-heading" className="grid gap-16 desktop:grid-cols-2">
          {KIND_OPTIONS.map((option) => {
            const checked = kind === option.value;
            const inputId = `vagvalKind-${option.value}`;
            return (
              <div
                key={option.value}
                className={cardClass(checked)}
                onClick={() => select(option.value)}
                data-cy={`economic-aid-vagval-${option.value.toLowerCase()}`}
              >
                <RadioButton
                  size="md"
                  name="vagvalKind"
                  id={inputId}
                  value={option.value}
                  checked={checked}
                  onChange={() => select(option.value)}
                  aria-labelledby={`${inputId}-label`}
                  aria-describedby={`${inputId}-helper`}
                />
                <span className="flex flex-col gap-4">
                  <span id={`${inputId}-label`} className="font-bold">
                    {option.label}
                  </span>
                  <span id={`${inputId}-helper`} className="text-small text-dark-secondary">
                    {option.helper}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </FormControl>

      <StepNavigation onNext={onNext} forwardDisabled={kind === null} />
    </section>
  );
};
