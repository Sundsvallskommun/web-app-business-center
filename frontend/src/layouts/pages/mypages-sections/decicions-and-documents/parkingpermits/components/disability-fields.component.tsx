import { Checkbox, FormControl, FormErrorMessage, FormLabel, Input, RadioButton, Select } from '@sk-web-gui/react';
import { UseFormReturn } from 'react-hook-form';
import { PermitFormModel } from '../parkingpermit-form.types';
import { WALKING_AIDS, DISABILITY_DURATION_OPTIONS } from '../parkingpermit-form.constants';

interface DisabilityFieldsProps {
  form: UseFormReturn<PermitFormModel>;
}

export const DisabilityFields = ({ form }: DisabilityFieldsProps) => {
  const canBeAloneWhileParking = form.watch('disability_canBeAloneWhileParking');

  return (
    <>
      <FormControl invalid={!!form.formState.errors.application_applicant_capacity}>
        <FormLabel className="mb-12">Ansöker du som förare eller passagerare?</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="capacity-driver"
            size="sm"
            className="mr-sm"
            name="application_applicant_capacity"
            id="capacity-driver"
            value="DRIVER"
            checked={form.watch('application_applicant_capacity') === 'DRIVER'}
            onChange={() => {}}
            onClick={() => form.setValue('application_applicant_capacity', 'DRIVER', { shouldValidate: true })}
          >
            Förare
          </RadioButton>
          <RadioButton
            data-cy="capacity-passenger"
            size="sm"
            className="mr-sm"
            name="application_applicant_capacity"
            id="capacity-passenger"
            value="PASSENGER"
            checked={form.watch('application_applicant_capacity') === 'PASSENGER'}
            onChange={() => {}}
            onClick={() => form.setValue('application_applicant_capacity', 'PASSENGER', { shouldValidate: true })}
          >
            Passagerare
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.application_applicant_capacity && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.application_applicant_capacity.message}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl>
        <FormLabel>Vilket eller vilka hjälpmedel används vid förflyttning?</FormLabel>
        <Checkbox.Group direction="row" className="gap-16 flex flex-col desktop:flex-row">
          {WALKING_AIDS.map((aid, index) => (
            <Checkbox
              key={`${aid.value}-${index}`}
              value={aid.value}
              data-cy={`walking-aids-checkbox-${index}`}
              {...form.register('disability_aid')}
            >
              {aid.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </FormControl>

      <FormControl invalid={!!form.formState.errors.disability_walkingAbility}>
        <FormLabel className="mb-12">Har du gångförmåga?</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="walking-ability-true"
            size="sm"
            className="mr-sm"
            name="disability_walkingAbility"
            id="walking-ability-true"
            value="true"
            checked={form.watch('disability_walkingAbility') === 'true'}
            onChange={() => {}}
            onClick={() => form.setValue('disability_walkingAbility', 'true', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="walking-ability-false"
            size="sm"
            className="mr-sm"
            name="disability_walkingAbility"
            id="walking-ability-false"
            value="false"
            checked={form.watch('disability_walkingAbility') === 'false'}
            onChange={() => {}}
            onClick={() => form.setValue('disability_walkingAbility', 'false', { shouldValidate: true })}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.disability_walkingAbility && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.disability_walkingAbility.message}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="w-full desktop:w-1/2">
        <FormLabel htmlFor="disability_walkingDistance_beforeRest">
          Hur långt kan du gå innan du behöver vila? (meter)
        </FormLabel>
        <Input
          type="number"
          min="0"
          {...form.register('disability_walkingDistance_beforeRest')}
          data-cy="walking-distance-before-rest"
        />
      </FormControl>

      <FormControl className="w-full desktop:w-1/2">
        <FormLabel htmlFor="disability_walkingDistance_max">Hur långt kan du gå totalt? (meter)</FormLabel>
        <Input
          type="number"
          min="0"
          {...form.register('disability_walkingDistance_max')}
          data-cy="walking-distance-max"
        />
      </FormControl>

      <FormControl className="w-full desktop:w-1/2">
        <FormLabel htmlFor="disability_duration">Funktionsnedsättningens varaktighet</FormLabel>
        <Select data-cy="disability-duration" {...form.register('disability_duration')}>
          {DISABILITY_DURATION_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </FormControl>

      <FormControl invalid={!!form.formState.errors.disability_canBeAloneWhileParking}>
        <FormLabel className="mb-12">Kan du lämnas ensam medan föraren parkerar fordonet?</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="can-be-alone-true"
            size="sm"
            className="mr-sm"
            name="disability_canBeAloneWhileParking"
            id="can-be-alone-true"
            value="true"
            checked={canBeAloneWhileParking === 'true'}
            onChange={() => {}}
            onClick={() => form.setValue('disability_canBeAloneWhileParking', 'true', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="can-be-alone-false"
            size="sm"
            className="mr-sm"
            name="disability_canBeAloneWhileParking"
            id="can-be-alone-false"
            value="false"
            checked={canBeAloneWhileParking === 'false'}
            onChange={() => {}}
            onClick={() => form.setValue('disability_canBeAloneWhileParking', 'false', { shouldValidate: true })}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.disability_canBeAloneWhileParking && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.disability_canBeAloneWhileParking.message}
          </FormErrorMessage>
        )}
      </FormControl>

      {canBeAloneWhileParking === 'false' && (
        <FormControl className="w-full desktop:w-3/4">
          <FormLabel htmlFor="disability_canBeAloneWhileParking_note">
            Beskriv varför du inte kan lämnas ensam
          </FormLabel>
          <Input {...form.register('disability_canBeAloneWhileParking_note')} data-cy="can-be-alone-note" />
        </FormControl>
      )}
    </>
  );
};
