export interface MandateUser {
  name: string;
  personNumber?: string;
}

export interface MandatePopulated {
  id?: string;
  activeFrom?: string;
  inactiveAfter?: string;
  created?: string;
  status?: string;
  grantor: MandateUser;
  grantee: MandateUser;
}

export interface RepresentingEntity {
  BUSINESS?: {
    organizationName: string;
    organizationNumber: string;
    isAuthorizedSignatory?: boolean;
    whitelisted?: boolean;
    information?: Record<string, unknown>;
  };
  PRIVATE?: {
    name: string;
  };
  mode: number;
}

export interface SignMandateDetails {
  granteeId: string;
  activeFrom: string;
  inactiveAfter?: string;
}

export interface SignMandateDto {
  visible: string;
  format: string;
  mandate?: SignMandateDetails;
}

export interface CreateMandateDto {
  transactionId: string;
}

export interface MandateApiResponse {
  data: Record<string, unknown>;
  message: string;
}
