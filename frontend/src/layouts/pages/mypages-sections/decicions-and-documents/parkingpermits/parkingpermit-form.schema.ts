import * as yup from 'yup';
import { PermitFormMode } from './parkingpermit-form.types';
import { VALIDATION_MESSAGE } from './parkingpermit-form.constants';

// Create validation schema based on mode
export const createFormSchema = (mode: PermitFormMode) => {
  return yup.object({
    // Renewal-only required fields
    application_renewal_changedCircumstances: mode === 'renewal'
      ? yup.string().oneOf(['Y', 'N'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE)
      : yup.string(),

    application_renewal_medicalConfirmationRequired: mode === 'renewal'
      ? yup.string().oneOf(['yes', 'no', 'unknown'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE)
      : yup.string(),

    // Disability fields - required for 'new' mode OR when changedCircumstances is 'Y' in renewal
    application_applicant_capacity: yup.string().when('application_renewal_changedCircumstances', {
      is: (value: string) => mode === 'new' || value === 'Y',
      then: (schema) => schema.oneOf(['DRIVER', 'PASSENGER'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE),
      otherwise: (schema) => schema,
    }),

    application_applicant_signingAbility: yup.string()
      .oneOf(['true', 'false'], VALIDATION_MESSAGE)
      .required(VALIDATION_MESSAGE),

    disability_walkingAbility: yup.string().when('application_renewal_changedCircumstances', {
      is: (value: string) => mode === 'new' || value === 'Y',
      then: (schema) => schema.oneOf(['true', 'false'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE),
      otherwise: (schema) => schema,
    }),

    disability_canBeAloneWhileParking: yup.string().when('application_renewal_changedCircumstances', {
      is: (value: string) => mode === 'new' || value === 'Y',
      then: (schema) => schema.oneOf(['true', 'false'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE),
      otherwise: (schema) => schema,
    }),

    consent_contact_doctor: yup.string().when('application_renewal_changedCircumstances', {
      is: (value: string) => mode === 'new' || value === 'Y',
      then: (schema) => schema.oneOf(['true', 'false'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE),
      otherwise: (schema) => schema,
    }),

    consent_view_transportationServiceDetails: yup.string().when('application_renewal_changedCircumstances', {
      is: (value: string) => mode === 'new' || value === 'Y',
      then: (schema) => schema.oneOf(['true', 'false'], VALIDATION_MESSAGE).required(VALIDATION_MESSAGE),
      otherwise: (schema) => schema,
    }),

    // Optional fields
    application_reason: yup.string(),
    disability_aid: yup.array().of(yup.string()),
    disability_walkingDistance_beforeRest: yup.string(),
    disability_walkingDistance_max: yup.string(),
    disability_duration: yup.string(),
    disability_canBeAloneWhileParking_note: yup.string(),
    application_renewal_expirationDate: yup.string(),
    files_medical: yup.array(),
    files_passport: yup.array(),
    files_signature: yup.array(),
  });
};
