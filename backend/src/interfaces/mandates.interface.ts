import { CreateMandate, GranteeDetails } from '@/data-contracts/myrepresentatives/data-contracts';
import { Mandate } from '@/responses/mandates.response';

export enum MandateStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Expired = 'EXPIRED',
  Deleted = 'DELETED',
}

export interface SignMandate extends Pick<CreateMandate, 'activeFrom' | 'inactiveAfter'> {
  /** Grantee id */
  granteeId: GranteeDetails['partyId'];
}
export interface SignMandateCache extends SignMandate {
  /** Grantor partyid */
  grantorId: string;
}

export interface MandateUser {
  name: string;
  personNumber?: string;
}
export interface MandatePopulated extends Pick<Mandate, 'activeFrom' | 'created' | 'id' | 'inactiveAfter' | 'status'> {
  grantor: MandateUser;
  grantee: MandateUser;
}
