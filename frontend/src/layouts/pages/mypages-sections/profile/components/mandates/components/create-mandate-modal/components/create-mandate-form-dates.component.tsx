import { DatePicker, FormControl, FormErrorMessage, FormLabel, Icon } from '@sk-web-gui/react';
import { Info } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SignMandateDetails } from 'src/data-contracts/backend/data-contracts';

export const CreateMandateFormDates: React.FC = () => {
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext<SignMandateDetails>();

  return (
    <fieldset>
      <div className="flex flex-col gap-16">
        <header className="flex flex-col">
          <legend className="text-label-large">{t('profile:validDuration')}</legend>
          <p>{t('profile:validDurationInformation')}</p>
        </header>
        <FormControl className="w-full max-w-[30rem]" size="lg">
          <FormLabel>{t('profile:mandates.properties.activeFrom')}</FormLabel>
          <DatePicker data-cy="create-mandate-date-from" {...register('activeFrom')}></DatePicker>
          {errors?.activeFrom && (
            <FormErrorMessage
              data-cy="create-mandate-date-from-error"
              className="text-error flex flex-row items-center justify-start gap-8"
            >
              <Icon icon={<Info />} size="1.6rem" />
              {t(errors.activeFrom.message as string)}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="w-full max-w-[30rem]" size="lg">
          <FormLabel>{t('profile:mandates.properties.inactiveAfter')}</FormLabel>
          <DatePicker data-cy="create-mandate-date-to" {...register('inactiveAfter')}></DatePicker>
          {errors?.inactiveAfter && (
            <FormErrorMessage
              data-cy="create-mandate-date-to-error"
              className="text-error flex flex-row items-center justify-start gap-8"
            >
              <Icon icon={<Info />} size="1.6rem" />
              {t(errors.inactiveAfter.message as string)}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
    </fieldset>
  );
};
