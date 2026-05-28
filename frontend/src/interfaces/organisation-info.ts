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
