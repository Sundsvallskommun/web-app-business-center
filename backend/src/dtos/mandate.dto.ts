import {
  CreateMandate,
  GranteeDetails,
  GrantorDetails,
  SigningInfo as SigningInfoType,
} from '@/data-contracts/myrepresentatives/data-contracts';
import { SignMandate } from '@/interfaces/mandates.interface';
import { Grantee, Grantor, SigningInfo } from '@/responses/mandates.response';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SignMandateDetails implements SignMandate {
  @IsString()
  granteeId: string;
  @IsDateString()
  activeFrom: string;
  @IsDateString()
  @IsOptional()
  inactiveAfter?: string;
}
export class MandateDto implements CreateMandate {
  @ValidateNested()
  @Type(() => Grantor)
  grantorDetails: GrantorDetails;
  @ValidateNested()
  @Type(() => Grantee)
  granteeDetails: GranteeDetails;
  @IsDateString()
  activeFrom: string;
  @IsDateString()
  @IsOptional()
  inactiveAfter?: string;
  @ValidateNested()
  @Type(() => SigningInfo)
  signingInfo: SigningInfoType;
}

export class MandatePaginationDto {
  @IsInt()
  @IsOptional()
  page?: number;
  @IsInt()
  @IsOptional()
  limit?: number;
}

export class CreateMandateDto {
  @IsString()
  transactionId: string;
}
