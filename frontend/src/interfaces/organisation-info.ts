export interface BusinessEngagement {
  organizationName: string;
  organizationNumber: string;
}
export interface BusinessInformation {
  companyLocation: {
    address: {
      city: string;
      street: string;
      postcode: string;
      careOf?: string;
    };
  };
}

export interface OrganisationInfo {
  organizationName: string;
  organizationNumber: string;
  information: BusinessInformation;
}
