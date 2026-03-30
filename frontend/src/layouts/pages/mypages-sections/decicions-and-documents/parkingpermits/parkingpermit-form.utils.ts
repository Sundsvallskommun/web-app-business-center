import { ExtraParameter, PermitFormMode, PermitFormModel } from './parkingpermit-form.types';
import { API_KEY_TO_FIELD, FIELD_TO_API_KEY, RENEWAL_ONLY_FIELDS } from './parkingpermit-form.constants';

// Helper to convert API extraParameters to form values
export const extraParametersToFormValues = (
  extraParams: ExtraParameter[]
): Partial<PermitFormModel> => {
  const formValues: Partial<PermitFormModel> = {};
  extraParams.forEach((param) => {
    const fieldKey = API_KEY_TO_FIELD[param.key];
    if (fieldKey && param.values?.length) {
      if (fieldKey === 'disability_aid') {
        (formValues as Record<string, string[]>)[fieldKey] = param.values;
      } else {
        (formValues as Record<string, string>)[fieldKey] = param.values[0];
      }
    }
  });
  return formValues;
};

// Helper to convert form data to extraParameters array format
export const formToExtraParameters = (
  data: PermitFormModel,
  mode: PermitFormMode,
  errandNumber?: string
): Array<{ key: string; values: string[] }> => {
  const extraParameters: Array<{ key: string; values: string[] }> = [];

  // Filter out renewal-specific fields when mode is 'new'
  const fieldKeys = (Object.keys(FIELD_TO_API_KEY) as (keyof typeof FIELD_TO_API_KEY)[])
    .filter(key => mode === 'renewal' || !RENEWAL_ONLY_FIELDS.includes(key));

  fieldKeys.forEach((fieldKey) => {
    const apiKey = FIELD_TO_API_KEY[fieldKey];
    const value = data[fieldKey as keyof PermitFormModel];

    if (fieldKey === 'disability_aid') {
      // Handle array values (walking aids)
      const arrayValue = value as string[];
      if (arrayValue && arrayValue.length > 0) {
        extraParameters.push({ key: apiKey, values: arrayValue });
      } else {
        extraParameters.push({ key: apiKey, values: [''] });
      }
    } else {
      // Handle string values
      const stringValue = value as string;
      extraParameters.push({ key: apiKey, values: [stringValue ?? ''] });
    }
  });

  // Add caseMeaning when circumstances have changed (renewal only)
  if (mode === 'renewal' && data.application_renewal_changedCircumstances === 'Y') {
    const caseMeaningText = errandNumber
      ? `Den sökande har angett att förutsättningar har ändrats. Tidigare ärende: ${errandNumber}`
      : 'Den sökande har angett att förutsättningar har ändrats.';
    extraParameters.push({ key: 'caseMeaning', values: [caseMeaningText] });
  }

  return extraParameters;
};

// Default form values
export const getDefaultFormValues = (): PermitFormModel => ({
  application_reason: '',
  application_applicant_capacity: '',
  application_applicant_signingAbility: '',
  disability_aid: [],
  disability_walkingAbility: '',
  disability_walkingDistance_beforeRest: '',
  disability_walkingDistance_max: '',
  disability_duration: '',
  disability_canBeAloneWhileParking: '',
  disability_canBeAloneWhileParking_note: '',
  consent_contact_doctor: '',
  consent_view_transportationServiceDetails: '',
  application_renewal_changedCircumstances: '',
  application_renewal_expirationDate: '',
  application_renewal_medicalConfirmationRequired: '',
  files_medical: [],
  files_passport: [],
  files_signature: [],
});
