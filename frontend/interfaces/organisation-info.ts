export interface BusinessEngagement {
  organizationName: string;
  organizationNumber: string;
}
export interface BusinessInformation {
  companyLocation: {
    city: string;
    street: string;
    postcode: string;
    careOf?: string;
  };
}

export interface OrganisationInfo {
  orgName: string;
  orgNumber: string;
  information: BusinessInformation;
}
