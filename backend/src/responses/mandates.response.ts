import {
  CompletionData as CompletionDataType,
  Device,
  GranteeDetails,
  GrantorDetails,
  MandateDetails,
  PagingAndSortingMetaData,
  User,
} from '@/data-contracts/myrepresentatives/data-contracts';
import { GrpStatus } from '@/interfaces/grp.interface';
import { MandatePopulated as MandatePopulatedType, MandateStatus, MandateUser } from '@/interfaces/mandates.interface';
import { ApiResponse } from '@/interfaces/service';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class Grantor implements GrantorDetails {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  grantorPartyId: string;
  @IsString()
  signatoryPartyId: string;
}

export class Grantee implements GranteeDetails {
  @IsString()
  partyId: string;
}

export class MandatePart implements MandateUser {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  personNumber?: string;
}

class CompletionDataUser implements User {
  @IsString()
  personalNumber: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  givenName: string;
  @IsString()
  surname: string;
}

class CompletionDataDevice implements Device {
  @IsString()
  ipAddress: string;
  @IsString()
  @IsOptional()
  uhi?: string;
}
class CompletionData implements CompletionDataType {
  @IsDateString()
  @IsOptional()
  bankIdIssueDate?: string;
  @IsString()
  signature: string;
  @IsString()
  @IsOptional()
  ocspResponse?: string;
  @IsString()
  @IsOptional()
  risk?: string;
  @ValidateNested()
  @Type(() => CompletionDataUser)
  user: User;
  @ValidateNested()
  @Type(() => CompletionDataDevice)
  device: Device;
}

export class SigningInfo {
  @IsString()
  orderRef: string;
  @IsString()
  @IsOptional()
  externalTransactionId?: string;
  @IsEnum(GrpStatus)
  status: GrpStatus;
  @ValidateNested()
  @Type(() => CompletionData)
  completionData: CompletionDataType;
}

class MandateDefaults
  implements
    Pick<MandateDetails, 'id' | 'created' | 'updated' | 'activeFrom' | 'inactiveAfter' | 'status' | 'whitelisted'>
{
  @IsString()
  id: string;
  @IsDateString()
  @IsOptional()
  created?: string;
  @IsDateString()
  @IsOptional()
  updated?: string;
  @IsDateString()
  activeFrom?: string;
  @IsDateString()
  @IsOptional()
  inactiveAfter?: string;
  @IsEnum(MandateStatus)
  status?: string;
  @IsBoolean()
  @IsOptional()
  whitelisted?: boolean;
}

export class Mandate extends MandateDefaults implements MandateDetails {
  @ValidateNested()
  @Type(() => Grantor)
  @IsOptional()
  grantorDetails?: GrantorDetails;
  @ValidateNested()
  @Type(() => Grantee)
  @IsOptional()
  granteeDetails?: GranteeDetails;
}

export class MandatePopulated extends MandateDefaults implements MandatePopulatedType {
  @ValidateNested()
  @Type(() => MandatePart)
  grantee: MandateUser;
  @ValidateNested()
  @Type(() => MandatePart)
  grantor: MandateUser;
}

class Meta implements PagingAndSortingMetaData {
  @IsInt()
  @IsOptional()
  page?: number;
  @IsInt()
  @IsOptional()
  limit?: number;
  @IsInt()
  @IsOptional()
  count?: number;
  @IsInt()
  @IsOptional()
  totalRecords?: number;
  @IsInt()
  @IsOptional()
  totalPages?: number;
}

export class MandatesApiResponse extends Meta implements ApiResponse<MandateDetails[]>, PagingAndSortingMetaData {
  @ValidateNested({ each: true })
  @Type(() => Mandate)
  data: MandateDetails[];
  @IsString()
  message: string;
}
export class MandateApiResponse implements ApiResponse<Mandate> {
  @ValidateNested()
  @Type(() => Mandate)
  data: Mandate;
  @IsString()
  message: string;
}

export class PopulatedMandatesApiResponse
  extends Meta
  implements ApiResponse<MandatePopulatedType[]>, PagingAndSortingMetaData
{
  @ValidateNested({ each: true })
  @Type(() => MandatePopulated)
  data: MandatePopulatedType[];
  @IsString()
  message: string;
}
