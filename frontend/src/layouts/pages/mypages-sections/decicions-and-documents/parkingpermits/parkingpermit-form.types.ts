import { UploadFile } from '@sk-web-gui/react';

export type PermitFormMode = 'new' | 'renewal';

export interface ExtraParameter {
  key: string;
  displayName?: string;
  values?: string[];
}

// Form model using underscore-based keys to avoid react-hook-form dot path interpretation
export interface PermitFormModel {
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
