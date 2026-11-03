export enum CaseDataNamespace {
  SBK_MEX = 'SBK_MEX',
  SBK_PARKING_PERMIT = 'SBK_PARKING_PERMIT',
  CONTACTSUNDSVALL = 'CONTACTSUNDSVALL',
  BOU = 'BOU',
  SALARYANDPENSION = 'SALARYANDPENSION',
}

export enum SalaryAndPensionCaseType {
  EMPLOYER_CERTIFICATE = 'EMPLOYER_CERTIFICATE',
  PRECEDENCE = 'PRECEDENCE',
}

export const SalaryAndPensionCaseTypeDisplayName: Readonly<Record<SalaryAndPensionCaseType, string>> = {
  [SalaryAndPensionCaseType.EMPLOYER_CERTIFICATE]: 'Arbetsgivarintyg',
  [SalaryAndPensionCaseType.PRECEDENCE]: 'Företräde',
};

export enum ParkingPermitCaseType {
  RENEWAL = 'PARKING_PERMIT_RENEWAL',
  LOST = 'LOST_PARKING_PERMIT',
}

export enum AttachmentCategory {
  MEDICAL_CONFIRMATION = 'MEDICAL_CONFIRMATION',
  POLICE_REPORT = 'POLICE_REPORT',
}

export enum StakeholderRole {
  APPLICANT = 'APPLICANT',
}
