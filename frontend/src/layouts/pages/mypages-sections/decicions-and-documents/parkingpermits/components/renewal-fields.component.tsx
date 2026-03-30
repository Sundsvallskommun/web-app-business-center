import { FormControl, FormErrorMessage, FormLabel, Input, RadioButton } from '@sk-web-gui/react';
import { UseFormReturn } from 'react-hook-form';
import { PermitFormModel } from '../parkingpermit-form.types';

interface RenewalFieldsProps {
  form: UseFormReturn<PermitFormModel>;
}

export const ChangedCircumstancesField = ({ form }: RenewalFieldsProps) => {
  const changedCircumstances = form.watch('application_renewal_changedCircumstances');

  return (
    <>
      <FormControl invalid={!!form.formState.errors.application_renewal_changedCircumstances}>
        <FormLabel className="mb-12">
          Har förutsättningarna för din ansökan förändrats gentemot ditt nuvarande parkeringstillstånd?
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="circumstances-changed-Y"
            size="sm"
            className="mr-sm"
            name="application_renewal_changedCircumstances"
            id="circumstances-changed-Y"
            value="Y"
            checked={changedCircumstances === 'Y'}
            onChange={() => {}}
            onClick={() => form.setValue('application_renewal_changedCircumstances', 'Y', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="circumstances-changed-N"
            size="sm"
            className="mr-sm"
            name="application_renewal_changedCircumstances"
            id="circumstances-changed-N"
            value="N"
            checked={changedCircumstances === 'N'}
            onChange={() => {}}
            onClick={() => form.setValue('application_renewal_changedCircumstances', 'N', { shouldValidate: true })}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.application_renewal_changedCircumstances && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.application_renewal_changedCircumstances.message}
          </FormErrorMessage>
        )}
      </FormControl>

      {changedCircumstances === 'Y' && (
        <FormControl className="w-full desktop:w-3/4">
          <FormLabel htmlFor="application_reason">Beskriv kort vad som förändrats</FormLabel>
          <Input
            {...form.register('application_reason', { required: 'Ange en beskrivning' })}
            data-cy="application-reason"
          />
          {form.formState.errors.application_reason && (
            <FormErrorMessage className="text-error">
              {form.formState.errors.application_reason.message}
            </FormErrorMessage>
          )}
        </FormControl>
      )}
    </>
  );
};

export const ExpirationDateField = ({ form }: RenewalFieldsProps) => {
  return (
    <FormControl>
      <FormLabel htmlFor="application_renewal_expirationDate">
        När gick ditt nuvarande parkeringstillstånd ut?
      </FormLabel>
      <Input
        type="date"
        {...form.register('application_renewal_expirationDate', { required: 'Ange ett datum' })}
        data-cy="expiration-date"
      />
      {form.formState.errors.application_renewal_expirationDate && (
        <FormErrorMessage className="text-error">
          {form.formState.errors.application_renewal_expirationDate.message}
        </FormErrorMessage>
      )}
    </FormControl>
  );
};

export const MedicalConfirmationRequiredField = ({ form }: RenewalFieldsProps) => {
  return (
    <FormControl invalid={!!form.formState.errors.application_renewal_medicalConfirmationRequired}>
      <FormLabel className="mb-12">Behövs det ett nytt läkarintyg?</FormLabel>
      <RadioButton.Group inline>
        <RadioButton
          data-cy="medical-required-yes"
          size="sm"
          className="mr-sm"
          name="application_renewal_medicalConfirmationRequired"
          id="medical-required-yes"
          value="yes"
          checked={form.watch('application_renewal_medicalConfirmationRequired') === 'yes'}
          onChange={() => {}}
          onClick={() =>
            form.setValue('application_renewal_medicalConfirmationRequired', 'yes', { shouldValidate: true })
          }
        >
          Ja
        </RadioButton>
        <RadioButton
          data-cy="medical-required-no"
          size="sm"
          className="mr-sm"
          name="application_renewal_medicalConfirmationRequired"
          id="medical-required-no"
          value="no"
          checked={form.watch('application_renewal_medicalConfirmationRequired') === 'no'}
          onChange={() => {}}
          onClick={() =>
            form.setValue('application_renewal_medicalConfirmationRequired', 'no', { shouldValidate: true })
          }
        >
          Nej
        </RadioButton>
        <RadioButton
          data-cy="medical-required-unknown"
          size="sm"
          className="mr-sm"
          name="application_renewal_medicalConfirmationRequired"
          id="medical-required-unknown"
          value="unknown"
          checked={form.watch('application_renewal_medicalConfirmationRequired') === 'unknown'}
          onChange={() => {}}
          onClick={() =>
            form.setValue('application_renewal_medicalConfirmationRequired', 'unknown', { shouldValidate: true })
          }
        >
          Vet inte
        </RadioButton>
      </RadioButton.Group>
      {form.formState.errors.application_renewal_medicalConfirmationRequired && (
        <FormErrorMessage className="text-error">
          {form.formState.errors.application_renewal_medicalConfirmationRequired.message}
        </FormErrorMessage>
      )}
    </FormControl>
  );
};
