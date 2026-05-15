import {
  Barn,
  CIVILSTAND_VALUES,
  Civilstand,
  EconomicAidApplicationV1,
} from '@interfaces/economic-aid';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  RadioButton,
  Textarea,
} from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { BarnFormCard } from '../components/barn-form-card.component';
import { StepNavigation } from '../components/step-navigation.component';
import { TolkSprakPicker } from '../components/tolk-sprak-picker.component';
import { StepProps } from './step-registry';

const PERSONNUMMER_PATTERN = /^\d{8}-\d{4}$/;
const FORANDRING_BESKRIVNING_MAX = 500;

const CIVILSTAND_LABELS: Record<Civilstand, string> = {
  gift: 'Gift eller registrerad partner',
  sambo: 'Sambo',
  ensamstaende: 'Ensamstående (ogift, skild, änka, änkling)',
};

const CIVILSTAND_WITH_PARTNER: ReadonlySet<Civilstand> = new Set(['gift', 'sambo']);

const emptyBarn = (): Barn => ({
  fornamn: '',
  efternamn: '',
  personnummer: '',
  borIHemmet: null,
});

type BooleanFieldName =
  | 'hushall.harBarnUnder21'
  | 'hushall.forandringBarnSedanSenasteAnsokan'
  | 'hushall.medsokande.behoverTolk';

const RequiredMark: React.FC = () => (
  <span aria-hidden="true" className="text-error ml-4">
    *
  </span>
);

const validateBoolean =
  (message: string) =>
  (value: unknown): true | string =>
    value === true || value === false || message;

