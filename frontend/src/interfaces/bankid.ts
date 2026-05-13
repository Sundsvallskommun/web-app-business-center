export interface Sign {
  transactionId: string;
  autoStartToken: string;
  qrCode?: string;
}

export interface SignCollect {
  progressStatus: {
    status: 'COMPLETE' | 'FAILED' | 'CANCELLED' | 'PENDING';
    substatus: string | null;
    message: string;
  };
  attributes?: Record<string, string>;
  userInfo?: {
    subjectIdentifier: { value: string; type: string };
    displayName?: string;
    givenName: string;
    sn: string;
    tin: string;
    ipAddress: string;
  };
  validationInfo?: {
    signature: string;
    signatureFormat: string;
    ocspResponse?: string;
  };
  transactionId: string;
  qrCode?: string;
}

export interface SignApiResponse {
  data: Sign;
  message: string;
}

export interface SignCollectApiResponse {
  data: SignCollect;
  message: string;
}
