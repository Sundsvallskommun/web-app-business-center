import { useCitizen } from '@services/citizen-service';
import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { CheckCircle2, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SignMandateDetails } from '@interfaces/mandates';

export const CreateMandateFormGrantee: React.FC = () => {
  const [personnumber, setPersonnumber] = useState<string>('');
  const { data: user, loaded } = useCitizen(personnumber);
  const { t } = useTranslation();

  const {
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext<SignMandateDetails & { name: string }>();

  useEffect(() => {
    if (loaded && user?.personId) {
      setValue('granteeId', user.personId);
      setValue('name', `${user.givenname} ${user.lastname}`);
      clearErrors('granteeId');
    } else {
      setValue('granteeId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, user?.personId]);
  return (
    <fieldset>
      <div className="flex flex-col gap-16 pb-8">
        <legend className="text-label-large">{t('profile:mandates.properties.grantee')}</legend>
        <FormControl invalid={!!errors?.granteeId} size="lg" className="w-full max-w-[30rem]">
          <FormLabel>
            {t('profile:personNumber')} ({t('profile:personNumberLayout')})
          </FormLabel>
          <Input
            data-cy="create-mandate-personnumber"
            placeholder={t('profile:personNumberLayout')}
            type="number"
            value={personnumber}
            onChange={(e) => setPersonnumber(e.target.value)}
          ></Input>
          {user?.personId && (
            <FormHelperText
              data-cy="create-mandate-personnumber-helpertext"
              className="flex flex-row gap-8 items-center justify-start text-large"
            >
              <Icon icon={<CheckCircle2 />} size="2.2rem" color="gronsta" />
              {user?.givenname} {user?.lastname}
            </FormHelperText>
          )}
          {errors?.granteeId && (
            <FormErrorMessage
              data-cy="create-mandate-personnumber-error"
              className="text-error flex flex-row items-center justify-start gap-8"
            >
              <Icon icon={<Info />} size="1.6rem" />
              {t(errors.granteeId.message as string)}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
    </fieldset>
  );
};
