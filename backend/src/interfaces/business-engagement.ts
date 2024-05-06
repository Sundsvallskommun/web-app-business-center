export interface BusinessEngagement {
  organizationName: string;
  organizationNumber: string;
  organizationId: string;
}

interface LiquidationReason {
  liquidationCode: string;
  liquidationDescription: string;
  liquidationDate: string;
  liquidationType: string;
}

export interface Address {
  city: string;
  street: string;
  postcode: string;
  careOf: string;
}

interface ShareType {
  label: string;
  numberOfShares: number;
  voteValue: string;
}

export interface BusinessInformationResponse {
  legalForm: {
    legalFormDescription: string;
    legalFormCode: string;
  };
  address: Address;
  emailAddress: string;
  phoneNumber: string;
  municipality: {
    municipalityName: string;
    municipalityCode: string;
  };
  county: {
    countyName: string;
    countyCode: string;
  };
  fiscalYear: {
    fromDay: number;
    fromMonth: number;
    toDay: number;
    toMonth: number;
  };
  companyForm: {
    companyFormCode: string;
    companyFormDescription: string;
  };
  companyRegistrationTime: string;
  liquidationInformation: {
    liquidationReasons: LiquidationReason[];
    cancelledLiquidation: LiquidationReason;
  };
  deregistrationDate: string;
  companyLocation: Address;
  businessSignatory: string;
  companyDescription: string;
  sharesInformation: {
    shareTypes: ShareType[];
    numberOfShares: number;
    shareCapital: number;
    shareCurrency: string;
  };
  errorInformation: {
    hasErrors: boolean;
    errorDescriptions: string;
  };
}

export interface BusinessInformation {
  companyLocation?: Address;
}
