import {
  BOR_I_HEMMET_VALUES,
  Barn,
  BorIHemmet,
  EconomicAidApplicationV1,
} from '@interfaces/economic-aid';
import {
  Button,
  Card,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Select,
} from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

const PERSONNUMMER_PATTERN = /^\d{8}-\d{4}$/;

const BOR_I_HEMMET_LABELS: Record<BorIHemmet, string> = {
  heltid: 'Heltid',
  deltid: 'Deltid',
};

const RequiredMark: React.FC = () => (
  <span aria-hidden="true" className="text-error ml-4">
    *
  </span>
);

interface BarnFormCardProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}

export const BarnFormCard: React.FC<BarnFormCardProps> = ({ index, canRemove, onRemove }) => {
  const { register, watch, formState, getValues, setValue } =
    useFormContext<EconomicAidApplicationV1>();

  const errors = formState.errors.hushall?.barn?.[index];
  const value = watch(`hushall.barn.${index}` as const) as Barn | undefined;

  // Bor-i-hemmet är inte ett <input> — registrera validatorn så att
  // trigger('hushall') kör den. Inputs registreras inline via spread.
  useEffect(() => {
    register(`hushall.barn.${index}.borIHemmet` as const, {
      validate: (next) =>
        getValues('hushall.harBarnUnder21') !== true ||
        (next !== null && BOR_I_HEMMET_VALUES.includes(next)) ||
        'Ange om barnet bor heltid eller deltid',
    });
  }, [register, getValues, index]);

  return (
    <Card data-cy={`economic-aid-barn-row-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">Barn {index + 1}</h4>
        {canRemove ? (
          <Button
            variant="link"
            size="sm"
            color="error"
            data-cy={`economic-aid-barn-${index}-remove`}
            onClick={onRemove}
            leftIcon={<Icon icon={<X />} />}
          >
            Ta bort
          </Button>
        ) : null}
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl invalid={!!errors?.fornamn} className="w-full">
          <FormLabel htmlFor={`economic-aid-barn-${index}-fornamn`}>
            Förnamn
            <RequiredMark />
          </FormLabel>
          <Input
            id={`economic-aid-barn-${index}-fornamn`}
            data-cy={`economic-aid-barn-${index}-fornamn`}
            {...register(`hushall.barn.${index}.fornamn` as const, {
              validate: (next) =>
                getValues('hushall.harBarnUnder21') !== true ||
                next.trim().length > 0 ||
                'Förnamn på barnet krävs',
            })}
          />
          {errors?.fornamn?.message ? (
            <FormErrorMessage className="text-error">{errors.fornamn.message}</FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl invalid={!!errors?.efternamn} className="w-full">
          <FormLabel htmlFor={`economic-aid-barn-${index}-efternamn`}>
            Efternamn
            <RequiredMark />
          </FormLabel>
          <Input
            id={`economic-aid-barn-${index}-efternamn`}
            data-cy={`economic-aid-barn-${index}-efternamn`}
            {...register(`hushall.barn.${index}.efternamn` as const, {
              validate: (next) =>
                getValues('hushall.harBarnUnder21') !== true ||
                next.trim().length > 0 ||
                'Efternamn på barnet krävs',
            })}
          />
          {errors?.efternamn?.message ? (
            <FormErrorMessage className="text-error">
              {errors.efternamn.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl invalid={!!errors?.personnummer} className="w-full">
          <FormLabel htmlFor={`economic-aid-barn-${index}-personnummer`}>
            Personnummer
            <RequiredMark />
          </FormLabel>
          <Input
            id={`economic-aid-barn-${index}-personnummer`}
            data-cy={`economic-aid-barn-${index}-personnummer`}
            placeholder="YYYYMMDD-XXXX"
            {...register(`hushall.barn.${index}.personnummer` as const, {
              validate: (next) => {
                if (getValues('hushall.harBarnUnder21') !== true) return true;
                if (next.trim().length === 0) return 'Personnummer krävs';
                return (
                  PERSONNUMMER_PATTERN.test(next) ||
                  'Personnummer måste anges som YYYYMMDD-XXXX'
                );
              },
            })}
          />
          {errors?.personnummer?.message ? (
            <FormErrorMessage className="text-error">
              {errors.personnummer.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>

        <FormControl invalid={!!errors?.borIHemmet} className="w-full">
          <FormLabel htmlFor={`economic-aid-barn-${index}-bor-i-hemmet`}>
            Bor i hemmet
            <RequiredMark />
          </FormLabel>
          <Select
            id={`economic-aid-barn-${index}-bor-i-hemmet`}
            data-cy={`economic-aid-barn-${index}-bor-i-hemmet`}
            className="w-full"
            value={value?.borIHemmet ?? ''}
            onSelectValue={(next) => {
              const parsed = next as BorIHemmet | '';
              setValue(
                `hushall.barn.${index}.borIHemmet` as const,
                parsed === '' ? null : parsed,
                { shouldDirty: true, shouldValidate: true },
              );
            }}
          >
            <Select.Option value="" disabled>
              Välj…
            </Select.Option>
            {BOR_I_HEMMET_VALUES.map((v) => (
              <Select.Option key={v} value={v}>
                {BOR_I_HEMMET_LABELS[v]}
              </Select.Option>
            ))}
          </Select>
          {errors?.borIHemmet?.message ? (
            <FormErrorMessage className="text-error">
              {errors.borIHemmet.message}
            </FormErrorMessage>
          ) : null}
        </FormControl>
      </div>
    </Card>
  );
};
