export enum SupportManagementNamespace {
  CONTACTSUNDSVALL = 'CONTACTSUNDSVALL',
  BOU = 'BOU',
  SERVICECENTERFINANCE = 'SERVICECENTERFINANCE',
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
