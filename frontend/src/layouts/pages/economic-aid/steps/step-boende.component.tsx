import {
  ANTAL_RUM_VALUES,
  AntalRum,
  BOENDEFORM_VALUES,
  Boendeform,
  EconomicAidApplicationV1,
} from '@interfaces/economic-aid';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  RadioButton,
  Select,
} from '@sk-web-gui/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

const AMOUNT_PATTERN = /^\d{1,7}$/;

const BOENDEFORM_LABELS: Record<Boendeform, string> = {
  hyreslagenhet: 'Hyreslägenhet',
  bostadsratt: 'Bostadsrätt',
  villa: 'Villa',
  andrahand: 'Andrahandshyra',
  inneboende: 'Inneboende',
  annat: 'Annat',
};

const ANTAL_RUM_LABELS: Record<AntalRum, string> = {
  '1_rok': '1 rok (rum och kokvrå)',
  '1_rk': '1 rk (rum och kök)',
  '2_rk': '2 rk',
  '3_rk': '3 rk',
  '4_rk': '4 rk',
  '5_rk': '5 rk',
  '6plus_rk': '6 rk eller fler',
};

type BooleanFieldName = 'boende.garagePplatsIngar';

const RequiredMark: React.FC = () => (
  <span aria-hidden="true" className="text-error ml-4">
    *
  </span>
);

const validateBoolean =
  (message: string) =>
  (value: unknown): true | string =>
    value === true || value === false || message;

const validateAmount =
  (message: string) =>
  (value: string): true | string => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return message;
    return AMOUNT_PATTERN.test(trimmed) || 'Ange ett belopp i hela kronor (siffror)';
  };