export const StepHushall: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { register, watch, formState, trigger, getValues, setValue, control } =
    useFormContext<EconomicAidApplicationV1>();

  const { fields: barnFields, append: appendBarn, remove: removeBarn } = useFieldArray({
    control,
    name: 'hushall.barn',
  });

  const errors = formState.errors.hushall;
  const civilstand = watch('hushall.civilstand');
  const harBarnUnder21 = watch('hushall.harBarnUnder21');
  const forandringBarn = watch('hushall.forandringBarnSedanSenasteAnsokan');
  const forandringBeskrivning = watch('hushall.forandringBeskrivning') ?? '';
  const medsokandeBehoverTolk = watch('hushall.medsokande.behoverTolk');
  const medsokandeTolkSprak = watch('hushall.medsokande.tolkSprak');
  const applicationKind = watch('vagval.kind');

  const showFortandringFraga = applicationKind === 'RETURNING' && harBarnUnder21 === true;
  const showMedsokande = civilstand !== null && CIVILSTAND_WITH_PARTNER.has(civilstand);

  // Säkra minst en rad när användaren svarar Ja, töm listan när hen ångrar.
  useEffect(() => {
    if (harBarnUnder21 === true && barnFields.length === 0) {
      appendBarn(emptyBarn(), { shouldFocus: false });
    } else if (harBarnUnder21 === false && barnFields.length > 0) {
      setValue('hushall.barn', [], { shouldDirty: true, shouldValidate: false });
    }
  }, [harBarnUnder21, barnFields.length, appendBarn, setValue]);

  useEffect(() => {
    register('hushall.civilstand', {
      validate: (value) =>
        (typeof value === 'string' && CIVILSTAND_VALUES.includes(value as Civilstand)) ||
        'Välj civilstånd',
    });
    register('hushall.harBarnUnder21', {
      validate: validateBoolean('Ange om du har barn under 21 år som bor i hemmet'),
    });
    register('hushall.forandringBarnSedanSenasteAnsokan', {
      validate: (value) => {
        if (
          getValues('vagval.kind') !== 'RETURNING' ||
          getValues('hushall.harBarnUnder21') !== true
        ) {
          return true;
        }
        return value === true || value === false || 'Ange om barnens situation har förändrats';
      },
    });
    register('hushall.medsokande.behoverTolk', {
      validate: (value) => {
        const cs = getValues('hushall.civilstand');
        if (!cs || !CIVILSTAND_WITH_PARTNER.has(cs)) return true;
        return value === true || value === false || 'Ange om medsökande behöver tolk';
      },
    });
    register('hushall.medsokande.tolkSprak', {
      validate: (value) => {
        const cs = getValues('hushall.civilstand');
        if (!cs || !CIVILSTAND_WITH_PARTNER.has(cs)) return true;
        if (getValues('hushall.medsokande.behoverTolk') !== true) return true;
        return value.trim().length > 0 || 'Ange vilket språk medsökande behöver tolk på';
      },
    });
  }, [register, getValues]);

  const setBoolean = (name: BooleanFieldName, value: boolean) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const setCivilstand = (value: Civilstand) =>
    setValue('hushall.civilstand', value, { shouldDirty: true, shouldValidate: true });

  const handleNext = async () => {
    const ok = await trigger('hushall');
    if (ok) onNext();
  };

  return (
    <section
      className="flex flex-col gap-32"
      aria-labelledby="economic-aid-step-hushall-heading"
      data-cy="economic-aid-step-hushall"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-hushall-heading">Hushåll</h2>
        <p>Uppgifter om dig och din familj — vi använder dem för att räkna ut riksnormen.</p>
      </header>

      {/* Civilstånd */}
      <FormControl
        invalid={!!errors?.civilstand}
        data-cy="economic-aid-civilstand"
        className="w-full"
      >
        <FormLabel className="font-bold">
          Civilstånd
          <RequiredMark />
        </FormLabel>
        <RadioButton.Group>
          {CIVILSTAND_VALUES.map((value) => (
            <RadioButton
              key={value}
              size="sm"
              name="civilstand"
              id={`economic-aid-civilstand-${value}`}
              data-cy={`economic-aid-civilstand-${value}`}
              value={value}
              checked={civilstand === value}
              onChange={() => {}}
              onClick={() => setCivilstand(value)}
            >
              {CIVILSTAND_LABELS[value]}
            </RadioButton>
          ))}
        </RadioButton.Group>
        {errors?.civilstand?.message ? (
          <FormErrorMessage className="text-error">{errors.civilstand.message}</FormErrorMessage>
        ) : null}
      </FormControl>

      {/* Barn under 21 */}
      <FormControl
        invalid={!!errors?.harBarnUnder21}
        data-cy="economic-aid-har-barn"
        className="w-full"
      >
        <FormLabel className="font-bold">
          Har du/ni barn under 21 år som bor helt eller delvis i hemmet?
          <RequiredMark />
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="harBarnUnder21"
            id="economic-aid-har-barn-yes"
            data-cy="economic-aid-har-barn-yes"
            value="TRUE"
            checked={harBarnUnder21 === true}
            onChange={() => {}}
            onClick={() => setBoolean('hushall.harBarnUnder21', true)}
          >
            Ja
          </RadioButton>
          <RadioButton
            size="sm"
            className="mr-sm"
            name="harBarnUnder21"
            id="economic-aid-har-barn-no"
            data-cy="economic-aid-har-barn-no"
            value="FALSE"
            checked={harBarnUnder21 === false}
            onChange={() => {}}
            onClick={() => setBoolean('hushall.harBarnUnder21', false)}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {errors?.harBarnUnder21?.message ? (
          <FormErrorMessage className="text-error">
            {errors.harBarnUnder21.message}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      {/* Barn — manuell ifyllning, ingen Citizen-uppslagning på tredje part.
          Renderas som ett kort per barn (inte tabell) så fälten ryms i kolumnen. */}
      {harBarnUnder21 === true ? (
        <section
          aria-labelledby="economic-aid-barn-heading"
          data-cy="economic-aid-barn"
          className="flex flex-col gap-16"
        >
          <h3 id="economic-aid-barn-heading" className="text-h4-md font-bold">
            Fyll i barnen
          </h3>

          {barnFields.map((field, idx) => (
            <BarnFormCard
              key={field.id}
              index={idx}
              canRemove={barnFields.length > 1}
              onRemove={() => removeBarn(idx)}
            />
          ))}

          <div>
            <Button
              variant="link"
              size="sm"
              data-cy="economic-aid-barn-add"
              onClick={() => appendBarn(emptyBarn())}
              leftIcon={<Icon icon={<Plus />} />}
            >
              Lägg till barn
            </Button>
          </div>
        </section>
      ) : null}

      {/* Förändring i barnens situation — bara vid återansökan + barn */}
      {showFortandringFraga ? (
        <FormControl
          invalid={!!errors?.forandringBarnSedanSenasteAnsokan}
          data-cy="economic-aid-forandring-barn"
          className="w-full"
        >
          <FormLabel className="font-bold">
            Har det skett förändringar i barnens situation sedan senaste ansökan?
            <RequiredMark />
          </FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="forandringBarn"
              id="economic-aid-forandring-barn-yes"
              data-cy="economic-aid-forandring-barn-yes"
              value="TRUE"
              checked={forandringBarn === true}
              onChange={() => {}}
              onClick={() => setBoolean('hushall.forandringBarnSedanSenasteAnsokan', true)}
            >
              Ja
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="forandringBarn"
              id="economic-aid-forandring-barn-no"
              data-cy="economic-aid-forandring-barn-no"
              value="FALSE"
              checked={forandringBarn === false}
              onChange={() => {}}
              onClick={() => setBoolean('hushall.forandringBarnSedanSenasteAnsokan', false)}
            >
              Nej
            </RadioButton>
          </RadioButton.Group>
          {errors?.forandringBarnSedanSenasteAnsokan?.message ? (
            <FormErrorMessage className="text-error">
              {errors.forandringBarnSedanSenasteAnsokan.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      ) : null}

      {showFortandringFraga && forandringBarn === true ? (
        <FormControl
          invalid={!!errors?.forandringBeskrivning}
          data-cy="economic-aid-forandring-beskrivning"
          className="w-full"
        >
          <FormLabel htmlFor="economic-aid-forandring-beskrivning-input">
            Beskriv förändringen
            <RequiredMark />
          </FormLabel>
          <Textarea
            id="economic-aid-forandring-beskrivning-input"
            data-cy="economic-aid-forandring-beskrivning-input"
            placeholder="Beskriv förändringen..."
            className="w-full min-h-72"
            maxLength={FORANDRING_BESKRIVNING_MAX}
            {...register('hushall.forandringBeskrivning', {
              validate: (value) => {
                if (
                  getValues('vagval.kind') !== 'RETURNING' ||
                  getValues('hushall.harBarnUnder21') !== true ||
                  getValues('hushall.forandringBarnSedanSenasteAnsokan') !== true
                ) {
                  return true;
                }
                if (value.trim().length === 0) return 'Beskriv förändringen i barnens situation';
                if (value.length > FORANDRING_BESKRIVNING_MAX) {
                  return `Beskrivningen får vara max ${FORANDRING_BESKRIVNING_MAX} tecken`;
                }
                return true;
              },
            })}
          />
          <p className="text-small text-dark-secondary mt-4">
            {forandringBeskrivning.length}/{FORANDRING_BESKRIVNING_MAX}
          </p>
          {errors?.forandringBeskrivning?.message ? (
            <FormErrorMessage className="text-error">
              {errors.forandringBeskrivning.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      ) : null}

      {/* Medsökande — visas bara vid civilstand gift/sambo */}
      {showMedsokande ? (
        <section
          aria-labelledby="economic-aid-medsokande-heading"
          data-cy="economic-aid-medsokande"
          className="flex flex-col gap-24"
        >
          <header>
            <h3 id="economic-aid-medsokande-heading" className="text-h4-md">
              Medsökande
            </h3>
            <p className="text-small text-dark-secondary">
              Den make/maka eller sambo som ansöker tillsammans med dig.
            </p>
          </header>

          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
            <FormControl invalid={!!errors?.medsokande?.fornamn} className="w-full">
              <FormLabel htmlFor="economic-aid-medsokande-fornamn">
                Förnamn
                <RequiredMark />
              </FormLabel>
              <Input
                id="economic-aid-medsokande-fornamn"
                data-cy="economic-aid-medsokande-fornamn"
                {...register('hushall.medsokande.fornamn', {
                  validate: (value) => {
                    const cs = getValues('hushall.civilstand');
                    if (!cs || !CIVILSTAND_WITH_PARTNER.has(cs)) return true;
                    return value.trim().length > 0 || 'Förnamn på medsökande krävs';
                  },
                })}
              />
              {errors?.medsokande?.fornamn?.message ? (
                <FormErrorMessage className="text-error">
                  {errors.medsokande.fornamn.message}
                </FormErrorMessage>
              ) : null}
            </FormControl>

            <FormControl invalid={!!errors?.medsokande?.efternamn} className="w-full">
              <FormLabel htmlFor="economic-aid-medsokande-efternamn">
                Efternamn
                <RequiredMark />
              </FormLabel>
              <Input
                id="economic-aid-medsokande-efternamn"
                data-cy="economic-aid-medsokande-efternamn"
                {...register('hushall.medsokande.efternamn', {
                  validate: (value) => {
                    const cs = getValues('hushall.civilstand');
                    if (!cs || !CIVILSTAND_WITH_PARTNER.has(cs)) return true;
                    return value.trim().length > 0 || 'Efternamn på medsökande krävs';
                  },
                })}
              />
              {errors?.medsokande?.efternamn?.message ? (
                <FormErrorMessage className="text-error">
                  {errors.medsokande.efternamn.message}
                </FormErrorMessage>
              ) : null}
            </FormControl>
          </div>

          <FormControl invalid={!!errors?.medsokande?.personnummer} className="w-full">
            <FormLabel htmlFor="economic-aid-medsokande-personnummer">
              Personnummer
              <RequiredMark />
            </FormLabel>
            <Input
              id="economic-aid-medsokande-personnummer"
              data-cy="economic-aid-medsokande-personnummer"
              placeholder="YYYYMMDD-XXXX"
              {...register('hushall.medsokande.personnummer', {
                validate: (value) => {
                  const cs = getValues('hushall.civilstand');
                  if (!cs || !CIVILSTAND_WITH_PARTNER.has(cs)) return true;
                  if (value.trim().length === 0) return 'Personnummer på medsökande krävs';
                  return (
                    PERSONNUMMER_PATTERN.test(value) || 'Personnummer måste anges som YYYYMMDD-XXXX'
                  );
                },
              })}
            />
            {errors?.medsokande?.personnummer?.message ? (
              <FormErrorMessage className="text-error">
                {errors.medsokande.personnummer.message}
              </FormErrorMessage>
            ) : null}
          </FormControl>

          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
            <FormControl invalid={!!errors?.medsokande?.epost} className="w-full">
              <FormLabel htmlFor="economic-aid-medsokande-epost">E-post (frivilligt)</FormLabel>
              <Input
                id="economic-aid-medsokande-epost"
                data-cy="economic-aid-medsokande-epost"
                type="email"
                {...register('hushall.medsokande.epost', {
                  validate: (value) => {
                    const cs = getValues('hushall.civilstand');
                    if (!cs || !CIVILSTAND_WITH_PARTNER.has(cs)) return true;
                    if (value.trim().length === 0) return true;
                    return /^\S+@\S+\.\S+$/.test(value) || 'Ange en giltig e-postadress';
                  },
                })}
              />
              {errors?.medsokande?.epost?.message ? (
                <FormErrorMessage className="text-error">
                  {errors.medsokande.epost.message}
                </FormErrorMessage>
              ) : null}
            </FormControl>

            <FormControl className="w-full">
              <FormLabel htmlFor="economic-aid-medsokande-mobiltelefon">
                Mobiltelefon (frivilligt)
              </FormLabel>
              <Input
                id="economic-aid-medsokande-mobiltelefon"
                data-cy="economic-aid-medsokande-mobiltelefon"
                inputMode="tel"
                placeholder="070-123 45 67"
                {...register('hushall.medsokande.mobiltelefon')}
              />
            </FormControl>
          </div>

          <FormControl
            invalid={!!errors?.medsokande?.behoverTolk}
            data-cy="economic-aid-medsokande-behover-tolk"
            className="w-full"
          >
            <FormLabel className="font-bold">
              Behöver medsökande tolk?
              <RequiredMark />
            </FormLabel>
            <RadioButton.Group inline>
              <RadioButton
                size="sm"
                className="mr-sm"
                name="medsokandeBehoverTolk"
                id="economic-aid-medsokande-behover-tolk-yes"
                data-cy="economic-aid-medsokande-behover-tolk-yes"
                value="TRUE"
                checked={medsokandeBehoverTolk === true}
                onChange={() => {}}
                onClick={() => setBoolean('hushall.medsokande.behoverTolk', true)}
              >
                Ja
              </RadioButton>
              <RadioButton
                size="sm"
                className="mr-sm"
                name="medsokandeBehoverTolk"
                id="economic-aid-medsokande-behover-tolk-no"
                data-cy="economic-aid-medsokande-behover-tolk-no"
                value="FALSE"
                checked={medsokandeBehoverTolk === false}
                onChange={() => {}}
                onClick={() => setBoolean('hushall.medsokande.behoverTolk', false)}
              >
                Nej
              </RadioButton>
            </RadioButton.Group>
            {errors?.medsokande?.behoverTolk?.message ? (
              <FormErrorMessage className="text-error">
                {errors.medsokande.behoverTolk.message}
              </FormErrorMessage>
            ) : null}
          </FormControl>

          {medsokandeBehoverTolk === true ? (
            <TolkSprakPicker
              id="economic-aid-medsokande-tolk-sprak"
              dataCy="economic-aid-medsokande-tolk-sprak"
              label="Ange på vilket språk medsökande behöver tolk"
              value={medsokandeTolkSprak}
              invalid={!!errors?.medsokande?.tolkSprak}
              errorMessage={errors?.medsokande?.tolkSprak?.message}
              onValueChange={(next) =>
                setValue('hushall.medsokande.tolkSprak', next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ) : null}
        </section>
      ) : null}

      <StepNavigation onBack={onBack} onNext={handleNext} />
    </section>
  );
};
