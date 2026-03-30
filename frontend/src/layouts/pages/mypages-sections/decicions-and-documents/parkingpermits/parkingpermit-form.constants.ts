import { PermitFormModel } from './parkingpermit-form.types';

// Mapping from API keys (dots) to form field names (underscores)
export const API_KEY_TO_FIELD: Record<string, keyof PermitFormModel> = {
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

// Mapping from form field names (underscores) to API keys (dots)
export const FIELD_TO_API_KEY: Record<string, string> = {
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
export const RENEWAL_ONLY_FIELDS = [
  'application_renewal_changedCircumstances',
  'application_renewal_expirationDate',
  'application_renewal_medicalConfirmationRequired',
];

export const WALKING_AIDS = [
  { label: 'Rullator', value: 'Rullator' },
  { label: 'Elrullstol', value: 'Elrullstol' },
  { label: 'Krycka/kryckor/käpp', value: 'Krycka/kryckor/käpp' },
  { label: 'Rullstol (manuell)', value: 'Rullstol (manuell)' },
];

export const DISABILITY_DURATION_OPTIONS = [
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

export const VALIDATION_MESSAGE = 'Du måste välja ett alternativ';
