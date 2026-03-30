import { FormControl, FormErrorMessage, FormLabel, RadioButton } from '@sk-web-gui/react';
import { UseFormReturn } from 'react-hook-form';
import { PermitFormModel } from '../parkingpermit-form.types';

interface ConsentFieldsProps {
  form: UseFormReturn<PermitFormModel>;
}

export const ConsentFields = ({ form }: ConsentFieldsProps) => {
  return (
    <>
      <FormControl invalid={!!form.formState.errors.consent_contact_doctor}>
        <FormLabel className="mb-12">Ger du ditt samtycke till att kommunen kontaktar din läkare vid behov?</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="consent-doctor-true"
            size="sm"
            className="mr-sm"
            name="consent_contact_doctor"
            id="consent-doctor-true"
            value="true"
            checked={form.watch('consent_contact_doctor') === 'true'}
            onChange={() => {}}
            onClick={() => form.setValue('consent_contact_doctor', 'true', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="consent-doctor-false"
            size="sm"
            className="mr-sm"
            name="consent_contact_doctor"
            id="consent-doctor-false"
            value="false"
            checked={form.watch('consent_contact_doctor') === 'false'}
            onChange={() => {}}
            onClick={() => form.setValue('consent_contact_doctor', 'false', { shouldValidate: true })}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.consent_contact_doctor && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.consent_contact_doctor.message}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl invalid={!!form.formState.errors.consent_view_transportationServiceDetails}>
        <FormLabel className="mb-12">
          Ger du ditt samtycke till att kommunen tar del av dina uppgifter om färdtjänst?
        </FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="consent-transport-true"
            size="sm"
            className="mr-sm"
            name="consent_view_transportationServiceDetails"
            id="consent-transport-true"
            value="true"
            checked={form.watch('consent_view_transportationServiceDetails') === 'true'}
            onChange={() => {}}
            onClick={() => form.setValue('consent_view_transportationServiceDetails', 'true', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="consent-transport-false"
            size="sm"
            className="mr-sm"
            name="consent_view_transportationServiceDetails"
            id="consent-transport-false"
            value="false"
            checked={form.watch('consent_view_transportationServiceDetails') === 'false'}
            onChange={() => {}}
            onClick={() =>
              form.setValue('consent_view_transportationServiceDetails', 'false', { shouldValidate: true })
            }
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.consent_view_transportationServiceDetails && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.consent_view_transportationServiceDetails.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </>
  );
};
