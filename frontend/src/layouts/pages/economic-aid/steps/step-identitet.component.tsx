import { EconomicAidApplicationV1 } from '@interfaces/economic-aid';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import {
  Combobox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  RadioButton,
} from '@sk-web-gui/react';
import { getLanguageOptions } from '@utils/languages';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

const PERSONNUMMER_PATTERN = /^\d{8}-\d{4}$/;
const POSTNUMMER_PATTERN = /^\d{3} \d{2}$/;

type BooleanFieldName =
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

export const StepIdentitet: React.FC<StepProps> = ({ onBack, onNext }) => {
  const { register, watch, formState, trigger, getValues, setValue } =
    useFormContext<EconomicAidApplicationV1>();
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });

  const errors = formState.errors.identitet;
  const kontaktViaSms = watch('identitet.kontaktViaSms');
  const behoverTolk = watch('identitet.behoverTolk');
  const ansoktSenaste3Manader = watch('identitet.ansoktSenaste3Manader');
  const tolkSprak = watch('identitet.tolkSprak');

  const languageOptions = useMemo(() => getLanguageOptions('sv'), []);

  useEffect(() => {
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


  useEffect(() => {
    if (!user?.name) return;
    const current = getValues('identitet');
    if (current.fornamn || current.efternamn) return;

    const trimmed = user.name.trim();
    const splitIndex = trimmed.indexOf(' ');
    if (splitIndex < 0) {
      setValue('identitet.fornamn', trimmed);
      return;
    }
    setValue('identitet.fornamn', trimmed.slice(0, splitIndex));
    setValue('identitet.efternamn', trimmed.slice(splitIndex + 1));
  }, [user?.name, getValues, setValue]);

  const setBoolean = (name: BooleanFieldName, value: boolean) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const handleNext = async () => {
    const ok = await trigger('identitet');
    if (ok) onNext();
  };

  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-identitet-heading"
      data-cy="economic-aid-step-identitet"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-identitet-heading">Uppgifter om sökande</h2>
        <p>Kontrollera att uppgifterna stämmer och fyll i de fält som saknas.</p>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
        <FormControl invalid={!!errors?.fornamn} className="w-full">
          <FormLabel htmlFor="economic-aid-fornamn">
            Förnamn
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-fornamn"
            data-cy="economic-aid-fornamn"
            {...register('identitet.fornamn', { required: 'Förnamn krävs' })}
          />
          {errors?.fornamn?.message ? (
            <FormErrorMessage className="text-error">{errors.fornamn.message}</FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl invalid={!!errors?.efternamn} className="w-full">
          <FormLabel htmlFor="economic-aid-efternamn">
            Efternamn
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-efternamn"
            data-cy="economic-aid-efternamn"
            {...register('identitet.efternamn', { required: 'Efternamn krävs' })}
          />
          {errors?.efternamn?.message ? (
            <FormErrorMessage className="text-error">{errors.efternamn.message}</FormErrorMessage>
          ) : null}
        </FormControl>
      </div>

      <FormControl invalid={!!errors?.personnummer} className="w-full">
        <FormLabel htmlFor="economic-aid-personnummer">
          Personnummer
          <RequiredMark />
        </FormLabel>
        <Input
          id="economic-aid-personnummer"
          data-cy="economic-aid-personnummer"
          placeholder="YYYYMMDD-XXXX"
          {...register('identitet.personnummer', {
            required: 'Personnummer krävs',
            pattern: {
              value: PERSONNUMMER_PATTERN,
              message: 'Personnummer måste anges som YYYYMMDD-XXXX',
            },
          })}
        />
        {errors?.personnummer?.message ? (
          <FormErrorMessage className="text-error">{errors.personnummer.message}</FormErrorMessage>
        ) : (
          <span className="text-small text-dark-secondary mt-4">Format: YYYYMMDD-XXXX</span>
        )}
      </FormControl>

      <FormControl invalid={!!errors?.gatuadress} className="w-full">
        <FormLabel htmlFor="economic-aid-gatuadress">
          Gatuadress
          <RequiredMark />
        </FormLabel>
        <Input
          id="economic-aid-gatuadress"
          data-cy="economic-aid-gatuadress"
          {...register('identitet.gatuadress', { required: 'Gatuadress krävs' })}
        />
        {errors?.gatuadress?.message ? (
          <FormErrorMessage className="text-error">{errors.gatuadress.message}</FormErrorMessage>
        ) : null}
      </FormControl>

      <FormControl className="w-full">
        <FormLabel htmlFor="economic-aid-co-adress">C/o-adress (frivilligt)</FormLabel>
        <Input
          id="economic-aid-co-adress"
          data-cy="economic-aid-co-adress"
          placeholder="c/o Andersson"
          {...register('identitet.coAdress')}
        />
      </FormControl>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-24">
        <FormControl invalid={!!errors?.postnummer} className="w-full">
          <FormLabel htmlFor="economic-aid-postnummer">
            Postnummer
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-postnummer"
            data-cy="economic-aid-postnummer"
            placeholder="123 45"
            {...register('identitet.postnummer', {
              required: 'Postnummer krävs',
              pattern: {
                value: POSTNUMMER_PATTERN,
                message: 'Postnummer måste anges som NNN NN',
              },
            })}
          />
          {errors?.postnummer?.message ? (
            <FormErrorMessage className="text-error">{errors.postnummer.message}</FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl invalid={!!errors?.postort} className="w-full">
          <FormLabel htmlFor="economic-aid-postort">
            Postort
            <RequiredMark />
          </FormLabel>
          <Input
            id="economic-aid-postort"
            data-cy="economic-aid-postort"
            {...register('identitet.postort', { required: 'Postort krävs' })}
          />
          {errors?.postort?.message ? (
            <FormErrorMessage className="text-error">{errors.postort.message}</FormErrorMessage>
          ) : null}
        </FormControl>
      </div>

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

      <FormControl invalid={!!errors?.kontaktViaSms} data-cy="economic-aid-kontakt-sms" className="w-full">
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
          <FormErrorMessage className="text-error">{errors.ansoktSenaste3Manader.message}</FormErrorMessage>
        ) : null}
      </FormControl>

      <FormControl invalid={!!errors?.behoverTolk} data-cy="economic-aid-behover-tolk" className="w-full">
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
        <FormControl invalid={!!errors?.tolkSprak} className="w-full">
          <FormLabel htmlFor="economic-aid-tolk-sprak">
            Ange på vilket språk du behöver tolk
            <RequiredMark />
          </FormLabel>
          <Combobox
            id="economic-aid-tolk-sprak"
            data-cy="economic-aid-tolk-sprak"
            className="w-full"
            value={tolkSprak}
            onChange={(event) => {
              const next = Array.isArray(event.target.value)
                ? (event.target.value[0] ?? '')
                : event.target.value;
              setValue('identitet.tolkSprak', next, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            searchPlaceholder="Sök språk..."
            placeholder="Välj språk"
          >
            <Combobox.Input className='w-full'/>
            <Combobox.List>
              {languageOptions.map((option) => (
                <Combobox.Option key={option.code} value={option.name}>
                  {option.name}
                </Combobox.Option>
              ))}
            </Combobox.List>
          </Combobox>
          {errors?.tolkSprak?.message ? (
            <FormErrorMessage className="text-error">{errors.tolkSprak.message}</FormErrorMessage>
          ) : null}
        </FormControl>
      ) : null}

      <StepNavigation onBack={onBack} onNext={handleNext} />
    </section>
  );
};
