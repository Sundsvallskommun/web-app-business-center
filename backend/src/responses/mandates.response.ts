import { GranteeDetails, GrantorDetails, MandateDetails, PagingAndSortingMetaData } from '@/data-contracts/myrepresentatives/data-contracts';
import { MandatePopulated as MandatePopulatedType, MandateStatus, MandateUser } from '@/interfaces/mandates.interface';
import { ApiResponse } from '@/interfaces/service';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class Grantor implements GrantorDetails {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  grantorPartyId!: string;
  @IsString()
  signatoryPartyId!: string;
}

class Grantee implements GranteeDetails {
  @IsString()
  partyId!: string;
}

class MandatePart implements MandateUser {
  @IsString()
  name!: string;
  @IsString()
  @IsOptional()
  personNumber?: string;
}

class MandateDefaults implements Pick<MandateDetails, 'id' | 'created' | 'updated' | 'activeFrom' | 'inactiveAfter' | 'status' | 'whitelisted'> {
  @IsString()
  id!: string;
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

class MandatePopulated extends MandateDefaults implements MandatePopulatedType {
  @ValidateNested()
  @Type(() => MandatePart)
  grantee!: MandateUser;
  @ValidateNested()
  @Type(() => MandatePart)
  grantor!: MandateUser;
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
  data!: MandateDetails[];
  @IsString()
  message!: string;
}
export class MandateApiResponse implements ApiResponse<Mandate> {
  @ValidateNested()
  @Type(() => Mandate)
  data!: Mandate;
  @IsString()
  message!: string;
}

export class PopulatedMandatesApiResponse extends Meta implements ApiResponse<MandatePopulatedType[]>, PagingAndSortingMetaData {
  @ValidateNested({ each: true })
  @Type(() => MandatePopulated)
  data!: MandatePopulatedType[];
  @IsString()
  message!: string;
}
