import {
  EconomicAidApplicationV1,
  SYSSELSATTNING_VALUES,
  Sysselsattning,
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

const SYSSELSATTNING_LABELS: Record<Sysselsattning, string> = {
  arbetssokande: 'Arbetssökande',
  anstalld: 'Anställd',
  sjukskriven: 'Sjukskriven',
  foraldraledig: 'Föräldraledig',
  studerar: 'Studerar',
  annat: 'Annat',
};

type BooleanFieldName =
  | 'sysselsattning.registreradHosAf'
  | 'sysselsattning.studerar'
  | 'sysselsattning.sjukskriven';

const RequiredMark: React.FC = () => (
  <span aria-hidden="true" className="text-error ml-4">
    *
  </span>
);

const validateBoolean =
  (message: string) =>
  (value: unknown): true | string =>
    value === true || value === false || message;

export const StepSysselsattning: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { register, watch, formState, trigger, getValues, setValue } =
    useFormContext<EconomicAidApplicationV1>();

  const errors = formState.errors.sysselsattning;
  const nuvarandeSysselsattning = watch('sysselsattning.nuvarandeSysselsattning');
  const registreradHosAf = watch('sysselsattning.registreradHosAf');
  const studerar = watch('sysselsattning.studerar');
  const sjukskriven = watch('sysselsattning.sjukskriven');

  const showAfFraga = nuvarandeSysselsattning === 'arbetssokande';

  useEffect(() => {
    register('sysselsattning.nuvarandeSysselsattning', {
      validate: (value) =>
        (typeof value === 'string' &&
          SYSSELSATTNING_VALUES.includes(value as Sysselsattning)) ||
        'Välj nuvarande sysselsättning',
    });
    register('sysselsattning.registreradHosAf', {
      validate: (value) => {
        if (getValues('sysselsattning.nuvarandeSysselsattning') !== 'arbetssokande') {
          return true;
        }
        return value === true || value === false || 'Ange om du är registrerad hos Arbetsförmedlingen';
      },
    });
    register('sysselsattning.studerar', {
      validate: validateBoolean('Ange om du studerar'),
    });
    register('sysselsattning.larosateSkolform', {
      validate: (value) => {
        if (getValues('sysselsattning.studerar') !== true) return true;
        return value.trim().length > 0 || 'Ange lärosäte eller skolform';
      },
    });
    register('sysselsattning.sjukskriven', {
      validate: validateBoolean('Ange om du är sjukskriven'),
    });
  }, [register, getValues]);

  const setBoolean = (name: BooleanFieldName, value: boolean) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const setSysselsattning = (value: Sysselsattning | '') => {
    if (value === '') return;
    setValue('sysselsattning.nuvarandeSysselsattning', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleNext = async () => {
    const ok = await trigger('sysselsattning');
    if (ok) onNext();
  };

  return (
    <section
      className="flex flex-col gap-32"
      aria-labelledby="economic-aid-step-sysselsattning-heading"
      data-cy="economic-aid-step-sysselsattning"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-sysselsattning-heading">Sysselsättning</h2>
        <p>Uppgifter om vad du gör nu — det styr vilka kontakter och kontroller som behövs.</p>
        <p className="text-small text-dark-secondary mt-8">
          Du kan bifoga AF-intyg, läkarintyg eller andra underlag senare via ditt ärende.
        </p>
      </header>

      <FormControl
        invalid={!!errors?.nuvarandeSysselsattning}
        data-cy="economic-aid-nuvarande-sysselsattning"
        className="w-full"
      >
        <FormLabel htmlFor="economic-aid-nuvarande-sysselsattning-select">
          Nuvarande sysselsättning
          <RequiredMark />
        </FormLabel>
        <Select
          id="economic-aid-nuvarande-sysselsattning-select"
          data-cy="economic-aid-nuvarande-sysselsattning-select"
          className="w-full"
          value={nuvarandeSysselsattning ?? ''}
          onChange={(event) => setSysselsattning(event.target.value as Sysselsattning | '')}
        >
          <Select.Option value="" disabled>
            Välj sysselsättning
          </Select.Option>
          {SYSSELSATTNING_VALUES.map((value) => (
            <Select.Option key={value} value={value}>
              {SYSSELSATTNING_LABELS[value]}
            </Select.Option>
          ))}
        </Select>
        {errors?.nuvarandeSysselsattning?.message ? (
          <FormErrorMessage className="text-error">
            {errors.nuvarandeSysselsattning.message}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      {showAfFraga ? (
        <FormControl
          invalid={!!errors?.registreradHosAf}
          data-cy="economic-aid-af-registrerad"
          className="w-full"
        >
          <FormLabel className="font-bold">
            Är du registrerad hos Arbetsförmedlingen?
            <RequiredMark />
          </FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="registreradHosAf"
              id="economic-aid-af-yes"
              data-cy="economic-aid-af-yes"
              value="TRUE"
              checked={registreradHosAf === true}
              onChange={() => {}}
              onClick={() => setBoolean('sysselsattning.registreradHosAf', true)}
            >
              Ja
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="registreradHosAf"
              id="economic-aid-af-no"
              data-cy="economic-aid-af-no"
              value="FALSE"
              checked={registreradHosAf === false}
              onChange={() => {}}
              onClick={() => setBoolean('sysselsattning.registreradHosAf', false)}
            >
              Nej
            </RadioButton>
          </RadioButton.Group>
          {errors?.registreradHosAf?.message ? (
            <FormErrorMessage className="text-error">
              {errors.registreradHosAf.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      ) : null}

      <FormControl
        invalid={!!errors?.studerar}
        data-cy="economic-aid-studerar"
        className="w-full"
      >
        <FormLabel className="font-bold">
          Studerar du?
          <RequiredMark />
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="studerar"
            id="economic-aid-studerar-yes"
            data-cy="economic-aid-studerar-yes"
            value="TRUE"
            checked={studerar === true}
            onChange={() => {}}
            onClick={() => setBoolean('sysselsattning.studerar', true)}
          >
            Ja
          </RadioButton>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="studerar"
            id="economic-aid-studerar-no"
            data-cy="economic-aid-studerar-no"
            value="FALSE"
            checked={studerar === false}
            onChange={() => {}}
            onClick={() => setBoolean('sysselsattning.studerar', false)}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {errors?.studerar?.message ? (
          <FormErrorMessage className="text-error">
            {errors.studerar.message}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      {studerar === true ? (
        <FormControl
          invalid={!!errors?.larosateSkolform}
          data-cy="economic-aid-larosate"
          className="w-full"
        >
          <FormLabel htmlFor="economic-aid-larosate-input">
            Lärosäte eller skolform
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-larosate-input"
            data-cy="economic-aid-larosate-input"
            placeholder="t.ex. Mittuniversitetet, gymnasium, SFI"
            {...register('sysselsattning.larosateSkolform', {
              validate: (value) => {
                if (getValues('sysselsattning.studerar') !== true) return true;
                return value.trim().length > 0 || 'Ange lärosäte eller skolform';
              },
            })}
          />
          {errors?.larosateSkolform?.message ? (
            <FormErrorMessage className="text-error">
              {errors.larosateSkolform.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      ) : null}

      <FormControl
        invalid={!!errors?.sjukskriven}
        data-cy="economic-aid-sjukskriven"
        className="w-full"
      >
        <FormLabel className="font-bold">
          Är du sjukskriven?
          <RequiredMark />
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="sjukskriven"
            id="economic-aid-sjukskriven-yes"
            data-cy="economic-aid-sjukskriven-yes"
            value="TRUE"
            checked={sjukskriven === true}
            onChange={() => {}}
            onClick={() => setBoolean('sysselsattning.sjukskriven', true)}
          >
            Ja
          </RadioButton>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="sjukskriven"
            id="economic-aid-sjukskriven-no"
            data-cy="economic-aid-sjukskriven-no"
            value="FALSE"
            checked={sjukskriven === false}
            onChange={() => {}}
            onClick={() => setBoolean('sysselsattning.sjukskriven', false)}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {errors?.sjukskriven?.message ? (
          <FormErrorMessage className="text-error">
            {errors.sjukskriven.message}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      <StepNavigation onBack={onBack} onNext={handleNext} />
    </section>
  );
};
