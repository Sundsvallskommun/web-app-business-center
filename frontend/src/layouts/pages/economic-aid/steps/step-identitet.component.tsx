import { ApplicantProfile, EconomicAidApplicationV1 } from '@interfaces/economic-aid';
import { useApi } from '@services/api-service';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  RadioButton,
} from '@sk-web-gui/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { StepNavigation } from '../components/step-navigation.component';
import { TolkSprakPicker } from '../components/tolk-sprak-picker.component';
import { StepProps } from './step-registry';

const POSTNUMMER_PATTERN = /^\d{3} \d{2}$/;

type BooleanFieldName =
  | 'identitet.vistelseadressStammer'
  | 'identitet.kontaktViaSms'
  | 'identitet.ansoktSenaste3Manader'
  | 'identitet.behoverTolk';

const RequiredMark: React.FC = () => (
  <span aria-hidden="true" className="text-error ml-4">
    *
  </span>
);

const validateBoolean =
  (message: string) =>
  (value: unknown): true | string =>
    value === true || value === false || message;

const formatAdressLine = (
  address: ApplicantProfile['folkbokforingsadress'],
): string => {
  if (!address) return '';
  const parts = [
    address.gatuadress,
    address.coAdress ? `c/o ${address.coAdress}` : '',
    [address.postnummer, address.postort].filter(Boolean).join(' '),
  ].filter(Boolean);
  return parts.join(', ');
};

interface ReadOnlyRowProps {
  label: string;
  value: string | null | undefined;
}

const ReadOnlyRow: React.FC<ReadOnlyRowProps> = ({ label, value }) => (
  <div className="flex flex-col gap-4 desktop:flex-row desktop:gap-24">
    <dt className="font-bold desktop:w-[20rem] desktop:shrink-0">{label}</dt>
    <dd className="text-content">{value && value.trim() !== '' ? value : '—'}</dd>
  </div>
);

