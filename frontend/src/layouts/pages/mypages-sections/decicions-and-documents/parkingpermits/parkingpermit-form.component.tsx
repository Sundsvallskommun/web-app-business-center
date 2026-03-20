import { yupResolver } from '@hookform/resolvers/yup';
import { useApi } from '@services/api-service';
import { ACCEPTED_UPLOAD_FILETYPES } from '@services/asset-service';
import {
  Button,
  Checkbox,
  FileUpload,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  RadioButton,
  Select,
  UploadFile,
  useConfirm,
  useSnackbar,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import { ArrowRight } from 'lucide-react';
import * as yup from 'yup';
import { useEffect } from 'react';
import { Resolver, useForm } from 'react-hook-form';

export type PermitFormMode = 'new' | 'renewal';

// Mapping from API keys (dots) to form field names (underscores)
const API_KEY_TO_FIELD: Record<string, keyof PermitFormModel> = {
  'application.reason': 'application_reason',
  'application.applicant.capacity': 'application_applicant_capacity',
  'application.applicant.signingAbility': 'application_applicant_signingAbility',
  'disability.aid': 'disability_aid',
  'disability.walkingAbility': 'disability_walkingAbility',
  'disability.walkingDistance.beforeRest': 'disability_walkingDistance_beforeRest',
  'disability.walkingDistance.max': 'disability_walkingDistance_max',
  'disability.duration': 'disability_duration',
  'disability.canBeAloneWhileParking': 'disability_canBeAloneWhileParking',
  'disability.canBeAloneWhileParking.note': 'disability_canBeAloneWhileParking_note',
  'consent.contact.doctor': 'consent_contact_doctor',
  'consent.view.transportationServiceDetails': 'consent_view_transportationServiceDetails',
  'application.renewal.changedCircumstances': 'application_renewal_changedCircumstances',
  'application.renewal.expirationDate': 'application_renewal_expirationDate',
  'application.renewal.medicalConfirmationRequired': 'application_renewal_medicalConfirmationRequired',
};

export interface ExtraParameter {
  key: string;
  displayName?: string;
  values?: string[];
}

// Helper to convert API extraParameters to form values
const extraParametersToFormValues = (
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

const walkingAids = [
  { label: 'Rullator', value: 'Rullator' },
  { label: 'Elrullstol', value: 'Elrullstol' },
  { label: 'Krycka/kryckor/käpp', value: 'Krycka/kryckor/käpp' },
  { label: 'Rullstol (manuell)', value: 'Rullstol (manuell)' },
];

const disabilityDurationOptions = [
  { label: 'Välj', value: '' },
  { label: 'Mindre än 6 månader', value: 'P6M' },
  { label: '6 månader till 1 år', value: 'P1Y' },
  { label: '1-2 år', value: 'P2Y' },
  { label: '2-3 år', value: 'P3Y' },
  { label: '3-4 år', value: 'P4Y' },
  { label: 'Mer än 4 år', value: 'P5Y' },
  { label: 'Bestående', value: 'P0Y' },
];

export const MAX_FILE_SIZE_MB = 50;

// Mapping from form field names (underscores) to API keys (dots)
const FIELD_TO_API_KEY: Record<string, string> = {
  application_reason: 'application.reason',
  application_applicant_capacity: 'application.applicant.capacity',
  application_applicant_signingAbility: 'application.applicant.signingAbility',
  disability_aid: 'disability.aid',
  disability_walkingAbility: 'disability.walkingAbility',
  disability_walkingDistance_beforeRest: 'disability.walkingDistance.beforeRest',
  disability_walkingDistance_max: 'disability.walkingDistance.max',
  disability_duration: 'disability.duration',
  disability_canBeAloneWhileParking: 'disability.canBeAloneWhileParking',
  disability_canBeAloneWhileParking_note: 'disability.canBeAloneWhileParking.note',
  consent_contact_doctor: 'consent.contact.doctor',
  consent_view_transportationServiceDetails: 'consent.view.transportationServiceDetails',
  application_renewal_changedCircumstances: 'application.renewal.changedCircumstances',
  application_renewal_expirationDate: 'application.renewal.expirationDate',
  application_renewal_medicalConfirmationRequired: 'application.renewal.medicalConfirmationRequired',
};

// Fields that are only relevant for renewal applications
const RENEWAL_ONLY_FIELDS = [
  'application_renewal_changedCircumstances',
  'application_renewal_expirationDate',
  'application_renewal_medicalConfirmationRequired',
];

// Form model using underscore-based keys to avoid react-hook-form dot path interpretation
interface PermitFormModel {
  application_reason: string;
  application_applicant_capacity: 'DRIVER' | 'PASSENGER' | '';
  application_applicant_signingAbility: 'true' | 'false' | '';
  disability_aid: string[];
  disability_walkingAbility: 'true' | 'false' | '';
  disability_walkingDistance_beforeRest: string;
  disability_walkingDistance_max: string;
  disability_duration: string;
  disability_canBeAloneWhileParking: 'true' | 'false' | '';
  disability_canBeAloneWhileParking_note: string;
  consent_contact_doctor: 'true' | 'false' | '';
  consent_view_transportationServiceDetails: 'true' | 'false' | '';
  application_renewal_changedCircumstances: 'Y' | 'N' | '';
  application_renewal_expirationDate: string;
  application_renewal_medicalConfirmationRequired: 'yes' | 'no' | 'unknown' | '';
  files_medical: UploadFile[];
  files_passport: UploadFile[];
  files_signature: UploadFile[];
}

const VALIDATION_MESSAGE = 'Du måste välja ett alternativ';

// Create validation schema based on mode
const createFormSchema = (mode: PermitFormMode) => {
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

// Helper to convert form data to extraParameters array format
const formToExtraParameters = (
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

export const ParkingPermitForm = ({
  mode,
  setFormState,
  errandData,
  errandNumber,
  assetValidTo,
}: {
  mode: PermitFormMode;
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
  errandData?: ExtraParameter[];
  errandNumber?: string;
  assetValidTo?: string;
}) => {
  const confirm = useConfirm();
  const toastMessage = useSnackbar();

  const form = useForm<PermitFormModel>({
    resolver: yupResolver(createFormSchema(mode)) as Resolver<PermitFormModel>,
    defaultValues: {
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
    },
    mode: 'onChange',
  });

  // Prepopulate form when errand data is loaded or asset validTo is available
  useEffect(() => {
    const formValues: Partial<PermitFormModel> = {};

    // Prepopulate from errand extraParameters if available
    if (errandData && Array.isArray(errandData) && errandData.length > 0) {
      Object.assign(formValues, extraParametersToFormValues(errandData));
    }

    // Prepopulate expiration date from asset validTo (if not already set from errand data) - renewal only
    if (mode === 'renewal' && assetValidTo && !formValues.application_renewal_expirationDate) {
      formValues.application_renewal_expirationDate = assetValidTo;
    }

    // Only reset if we have values to prepopulate
    if (Object.keys(formValues).length > 0) {
      form.reset({
        ...form.getValues(),
        ...formValues,
        files_medical: [],
        files_passport: [],
        files_signature: [],
      });
    }
  }, [errandData, assetValidTo, form, mode]);

  // Mode-aware API endpoint
  const endpoint = mode === 'new'
    ? '/assets/parkingpermit/new'
    : '/assets/parkingpermit/extend';

  const registerErrand = useApi<unknown>({
    url: endpoint,
    method: 'post',
    axiosParameters: { headers: { 'Content-Type': 'multipart/form-data' } },
  });

  // Mode-aware UI text
  const confirmTitle = mode === 'new'
    ? 'Ansök om parkeringstillstånd?'
    : 'Ansök om förlängning?';

  const confirmMessage = mode === 'new'
    ? 'Vill du skicka in ansökan om parkeringstillstånd?'
    : 'Vill du skicka in ansökan om förlängning av parkeringstillstånd?';

  const successMessage = mode === 'new'
    ? 'Din ansökan har skickats in!'
    : 'Din ansökan om förlängning har skickats in!';

  const onSubmit = async (data: PermitFormModel) => {
    const confirmed = await confirm.showConfirmation(
      confirmTitle,
      confirmMessage,
      'Ja',
      'Nej',
      'info'
    );
    if (confirmed) {
      const formData = new FormData();

      // Convert form data to extraParameters array and append as JSON
      const extraParameters = formToExtraParameters(data, mode, errandNumber);
      formData.append('extraParameters', JSON.stringify(extraParameters));

      // Helper to append files with category prefix
      const appendFiles = async (files: UploadFile[], category: string) => {
        await Promise.all(
          files.map(async (file) => {
            if (file.file instanceof Blob) {
              const fileData = await toBase64(file.file);
              const buf = Buffer.from(fileData, 'base64');
              const blob = new Blob([buf], { type: file.file.type });
              formData.append('files', blob, `${category}__${file.meta.name}.${file.meta.ending}`);
            }
          })
        );
      };

      try {
        if (data.files_medical.length) {
          await appendFiles(data.files_medical, 'MEDICAL_CONFIRMATION');
        }
        if (data.files_passport.length) {
          await appendFiles(data.files_passport, 'PASSPORT_PHOTO');
        }
        if (data.files_signature.length) {
          await appendFiles(data.files_signature, 'SIGNATURE');
        }
      } catch {
        // File processing error - continue with submission
      }

      try {
        await registerErrand.mutateAsync(formData);
        form.reset();
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: successMessage,
          status: 'success',
        });
        setFormState('success');
      } catch {
        toastMessage({
          position: 'bottom',
          closeable: false,
          message: 'Något gick fel när ansökan skulle skickas in. Försök igen senare.',
          status: 'error',
        });
      }
    }
  };

  const filesMedical = form.watch('files_medical');
  const filesPassport = form.watch('files_passport');
  const filesSignature = form.watch('files_signature');
  const changedCircumstances = form.watch('application_renewal_changedCircumstances');
  const canBeAloneWhileParking = form.watch('disability_canBeAloneWhileParking');
  const signingAbility = form.watch('application_applicant_signingAbility');
  const medicalConfirmationRequired = form.watch('application_renewal_medicalConfirmationRequired');

  // For NEW applications: always show all disability fields
  // For RENEWAL: show based on changedCircumstances answer
  const showDisabilityFields = mode === 'new' || changedCircumstances === 'Y';

  // Show medical file upload for new applications or when renewal requires new medical confirmation
  const showMedicalFileUpload = mode === 'new' || medicalConfirmationRequired === 'yes';

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-40">
      {/* Changed Circumstances - Renewal only */}
      {mode === 'renewal' && (
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
      )}

      {/* Application Reason - shown for renewal with changed circumstances */}
      {mode === 'renewal' && changedCircumstances === 'Y' && (
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

      {/* Universal disability fields - always shown for 'new', conditional for 'renewal' */}
      {showDisabilityFields && (
        <>
          {/* Applicant Capacity */}
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

          {/* Walking Aids */}
          <FormControl>
            <FormLabel>Vilket eller vilka hjälpmedel används vid förflyttning?</FormLabel>
            <Checkbox.Group direction="row" className="gap-16 flex flex-col desktop:flex-row">
              {walkingAids.map((aid, index) => (
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

          {/* Walking Ability */}
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

          {/* Walking Distance Before Rest */}
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

          {/* Walking Distance Max */}
          <FormControl className="w-full desktop:w-1/2">
            <FormLabel htmlFor="disability_walkingDistance_max">Hur långt kan du gå totalt? (meter)</FormLabel>
            <Input
              type="number"
              min="0"
              {...form.register('disability_walkingDistance_max')}
              data-cy="walking-distance-max"
            />
          </FormControl>

          {/* Disability Duration */}
          <FormControl className="w-full desktop:w-1/2">
            <FormLabel htmlFor="disability_duration">Funktionsnedsättningens varaktighet</FormLabel>
            <Select data-cy="disability-duration" {...form.register('disability_duration')}>
              {disabilityDurationOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormControl>

          {/* Can Be Alone While Parking */}
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

          {/* Note if cannot be alone while parking */}
          {canBeAloneWhileParking === 'false' && (
            <FormControl className="w-full desktop:w-3/4">
              <FormLabel htmlFor="disability_canBeAloneWhileParking_note">
                Beskriv varför du inte kan lämnas ensam
              </FormLabel>
              <Input
                {...form.register('disability_canBeAloneWhileParking_note')}
                data-cy="can-be-alone-note"
              />
            </FormControl>
          )}

          {/* Consent - Contact Doctor */}
          <FormControl invalid={!!form.formState.errors.consent_contact_doctor}>
            <FormLabel className="mb-12">
              Ger du ditt samtycke till att kommunen kontaktar din läkare vid behov?
            </FormLabel>
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

          {/* Consent - View Transportation Service Details */}
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
                onClick={() => form.setValue('consent_view_transportationServiceDetails', 'false', { shouldValidate: true })}
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
      )}

      {/* Expiration Date - Renewal only */}
      {mode === 'renewal' && (
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
      )}

      {/* Medical Confirmation Required - Renewal only */}
      {mode === 'renewal' && (
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
              onClick={() => form.setValue('application_renewal_medicalConfirmationRequired', 'yes', { shouldValidate: true })}
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
              onClick={() => form.setValue('application_renewal_medicalConfirmationRequired', 'no', { shouldValidate: true })}
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
              onClick={() => form.setValue('application_renewal_medicalConfirmationRequired', 'unknown', { shouldValidate: true })}
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
      )}

      {/* Signing Ability */}
      <FormControl invalid={!!form.formState.errors.application_applicant_signingAbility}>
        <FormLabel className="mb-12">Kan den sökande signera med sin namnteckning?</FormLabel>
        <RadioButton.Group inline>
          <RadioButton
            data-cy="signing-ability-true"
            size="sm"
            className="mr-sm"
            name="application_applicant_signingAbility"
            id="signing-ability-true"
            value="true"
            checked={signingAbility === 'true'}
            onChange={() => {}}
            onClick={() => form.setValue('application_applicant_signingAbility', 'true', { shouldValidate: true })}
          >
            Ja
          </RadioButton>
          <RadioButton
            data-cy="signing-ability-false"
            size="sm"
            className="mr-sm"
            name="application_applicant_signingAbility"
            id="signing-ability-false"
            value="false"
            checked={signingAbility === 'false'}
            onChange={() => {}}
            onClick={() => form.setValue('application_applicant_signingAbility', 'false', { shouldValidate: true })}
          >
            Nej
          </RadioButton>
        </RadioButton.Group>
        {form.formState.errors.application_applicant_signingAbility && (
          <FormErrorMessage className="text-error">
            {form.formState.errors.application_applicant_signingAbility.message}
          </FormErrorMessage>
        )}
      </FormControl>

      {/* File Upload - Medical Confirmation */}
      {showMedicalFileUpload && (
        <FormControl className="w-full">
          <FormLabel>Bifoga läkarintyg</FormLabel>
          <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
          {filesMedical && filesMedical.length > 0 ? (
            <FileUpload.List name="files_medical">
              {filesMedical.map((file, i) => (
                <FileUpload.ListItem
                  key={file.id}
                  index={i}
                  file={file}
                  categoryProps={{
                    categories: { MEDICAL_CONFIRMATION: 'Läkarintyg' },
                  }}
                  actionsProps={{
                    showRemove: true,
                    onRemove: () =>
                      form.setValue(
                        'files_medical',
                        form.watch('files_medical').filter((f) => f !== file)
                      ),
                  }}
                />
              ))}
            </FileUpload.List>
          ) : (
            <FileUpload.Field
              className="inline-block w-full"
              accept={ACCEPTED_UPLOAD_FILETYPES}
              variant="horizontal"
              name="files_medical"
              maxFileSizeMB={MAX_FILE_SIZE_MB}
              onChange={(e) => {
                form.setValue('files_medical', e.target.value);
              }}
            />
          )}
        </FormControl>
      )}

      {/* File Upload - Passport Photo */}
      <FormControl className="w-full">
        <FormLabel>Bifoga passfoto</FormLabel>
        <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
        {filesPassport && filesPassport.length > 0 ? (
          <FileUpload.List name="files_passport">
            {filesPassport.map((file, i) => (
              <FileUpload.ListItem
                key={file.id}
                index={i}
                file={file}
                categoryProps={{
                  categories: { PASSPORT_PHOTO: 'Passfoto' },
                }}
                actionsProps={{
                  showRemove: true,
                  onRemove: () =>
                    form.setValue(
                      'files_passport',
                      form.watch('files_passport').filter((f) => f !== file)
                    ),
                }}
              />
            ))}
          </FileUpload.List>
        ) : (
          <FileUpload.Field
            className="inline-block w-full"
            accept={ACCEPTED_UPLOAD_FILETYPES}
            variant="horizontal"
            name="files_passport"
            maxFileSizeMB={MAX_FILE_SIZE_MB}
            onChange={(e) => {
              form.setValue('files_passport', e.target.value);
            }}
          />
        )}
      </FormControl>

      {/* File Upload - Signature (conditional on signing ability) */}
      {signingAbility === 'true' && (
        <FormControl className="w-full">
          <FormLabel>Bifoga namnteckning</FormLabel>
          <FormHelperText className="mb-12">Tillåtna filtyper: PDF, Word, JPEG. Max filstorlek: 25 MB</FormHelperText>
          {filesSignature && filesSignature.length > 0 ? (
            <FileUpload.List name="files_signature">
              {filesSignature.map((file, i) => (
                <FileUpload.ListItem
                  key={file.id}
                  index={i}
                  file={file}
                  categoryProps={{
                    categories: { SIGNATURE: 'Namnteckning' },
                  }}
                  actionsProps={{
                    showRemove: true,
                    onRemove: () =>
                      form.setValue(
                        'files_signature',
                        form.watch('files_signature').filter((f) => f !== file)
                      ),
                  }}
                />
              ))}
            </FileUpload.List>
          ) : (
            <FileUpload.Field
              className="inline-block w-full"
              accept={ACCEPTED_UPLOAD_FILETYPES}
              variant="horizontal"
              name="files_signature"
              maxFileSizeMB={MAX_FILE_SIZE_MB}
              onChange={(e) => {
                form.setValue('files_signature', e.target.value);
              }}
            />
          )}
        </FormControl>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" onClick={() => setFormState('showInfo')}>
          Avbryt
        </Button>
        <Button
          size="lg"
          color="vattjom"
          rightIcon={<ArrowRight />}
          type="submit"
          loading={registerErrand.isPending}
          loadingText="Sparar"
        >
          Skicka in
        </Button>
      </div>
    </form>
  );
};