export const StepBoende: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { register, watch, formState, trigger, setValue } =
    useFormContext<EconomicAidApplicationV1>();

  const errors = formState.errors.boende;
  const boendeform = watch('boende.boendeform');
  const antalRum = watch('boende.antalRum');
  const garagePplatsIngar = watch('boende.garagePplatsIngar');

  useEffect(() => {
    register('boende.boendeform', {
      validate: (value) =>
        (typeof value === 'string' && BOENDEFORM_VALUES.includes(value as Boendeform)) ||
        'Välj boendeform',
    });
    register('boende.antalRum', {
      validate: (value) =>
        (typeof value === 'string' && ANTAL_RUM_VALUES.includes(value as AntalRum)) ||
        'Välj antal rum',
    });
    register('boende.garagePplatsIngar', {
      validate: validateBoolean('Ange om garage eller p-plats ingår i hyran'),
    });
  }, [register]);

  const setBoolean = (name: BooleanFieldName, value: boolean) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const setBoendeform = (value: Boendeform | '') => {
    if (value === '') return;
    setValue('boende.boendeform', value, { shouldDirty: true, shouldValidate: true });
  };

  const setAntalRum = (value: AntalRum | '') => {
    if (value === '') return;
    setValue('boende.antalRum', value, { shouldDirty: true, shouldValidate: true });
  };

  const handleNext = async () => {
    const ok = await trigger('boende');
    if (ok) onNext();
  };

  return (
    <section
      className="flex flex-col gap-32"
      aria-labelledby="economic-aid-step-boende-heading"
      data-cy="economic-aid-step-boende"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-boende-heading">Boende</h2>
        <p>
          Uppgifter om hur du bor och dina boendekostnader. Belopp anges i hela kronor per
          månad.
        </p>
        <p className="text-small text-dark-secondary mt-8">
          Du kan bifoga hyresavi och fakturor senare via ditt ärende.
        </p>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
        <FormControl
          invalid={!!errors?.boendeform}
          data-cy="economic-aid-boendeform"
          className="w-full"
        >
          <FormLabel htmlFor="economic-aid-boendeform-select">
            Boendeform
            <RequiredMark />
          </FormLabel>
          <Select
            id="economic-aid-boendeform-select"
            data-cy="economic-aid-boendeform-select"
            className="w-full"
            value={boendeform ?? ''}
            onChange={(event) => setBoendeform(event.target.value as Boendeform | '')}
          >
            <Select.Option value="" disabled>
              Välj boendeform
            </Select.Option>
            {BOENDEFORM_VALUES.map((value) => (
              <Select.Option key={value} value={value}>
                {BOENDEFORM_LABELS[value]}
              </Select.Option>
            ))}
          </Select>
          {errors?.boendeform?.message ? (
            <FormErrorMessage className="text-error">
              {errors.boendeform.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl
          invalid={!!errors?.antalRum}
          data-cy="economic-aid-antal-rum"
          className="w-full"
        >
          <FormLabel htmlFor="economic-aid-antal-rum-select">
            Antal rum
            <RequiredMark />
          </FormLabel>
          <Select
            id="economic-aid-antal-rum-select"
            data-cy="economic-aid-antal-rum-select"
            className="w-full"
            value={antalRum ?? ''}
            onChange={(event) => setAntalRum(event.target.value as AntalRum | '')}
          >
            <Select.Option value="" disabled>
              Välj antal rum
            </Select.Option>
            {ANTAL_RUM_VALUES.map((value) => (
              <Select.Option key={value} value={value}>
                {ANTAL_RUM_LABELS[value]}
              </Select.Option>
            ))}
          </Select>
          {errors?.antalRum?.message ? (
            <FormErrorMessage className="text-error">{errors.antalRum.message}</FormErrorMessage>
          ) : null}
        </FormControl>
      </div>

      <FormControl
        invalid={!!errors?.manadskostnad}
        data-cy="economic-aid-manadskostnad"
        className="w-full"
      >
        <FormLabel htmlFor="economic-aid-manadskostnad-input">
          Månadshyra eller boendekostnad (kr/mån)
          <RequiredMark />
        </FormLabel>
        <Input
          id="economic-aid-manadskostnad-input"
          data-cy="economic-aid-manadskostnad-input"
          inputMode="numeric"
          placeholder="t.ex. 7500"
          {...register('boende.manadskostnad', {
            validate: validateAmount('Ange din månadshyra eller boendekostnad'),
          })}
        />
        {errors?.manadskostnad?.message ? (
          <FormErrorMessage className="text-error">
            {errors.manadskostnad.message}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      <FormControl
        invalid={!!errors?.garagePplatsIngar}
        data-cy="economic-aid-garage"
        className="w-full"
      >
        <FormLabel className="font-bold">
          Ingår garage eller parkeringsplats i hyran?
          <RequiredMark />
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="garagePplatsIngar"
            id="economic-aid-garage-yes"
            data-cy="economic-aid-garage-yes"
            value="TRUE"
            checked={garagePplatsIngar === true}
            onChange={() => {}}
            onClick={() => setBoolean('boende.garagePplatsIngar', true)}
          >
            Ja
          </RadioButton>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="garagePplatsIngar"
            id="economic-aid-garage-no"
            data-cy="economic-aid-garage-no"
            value="FALSE"
            checked={garagePplatsIngar === false}
            onChange={() => {}}
            onClick={() => setBoolean('boende.garagePplatsIngar', false)}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {errors?.garagePplatsIngar?.message ? (
          <FormErrorMessage className="text-error">
            {errors.garagePplatsIngar.message}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
        <FormControl
          invalid={!!errors?.hushallsel}
          data-cy="economic-aid-hushallsel"
          className="w-full"
        >
          <FormLabel htmlFor="economic-aid-hushallsel-input">
            Hushållsel (kr/mån)
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-hushallsel-input"
            data-cy="economic-aid-hushallsel-input"
            inputMode="numeric"
            placeholder="t.ex. 350"
            {...register('boende.hushallsel', {
              validate: validateAmount('Ange din kostnad för hushållsel (skriv 0 om den ingår i hyran)'),
            })}
          />
          {errors?.hushallsel?.message ? (
            <FormErrorMessage className="text-error">
              {errors.hushallsel.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl
          invalid={!!errors?.hemforsakring}
          data-cy="economic-aid-hemforsakring"
          className="w-full"
        >
          <FormLabel htmlFor="economic-aid-hemforsakring-input">
            Hemförsäkring (kr/mån)
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-hemforsakring-input"
            data-cy="economic-aid-hemforsakring-input"
            inputMode="numeric"
            placeholder="t.ex. 150"
            {...register('boende.hemforsakring', {
              validate: validateAmount('Ange din kostnad för hemförsäkring (skriv 0 om du saknar)'),
            })}
          />
          {errors?.hemforsakring?.message ? (
            <FormErrorMessage className="text-error">
              {errors.hemforsakring.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      </div>

      <StepNavigation onBack={onBack} onNext={handleNext} />
    </section>
  );
};
