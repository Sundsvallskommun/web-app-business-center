export interface Address {
  city?: string;
  street?: string;
  postcode?: string;
  careOf?: string;
}

export interface ClientBusinessInformation {
  companyLocation?: Address;
}