export const StepIdentitet: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { register, watch, formState, trigger, getValues, setValue } =
    useFormContext<EconomicAidApplicationV1>();
  const { data: profile, isLoading: isProfileLoading } = useApi<ApplicantProfile>({
    url: '/economic-aid/applicant-profile',
    method: 'get',
  });

  const errors = formState.errors.identitet;
  const vistelseadressStammer = watch('identitet.vistelseadressStammer');
  const kontaktViaSms = watch('identitet.kontaktViaSms');
  const behoverTolk = watch('identitet.behoverTolk');
  const ansoktSenaste3Manader = watch('identitet.ansoktSenaste3Manader');
  const tolkSprak = watch('identitet.tolkSprak');

  useEffect(() => {
    register('identitet.vistelseadressStammer', {
      validate: validateBoolean('Bekräfta om folkbokföringsadressen är din vistelseadress'),
    });
    register('identitet.kontaktViaSms', {
      validate: validateBoolean('Välj om vi får kontakta dig via SMS'),
    });
    register('identitet.ansoktSenaste3Manader', {
      validate: validateBoolean('Ange om du sökt ekonomiskt bistånd de senaste 3 månaderna'),
    });
    register('identitet.behoverTolk', {
      validate: validateBoolean('Ange om du behöver tolk'),
    });
    register('identitet.tolkSprak', {
      validate: (value) => {
        if (getValues('identitet.behoverTolk') !== true) return true;
        return value.trim().length > 0 || 'Ange vilket språk du behöver tolk på';
      },
    });
  }, [register, getValues]);

  const setBoolean = (name: BooleanFieldName, value: boolean) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const handleNext = async () => {
    const ok = await trigger('identitet');
    if (ok) onNext();
  };

  const folkbokforingsAdressLine = formatAdressLine(profile?.folkbokforingsadress ?? null);
  const helName = [profile?.fornamn, profile?.efternamn].filter(Boolean).join(' ');

  return (
    <section
      className="flex flex-col gap-32"
      aria-labelledby="economic-aid-step-identitet-heading"
      data-cy="economic-aid-step-identitet"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-identitet-heading">Identitet och vistelse</h2>
        <p>
          Uppgifterna nedan är hämtade från Skatteverkets folkbokföringsregister. Bekräfta att de
          stämmer — om något är felaktigt behöver det rättas hos Skatteverket först.
        </p>
      </header>

      {/* Kort 1 — Skrivskyddade uppgifter från Citizen */}
      <section
        aria-labelledby="economic-aid-citizen-data-heading"
        data-cy="economic-aid-citizen-data"
        className="rounded-cards border border-divider bg-background-content-200 p-24 desktop:p-32 flex flex-col gap-24"
      >
        <header>
          <h3 id="economic-aid-citizen-data-heading" className="text-h4-md">
            Dina uppgifter
          </h3>
          <p className="text-small text-dark-secondary">
            Hämtade från folkbokföringen — kan inte ändras här.
          </p>
        </header>
        {isProfileLoading ? (
          <p className="text-content text-dark-secondary">Hämtar dina uppgifter...</p>
        ) : (
          <dl className="flex flex-col gap-16">
            <ReadOnlyRow label="Namn" value={helName} />
            <ReadOnlyRow label="Personnummer" value={profile?.personnummer} />
            <ReadOnlyRow label="Folkbokföringsadress" value={folkbokforingsAdressLine} />
            {profile?.medborgarskap ? (
              <ReadOnlyRow label="Medborgarskap" value={profile.medborgarskap} />
            ) : null}
            {profile?.uppehallstillstand ? (
              <ReadOnlyRow label="Uppehållstillstånd" value={profile.uppehallstillstand} />
            ) : null}
          </dl>
        )}
      </section>

      {/* Kort 2 — Bekräftelsefrågor */}
      <section
        aria-labelledby="economic-aid-confirm-heading"
        data-cy="economic-aid-confirm"
        className="flex flex-col gap-24"
      >
        <header>
          <h3 id="economic-aid-confirm-heading" className="text-h4-md">
            Bekräfta dina uppgifter
          </h3>
        </header>

        <FormControl
          invalid={!!errors?.vistelseadressStammer}
          data-cy="economic-aid-vistelseadress-stammer"
          className="w-full"
        >
          <FormLabel className="font-bold">
            Stämmer folkbokföringsadressen med din faktiska vistelseadress?
            <RequiredMark />
          </FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="vistelseadressStammer"
              id="economic-aid-vistelseadress-stammer-yes"
              data-cy="economic-aid-vistelseadress-stammer-yes"
              value="TRUE"
              checked={vistelseadressStammer === true}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.vistelseadressStammer', true)}
            >
              Ja
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="vistelseadressStammer"
              id="economic-aid-vistelseadress-stammer-no"
              data-cy="economic-aid-vistelseadress-stammer-no"
              value="FALSE"
              checked={vistelseadressStammer === false}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.vistelseadressStammer', false)}
            >
              Nej
            </RadioButton>
          </RadioButton.Group>
          {errors?.vistelseadressStammer?.message ? (
            <FormErrorMessage className="text-error">
              {errors.vistelseadressStammer.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>

        {vistelseadressStammer === false ? (
          <div
            data-cy="economic-aid-alternativ-vistelseadress"
            className="flex flex-col gap-24"
          >
            <header>
              <h4 className="text-h4-md">Faktisk vistelseadress</h4>
            </header>

            <FormControl
              invalid={!!errors?.alternativVistelseadress?.gatuadress}
              className="w-full"
            >
              <FormLabel htmlFor="economic-aid-alternativ-gatuadress">
                Gatuadress
                <RequiredMark />
              </FormLabel>
              <Input
                id="economic-aid-alternativ-gatuadress"
                data-cy="economic-aid-alternativ-gatuadress"
                {...register('identitet.alternativVistelseadress.gatuadress', {
                  validate: (value) => {
                    if (getValues('identitet.vistelseadressStammer') !== false) return true;
                    return value.trim().length > 0 || 'Gatuadress krävs';
                  },
                })}
              />
              {errors?.alternativVistelseadress?.gatuadress?.message ? (
                <FormErrorMessage className="text-error">
                  {errors.alternativVistelseadress.gatuadress.message}
                </FormErrorMessage>
              ) : null}
            </FormControl>

            <FormControl className="w-full">
              <FormLabel htmlFor="economic-aid-alternativ-co-adress">
                C/o-adress (frivilligt)
              </FormLabel>
              <Input
                id="economic-aid-alternativ-co-adress"
                data-cy="economic-aid-alternativ-co-adress"
                placeholder="c/o Andersson"
                {...register('identitet.alternativVistelseadress.coAdress')}
              />
            </FormControl>

            <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
              <FormControl
                invalid={!!errors?.alternativVistelseadress?.postnummer}
                className="w-full"
              >
                <FormLabel htmlFor="economic-aid-alternativ-postnummer">
                  Postnummer
                  <RequiredMark />
                </FormLabel>
                <Input
                  id="economic-aid-alternativ-postnummer"
                  data-cy="economic-aid-alternativ-postnummer"
                  placeholder="123 45"
                  {...register('identitet.alternativVistelseadress.postnummer', {
                    validate: (value) => {
                      if (getValues('identitet.vistelseadressStammer') !== false) return true;
                      if (value.trim().length === 0) return 'Postnummer krävs';
                      return POSTNUMMER_PATTERN.test(value) || 'Postnummer måste anges som NNN NN';
                    },
                  })}
                />
                {errors?.alternativVistelseadress?.postnummer?.message ? (
                  <FormErrorMessage className="text-error">
                    {errors.alternativVistelseadress.postnummer.message}
                  </FormErrorMessage>
                ) : null}
              </FormControl>

              <FormControl
                invalid={!!errors?.alternativVistelseadress?.postort}
                className="w-full"
              >
                <FormLabel htmlFor="economic-aid-alternativ-postort">
                  Postort
                  <RequiredMark />
                </FormLabel>
                <Input
                  id="economic-aid-alternativ-postort"
                  data-cy="economic-aid-alternativ-postort"
                  {...register('identitet.alternativVistelseadress.postort', {
                    validate: (value) => {
                      if (getValues('identitet.vistelseadressStammer') !== false) return true;
                      return value.trim().length > 0 || 'Postort krävs';
                    },
                  })}
                />
                {errors?.alternativVistelseadress?.postort?.message ? (
                  <FormErrorMessage className="text-error">
                    {errors.alternativVistelseadress.postort.message}
                  </FormErrorMessage>
                ) : null}
              </FormControl>
            </div>
          </div>
        ) : null}
      </section>

      {/* Kort 3 — Tillfälligt: kontakt + tolk + 3-mån. TODO: flytta till eget steg. */}
      <section
        aria-labelledby="economic-aid-contact-heading"
        data-cy="economic-aid-contact"
        className="flex flex-col gap-24"
      >
        <header>
          <h3 id="economic-aid-contact-heading" className="text-h4-md">
            Kontakt och kommunikation
          </h3>
        </header>

        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
          <FormControl invalid={!!errors?.epost} className="w-full">
            <FormLabel htmlFor="economic-aid-epost">
              E-postadress
              <RequiredMark />
            </FormLabel>
            <Input
              id="economic-aid-epost"
              data-cy="economic-aid-epost"
              type="email"
              {...register('identitet.epost', {
                required: 'E-postadress krävs',
                pattern: {
                  // Avsiktligt enkelt mönster — matchar HTML5-validering.
                  // Strängare kontroll görs på backend via @IsEmail.
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Ange en giltig e-postadress',
                },
              })}
            />
            {errors?.epost?.message ? (
              <FormErrorMessage className="text-error">{errors.epost.message}</FormErrorMessage>
            ) : null}
          </FormControl>

          <FormControl invalid={!!errors?.mobiltelefon} className="w-full">
            <FormLabel htmlFor="economic-aid-mobiltelefon">
              Mobiltelefon
              {kontaktViaSms === true ? <RequiredMark /> : ' (frivilligt)'}
            </FormLabel>
            <Input
              id="economic-aid-mobiltelefon"
              data-cy="economic-aid-mobiltelefon"
              inputMode="tel"
              placeholder="070-123 45 67"
              {...register('identitet.mobiltelefon', {
                validate: (value) => {
                  if (getValues('identitet.kontaktViaSms') !== true) return true;
                  return value.trim().length > 0 || 'Mobiltelefon krävs när du valt kontakt via SMS';
                },
              })}
            />
            {errors?.mobiltelefon?.message ? (
              <FormErrorMessage className="text-error">{errors.mobiltelefon.message}</FormErrorMessage>
            ) : null}
          </FormControl>
        </div>

        <FormControl
          invalid={!!errors?.kontaktViaSms}
          data-cy="economic-aid-kontakt-sms"
          className="w-full"
        >
          <FormLabel className="font-bold">
            Får vi kontakta dig via SMS?
            <RequiredMark />
          </FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="kontaktViaSms"
              id="economic-aid-kontakt-sms-yes"
              data-cy="economic-aid-kontakt-sms-yes"
              value="TRUE"
              checked={kontaktViaSms === true}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.kontaktViaSms', true)}
            >
              Ja
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="kontaktViaSms"
              id="economic-aid-kontakt-sms-no"
              data-cy="economic-aid-kontakt-sms-no"
              value="FALSE"
              checked={kontaktViaSms === false}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.kontaktViaSms', false)}
            >
              Nej
            </RadioButton>
          </RadioButton.Group>
          {errors?.kontaktViaSms?.message ? (
            <FormErrorMessage className="text-error">{errors.kontaktViaSms.message}</FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl
          invalid={!!errors?.ansoktSenaste3Manader}
          data-cy="economic-aid-tidigare-ansokan"
          className="w-full"
        >
          <FormLabel className="font-bold">
            Har du ansökt om ekonomiskt bistånd hos Sundsvalls kommun de senaste 3 månaderna?
            <RequiredMark />
          </FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="ansoktSenaste3Manader"
              id="economic-aid-tidigare-ansokan-yes"
              data-cy="economic-aid-tidigare-ansokan-yes"
              value="TRUE"
              checked={ansoktSenaste3Manader === true}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.ansoktSenaste3Manader', true)}
            >
              Ja
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="ansoktSenaste3Manader"
              id="economic-aid-tidigare-ansokan-no"
              data-cy="economic-aid-tidigare-ansokan-no"
              value="FALSE"
              checked={ansoktSenaste3Manader === false}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.ansoktSenaste3Manader', false)}
            >
              Nej
            </RadioButton>
          </RadioButton.Group>
          {errors?.ansoktSenaste3Manader?.message ? (
            <FormErrorMessage className="text-error">
              {errors.ansoktSenaste3Manader.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl
          invalid={!!errors?.behoverTolk}
          data-cy="economic-aid-behover-tolk"
          className="w-full"
        >
          <FormLabel className="font-bold">
            Behöver du tolk?
            <RequiredMark />
          </FormLabel>
          <RadioButton.Group inline>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="behoverTolk"
              id="economic-aid-behover-tolk-yes"
              data-cy="economic-aid-behover-tolk-yes"
              value="TRUE"
              checked={behoverTolk === true}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.behoverTolk', true)}
            >
              Ja
            </RadioButton>
            <RadioButton
              size="sm"
              className="mr-sm"
              name="behoverTolk"
              id="economic-aid-behover-tolk-no"
              data-cy="economic-aid-behover-tolk-no"
              value="FALSE"
              checked={behoverTolk === false}
              onChange={() => {}}
              onClick={() => setBoolean('identitet.behoverTolk', false)}
            >
              Nej
            </RadioButton>
          </RadioButton.Group>
          {errors?.behoverTolk?.message ? (
            <FormErrorMessage className="text-error">{errors.behoverTolk.message}</FormErrorMessage>
          ) : null}
        </FormControl>

        {behoverTolk === true ? (
          <TolkSprakPicker
            id="economic-aid-tolk-sprak"
            dataCy="economic-aid-tolk-sprak"
            label="Ange på vilket språk du behöver tolk"
            value={tolkSprak}
            invalid={!!errors?.tolkSprak}
            errorMessage={errors?.tolkSprak?.message}
            onValueChange={(next) =>
              setValue('identitet.tolkSprak', next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        ) : null}
      </section>

      <StepNavigation onBack={onBack} onNext={handleNext} />
    </section>
  );
};
